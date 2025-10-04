import { Moment } from "moment";


export interface Token {
  token: string;
  expires: Date;
}

export interface ITokenUser {
  id: string;
  role: string;
}
export interface IGenerateTokenParams {
  userData: { id: string; role: string };
  expires: moment.Moment | Date;
  type: string;
  secret?: string;
}


export interface IAuthTokens {
  access: Token;
  refresh?: Token;
}

export interface IGenerateAuthTokensParams {
  user: ITokenUser;
  isRefreshToken: boolean;
}

export interface ISaveTokenParams {
  token: string;
  userData: ITokenUser;
  expires: Moment;
  type: string;
  blacklisted?: boolean;
}

export interface DecodedToken {
  _id: string;
  role?: string;
  iat?: number;
  exp?: number;
}