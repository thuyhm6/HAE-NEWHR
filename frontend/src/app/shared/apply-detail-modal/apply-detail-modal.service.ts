import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export type ApplyDetailVariant = 'ot' | 'otOver' | 'leave' | 'attendanceEx';

export interface ApplyDetailInfo {
  // Trường riêng của OT (otInfo)
  otTypeName?: string;
  applyOtDate?: string;
  detailFromDateTime?: string;
  detailToDateTime?: string;
  otApplyHour?: string;
  applyOtRemark?: string;
  // Trường riêng của nghỉ phép / chấm công bất thường (leaveInfo)
  leaveTypeName?: string;
  leaveFromTime?: string;
  leaveToTime?: string;
  applyLength?: string;
  dayHours?: string;
  leaveReason?: string;
  // Trường nhân viên (employeeInfo, hoặc lồng trong info nếu API không tách riêng)
  localName?: string;
  empId?: string;
  deptName?: string;
  postGradeName?: string;
}

export interface ApprovalRow {
  affirmLevel?: string | number;
  affirmTypeName?: string;
  affirmFlagName?: string;
  affirmName?: string;
  affirmContent?: string;
  updateDate?: string;
  deptName?: string;
  affirmPersonId?: string;
  affirmFlag?: string | number;
}

export interface ApplyDetailResponse {
  otInfo?: ApplyDetailInfo;
  leaveInfo?: ApplyDetailInfo;
  employeeInfo?: ApplyDetailInfo;
  approvalList?: ApprovalRow[];
}

export interface AffirmContext {
  applyNo: string;
  applyType?: string;
  applyFlag?: string;
  affirmLevel?: string | number;
  affirmPersonId?: string;
  affirmFlag?: string | number;
  fromApprovalEmail?: boolean;
}

export interface AffirmExecuteItem {
  applyNo: string;
  applyType?: string;
  applyFlag?: string;
  affirmLevel?: string | number;
  flag: 1 | 2;
  affirmContent: string;
}

export interface AffirmExecuteResponse {
  success: boolean;
  message?: string;
}

const DETAIL_URLS: Record<ApplyDetailVariant, string> = {
  ot: '/ar/attendanceMintenance/api/overtime/detail',
  otOver: '/ar/attendanceMintenance/api/overtime/detailOver',
  leave: '/ar/attendanceMintenance/api/leaveApply/detail',
  attendanceEx: '/ess/infoApplyAttendance/api/checkAttendanceEx/detail',
};

const EXECUTE_URL = '/ess/infoApply/api/approvalEmail/execute';

/**
 * Service dùng chung cho modal "Chi tiết đơn" - port lại từ 3 fragment gần
 * như trùng lặp hoàn toàn: ess/infoApply/viewApprovaledOt.html,
 * viewApprovaledLeave.html, ess/infoApply/viewAttendanceEx.html (đều đã xoá).
 * 3 fragment gốc chỉ khác nhau ở URL lấy chi tiết và tên field JSON
 * (otInfo/leaveInfo) nên gộp thành 1 service + 1 component dùng chung, chọn
 * hành vi qua tham số `variant`, thay vì viết lại 3 lần. Biến thể `otOver`
 * (tăng ca vượt) thêm sau ở Batch F cho ess/infoApply/viewPiciOtAffirmPBatchList.html
 * - cùng cấu trúc otInfo với `ot` nhưng gọi endpoint chi tiết riêng
 * (`overtime/detailOver`).
 */
@Injectable({ providedIn: 'root' })
export class ApplyDetailModalService {
  private readonly http = inject(HttpClient);

  getDetail(variant: ApplyDetailVariant, applyNo: string, applyType?: string): Promise<ApplyDetailResponse> {
    return firstValueFrom(
      this.http.get<ApplyDetailResponse>(DETAIL_URLS[variant], { params: { applyNo, applyType: applyType ?? '' } }),
    );
  }

  executeAffirm(items: AffirmExecuteItem[]): Promise<AffirmExecuteResponse> {
    return firstValueFrom(this.http.post<AffirmExecuteResponse>(EXECUTE_URL, { items }));
  }
}
