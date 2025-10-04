import catchAsync from '../../utils/catchAsync';
import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import GlobalFAQServices from '../../services/config/globalFAQ.service';

const GlobalFAQController = {
  createGlobalFAQ: catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const newGlobalFAQ = await GlobalFAQServices.createGlobalFAQ(req.body);
      sendResponse(res, 201, {
        data: newGlobalFAQ,
        message: 'Global FAQ created successfully',
      });
    }
  ),

  getGlobalFAQs: catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const { assetClass = "", assetCategory = "", status } = req.query;
      
      const globalFAQs = await GlobalFAQServices.getGlobalFAQs({
        assetClass: assetClass as string,
        assetCategory: assetCategory as string,
        status: status === 'true' ? true : status === 'false' ? false : undefined
      });

      sendResponse(res, 200, {
        data: globalFAQs,
        message: "Global FAQs fetched successfully",
      });
    }
  ),

  updateGlobalFAQ: catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const id: string = req.params.id;
      const updatedGlobalFAQ = await GlobalFAQServices.updateGlobalFAQ({ 
        id, 
        globalFAQ: req.body 
      });
      
      sendResponse(res, 200, {
        data: updatedGlobalFAQ,
        message: 'Global FAQ updated successfully',
      });
    }
  ),

  deleteGlobalFAQ: catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const id: string = req.params.id;
      const deletedGlobalFAQ = await GlobalFAQServices.deleteGlobalFAQ(id);
      
      sendResponse(res, 200, {
        data: deletedGlobalFAQ,
        message: 'Global FAQ deleted successfully',
      });
    }
  )
};

export default GlobalFAQController; 