import { Request, Response } from "express";
import BusinessService, { WishlistInput, WishlistResult } from "../services/business.service";

export class BusinessController {
  static async addToWishlist(req: Request, res: Response) {
    try {
      const body = req.body as WishlistInput;
      console.log("body", body);
      if (!body.email) {
        return res.status(400).json({ success: false, message: "Missing fields" });
      }
      const result = await BusinessService.addToWishlist(body);
      console.log("result", result);
      return res.status(201).json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }


}