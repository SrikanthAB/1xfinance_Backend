import User, { IUserDocument } from "../../models/user/user.model";
import { IUser } from "../../interfaces/user/user.interface";
import ApiError from "../../utils/ApiError";
import config from "../../config/config";
import { hashPassword } from "../../utils/bycrypt";
import { Types } from 'mongoose';

type UserIdType = string | Types.ObjectId;

const UserSerivice = {
  async findByMobileNumber({
    mobileNumber,
    countryCode = config.defaultCountryCode,
  }: {
    mobileNumber: string;
    countryCode: string;
  }): Promise<Omit<IUserDocument, "password"> | null> {
    const user = await User.findOne({ mobileNumber, countryCode }).select('+password');
    console.log("service page user is here",user);
    return user;
  },

  async createUser(
    userData: Partial<IUser>
  ): Promise<Omit<IUserDocument, "password">> {
    const user = await User.create(userData);
    return user;
  },

  async getUserById(userId: UserIdType): Promise<IUser> {
    const user = await User.findById(userId).select("-password -__v");
    if (!user) {
      throw new ApiError({ statusCode: 404, message: "User not found" });
    }
    return user;
  },

  async updateUserById(
    userId: UserIdType,
    updateData: Partial<IUser>
  ): Promise<IUser> {
    if(updateData.password){
      updateData.password = await hashPassword(updateData.password);
    }
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });
    if (!user) {
      throw new ApiError({ statusCode: 404, message: "User not found" });
    }
    return user;
  },

  async findUserWithMobileNumber({
    mobileNumber,
    countryCode = config.defaultCountryCode,
  }: {
    mobileNumber: string;
    countryCode: string;
  }) {
    const user = await User.findOne({
      mobileNumber,
      countryCode,
    }).select("-password -__v");
    if (!user) {
      throw new ApiError({
        statusCode: 404,
        message: "User not found",
      });
    }
    return user;
  },

  async updateWalletAddress(userId: UserIdType, walletAddress: string): Promise<IUser> {
    // Check if wallet address is provided
    if (!walletAddress) {
      throw new ApiError({ statusCode: 400, message: 'Wallet address is required' });
    }

    // Check if wallet address is valid (basic check for 0x prefix and length)
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      throw new ApiError({ statusCode: 400, message: 'Invalid wallet address format' });
    }

    // Check if wallet address is already in use by another user
    const existingUser = await User.findOne({ walletAddress });
    if (existingUser && String(existingUser._id) !== String(userId)) {
      throw new ApiError({ statusCode: 400, message: 'Wallet address is already in use' });
    }

    // Update the user's wallet address
    const user = await User.findByIdAndUpdate(
      userId,
      { walletAddress },
      { new: true, runValidators: true }
    ).select("-password -__v");

    if (!user) {
      throw new ApiError({
        statusCode: 404,
        message: "User not found"
      });
    }

    return user;
  },
};

export default UserSerivice;
