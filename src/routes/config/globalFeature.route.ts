import { Router } from 'express'
import GlobalFeatureController from "../../controllers/config/globalFeature.controller";
import { createAmenityFeatureSchema, updateAmenityFeatureSchema } from '../../validations/globalAmenityFeature.validation';
import { validateRequest } from '../../middleware/validateRequest';

export class GlobalFeatureRoutes {
    router: Router;
    public globalFeatureController = GlobalFeatureController;

    constructor() {
        this.router = Router()
        this.routes()
    }

    routes() {
        // Get all global features
        this.router.get('/', this.globalFeatureController.getAllGlobalFeatures)
        
        // Create a new global feature
        this.router.post('/', validateRequest(createAmenityFeatureSchema), this.globalFeatureController.createGlobalFeature)
        
        // Update global feature by ID
        this.router.put('/:id', validateRequest(updateAmenityFeatureSchema), this.globalFeatureController.updateGlobalFeature)
        
        // Delete global feature by ID
        this.router.delete('/:id', this.globalFeatureController.deleteGlobalFeature)
    }
}