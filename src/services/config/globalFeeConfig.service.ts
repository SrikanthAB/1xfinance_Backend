import GlobalFeeConfig,{IGlobalFeeConfigDocument} from "../../models/config/globalFeeConfig.model";
import ApiError from "../../utils/ApiError";
import httpStatus from "http-status";

const GlobalFeeConfigServices = {
    async createGlobalFeeConfig(globalFeeConfig:IGlobalFeeConfigDocument):Promise<IGlobalFeeConfigDocument>{
        // Check if global fee config with same name, assetClass, assetCategory and feeType already exists
        const existingFeeConfig = await GlobalFeeConfig.findOne({
            name: globalFeeConfig.name,
            assetClass: globalFeeConfig.assetClass,
            assetCategory: globalFeeConfig.assetCategory,
            feeType: globalFeeConfig.feeType
        });
        
        if (existingFeeConfig) {
            throw new ApiError({
                statusCode: httpStatus.CONFLICT,
                message: `A global fee configuration named "${globalFeeConfig.name}" already exists for this asset class, category and fee type`,
            });
        }
        
        const newGlobalFeeConfig = await GlobalFeeConfig.create(globalFeeConfig);
        return newGlobalFeeConfig;
    },
    async getGlobalFeeConfigs({ assetClass, assetCategory, feeType, status}: { assetClass?: string, assetCategory?: string, feeType?:string, status?:boolean}) {
        const filter = {} as any;
        if (assetClass) filter.assetClass = assetClass;
        if (assetCategory) filter.assetCategory = assetCategory;
        if (feeType) filter.feeType = feeType;
        if (status) filter.status = status;
        const globalFeeConfigs = await GlobalFeeConfig.find(filter);
        return globalFeeConfigs;
    },
    async updateGlobalFeeConfig({id,globalFeeConfig}:{id:string,globalFeeConfig:IGlobalFeeConfigDocument}):Promise<IGlobalFeeConfigDocument | null>{
        if (!id) {
            throw new ApiError({
                statusCode: httpStatus.BAD_REQUEST,
                message: 'Global fee config ID is required',
            });
        }
        
        // If name is being updated, check for duplicates
        if (globalFeeConfig.name) {
            // Get the current fee config to check its class, category and feeType
            const currentFeeConfig = await GlobalFeeConfig.findById(id);
            if (!currentFeeConfig) {
                throw new ApiError({
                    statusCode: httpStatus.NOT_FOUND,
                    message: 'Global fee configuration not found',
                });
            }
            
            // Use the provided values or fall back to the current values
            const assetClass = globalFeeConfig.assetClass || currentFeeConfig.assetClass;
            const assetCategory = globalFeeConfig.assetCategory || currentFeeConfig.assetCategory;
            const feeType = globalFeeConfig.feeType || currentFeeConfig.feeType;
            
            // Check if another fee config with the same name exists in this class, category and fee type
            const existingFeeConfig = await GlobalFeeConfig.findOne({
                name: globalFeeConfig.name,
                assetClass: assetClass,
                assetCategory: assetCategory,
                feeType: feeType,
                _id: { $ne: id } // Exclude the current fee config
            });
            
            if (existingFeeConfig) {
                throw new ApiError({
                    statusCode: httpStatus.CONFLICT,
                    message: `A global fee configuration named "${globalFeeConfig.name}" already exists for this asset class, category and fee type`,
                });
            }
        }
        
        const updatedGlobalFeeConfig = await GlobalFeeConfig.findByIdAndUpdate(id,globalFeeConfig,{new:true});
        
        if (!updatedGlobalFeeConfig) {
            throw new ApiError({
                statusCode: httpStatus.NOT_FOUND,
                message: 'Global fee config not found',
            });
        }
        
        return updatedGlobalFeeConfig;
    },
    async deleteGlobalFeeConfig(id:string):Promise<IGlobalFeeConfigDocument | null>{
        if (!id) {
            throw new ApiError({
                statusCode: httpStatus.BAD_REQUEST,
                message: 'Global fee config ID is required',
            });
        }
        
        const deletedGlobalFeeConfig = await GlobalFeeConfig.findByIdAndDelete(id);
        
        if (!deletedGlobalFeeConfig) {
            throw new ApiError({
                statusCode: httpStatus.NOT_FOUND,
                message: 'Global fee config not found',
            });
        }
        
        return deletedGlobalFeeConfig;
    },
}

export default GlobalFeeConfigServices; 