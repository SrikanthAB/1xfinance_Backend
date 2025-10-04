import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { IGlobalAmenity } from '../../models/config/globalAmenity.model';
import GlobalAmenityServices from '../../services/config/globalAmenity.service';
import sendResponse from '../../utils/sendResponse';

const GlobalAmenityController = {
    createGlobalAmenity: catchAsync(
        async (req: Request, res: Response): Promise<void> => {
            const amenity: IGlobalAmenity = req.body;
            const newAmenity = await GlobalAmenityServices.createGlobalAmenity(amenity);
            sendResponse(res, 201, {
                data: newAmenity,
                message: 'Global amenity created successfully',
            });
        }
    ),
    
    getAllGlobalAmenities: catchAsync(
        async (req: Request, res: Response): Promise<void> => {
            const amenities = await GlobalAmenityServices.getAllGlobalAmenities();
            sendResponse(res, 200, {
                data: amenities,
                message: 'Global amenities retrieved successfully',
            });
        }
    ),
    
    updateGlobalAmenity: catchAsync(
        async (req: Request, res: Response): Promise<void> => {
            const id: string = req.params.id;
            const updatedAmenity: IGlobalAmenity | null =
                await GlobalAmenityServices.updateGlobalAmenity({ id, amenity: req.body });
            sendResponse(res, 200, {
                data: updatedAmenity,
                message: 'Global amenity updated successfully',
            });
        }
    ),
    
    deleteGlobalAmenity: catchAsync(
        async (req: Request, res: Response): Promise<void> => {
            const id: string = req.params.id;
            const deletedAmenity: IGlobalAmenity | null =
                await GlobalAmenityServices.deleteGlobalAmenity(id);
            sendResponse(res, 200, {
                data: deletedAmenity,
                message: 'Global amenity deleted successfully',
            });
        }
    ),
};

export default GlobalAmenityController;
