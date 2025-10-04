
import GlobalFeature, { IGlobalFeature } from "../../models/config/globalFeature.model";
import ApiError from "../../utils/ApiError";
import httpStatus from "http-status";

const GlobalFeatureServices = {
    async createGlobalFeature(globalFeature: IGlobalFeature): Promise<IGlobalFeature> {
        // Check if global feature with same name, assetClass and assetCategory already exists
        const existingFeature = await GlobalFeature.findOne({
            name: globalFeature.name,
            assetClass: globalFeature.assetClass,
            assetCategory: globalFeature.assetCategory
        });
        
        if (existingFeature) {
            throw new ApiError({
                statusCode: httpStatus.CONFLICT,
                message: `A global feature named "${globalFeature.name}" already exists for this asset class and category`,
            });
        }
        
        const newGlobalFeature = await GlobalFeature.create(globalFeature);
        return newGlobalFeature;
    },
    
    async getAllGlobalFeatures(): Promise<IGlobalFeature[]> {
        const features = await GlobalFeature.find().sort({ createdAt: -1 });
        return features;
    },
    
    async getGlobalFeaturesByCategoryAndClass(assetCategory: string, assetClass: string): Promise<IGlobalFeature[]> {
        const features = await GlobalFeature.find({ 
            assetCategory, 
            assetClass,
            status: true 
        }).sort({ createdAt: -1 });
        return features;
    },
    
    async updateGlobalFeature({
        id,
        globalFeature,
    }: {
        id: string;
        globalFeature: Partial<IGlobalFeature>;
    }): Promise<IGlobalFeature | null> {
        if (!id) {
            throw new ApiError({
                statusCode: httpStatus.BAD_REQUEST,
                message: 'Global feature ID is required',
            });
        }
        
        // If name is being updated, check for duplicates
        if (globalFeature.name) {
            // Get the current feature to check its class and category
            const currentFeature = await GlobalFeature.findById(id);
            if (!currentFeature) {
                throw new ApiError({
                    statusCode: httpStatus.NOT_FOUND,
                    message: 'Global feature not found',
                });
            }
            
            // Use the provided values or fall back to the current values
            const assetClass = globalFeature.assetClass || currentFeature.assetClass;
            const assetCategory = globalFeature.assetCategory || currentFeature.assetCategory;
            
            // Check if another feature with the same name exists in this class and category
            const existingFeature = await GlobalFeature.findOne({
                name: globalFeature.name,
                assetClass: assetClass,
                assetCategory: assetCategory,
                _id: { $ne: id } // Exclude the current feature
            });
            
            if (existingFeature) {
                throw new ApiError({
                    statusCode: httpStatus.CONFLICT,
                    message: `A global feature named "${globalFeature.name}" already exists for this asset class and category`,
                });
            }
        }
        
        const updatedGlobalFeature = await GlobalFeature.findByIdAndUpdate(
            id,
            globalFeature,
            { new: true }
        );
        
        if (!updatedGlobalFeature) {
            throw new ApiError({
                statusCode: httpStatus.NOT_FOUND,
                message: 'Global feature not found',
            });
        }
        
        return updatedGlobalFeature;
    },
    
    async deleteGlobalFeature(id: string): Promise<IGlobalFeature | null> {
        if (!id) {
            throw new ApiError({
                statusCode: httpStatus.BAD_REQUEST,
                message: 'Global feature ID is required',
            });
        }
        
        const deletedGlobalFeature = await GlobalFeature.findByIdAndDelete(id);
        
        if (!deletedGlobalFeature) {
            throw new ApiError({
                statusCode: httpStatus.NOT_FOUND,
                message: 'Global feature not found',
            });
        }
        
        return deletedGlobalFeature;
    },
};

export default GlobalFeatureServices;
