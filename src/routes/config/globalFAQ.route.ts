import { Router } from 'express';
import GlobalFAQController from '../../controllers/config/globalFAQ.controller';
import { validateRequest } from "../../middleware/validateRequest";
import { CreateGlobalFAQValidation, UpdateGlobalFAQValidation } from '../../validations/globalFAQ.validation';

export class GlobalFAQ {
  router: Router
  public globalFAQController = GlobalFAQController

  constructor() {
    this.router = Router()
    this.routes()
  }

  routes() {
    this.router.post('/', validateRequest(CreateGlobalFAQValidation), this.globalFAQController.createGlobalFAQ);
    this.router.get('/', this.globalFAQController.getGlobalFAQs);
    this.router.put('/:id', validateRequest(UpdateGlobalFAQValidation), this.globalFAQController.updateGlobalFAQ);
    this.router.delete('/:id', this.globalFAQController.deleteGlobalFAQ);
  }
} 