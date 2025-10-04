import catchAsync from '../../utils/catchAsync';
import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import GlobalExitOpportunityServices from '../../services/config/globalExitOpportunity.service';

const GlobalExitOpportunityController = {
  createGlobalExitOpportunity: catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const newGlobalExitOpportunity = await GlobalExitOpportunityServices.createGlobalExitOpportunity(req.body);
      sendResponse(res, 201, {
        data: newGlobalExitOpportunity,
        message: 'Global Exit Opportunity created successfully',
      });
    }
  ),

  getGlobalExitOpportunities: catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const { assetClass = "", assetCategory = "", status } = req.query;
      
      const globalExitOpportunities = await GlobalExitOpportunityServices.getGlobalExitOpportunities({
        assetClass: assetClass as string,
        assetCategory: assetCategory as string,
        status: status === 'true' ? true : status === 'false' ? false : undefined
      });

      sendResponse(res, 200, {
        data: globalExitOpportunities,
        message: "Global Exit Opportunities fetched successfully",
      });
    }
  ),

  updateGlobalExitOpportunity: catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const id: string = req.params.id;
      const updatedGlobalExitOpportunity = await GlobalExitOpportunityServices.updateGlobalExitOpportunity({ 
        id, 
        globalExitOpportunity: req.body 
      });
      
      sendResponse(res, 200, {
        data: updatedGlobalExitOpportunity,
        message: 'Global Exit Opportunity updated successfully',
      });
    }
  ),

  deleteGlobalExitOpportunity: catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const id: string = req.params.id;
      const deletedGlobalExitOpportunity = await GlobalExitOpportunityServices.deleteGlobalExitOpportunity(id);
      
      sendResponse(res, 200, {
        data: deletedGlobalExitOpportunity,
        message: 'Global Exit Opportunity deleted successfully',
      });
    }
  )
};

export default GlobalExitOpportunityController; 