import catchAsync from '../../utils/catchAsync';
import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import GlobalFeeConfigServices from '../../services/config/globalFeeConfig.service';

const GlobalFeeConfigController = {
    createGlobalFeeConfig: catchAsync(
        async (req: Request, res: Response): Promise<void> => {
            const newGlobalFeeConfig = await GlobalFeeConfigServices.createGlobalFeeConfig(req.body);
            sendResponse(res, 201, {
                data: newGlobalFeeConfig,
                message: 'Global Fee Config created successfully',
            });
        }
    ),
    getGlobalFeeConfigs: catchAsync(async (req: Request, res: Response): Promise<void> => {
        const { assetClass = "", assetCategory = "", feeType = "" } = req.query;

        const globalFeeConfigs = await GlobalFeeConfigServices.getGlobalFeeConfigs({
            assetClass: assetClass as string,
            assetCategory: assetCategory as string,
            feeType: feeType as string
        });

        sendResponse(res, 200, {
            data: globalFeeConfigs,
            message: "Global Fee Configs fetched successfully",
        });
    }),
    updateGlobalFeeConfig: catchAsync(
        async (req: Request, res: Response): Promise<void> => {
            const id: string = req.params.id;
            const updatedGlobalFeeConfig = await GlobalFeeConfigServices.updateGlobalFeeConfig({ id, globalFeeConfig: req.body });
            sendResponse(res, 200, {
                data: updatedGlobalFeeConfig,
                message: 'Global Fee Config updated successfully',
            });
        }
    ),
    deleteGlobalFeeConfig: catchAsync(
        async (req: Request, res: Response): Promise<void> => {
            const id: string = req.params.id;
            const deletedGlobalFeeConfig = await GlobalFeeConfigServices.deleteGlobalFeeConfig(id);
            sendResponse(res, 200, {
                data: deletedGlobalFeeConfig,
                message: 'Global Fee Config deleted successfully',
            });
        }
    )
}

export default GlobalFeeConfigController;