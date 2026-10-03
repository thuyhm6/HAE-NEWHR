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
  requirePersonalDataConfirm: boolean;
}

export interface LoginResult {
  success: boolean;
  redirectUrl?: string;
  requirePasswordChange?: boolean;
  requirePersonalDataConfirm?: boolean;
  message?: string;
  remainingAttempts?: number;
  timeUntilReset?: number;
}

/** Tương ứng với PersonalDataConfirmInfoDTO (backend) - GET /api/personal-data-confirm/info. */
export interface PersonalDataConfirmInfo {
  localName: string;
  empId: string;
  positionName: string;
  teamName: string;
  partName: string;
  cellName: string;
}
