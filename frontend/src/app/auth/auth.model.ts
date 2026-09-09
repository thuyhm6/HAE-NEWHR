/** Tương ứng với HrAuthenticationService.HrUserInfo (backend) - xem AuthController#me. */
export interface CurrentUser {
  username: string;
  employeeName: string;
  photoUrl: string;
  personId: string;
  cpnyId: string;
  userType: string;
  admin: boolean;
  requirePasswordChange: boolean;
  hasSysTypeZeroMenus: boolean;
}

export interface LoginResult {
  success: boolean;
  redirectUrl?: string;
  requirePasswordChange?: boolean;
  message?: string;
  remainingAttempts?: number;
  timeUntilReset?: number;
}
