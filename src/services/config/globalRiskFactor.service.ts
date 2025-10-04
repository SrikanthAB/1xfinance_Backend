import GlobalRiskFactor, { IGlobalRiskFactorDocument } from "../../models/config/globalRiskFactor.model";
import ApiError from "../../utils/ApiError";
import httpStatus from "http-status";

const GlobalRiskFactorServices = {
  async createGlobalRiskFactor(globalRiskFactor: IGlobalRiskFactorDocument): Promise<IGlobalRiskFactorDocument> {
    // Check if global risk factor with same name, assetClass and assetCategory already exists
    const existingRiskFactor = await GlobalRiskFactor.findOne({
        name: globalRiskFactor.name,
        assetClass: globalRiskFactor.assetClass,
        assetCategory: globalRiskFactor.assetCategory
    });
    
    if (existingRiskFactor) {
        throw new ApiError({
            statusCode: httpStatus.CONFLICT,
            message: `A global risk factor named "${globalRiskFactor.name}" already exists for this asset class and category`,
        });
    }
    
    const newGlobalRiskFactor = await GlobalRiskFactor.create(globalRiskFactor);
    return newGlobalRiskFactor;
  },

  async getGlobalRiskFactors({ assetClass, assetCategory, status }: { assetClass?: string, assetCategory?: string, status?: boolean }) {
    const filter = {} as any;
    if (assetClass) filter.assetClass = assetClass;
    if (assetCategory) filter.assetCategory = assetCategory;
    if (status !== undefined) filter.status = status;
    
    const globalRiskFactors = await GlobalRiskFactor.find(filter);
    return globalRiskFactors;
  },

  async updateGlobalRiskFactor({ id, globalRiskFactor }: { id: string, globalRiskFactor: Partial<IGlobalRiskFactorDocument> }): Promise<IGlobalRiskFactorDocument | null> {
    if (!id) {
      throw new ApiError({
        statusCode: httpStatus.BAD_REQUEST,
        message: 'Global risk factor ID is required',
      });
    }
    
    // If name is being updated, check for duplicates
    if (globalRiskFactor.name) {
        // Get the current risk factor to check its class and category
        const currentRiskFactor = await GlobalRiskFactor.findById(id);
        if (!currentRiskFactor) {
            throw new ApiError({
                statusCode: httpStatus.NOT_FOUND,
                message: 'Global risk factor not found',
            });
        }
        
        // Use the provided values or fall back to the current values
        const assetClass = globalRiskFactor.assetClass || currentRiskFactor.assetClass;
        const assetCategory = globalRiskFactor.assetCategory || currentRiskFactor.assetCategory;
        
        // Check if another risk factor with the same name exists in this class and category
        const existingRiskFactor = await GlobalRiskFactor.findOne({
            name: globalRiskFactor.name,
            assetClass: assetClass,
            assetCategory: assetCategory,
            _id: { $ne: id } // Exclude the current risk factor
        });
        
        if (existingRiskFactor) {
            throw new ApiError({
                statusCode: httpStatus.CONFLICT,
                message: `A global risk factor named "${globalRiskFactor.name}" already exists for this asset class and category`,
            });
        }
    }
    
    const updatedGlobalRiskFactor = await GlobalRiskFactor.findByIdAndUpdate(id, globalRiskFactor, { new: true });
    
    if (!updatedGlobalRiskFactor) {
      throw new ApiError({
        statusCode: httpStatus.NOT_FOUND,
        message: 'Global risk factor not found',
      });
    }
    
    return updatedGlobalRiskFactor;
  },

  async deleteGlobalRiskFactor(id: string): Promise<IGlobalRiskFactorDocument | null> {
    if (!id) {
      throw new ApiError({
        statusCode: httpStatus.BAD_REQUEST,
        message: 'Global risk factor ID is required',
      });
    }
    
    const deletedGlobalRiskFactor = await GlobalRiskFactor.findByIdAndDelete(id);
    
    if (!deletedGlobalRiskFactor) {
      throw new ApiError({
        statusCode: httpStatus.NOT_FOUND,
        message: 'Global risk factor not found',
      });
    }
    
    return deletedGlobalRiskFactor;
  }
};

export default GlobalRiskFactorServices; 