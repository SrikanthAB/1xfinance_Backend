import catchAsync from '../../utils/catchAsync';
import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import GlobalAdditionalTaxServices from '../../services/config/globalAdditionalTax.service';

const GlobalAdditionalTaxController = {
  createGlobalAdditionalTax: catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const newGlobalAdditionalTax = await GlobalAdditionalTaxServices.createGlobalAdditionalTax(req.body);
      sendResponse(res, 201, {
        data: newGlobalAdditionalTax,
        message: 'Global Additional Tax created successfully',
      });
    }
  ),

  getGlobalAdditionalTaxes: catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const { assetClass = "", assetCategory = "", status } = req.query;
      
      const globalAdditionalTaxes = await GlobalAdditionalTaxServices.getGlobalAdditionalTaxes({
        assetClass: assetClass as string,
        assetCategory: assetCategory as string,
        status: status === 'true' ? true : status === 'false' ? false : undefined
      });

      sendResponse(res, 200, {
        data: globalAdditionalTaxes,
        message: "Global Additional Taxes fetched successfully",
      });
    }
  ),

  updateGlobalAdditionalTax: catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const id: string = req.params.id;
      const updatedGlobalAdditionalTax = await GlobalAdditionalTaxServices.updateGlobalAdditionalTax({ 
        id, 
        globalAdditionalTax: req.body 
      });
      
      sendResponse(res, 200, {
        data: updatedGlobalAdditionalTax,
        message: 'Global Additional Tax updated successfully',
      });
    }
  ),

  deleteGlobalAdditionalTax: catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const id: string = req.params.id;
      const deletedGlobalAdditionalTax = await GlobalAdditionalTaxServices.deleteGlobalAdditionalTax(id);
      
      sendResponse(res, 200, {
        data: deletedGlobalAdditionalTax,
        message: 'Global Additional Tax deleted successfully',
      });
    }
  )
};

export default GlobalAdditionalTaxController; 