import catchAsync from '../../utils/catchAsync';
import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import GlobalRiskFactorServices from '../../services/config/globalRiskFactor.service';

const GlobalRiskFactorController = {
  createGlobalRiskFactor: catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const newGlobalRiskFactor = await GlobalRiskFactorServices.createGlobalRiskFactor(req.body);
      sendResponse(res, 201, {
        data: newGlobalRiskFactor,
        message: 'Global Risk Factor created successfully',
      });
    }
  ),

  getGlobalRiskFactors: catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const { assetClass = "", assetCategory = "", status } = req.query;
      
      const globalRiskFactors = await GlobalRiskFactorServices.getGlobalRiskFactors({
        assetClass: assetClass as string,
        assetCategory: assetCategory as string,
        status: status === 'true' ? true : status === 'false' ? false : undefined
      });

      sendResponse(res, 200, {
        data: globalRiskFactors,
        message: "Global Risk Factors fetched successfully",
      });
    }
  ),

  updateGlobalRiskFactor: catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const id: string = req.params.id;
      const updatedGlobalRiskFactor = await GlobalRiskFactorServices.updateGlobalRiskFactor({ 
        id, 
        globalRiskFactor: req.body 
      });
      
      sendResponse(res, 200, {
        data: updatedGlobalRiskFactor,
        message: 'Global Risk Factor updated successfully',
      });
    }
  ),

  deleteGlobalRiskFactor: catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const id: string = req.params.id;
      const deletedGlobalRiskFactor = await GlobalRiskFactorServices.deleteGlobalRiskFactor(id);
      
      sendResponse(res, 200, {
        data: deletedGlobalRiskFactor,
        message: 'Global Risk Factor deleted successfully',
      });
    }
  )
};

export default GlobalRiskFactorController; 