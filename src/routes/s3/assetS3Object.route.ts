import { Router } from "express";
import * as assetS3ObjectController from "../../controllers/assetS3Object.controller";
// import auth from '../../middleware/auth.middleware';
import { validateRequest } from "../../middleware/validateRequest";
import assetS3ObjectValidation from "../../validations/assetS3Object.validation";

export class S3ObjectRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  private routes(): void {
    // Base routes for single asset operations
    this.router.route("/").get(
      // auth,
      validateRequest(assetS3ObjectValidation.getAssetS3Objects.query, {
        target: "query",
      }),
      assetS3ObjectController.getAssetS3Objects
    );

    this.router.route("/upload-single").post(
      // auth,
      validateRequest(assetS3ObjectValidation.createSingleUploadUrl.body),
      assetS3ObjectController.createSingleUploadUrl
    );

    // Routes for multiple asset operations
    this.router.route("/upload-multiple").post(
      // auth,
      validateRequest(assetS3ObjectValidation.createMultipleUploadUrls.body),
      assetS3ObjectController.createMultipleUploadUrls
    );

    this.router.route("/multiple/:assetId").put(
      // auth,
      validateRequest(
        assetS3ObjectValidation.updateMultipleAssetS3Objects.params,
        { target: "params" }
      ),
      validateRequest(
        assetS3ObjectValidation.updateMultipleAssetS3Objects.body
      ),
      assetS3ObjectController.updateMultipleAssetS3Objects
    );

    this.router
      .route("/assetS3Objects/:assetId")
      .get(
        // auth,
        assetS3ObjectController.getAssetS3ObjectsByAssetId
      )
      .delete(
        // auth,
        assetS3ObjectController.deleteAssetS3ObjectsByAssetId
      );

    this.router
      .route("/:id")
      .get(
        // auth,
        validateRequest(assetS3ObjectValidation.getAssetS3ObjectById.params, {
          target: "params",
        }),
        assetS3ObjectController.getAssetS3ObjectById
      )
      .put(
        // auth,
        validateRequest(assetS3ObjectValidation.updateAssetS3Object.params, {
          target: "params",
        }),
        validateRequest(assetS3ObjectValidation.updateAssetS3Object.body),
        assetS3ObjectController.updateAssetS3Object
      )
      .delete(
        // auth,
        validateRequest(assetS3ObjectValidation.deleteAssetS3Object.params, {
          target: "params",
        }),
        assetS3ObjectController.deleteAssetS3Object
      );

    this.router.route("/:id/s3PresignedUrl").get(
      // auth,
      validateRequest(assetS3ObjectValidation.getS3ObjectUrl.params, {
        target: "params",
      }),
      assetS3ObjectController.getS3ObjectUrl
    );

    // Add new route for permanent URL
    this.router.route("/:id/s3Url").get(
      // auth,
      validateRequest(assetS3ObjectValidation.getPermanents3Url.params, {
        target: "params",
      }),
      assetS3ObjectController.getPermanentS3Url
    );
  }
}
