import axios from 'axios';
import pug from 'pug';
import path from 'path';
import config from "../config/config";
import ApiError from "../utils/ApiError";

const renderTemplate = (templateName: string, context: any) => {
  const templatePath = path.join(__dirname, '../templates/', `${templateName}.pug`);
  return pug.renderFile(templatePath, context);
};

const sendEmail = async (email: string, subject: string, template: string, context = {}) => {
  try {
    const htmlContent = renderTemplate(template, context);
    const textContent = htmlContent.replace(/<[^>]+>/g, ''); 

    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: config.email.smtp.auth.user,
          email: config.email.from,
        },
        to: [
          {email}
        ],
        subject,
        htmlContent,
        textContent,
      },
      {
        headers: {
          'accept': 'application/json',
          'api-key': config.brevoApiKey,
          'content-type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (err: any) {
    console.error('Error sending email:', err?.response?.data || err.message);
    throw new ApiError({ statusCode: 500, message: err?.response?.data?.message || err.message });
  }
};

export const sendOtpToEmail = async (email: string, otp: string) => {
   await sendEmail(email, 'Ryzer verification code', 'otp', { otp });
};

export const sendWelcomeEmail = async (email: string, context = {}) => {
  await sendEmail(email, 'Welcome to Ryzer!', 'welcome', context);
};

