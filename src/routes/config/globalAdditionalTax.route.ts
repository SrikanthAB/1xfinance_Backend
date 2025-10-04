import { Router } from 'express';
import GlobalAdditionalTaxController from '../../controllers/config/globalAdditionalTax.controller';
import { validateRequest } from "../../middleware/validateRequest";
import { CreateGlobalAdditionalTaxValidation, UpdateGlobalAdditionalTaxValidation } from '../../validations/globalAdditionalTax.validation';

export class GlobalAdditionalTax {
  router: Router
  public globalAdditionalTaxController = GlobalAdditionalTaxController

  constructor() {
    this.router = Router()
    this.routes()
  }

  routes() {
    this.router.post('/', validateRequest(CreateGlobalAdditionalTaxValidation), this.globalAdditionalTaxController.createGlobalAdditionalTax);
    this.router.get('/', this.globalAdditionalTaxController.getGlobalAdditionalTaxes);
    this.router.put('/:id', validateRequest(UpdateGlobalAdditionalTaxValidation), this.globalAdditionalTaxController.updateGlobalAdditionalTax);
    this.router.delete('/:id', this.globalAdditionalTaxController.deleteGlobalAdditionalTax);
  }
} 