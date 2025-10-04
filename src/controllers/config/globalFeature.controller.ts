import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { IGlobalFeature } from '../../models/config/globalFeature.model';
import GlobalFeatureServices from '../../services/config/globalFeature.service';
import sendResponse from '../../utils/sendResponse';

const GlobalFeatureController = {
    createGlobalFeature: catchAsync(
        async (req: Request, res: Response): Promise<void> => {
            const feature: IGlobalFeature = req.body;
            const newFeature = await GlobalFeatureServices.createGlobalFeature(feature);
            sendResponse(res, 201, {
                data: newFeature,
                message: 'Global feature created successfully',
            });
        }
    ),
    
    getAllGlobalFeatures: catchAsync(
        async (req: Request, res: Response): Promise<void> => {
            const features = await GlobalFeatureServices.getAllGlobalFeatures();
            sendResponse(res, 200, {
                data: features,
                message: 'Global features retrieved successfully',
            });
        }
    ),
    
    updateGlobalFeature: catchAsync(
        async (req: Request, res: Response): Promise<void> => {
            const id: string = req.params.id;
            const updatedFeature: IGlobalFeature | null = await GlobalFeatureServices.updateGlobalFeature({ id, globalFeature: req.body });
            sendResponse(res, 200, {
                data: updatedFeature,
                message: 'Global feature updated successfully',
            });
        }
    ),
    
    deleteGlobalFeature: catchAsync(
        async (req: Request, res: Response): Promise<void> => {
            const id: string = req.params.id;
            const deletedFeature: IGlobalFeature | null = await GlobalFeatureServices.deleteGlobalFeature(id);
            sendResponse(res, 200, {
                data: deletedFeature,
                message: 'Global feature deleted successfully',
            });
        }
    ),
};

export default GlobalFeatureController;
