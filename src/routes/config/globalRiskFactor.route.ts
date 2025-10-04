import { Router } from 'express';
import GlobalRiskFactorController from '../../controllers/config/globalRiskFactor.controller';
import { validateRequest } from "../../middleware/validateRequest";
import { CreateGlobalRiskFactorValidation, UpdateGlobalRiskFactorValidation } from '../../validations/globalRiskFactor.validation';

export class GlobalRiskFactor {
  router: Router
  public globalRiskFactorController = GlobalRiskFactorController

  constructor() {
    this.router = Router()
    this.routes()
  }

  routes() {
    this.router.post('/', validateRequest(CreateGlobalRiskFactorValidation), this.globalRiskFactorController.createGlobalRiskFactor);
    this.router.get('/', this.globalRiskFactorController.getGlobalRiskFactors);
    this.router.put('/:id', validateRequest(UpdateGlobalRiskFactorValidation), this.globalRiskFactorController.updateGlobalRiskFactor);
    this.router.delete('/:id', this.globalRiskFactorController.deleteGlobalRiskFactor);
  }
} 