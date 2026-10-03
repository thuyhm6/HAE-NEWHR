import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface MyInfo {
  personId?: string;
  localName?: string;
  empId?: string;
  postFamily?: string;
  deptName?: string;
  headDepartment?: string;
  postFamilyName?: string;
  dutyName?: string;
  positionNoName?: string;
  dateStarted?: string;
}

export interface HrDeptManager {
  PERSON_ID?: string;
  LOCAL_NAME?: string;
  EMP_ID?: string;
  DEPT_NAME?: string;
  POSITION_NAME?: string;
}

export interface OtDateInfo {
  SHIFT_NAME?: string;
  SHIFT_START_TIME?: string;
  SHIFT_END_TIME?: string;
  INDOOR_TIME?: string;
  OUTDOOR_TIME?: string;
  OT_TYPE_CODE?: string;
  OT_TYPE_NAME?: string;
  OT_TOTAIL_MONTH?: string | number;
  OT_TOTAIL?: string | number;
  WEEKDAY_OT_TOTAIL?: string | number;
  OT_LIMIT?: string;
  OT_LIMIT_100?: string;
}

export interface OtDurationResult {
  OT_LENGTH?: string | number;
}

export interface EmployeeSearchResult {
  personId?: string;
  empId?: string;
  localName?: string;
  deptNo?: string;
  deptName?: string;
  position?: string;
  positionName?: string;
}

export interface ApproverInput {
  personId: string;
  localName: string;
  empId: string;
  /** AFFIRM_TYPE bên backend: '1' = Phê duyệt, '3' = Thông báo */
  approvType: string;
}

export interface OvertimeSavePayload {
  applyNo: string;
  personId: string;
  localName: string;
  empId: string;
  otTypeNo: string;
  otTypeCode: string;
  applyOtDate: string;
  otFromTime: string;
  otToTime: string;
  otApplyHour: string;
  applyOtRemark: string;
  deductYn: string;
  usecarYn: string;
  carAddress: string;
  carAddressDetail: string;
  approvers: ApproverInput[];
}

export interface SaveResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface SyCodeOption {
  codeNo: string;
  codeName?: string;
  nameVi?: string;
}

const MY_INFO_URL = '/ess/empinfo/api/personalInfo/myInfo';
const HR_DEPT_MANAGER_URL = '/ess/infoApply/api/hrDeptManager';
const OT_DATE_INFO_URL = '/ess/infoApply/api/otDateInfo';
const OT_DURATION_URL = '/ess/infoApply/api/otDuration';
const EMPLOYEE_SEARCH_URL = '/hrm/empinfo/api/employee/search';
const CODE_LIST_URL = '/sys/api/getCode/list';

export const CAR_ADDRESS_PARENT_CODE = '90000578';

/** Giá trị AFFIRM_TYPE bên backend (SY_AFFIRM_EMAIL): '1' = Phê duyệt, '3' = Thông báo */
export const APPROV_TYPE_APPROVAL = '1';
export const APPROV_TYPE_NOTICE = '3';

/**
 * Các API dùng cho form xin tăng ca - dùng chung cho cả SstOtApplyComponent
 * (tăng ca thường - ess/infoApply/viewSSTOtApplyInfo.html, đã xoá) và
 * SstOtApplyOverComponent (tăng ca vượt - viewSSTOtApplyInfoTx.html, đã
 * xoá). 2 component tách riêng vì áp dụng rule nghiệp vụ khác nhau (giới
 * hạn giờ/tháng/năm, min duration theo nhóm nhân viên, tự động thêm Trưởng
 * bộ phận nhân sự - chỉ ở trang thường) và lưu vào 2 bảng khác nhau
 * (ESS_APPLY_OT vs ESS_APPLY_OT_OVER qua `saveUrl` truyền vào save()), nhưng
 * các API gọi (myInfo, otDateInfo, otDuration, tìm người phê duyệt, mã
 * tuyến xe...) hoàn toàn giống nhau nên giữ chung 1 service, tránh viết lại.
 * Thay EmployeeSearchModal (jQuery) bằng nz-select tìm kiếm server-side chọn
 * người phê duyệt (giống SstLeaveApplyComponent). Gọi lại nguyên vẹn API
 * JSON sẵn có.
 */
@Injectable({ providedIn: 'root' })
export class SstOtApplyService {
  private readonly http = inject(HttpClient);

  getMyInfo(): Promise<MyInfo> {
    return firstValueFrom(this.http.get<MyInfo>(MY_INFO_URL));
  }

  getHrDeptManager(): Promise<HrDeptManager> {
    return firstValueFrom(this.http.get<HrDeptManager>(HR_DEPT_MANAGER_URL));
  }

  getOtDateInfo(applyDate: string): Promise<OtDateInfo> {
    return firstValueFrom(this.http.get<OtDateInfo>(OT_DATE_INFO_URL, { params: { applyDate } }));
  }

  getOtDuration(applyOtDate: string, otFromTime: string, otToTime: string, deductYn: string): Promise<OtDurationResult> {
    return firstValueFrom(
      this.http.get<OtDurationResult>(OT_DURATION_URL, { params: { applyOtDate, otFromTime, otToTime, deductYn } }),
    );
  }

  searchEmployees(keyword: string): Promise<EmployeeSearchResult[]> {
    return firstValueFrom(this.http.get<EmployeeSearchResult[]>(EMPLOYEE_SEARCH_URL, { params: { keyword } }));
  }

  getCarAddressOptions(): Promise<SyCodeOption[]> {
    return firstValueFrom(this.http.get<SyCodeOption[]>(CODE_LIST_URL, { params: { parentCodeNo: CAR_ADDRESS_PARENT_CODE } }));
  }

  getCarAddressDetailOptions(parentCodeNo: string): Promise<SyCodeOption[]> {
    return firstValueFrom(this.http.get<SyCodeOption[]>(CODE_LIST_URL, { params: { parentCodeNo } }));
  }

  save(saveUrl: string, payload: OvertimeSavePayload): Promise<SaveResponse> {
    return firstValueFrom(this.http.post<SaveResponse>(saveUrl, payload));
  }
}
