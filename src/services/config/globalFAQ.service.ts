
import GlobalFAQ, {
  IGlobalFAQDocument,
} from '../../models/config/globalFAQ.model';
import ApiError from '../../utils/ApiError';
import httpStatus from 'http-status';

const GlobalFAQServices = {
  async createGlobalFAQ(
    globalFAQ: IGlobalFAQDocument
  ): Promise<IGlobalFAQDocument> {
    // Check if global FAQ with same question, assetClass and assetCategory already exists
    const existingFAQ = await GlobalFAQ.findOne({
      question: globalFAQ.question,
      assetClass: globalFAQ.assetClass,
      assetCategory: globalFAQ.assetCategory,
    });

    if (existingFAQ) {
      throw new ApiError({
        statusCode: httpStatus.CONFLICT,
        message: `A global FAQ with the question "${globalFAQ.question}" already exists for this asset class and category`,
      });
    }

    const newGlobalFAQ = await GlobalFAQ.create(globalFAQ);
    return newGlobalFAQ;
  },

  async getGlobalFAQs({
    assetClass,
    assetCategory,
    status,
  }: {
    assetClass?: string;
    assetCategory?: string;
    status?: boolean;
  }) {
    const filter = {} as any;
    if (assetClass) filter.assetClass = assetClass;
    if (assetCategory) filter.assetCategory = assetCategory;
    if (status !== undefined) filter.status = status;

    const globalFAQs = await GlobalFAQ.find(filter);
    return globalFAQs;
  },

  async updateGlobalFAQ({
    id,
    globalFAQ,
  }: {
    id: string;
    globalFAQ: Partial<IGlobalFAQDocument>;
  }): Promise<IGlobalFAQDocument | null> {
    if (!id) {
      throw new ApiError({
        statusCode: httpStatus.BAD_REQUEST,
        message: 'Global FAQ ID is required',
      });
    }

    // If question is being updated, check for duplicates
    if (globalFAQ.question) {
      // Get the current FAQ to check its class and category
      const currentFAQ = await GlobalFAQ.findById(id);
      if (!currentFAQ) {
        throw new ApiError({
          statusCode: httpStatus.NOT_FOUND,
          message: 'Global FAQ not found',
        });
      }

      // Use the provided values or fall back to the current values
      const assetClass = globalFAQ.assetClass || currentFAQ.assetClass;
      const assetCategory = globalFAQ.assetCategory || currentFAQ.assetCategory;

      // Check if another FAQ with the same question exists in this class and category
      const existingFAQ = await GlobalFAQ.findOne({
        question: globalFAQ.question,
        assetClass: assetClass,
        assetCategory: assetCategory,
        _id: { $ne: id }, // Exclude the current FAQ
      });

      if (existingFAQ) {
        throw new ApiError({
          statusCode: httpStatus.CONFLICT,
          message: `A global FAQ with the question "${globalFAQ.question}" already exists for this asset class and category`,
        });
      }
    }

    const updatedGlobalFAQ = await GlobalFAQ.findByIdAndUpdate(id, globalFAQ, {
      new: true,
    });

    if (!updatedGlobalFAQ) {
      throw new ApiError({
        statusCode: httpStatus.NOT_FOUND,
        message: 'Global FAQ not found',
      });
    }

    return updatedGlobalFAQ;
  },

  async deleteGlobalFAQ(id: string): Promise<IGlobalFAQDocument | null> {
    if (!id) {
      throw new ApiError({
        statusCode: httpStatus.BAD_REQUEST,
        message: 'Global FAQ ID is required',
      });
    }

    const deletedGlobalFAQ = await GlobalFAQ.findByIdAndDelete(id);
    if (!deletedGlobalFAQ) {
      throw new ApiError({
        statusCode: httpStatus.NOT_FOUND,
        message: 'Global FAQ not found',
      });
    }

    return deletedGlobalFAQ;
  },
};

export default GlobalFAQServices;
