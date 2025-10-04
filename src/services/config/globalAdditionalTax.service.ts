import GlobalAdditionalTax, { IGlobalAdditionalTaxDocument } from "../../models/config/globalAdditionalTax.model";
import ApiError from "../../utils/ApiError";
import httpStatus from "http-status";

const GlobalAdditionalTaxServices = {
  async createGlobalAdditionalTax(globalAdditionalTax: IGlobalAdditionalTaxDocument): Promise<IGlobalAdditionalTaxDocument> {
    const newGlobalAdditionalTax = await GlobalAdditionalTax.create(globalAdditionalTax);
    return newGlobalAdditionalTax;
  },

  async getGlobalAdditionalTaxes({ assetClass, assetCategory, status }: { assetClass?: string, assetCategory?: string, status?: boolean }) {
    const filter = {} as any;
    if (assetClass) filter.assetClass = assetClass;
    if (assetCategory) filter.assetCategory = assetCategory;
    if (status !== undefined) filter.status = status;
    
    const globalAdditionalTaxes = await GlobalAdditionalTax.find(filter);
    return globalAdditionalTaxes;
  },

  async updateGlobalAdditionalTax({ id, globalAdditionalTax }: { id: string, globalAdditionalTax: Partial<IGlobalAdditionalTaxDocument> }): Promise<IGlobalAdditionalTaxDocument | null> {
    if (!id) {
      throw new ApiError({
        statusCode: httpStatus.BAD_REQUEST,
        message: 'Global additional tax ID is required',
      });
    }
    
    const updatedGlobalAdditionalTax = await GlobalAdditionalTax.findByIdAndUpdate(id, globalAdditionalTax, { new: true });
    
    if (!updatedGlobalAdditionalTax) {
      throw new ApiError({
        statusCode: httpStatus.NOT_FOUND,
        message: 'Global additional tax not found',
      });
    }
    
    return updatedGlobalAdditionalTax;
  },

  async deleteGlobalAdditionalTax(id: string): Promise<IGlobalAdditionalTaxDocument | null> {
    if (!id) {
      throw new ApiError({
        statusCode: httpStatus.BAD_REQUEST,
        message: 'Global additional tax ID is required',
      });
    }
    
    const deletedGlobalAdditionalTax = await GlobalAdditionalTax.findByIdAndDelete(id);
    
    if (!deletedGlobalAdditionalTax) {
      throw new ApiError({
        statusCode: httpStatus.NOT_FOUND,
        message: 'Global additional tax not found',
      });
    }
    
    return deletedGlobalAdditionalTax;
  }
};

export default GlobalAdditionalTaxServices; 