export interface SmileIDConfig {
  partnerId: string;
  apiKey: string;
  notificationEmail: string;
  environment: 'sandbox' | 'production';
}

export interface SmileIDResponse {
  success: boolean;
  message?: string;
  error?: string;
}