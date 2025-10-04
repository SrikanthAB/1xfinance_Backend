import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest";
import AdminController from "../../controllers/admin/admin.controller";
import { getMyOrdersQueryValidation } from "../../validations/order/order.validation";
import { authenticateAdmin } from "../../middleware/auth.middleware";

export class AdminRoutes {
  router: Router;
  public adminController = AdminController;

  constructor() {
    this.router = Router();
    this.routes();
  }
  routes() {
    this.router.post("/login", this.adminController.adminLogin);
    this.router.post("/refresh-token", this.adminController.refreshAccessToken);
  
    this.router.get(
      "/get-details",
      authenticateAdmin,
      this.adminController.getAdminDetails
    );
    
    // this.router.get(
    //   "/orders/:orderId",
    //   authenticateAdmin,
    //   this.adminController.getOrderById
    // );
    
  }
}
