import { Request, Response } from 'express';
import TableConfigService from '../services/tableConfig.service';
import sendResponse from '../utils/sendResponse';
import catchAsync from '../utils/catchAsync';

const TableConfigController = {
    getAllTableConfigs: catchAsync(async (req: Request, res: Response) => {
        const allTableConfigs = await TableConfigService.getAllTableConfigs();
        sendResponse(res, 200, {
            data: allTableConfigs,
            message: "All Table Configs retrived successfully"
        })
    }),
    createTableConfig: catchAsync(async (req: Request, res: Response) => {
        const { tableKey, config } = req.body;
        const tableConfig = await TableConfigService.createTableConfig({ tableKey, config });
        sendResponse(res, 201, {
            data: tableConfig,
            message: 'Table Config created successfully'
        })
    }),
    updateTableConfig: catchAsync(async (req: Request, res: Response) => {
        const { tableKey, config } = req.body;
        const tableConfig = await TableConfigService.updateTableConfig({ tableKey, config });
        sendResponse(res, 200, {
            data: tableConfig,
            message: 'Table Config updated successfully'
        })
    }),
    deleteTableConfigTableKey: catchAsync(
        async (req: Request, res: Response) => {
            const tableKey = req.query.tableKey as string
            const deletedTableConfig = await TableConfigService.deleteTableConfigByTableKey(tableKey);
            sendResponse(res, 200, {
                data: deletedTableConfig,
                message: 'Table Config deleted successfully'
            })
        }
    ),
    deleteTableConfigId: catchAsync(
        async (req: Request, res: Response) => {
            const { id } = req.params;
            const deletedTableConfig = await TableConfigService.deleteTableConfigById(id);
            sendResponse(res, 200, {
                data: deletedTableConfig,
                message: 'Table Config deleted successfully'
            })
        }
    )
}


export default TableConfigController;