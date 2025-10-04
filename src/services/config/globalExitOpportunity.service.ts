import GlobalExitOpportunity, { IGlobalExitOpportunityDocument } from "../../models/config/globalExitOpportunity.model";
import ApiError from "../../utils/ApiError";
import httpStatus from "http-status";

const GlobalExitOpportunityServices = {
  async createGlobalExitOpportunity(globalExitOpportunity: IGlobalExitOpportunityDocument): Promise<IGlobalExitOpportunityDocument> {
    // Check if global exit opportunity with same name, assetClass and assetCategory already exists
    const existingExitOpportunity = await GlobalExitOpportunity.findOne({
        name: globalExitOpportunity.name,
        assetClass: globalExitOpportunity.assetClass,
        assetCategory: globalExitOpportunity.assetCategory
    });
    
    if (existingExitOpportunity) {
        throw new ApiError({
            statusCode: httpStatus.CONFLICT,
            message: `A global exit opportunity named "${globalExitOpportunity.name}" already exists for this asset class and category`,
        });
    }
    
    const newGlobalExitOpportunity = await GlobalExitOpportunity.create(globalExitOpportunity);
    return newGlobalExitOpportunity;
  },

  async getGlobalExitOpportunities({ assetClass, assetCategory, status }: { assetClass?: string, assetCategory?: string, status?: boolean }) {
    const filter = {} as any;
    if (assetClass) filter.assetClass = assetClass;
    if (assetCategory) filter.assetCategory = assetCategory;
    if (status !== undefined) filter.status = status;
    
    const globalExitOpportunities = await GlobalExitOpportunity.find(filter);
    return globalExitOpportunities;
  },

  async updateGlobalExitOpportunity({ id, globalExitOpportunity }: { id: string, globalExitOpportunity: Partial<IGlobalExitOpportunityDocument> }): Promise<IGlobalExitOpportunityDocument | null> {
    if (!id) {
      throw new ApiError({
        statusCode: httpStatus.BAD_REQUEST,
        message: 'Global exit opportunity ID is required',
      });
    }
    
    // If name is being updated, check for duplicates
    if (globalExitOpportunity.name) {
        // Get the current exit opportunity to check its class and category
        const currentExitOpportunity = await GlobalExitOpportunity.findById(id);
        if (!currentExitOpportunity) {
            throw new ApiError({
                statusCode: httpStatus.NOT_FOUND,
                message: 'Global exit opportunity not found',
            });
        }
        
        // Use the provided values or fall back to the current values
        const assetClass = globalExitOpportunity.assetClass || currentExitOpportunity.assetClass;
        const assetCategory = globalExitOpportunity.assetCategory || currentExitOpportunity.assetCategory;
        
        // Check if another exit opportunity with the same name exists in this class and category
        const existingExitOpportunity = await GlobalExitOpportunity.findOne({
            name: globalExitOpportunity.name,
            assetClass: assetClass,
            assetCategory: assetCategory,
            _id: { $ne: id } // Exclude the current exit opportunity
        });
        
        if (existingExitOpportunity) {
            throw new ApiError({
                statusCode: httpStatus.CONFLICT,
                message: `A global exit opportunity named "${globalExitOpportunity.name}" already exists for this asset class and category`,
            });
        }
    }
    
    const updatedGlobalExitOpportunity = await GlobalExitOpportunity.findByIdAndUpdate(id, globalExitOpportunity, { new: true });
    
    if (!updatedGlobalExitOpportunity) {
      throw new ApiError({
        statusCode: httpStatus.NOT_FOUND,
        message: 'Global exit opportunity not found',
      });
    }
    
    return updatedGlobalExitOpportunity;
  },

  async deleteGlobalExitOpportunity(id: string): Promise<IGlobalExitOpportunityDocument | null> {
    if (!id) {
      throw new ApiError({
        statusCode: httpStatus.BAD_REQUEST,
        message: 'Global exit opportunity ID is required',
      });
    }
    
    const deletedGlobalExitOpportunity = await GlobalExitOpportunity.findByIdAndDelete(id);
    
    if (!deletedGlobalExitOpportunity) {
      throw new ApiError({
        statusCode: httpStatus.NOT_FOUND,
        message: 'Global exit opportunity not found',
      });
    }
    
    return deletedGlobalExitOpportunity;
  }
};

export default GlobalExitOpportunityServices; 