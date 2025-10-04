import GlobalRiskDisclosure, { IGlobalRiskDisclosureDocument } from "../../models/config/globalRiskDisclosure.model";
import ApiError from "../../utils/ApiError";
import httpStatus from "http-status";

const GlobalRiskDisclosureServices = {
  async createGlobalRiskDisclosure(globalRiskDisclosure: IGlobalRiskDisclosureDocument): Promise<IGlobalRiskDisclosureDocument> {
    // Check if global risk disclosure with same name, assetClass and assetCategory already exists
    const existingRiskDisclosure = await GlobalRiskDisclosure.findOne({
        name: globalRiskDisclosure.name,
        assetClass: globalRiskDisclosure.assetClass,
        assetCategory: globalRiskDisclosure.assetCategory
    });
    
    if (existingRiskDisclosure) {
        throw new ApiError({
            statusCode: httpStatus.CONFLICT,
            message: `A global risk disclosure named "${globalRiskDisclosure.name}" already exists for this asset class and category`,
        });
    }
    
    const newGlobalRiskDisclosure = await GlobalRiskDisclosure.create(globalRiskDisclosure);
    return newGlobalRiskDisclosure;
  },

  async getGlobalRiskDisclosures({ assetClass, assetCategory, status }: { assetClass?: string, assetCategory?: string, status?: boolean }) {
    const filter = {} as any;
    if (assetClass) filter.assetClass = assetClass;
    if (assetCategory) filter.assetCategory = assetCategory;
    if (status !== undefined) filter.status = status;
    
    const globalRiskDisclosures = await GlobalRiskDisclosure.find(filter);
    return globalRiskDisclosures;
  },

  async updateGlobalRiskDisclosure({ id, globalRiskDisclosure }: { id: string, globalRiskDisclosure: Partial<IGlobalRiskDisclosureDocument> }): Promise<IGlobalRiskDisclosureDocument | null> {
    if (!id) {
      throw new ApiError({
        statusCode: httpStatus.BAD_REQUEST,
        message: 'Global risk disclosure ID is required',
      });
    }
    
    // If name is being updated, check for duplicates
    if (globalRiskDisclosure.name) {
        // Get the current risk disclosure to check its class and category
        const currentRiskDisclosure = await GlobalRiskDisclosure.findById(id);
        if (!currentRiskDisclosure) {
            throw new ApiError({
                statusCode: httpStatus.NOT_FOUND,
                message: 'Global risk disclosure not found',
            });
        }
        
        // Use the provided values or fall back to the current values
        const assetClass = globalRiskDisclosure.assetClass || currentRiskDisclosure.assetClass;
        const assetCategory = globalRiskDisclosure.assetCategory || currentRiskDisclosure.assetCategory;
        
        // Check if another risk disclosure with the same name exists in this class and category
        const existingRiskDisclosure = await GlobalRiskDisclosure.findOne({
            name: globalRiskDisclosure.name,
            assetClass: assetClass,
            assetCategory: assetCategory,
            _id: { $ne: id } // Exclude the current risk disclosure
        });
        
        if (existingRiskDisclosure) {
            throw new ApiError({
                statusCode: httpStatus.CONFLICT,
                message: `A global risk disclosure named "${globalRiskDisclosure.name}" already exists for this asset class and category`,
            });
        }
    }
    
    const updatedGlobalRiskDisclosure = await GlobalRiskDisclosure.findByIdAndUpdate(id, globalRiskDisclosure, { new: true });
    
    if (!updatedGlobalRiskDisclosure) {
      throw new ApiError({
        statusCode: httpStatus.NOT_FOUND,
        message: 'Global risk disclosure not found',
      });
    }
    
    return updatedGlobalRiskDisclosure;
  },

  async deleteGlobalRiskDisclosure(id: string): Promise<IGlobalRiskDisclosureDocument | null> {
    if (!id) {
      throw new ApiError({
        statusCode: httpStatus.BAD_REQUEST,
        message: 'Global risk disclosure ID is required',
      });
    }
    
    const deletedGlobalRiskDisclosure = await GlobalRiskDisclosure.findByIdAndDelete(id);
    
    if (!deletedGlobalRiskDisclosure) {
      throw new ApiError({
        statusCode: httpStatus.NOT_FOUND,
        message: 'Global risk disclosure not found',
      });
    }
    
    return deletedGlobalRiskDisclosure;
  }
};

export default GlobalRiskDisclosureServices; 