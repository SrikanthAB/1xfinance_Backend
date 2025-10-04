import catchAsync from '../../utils/catchAsync';
import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import GlobalRiskDisclosureServices from '../../services/config/globalRiskDisclosure.service';

const GlobalRiskDisclosureController = {
  createGlobalRiskDisclosure: catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const newGlobalRiskDisclosure = await GlobalRiskDisclosureServices.createGlobalRiskDisclosure(req.body);
      sendResponse(res, 201, {
        data: newGlobalRiskDisclosure,
        message: 'Global Risk Disclosure created successfully',
      });
    }
  ),

  getGlobalRiskDisclosures: catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const { assetClass = "", assetCategory = "", status } = req.query;
      
      const globalRiskDisclosures = await GlobalRiskDisclosureServices.getGlobalRiskDisclosures({
        assetClass: assetClass as string,
        assetCategory: assetCategory as string,
        status: status === 'true' ? true : status === 'false' ? false : undefined
      });

      sendResponse(res, 200, {
        data: globalRiskDisclosures,
        message: "Global Risk Disclosures fetched successfully",
      });
    }
  ),

  updateGlobalRiskDisclosure: catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const id: string = req.params.id;
      const updatedGlobalRiskDisclosure = await GlobalRiskDisclosureServices.updateGlobalRiskDisclosure({ 
        id, 
        globalRiskDisclosure: req.body 
      });
      
      sendResponse(res, 200, {
        data: updatedGlobalRiskDisclosure,
        message: 'Global Risk Disclosure updated successfully',
      });
    }
  ),

  deleteGlobalRiskDisclosure: catchAsync(
    async (req: Request, res: Response): Promise<void> => {
      const id: string = req.params.id;
      const deletedGlobalRiskDisclosure = await GlobalRiskDisclosureServices.deleteGlobalRiskDisclosure(id);
      
      sendResponse(res, 200, {
        data: deletedGlobalRiskDisclosure,
        message: 'Global Risk Disclosure deleted successfully',
      });
    }
  )
};

export default GlobalRiskDisclosureController; 