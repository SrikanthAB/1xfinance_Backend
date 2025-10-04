import axios from "axios";
import config from "./config";

const sendMobileOTP = async ({
  mobileNumber,
  otp,
  isForgotPassword = false,
}: {
  mobileNumber: string;
  otp: string;
  isForgotPassword?: boolean;
}) => {
  const response = await axios.post(`${config.advanta.url}`, {
    apikey: config.advanta.apiKey,
    partnerID: config.advanta.partnerId,
    mobile: mobileNumber,
    message: isForgotPassword
      ? `Your OwnMali password reset code is ${otp}. STOP *456*9*5#`
      : `Your OwnMali verification code is ${otp}. STOP *456*9*5#`,
    shortcode: config.advanta.senderId,
  });
  return response.data;
};

export default sendMobileOTP;
