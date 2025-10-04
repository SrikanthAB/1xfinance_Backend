import express, {
  NextFunction,
  Response,
  Request,
  RequestHandler,
} from "express";
import mongoose from "mongoose";
import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import { MONGODB_URI } from "./utils/secrets";
import { UserRoutes } from "./routes/user/user.route";

import { KycRoutes } from "./routes/user/kyc.route";
import { AdminRoutes } from "./routes/admin/admin.route";
import  globalErrorHandler  from "./middleware/globalErrorHandler";

class Server {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.config(); // config() must come before routes()
    this.routes(); // routes use cors settings
    this.mongo();
    this.app.use((err : any , req : any, res : any, next :any) => {
      globalErrorHandler(err, req, res, next);
    });
  }

  public routes(): void {
    this.app.get("/api/health", (req, res) => {
      res.status(200).json({
        success: true,
        message: "Ownamli health check",
      });
    });
    this.app.use("/api/test", (req, res) => {
      res.status(200).json({
        success: true,
        message: "Ownmali V2 API india is running successfully!",
      });
    });
    this.app.use("/api/user", new UserRoutes().router);
  
    // admin login routes
    this.app.use("/api/admin", new AdminRoutes().router);


  }

  public config(): void {
    this.app.set("port", 3001);
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(compression() as unknown as RequestHandler);

    const allowedOrigins = [
      "http://localhost:3000", // User client local
      "http://localhost:5173", // Admin dashboard local
      "https://ownmali-admin.vercel.app",
      "https://ownmali.vercel.app",
      "https://ownmali-admin-v2.vercel.app",  
      "https://ownmali-v2.vercel.app"
    ];
    this.app.use(
      cors({
        origin: function (origin, callback) {
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error("Not allowed by CORS"));
          }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
      })
    );
  }

  private mongo() {
    const connection = mongoose.connection;
    connection.on("connected", () => {
      console.log("Mongo DB URI: ", MONGODB_URI);
      console.log("Mongo Connection Established");
    });
    connection.on("reconnected", () => {
      console.log("Mongo Connection Reestablished");
    });
    connection.on("disconnected", () => {
      console.log("Mongo Connection Disconnected");
      console.log("Mongo DB URI: ", MONGODB_URI);
      console.log("Trying to reconnect to Mongo ...");
      setTimeout(() => {
        mongoose.connect(MONGODB_URI, {
          socketTimeoutMS: 3000,
          connectTimeoutMS: 3000,
        });
      }, 3000);
    });
    connection.on("close", () => {
      console.log("Mongo Connection Closed");
    });
    connection.on("error", (error: Error) => {
      console.log("Mongo Connection ERROR: " + error);
    });

    const run = async () => {
      console.log("Mongo DB URI: ", MONGODB_URI);
      await mongoose.connect(MONGODB_URI);
    };
    run().catch((error) => console.error(error));
  }

  public start(): void {
    this.app.listen(this.app.get("port"), "0.0.0.0", () => {
      console.log(
        "✉️ API is running at http://localhost:%d",
        this.app.get("port")
      );
    });
  }
}

const server = new Server();
server.start();
