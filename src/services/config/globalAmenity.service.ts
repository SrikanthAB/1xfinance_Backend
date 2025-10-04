
import GlobalAmenity, { IGlobalAmenity } from '../../models/config/globalAmenity.model';
import ApiError from '../../utils/ApiError';
import httpStatus from 'http-status';

const GlobalAmenityServices = {
    async createGlobalAmenity(amenity: IGlobalAmenity): Promise<IGlobalAmenity> {
        // Check if global amenity with same name, assetClass and assetCategory already exists
        const existingAmenity = await GlobalAmenity.findOne({
            name: amenity.name,
            assetClass: amenity.assetClass,
            assetCategory: amenity.assetCategory
        });
        
        if (existingAmenity) {
            throw new ApiError({
                statusCode: httpStatus.CONFLICT,
                message: `A global amenity named "${amenity.name}" already exists for this asset class and category`,
            });
        }
        
        const newAmenity = await GlobalAmenity.create(amenity);
        return newAmenity;
    },
    
    async getAllGlobalAmenities(): Promise<IGlobalAmenity[]> {
        const amenities = await GlobalAmenity.find().sort({ createdAt: -1 });
        return amenities;
    },
    
    async getGlobalAmenitiesByCategoryAndClass(assetCategory: string, assetClass: string): Promise<IGlobalAmenity[]> {
        const amenities = await GlobalAmenity.find({ 
            assetCategory, 
            assetClass,
            status: true 
        }).sort({ createdAt: -1 });
        return amenities;
    },
    
    async updateGlobalAmenity({
        id,
        amenity,
    }: {
        id: string;
        amenity: Partial<IGlobalAmenity>;
    }): Promise<IGlobalAmenity | null> {
        if (!id) {
            throw new ApiError({
                statusCode: httpStatus.BAD_REQUEST,
                message: 'Global amenity ID is required',
            });
        }
        
        // If name is being updated, check for duplicates
        if (amenity.name) {
            // Get the current amenity to check its class and category
            const currentAmenity = await GlobalAmenity.findById(id);
            if (!currentAmenity) {
                throw new ApiError({
                    statusCode: httpStatus.NOT_FOUND,
                    message: 'Global amenity not found',
                });
            }
            
            // Use the provided values or fall back to the current values
            const assetClass = amenity.assetClass || currentAmenity.assetClass;
            const assetCategory = amenity.assetCategory || currentAmenity.assetCategory;
            
            // Check if another amenity with the same name exists in this class and category
            const existingAmenity = await GlobalAmenity.findOne({
                name: amenity.name,
                assetClass: assetClass,
                assetCategory: assetCategory,
                _id: { $ne: id } // Exclude the current amenity
            });
            
            if (existingAmenity) {
                throw new ApiError({
                    statusCode: httpStatus.CONFLICT,
                    message: `A global amenity named "${amenity.name}" already exists for this asset class and category`,
                });
            }
        }
        
        const updatedAmenity = await GlobalAmenity.findByIdAndUpdate(id, amenity, {
            new: true,
        });
        
        if (!updatedAmenity) {
            throw new ApiError({
                statusCode: httpStatus.NOT_FOUND,
                message: 'Global amenity not found',
            });
        }
        
        return updatedAmenity;
    },
    
    async deleteGlobalAmenity(id: string): Promise<IGlobalAmenity | null> {
        if (!id) {
            throw new ApiError({
                statusCode: httpStatus.BAD_REQUEST,
                message: 'Global amenity ID is required',
            });
        }
        
        const deletedAmenity = await GlobalAmenity.findByIdAndDelete(id);
        
        if (!deletedAmenity) {
            throw new ApiError({
                statusCode: httpStatus.NOT_FOUND,
                message: 'Global amenity not found',
            });
        }
        
        return deletedAmenity;
    },
};

export default GlobalAmenityServices;
