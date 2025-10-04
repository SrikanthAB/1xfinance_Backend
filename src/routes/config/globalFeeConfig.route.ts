import {Router} from 'express';
import GlobalFeeConfigController from '../../controllers/config/gobalFeeConfig.controller';
import { validateRequest } from "../../middleware/validateRequest";
import {CreateGlobalFeeConfigValidation,UpdateGlobalFeeConfigValidation } from '../../validations/globalFeeConfig.validation';

export class GlobalFeeConfig{
    router:Router
    public globalFeeCongiController = GlobalFeeConfigController

    constructor(){
        this.router = Router()
        this.routes()
    }

    routes(){
        this.router.post('/',validateRequest(CreateGlobalFeeConfigValidation),this.globalFeeCongiController.createGlobalFeeConfig);
        this.router.get('/',this.globalFeeCongiController.getGlobalFeeConfigs);
        this.router.put('/:id',validateRequest(UpdateGlobalFeeConfigValidation),this.globalFeeCongiController.updateGlobalFeeConfig);
        this.router.delete('/:id',this.globalFeeCongiController.deleteGlobalFeeConfig);
    }
}