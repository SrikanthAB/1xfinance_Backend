import jwt, { JwtPayload } from "jsonwebtoken";
import { TokenType, tokenTypes } from "../../config/tokens";
import config from "../../config/config"; // Import config

// Define CustomJwtPayload type if not already defined elsewhere
type CustomJwtPayload = JwtPayload & {
  _id: string;
  role?: string;
};

// Map token types to their config values for expiration and secret
const tokenTypeConfig = {
  [tokenTypes.ACCESS]: {
    expiresIn: config.jwt.accessTokenExpiresIn, // e.g., '15m'
    secret: config.jwt.accessTokenSecret,
  },
  [tokenTypes.REFRESH]: {
    expiresIn: config.jwt.refreshTokenExpiresIn, // e.g., '7d'
    secret: config.jwt.refreshTokenSecret,
  },
  [tokenTypes.ADMIN_ACCESS]: {
    expiresIn: config.adminJwt.adminAccessTokenExpiresIn,
    secret: config.adminJwt.adminAccessTokenSecret,
  },
  [tokenTypes.ADMIN_REFRESH]: {
    expiresIn: config.adminJwt.adminRefreshTokenExpiresIn,
    secret: config.adminJwt.admiRrefreshTokenSecret,
  },
};

const jwtTokenGenerate = ({
  payload,
  tokenType,
}: {
  payload: CustomJwtPayload;
  tokenType: keyof typeof tokenTypes;
}): string => {
  const configForType = tokenTypeConfig[tokenType];
  if (!configForType) throw new Error('Invalid token type');
  return jwt.sign(payload, configForType.secret, { expiresIn: configForType.expiresIn });
};

const verifyToken = ({
  token,
  tokenType,
}: {
  token: string;
  tokenType: TokenType;
}): Promise<CustomJwtPayload> => {
  const configForType = tokenTypeConfig[tokenType];
  if (!configForType) throw new Error('Invalid token type');
  return new Promise((resolve, reject) => {
    jwt.verify(token, configForType.secret, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      resolve(decoded as CustomJwtPayload);
    });
  });
};

const jwtToken = {
  generate: jwtTokenGenerate,
  verify: verifyToken,
};

export default jwtToken;
