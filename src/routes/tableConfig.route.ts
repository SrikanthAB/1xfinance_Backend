import {Router} from 'express'
import TableConfigController from '../controllers/tableConfig.controller'
import { validateRequest } from '../middleware/validateRequest'
import { createTableConfigSchema,updateTableConfigSchema,paramsWithIdSchema } from '../validations/tableConfig.validation';

export class TableConfigRoutes{
    router:Router;
    public tableConfigController = TableConfigController;
    constructor(){
        this.router = Router();
        this.routes();
    }
    routes(){
        this.router.get('/',this.tableConfigController.getAllTableConfigs);
        this.router.post('/',validateRequest(createTableConfigSchema),this.tableConfigController.createTableConfig)
        this.router.put('/',validateRequest(updateTableConfigSchema),this.tableConfigController.updateTableConfig)
        this.router.delete('/:id',validateRequest(paramsWithIdSchema,{ target: 'params' }),this.tableConfigController.deleteTableConfigId);
    }
}