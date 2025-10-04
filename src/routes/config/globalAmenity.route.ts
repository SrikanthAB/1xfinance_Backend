import { Router } from 'express'
import GlobalAmenityController from "../../controllers/config/globalAmenity.controller";
import { createAmenityFeatureSchema, updateAmenityFeatureSchema } from '../../validations/globalAmenityFeature.validation';
import { validateRequest } from '../../middleware/validateRequest';

export class GlobalAmenityRoutes {
    router: Router;
    public globalAmenityController = GlobalAmenityController;

    constructor() {
        this.router = Router()
        this.routes()
    }

    routes() {
        // Get all global amenities
        this.router.get('/', this.globalAmenityController.getAllGlobalAmenities)
        
        // Create a new global amenity
        this.router.post('/', validateRequest(createAmenityFeatureSchema), this.globalAmenityController.createGlobalAmenity)
        
        // Update global amenity by ID
        this.router.put('/:id', validateRequest(updateAmenityFeatureSchema), this.globalAmenityController.updateGlobalAmenity)
        
        // Delete global amenity by ID
        this.router.delete('/:id', this.globalAmenityController.deleteGlobalAmenity)
    }
}