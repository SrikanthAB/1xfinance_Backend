import { Router } from 'express';
import GlobalRiskDisclosureController from '../../controllers/config/globalRiskDisclosure.controller';
import { validateRequest } from "../../middleware/validateRequest";
import { CreateGlobalRiskDisclosureValidation, UpdateGlobalRiskDisclosureValidation } from '../../validations/globalRiskDisclosure.validation';

export class GlobalRiskDisclosure {
  router: Router
  public globalRiskDisclosureController = GlobalRiskDisclosureController

  constructor() {
    this.router = Router()
    this.routes()
  }

  routes() {
    this.router.post('/', validateRequest(CreateGlobalRiskDisclosureValidation), this.globalRiskDisclosureController.createGlobalRiskDisclosure);
    this.router.get('/', this.globalRiskDisclosureController.getGlobalRiskDisclosures);
    this.router.put('/:id', validateRequest(UpdateGlobalRiskDisclosureValidation), this.globalRiskDisclosureController.updateGlobalRiskDisclosure);
    this.router.delete('/:id', this.globalRiskDisclosureController.deleteGlobalRiskDisclosure);
  }
} 