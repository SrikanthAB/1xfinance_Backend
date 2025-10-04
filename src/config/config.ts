import dotenv from "dotenv";
import path from "path";
import Joi from "joi";

// Load environment variables from the .env file
dotenv.config({ path: path.join(__dirname, "../../.env") });

// Define a schema to validate the environment variables
const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string().valid("production", "development", "test").required(),
  PORT: Joi.number().default(3000),

  // MongoDB
  MONGODB_URI: Joi.string().required().description("MongoDB connection string"),

  // OTP
  OTP_EXPIRES_IN: Joi.string().default("5m").description("OTP expiration time"),

  // Admin JWT
  ADMIN_JWT_SECRET: Joi.string()
    .required()
    .description("Admin access token secret key"),
  ADMIN_JWT_ACCESS_EXPIRATION_MINUTES: Joi.string()
    .default("30m")
    .description("Admin access token expiration time"),
  ADMIN_REFRESH_SECRET: Joi.string()
    .required()
    .description("Admin refresh token secret key"),
  ADMIN_JWT_REFRESH_EXPIRATION_DAYS: Joi.string()
    .default("7d")
    .description("Admin refresh token expiration time"),

  // SMTP Configuration
  SMTP_HOST: Joi.string().description("SMTP server host"),
  SMTP_PORT: Joi.number().description("SMTP port"),
  SMTP_USERNAME: Joi.string().description("SMTP username"),
  SMTP_PASSWORD: Joi.string().description("SMTP password"),
  EMAIL_FROM: Joi.string().description('Default "from" email address'),

  // AWS S3
  AWS_BUCKET_NAME: Joi.string(),
  AWS_ACCESS_KEY_ID: Joi.string(),
  AWS_SECRET_ACCESS_KEY: Joi.string(),
  AWS_REGION: Joi.string(),

  //Smile ID
  SMILE_ID_PARTNER_ID: Joi.string().required().description("Smile ID Partner ID"),
  SMILE_ID_API_KEY: Joi.string().required().description("Smile ID API key"),
  SMILE_ID_API_URL: Joi.string().description("Smile ID API URL"), 
  SMILE_ID_ENVIRONMENT: Joi.string()
    .valid("sandbox", "production")
    .default("production")
    .description("Smile ID environment"),
  SMILE_ID_PARTNER_EMAIL: Joi.string()
    .email()
    .default("support@ownmali.com")
    .description("Partner email for Smile ID API"),
    

  // advanta
  ADVANTA_URL: Joi.string().required().description("Advanta URL"),
  ADVANTA_API_KEY: Joi.string().required().description("Advanta API key"),
  ADVANTA_SENDER_ID: Joi.string().required().description("Advanta Sender ID"),
  ADVANTA_PARTNER_ID: Joi.string().required().description("Advanta Partner ID"),

  // defautl country code
  DEFAULT_COUNTRY_CODE: Joi.string()
    .default("+254")
    .description("Default country code"),
  // Registrater with google
  GOOGLE_CLIENT_ID: Joi.string().required().description("Google client ID"),
  GOOGLE_MAPS_API_KEY: Joi.string()
    .required()
    .description("Google Maps API key"),
  // Sandy google client id
  GOOGLE_CLIENT_ID_SANDY: Joi.string()
    .required()
    .description("Google client ID for Sandy"),

  // JWT
  JWT_SECRET: Joi.string().required().description("JWT secret key"),
  JWT_REFRESH_SECRET: Joi.string()
    .required()
    .description("JWT refresh secret key"),
  JWT_ACCESS_EXPIRATION_MINUTES: Joi.number()
    .default(30)
    .description("Access token expiration time in minutes"),
  JWT_REFRESH_EXPIRATION_DAYS: Joi.number()
    .default(30)
    .description("Refresh token expiration time in days"),

  ENCRYPTION_KEY: Joi.string()
    .required()
    .description("Encryption key for sensitive data"),
})
  .unknown()
  .prefs({ errors: { label: "key" } });

