import { Router } from 'express';
import { GlobalFeeConfig } from './globalFeeConfig.route';
import { GlobalFAQ } from './globalFAQ.route';
import { GlobalRiskFactor } from './globalRiskFactor.route';
import { GlobalRiskDisclosure } from './globalRiskDisclosure.route';
import { GlobalAdditionalTax } from './globalAdditionalTax.route';
import { GlobalExitOpportunity } from './globalExitOpportunity.route';
import { GlobalAmenityRoutes } from './globalAmenity.route';
import { GlobalFeatureRoutes } from './globalFeature.route';

class ConfigRoutes {
    public router: Router;

    constructor() {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        // Mount all global configuration routes to this router
        this.router.use('/fee-config', new GlobalFeeConfig().router);
        this.router.use('/faq', new GlobalFAQ().router);
        this.router.use('/risk-factor', new GlobalRiskFactor().router);
        this.router.use('/risk-disclosure', new GlobalRiskDisclosure().router);
        this.router.use('/additional-tax', new GlobalAdditionalTax().router);
        this.router.use('/exit-opportunity', new GlobalExitOpportunity().router);
        this.router.use('/amenities', new GlobalAmenityRoutes().router);
        this.router.use('/features', new GlobalFeatureRoutes().router);
    }
}

export { ConfigRoutes };
