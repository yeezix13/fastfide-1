
export interface EmailRequest {
  type: string;
  email: string;
  userType?: 'customer' | 'merchant';
  resetToken?: string;
  confirmationToken?: string;
  firstName?: string;
  lastName?: string;
  businessName?: string;
  newPassword?: string;
  userId?: string;
  token?: string;
  merchantName?: string;
  signupUrl?: string;
}

export interface EmailResponse {
  success: boolean;
  data?: any;
  error?: string;
}