// Validate the environment variables
const { value: envVars, error } = envVarsSchema.validate(process.env);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

// Define TypeScript interface for configuration
interface Config {
  env: string;
  port: number;
  mongoose: {
    url: string;
  };
  jwt: {
    accessTokenSecret: string;
    accessTokenExpiresIn: string;
    refreshTokenSecret: string;
    refreshTokenExpiresIn: string;
  };
  adminJwt:{
    adminAccessTokenSecret:string,
    adminAccessTokenExpiresIn: string;
    admiRrefreshTokenSecret: string;
    adminRefreshTokenExpiresIn: string
  },
  email: {
    smtp: {
      host: string | undefined;
      port: number | undefined;
      auth: {
        user: string | undefined;
        pass: string | undefined;
      };
    };
    from: string | undefined;
  };
  aws: {
    s3: {
      awsAccessKeyId: string | undefined;
      awsSecretAccessKey: string | undefined;
      awsRegion: string | undefined;
      bucketName: string | undefined;
    };
  };
  google: {
    googleClientId: string;
    googleMapsApiKey: string;
    googleClientIdSandy: string;
  };
  advanta: {
    url: string;
    apiKey: string;
    senderId: string;
    partnerId: string;
  };
  brevoApiKey: string,
  defaultCountryCode: string;
  cryptoKey: string;
  smileId: {
    partnerId: string;
    apiKey: string;
    apiUrl: string;
    environment: string;
    partnerEmail: string;
  };
}

// Export configuration with validated and typed variables
const config: Config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URI + (envVars.NODE_ENV === "test" ? "-test" : ""),
  },
  jwt: {
    accessTokenSecret: envVars.JWT_SECRET,
    accessTokenExpiresIn: envVars.JWT_ACCESS_EXPIRATION_MINUTES + "m",
    refreshTokenSecret: envVars.JWT_REFRESH_SECRET,
    refreshTokenExpiresIn: envVars.JWT_REFRESH_EXPIRATION_DAYS + "d",
  },
  adminJwt:{
    adminAccessTokenSecret:envVars.ADMIN_JWT_SECRET,
    adminAccessTokenExpiresIn:envVars.ADMIN_JWT_ACCESS_EXPIRATION_MINUTES + "m",
    admiRrefreshTokenSecret: envVars.ADMIN_REFRESH_SECRET,
    adminRefreshTokenExpiresIn: envVars.ADMIN_JWT_REFRESH_EXPIRATION_DAYS+ "d"
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },
  aws: {
    s3: {
      awsAccessKeyId: envVars.AWS_ACCESS_KEY_ID,
      awsSecretAccessKey: envVars.AWS_SECRET_ACCESS_KEY,
      awsRegion: envVars.AWS_REGION,
      bucketName: envVars.AWS_BUCKET_NAME,
    },
  },
  google: {
    googleClientId: envVars.GOOGLE_CLIENT_ID,
    googleMapsApiKey: envVars.GOOGLE_MAPS_API_KEY,
    googleClientIdSandy: envVars.GOOGLE_CLIENT_ID_SANDY,
  },
  smileId: {
    partnerId: envVars.SMILE_ID_PARTNER_ID,
    apiKey: envVars.SMILE_ID_API_KEY,
    apiUrl: envVars.SMILE_ID_API_URL,
    environment: envVars.SMILE_ID_ENVIRONMENT || "production",
    partnerEmail: envVars.SMILE_ID_PARTNER_EMAIL,
  },
  advanta: {
    url: envVars.ADVANTA_URL,
    apiKey: envVars.ADVANTA_API_KEY,
    senderId: envVars.ADVANTA_SENDER_ID,
    partnerId: envVars.ADVANTA_PARTNER_ID,
  },
  brevoApiKey: envVars.BREVO_API_KEY,
  defaultCountryCode: envVars.DEFAULT_COUNTRY_CODE,
  cryptoKey: envVars.ENCRYPTION_KEY,
};

export default config;
