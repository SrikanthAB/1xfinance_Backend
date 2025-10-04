import { ITokens } from "../interfaces/global";

export const tokenTypes :ITokens = {
  ACCESS: 'access' as const,
  REFRESH: 'refresh' as const,
  ADMIN_ACCESS:'adminAccess' as const,
  ADMIN_REFRESH:'adminRefresh' as const
};

export type TokenType = (typeof tokenTypes)[keyof typeof tokenTypes];
