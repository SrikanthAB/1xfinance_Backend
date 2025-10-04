import { Router } from 'express';
import GlobalExitOpportunityController from '../../controllers/config/globalExitOpportunity.controller';
import { validateRequest } from "../../middleware/validateRequest";
import { CreateGlobalExitOpportunityValidation, UpdateGlobalExitOpportunityValidation } from '../../validations/globalExitOpportunity.validation';

export class GlobalExitOpportunity {
  router: Router
  public globalExitOpportunityController = GlobalExitOpportunityController

  constructor() {
    this.router = Router()
    this.routes()
  }

  routes() {
    this.router.post('/', validateRequest(CreateGlobalExitOpportunityValidation), this.globalExitOpportunityController.createGlobalExitOpportunity);
    this.router.get('/', this.globalExitOpportunityController.getGlobalExitOpportunities);
    this.router.put('/:id', validateRequest(UpdateGlobalExitOpportunityValidation), this.globalExitOpportunityController.updateGlobalExitOpportunity);
    this.router.delete('/:id', this.globalExitOpportunityController.deleteGlobalExitOpportunity);
  }
} 