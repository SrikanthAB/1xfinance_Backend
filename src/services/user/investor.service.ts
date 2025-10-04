import User, { IUserDocument } from "../../models/user/user.model";
import ApiError from "../../utils/ApiError";
import { IUser } from "../../interfaces/user/user.interface";
import WalletModel from "../../models/web3/wallet.model";
import { Types } from "mongoose";
import aggregateWithPagination from "../../utils/aggregateWithPagination";
import Order from "../../models/order/order.model";
import { InvestorList } from "../../interfaces/user/user.interface";
import findAllEntities from "../../utils/findAllEntities";

const InvestorServices = {
  async getUser(id: string): Promise<{ user: IUser, isNewUser: boolean }> {
    if (!id) {
      throw new ApiError({
        statusCode: 401,
        message: "Unauthorized or Id not found",
      });
    }
    const user: IUserDocument | null = await User.findById(id);
    if (!user) {
      throw new ApiError({
        statusCode: 404,
        message: "User not found.",
      });
    }
    const userObj = user.toObject();
    const isNewUser = !user.fullName|| !user.type;
    return { ...userObj, isNewUser };
  },

  async updateUser({ userId, updateData }: { userId: string, updateData: Partial<IUser> }): Promise<IUserDocument> {
    const user: IUserDocument | null = await User.findByIdAndUpdate(userId, updateData, { new: true });
    if (!user) {
      throw new ApiError({
        statusCode: 404,
        message: "User not found to update.",
      });
    }
    return user;
  },

  async getInvestorDetailsWithWallet(investorId: string): Promise<IUserDocument> {
    const objectId = new Types.ObjectId(investorId);
    const existingWallet = await WalletModel.findOne({ investorId: objectId });
    if (!existingWallet) {
      const user = await User.findById(objectId);
      if (!user) {
        throw new ApiError({
          statusCode: 404,
          message: "User not found.",
        });
      }
      return user;
    }
    const result = await WalletModel.aggregate([
      {
        $match: {
          investorId: objectId,
        },
      },
      {
        $lookup: {
          from: 'users', // collection name in lowercase and plural
          localField: 'investorId',
          foreignField: '_id',
          as: 'investor',
        },
      },
      {
        $unwind: '$investor',
      },
      {
        $project: {
          _id: 1,
          address: 1,
          balance: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,

          // User (investor) fields
          'investor._id': 1,
          'investor.fullName': 1,
          'investor.email': 1,
          'investor.mobileNumber': 1,
          'investor.country': 1,
          'investor.kycCompleted': 1,
          'investor.avatar': 1,
          'investor.countryCode': 1,
          'investor.gender': 1,
          'investor.dob': 1,
        },
      },
    ]);

    return result[0];
  },

  async getInvestorListing(
    { filter, page = 1, limit = 10 }:
      { filter: { search?: string; type?: string | string[]; status?: string, assetId?: string, companyId?: string }; page: number; limit: number }):
    Promise<{ investors: InvestorList[]; totalCount: number }> {
    const matchUserStage: Record<string, any> = {};

    if (filter.type) {
      matchUserStage['user.type'] = Array.isArray(filter.type)
        ? { $in: filter.type }
        : filter.type;
    }

    if (filter.search) {
      matchUserStage['$or'] = [
        { 'user.fullName': { $regex: filter.search, $options: 'i' } },
        { 'user.email': { $regex: filter.search, $options: 'i' } },
      ];
    }
    const matchOrderStage: Record<string, any> = {};
    if (filter.assetId) {
      matchOrderStage.assetId = new Types.ObjectId(filter.assetId);
    } else if (filter.companyId) {
      matchOrderStage.companyId = new Types.ObjectId(filter.companyId);
    }
    // if (filter.status) {
    //   matchUserStage['status'] = filter.status;
    // }
    const isAssetFilter = !!filter.assetId;

    const pipeline = [
      Object.keys(matchOrderStage).length > 0 ? { $match: matchOrderStage } : null,
      // 1. Group orders by investor
      {
        $group: {
          _id: '$investorId',
          tokensBooked: { $sum: '$tokensBooked' },
          totalOrderValue: { $sum: '$totalOrderValue' },
          orderStatuses: { $addToSet: '$currentStatus' },
          assetIds: { $addToSet: '$assetId' },
        },
      },

      // 2. Lookup user info
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },

      // 3. Apply user-level filters (search and type)
      {
        $match: matchUserStage, // This comes from your code and includes search/type filters
      },

      // 4. Lookup asset info
      {
        $lookup: {
          from: 'assets',
          localField: 'assetIds',
          foreignField: '_id',
          as: 'assets',
        },
      },

      // 5. Compute total asset value
      {
        $addFields: {
          totalBaseValue: {
            $cond: [
              isAssetFilter,
              { $sum: '$assets.tokenInformation.tokenSupply' },
              { $sum: '$assets.totalPropertyValueAfterFees' }
            ],
          },
          currency: { $first: '$assets.currency' },
        },
      },

      // 6. Compute ownership % and status
      {
        $addFields: { 
          ownershipPercentage: {
            $cond: [
              { $gt: ['$totalBaseValue', 0] },
              {
                $round: [
                  {
                    $multiply: [
                      {
                        $divide: [
                          isAssetFilter ? '$tokensBooked' : '$totalOrderValue', '$totalBaseValue',
                        ],
                      },
                      100,
                    ],
                  },
                  2,
                ],
              },
              0,
            ],
          },
          status: {
            $cond: [
              {
                $in: [
                  'property-tokens-transferred-and-order-successfully-completed',
                  '$orderStatuses',
                ],
              },
              'active',
              'pending',
            ],
          },
        },
      },

      // 7. Final projection
      {
        $project: {
          investor: {
            _id: '$_id',
            fullName: '$user.fullName',
            email: '$user.email',
            type: '$user.type',
            createdAt: '$user.createdAt',
          },
          tokensBooked: 1,
          totalOrderValue: 1,
          ownership: 1,
          status: 1,
          currency:1,
          ownershipPercentage:1,
        },
      },
    ];


    const { list, totalCount } = await aggregateWithPagination({
      model: Order,
      pipeline,
      page,
      limit,
    });

    return { investors: list, totalCount };
  },

  async deleteUser(id: string): Promise<IUserDocument> {
    const user: IUserDocument | null = await User.findByIdAndDelete(id);
    if (!user) {
      throw new ApiError({
        statusCode: 404,
        message: "User not found to delete.",
      });
    }
    return user;
  },

  async getUsers({ page = 1, limit = 10 }) {
    const { entities, totalCount } = await findAllEntities({
      page,
      limit,
      model: User,
    });
    return { investors: entities, totalCount };
  },

};

export default InvestorServices;
