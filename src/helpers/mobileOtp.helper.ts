import ApiError from "../utils/ApiError";

export enum ApiResponseCode {
  Success = 200,
  InvalidSenderId = 1001,
  NetworkNotAllowed = 1002,
  InvalidMobileNumber = 1003,
  LowBulkCredits = 1004,
  SystemError1 = 1005, // Failed. System error
  InvalidCredentials = 1006,
  SystemError2 = 1007, // Failed. System error
  NoDeliveryReport = 1008,
  UnsupportedDataType = 1009,
  UnsupportedRequestType = 1010,
  TooManyMessagesOnSmsList = 1012,
  TooManyCommaSeparatedContacts = 1104,
  InternalErrorTryAgain = 4090,
  NoPartnerIdSet = 4091,
  NoApiKeyProvided = 4092,
  DetailsNotFound = 4093,
}

// Helper function to handle API response from sendMobileOTP
export function handleSendOTPResponse(apiResult: any): void {
  if (!apiResult || !apiResult.responses || apiResult.responses.length === 0) {
    throw new ApiError({
      statusCode: 500,
      message: "Failed to send OTP: Invalid API response",
    });
  }

  const response = apiResult.responses[0];
  const responseCode = parseInt(response["response-code"] as any, 10);
  const responseDescription = response["response-description"];

  if (responseCode !== ApiResponseCode.Success) {
    switch (responseCode) {
      case ApiResponseCode.InvalidSenderId:
        throw new ApiError({
          statusCode: 400,
          message: `Failed to send OTP: Invalid sender ID (${responseDescription})`,
        });
      case ApiResponseCode.NetworkNotAllowed:
        throw new ApiError({
          statusCode: 400,
          message: `Failed to send OTP: Network not allowed (${responseDescription})`,
        });
      case ApiResponseCode.InvalidMobileNumber:
        throw new ApiError({
          statusCode: 400,
          message: `Failed to send OTP: Invalid mobile number (${responseDescription})`,
        });
      case ApiResponseCode.LowBulkCredits:
        throw new ApiError({
          statusCode: 500,
          message: `Failed to send OTP: Low bulk credits (${responseDescription})`,
        });
      case ApiResponseCode.InvalidCredentials:
        throw new ApiError({
          statusCode: 401,
          message: `Failed to send OTP: Invalid credentials (${responseDescription})`,
        });
      case ApiResponseCode.NoPartnerIdSet:
      case ApiResponseCode.NoApiKeyProvided:
        throw new ApiError({
          statusCode: 500,
          message: `Failed to send OTP: API configuration error (${responseDescription})`,
        });
      case ApiResponseCode.SystemError1:
      case ApiResponseCode.SystemError2:
      case ApiResponseCode.InternalErrorTryAgain:
      case ApiResponseCode.DetailsNotFound:
      default:
        throw new ApiError({
          statusCode: 500,
          message: `Failed to send OTP: ${responseDescription || "Unknown error"}`,
        });
    }
  }
}
