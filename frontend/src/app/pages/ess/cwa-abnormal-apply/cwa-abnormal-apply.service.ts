import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface CwaAbnormalRow {
  pkNo?: string;
  personId?: string;
  empId?: string;
  itemNo?: string;
  itemName?: string;
  arDateStr?: string;
  indoorTime?: string;
  outdoorTime?: string;
  shiftStartYyyy?: string;
  shiftStartHh?: string;
  shiftStartMi?: string;
  shiftEndYyyy?: string;
  shiftEndHh?: string;
  shiftEndMi?: string;
  /** 'N' = chưa khóa (được chọn xin phép) */
  lockYn?: string;
}

export interface MyInfo {
  personId?: string;
  localName?: string;
  empId?: string;
}

export interface ApproverRow {
  affirmLevel?: string | number;
  empId?: string;
  localName?: string;
}

export interface CwaApplyItem {
  applyNo: string;
  personId: string;
  localName: string;
  itemNo: string;
  arDateStr: string;
  fromDateTime: string;
  toDateTime: string;
  workHour: string;
  remark: string;
}

export interface CwaApplyResponse {
  success: boolean;
  message?: string;
  error?: string;
}

const LIST_URL = '/ess/infoApply/api/myCwaAbnormal/list';
const MY_INFO_URL = '/ess/empinfo/api/personalInfo/myInfo';
const APPROVERS_URL = '/ar/attendanceMintenance/api/leaveApply/approvers';
const APPLY_URL = '/ess/infoApplyAttendance/api/attendanceEx/apply';

const APPLY_TYPE_NO = '218197';
const APPLY_TYPE_CODE = '141443';

/**
 * Xin phép chấm công bất thường (quên quẹt thẻ/thiếu giờ) hàng loạt cho
 * chính nhân viên đang đăng nhập - port lại từ
 * ess/infoApply/viewShowCwaAbnormalApply.html (đã xoá). Dùng chung endpoint
 * "approvers" đã có (`/ar/attendanceMintenance/api/leaveApply/approvers`,
 * cùng endpoint dùng ở SstLeaveApplyComponent) và endpoint duyệt hàng loạt
 * sẵn có `/ess/infoApplyAttendance/api/attendanceEx/apply` (dùng chung với
 * Batch J `viewAttendanceExForBatchInfoList` phía HR) thay vì tạo API mới.
 * Lưu ý định dạng ngày gửi lên `apply`: mapper `insertCardApply` dùng
 * `TO_DATE(..., 'YYYY/MM/DD HH24:MI')` (năm trước, có dấu gạch chéo) - khác
 * với định dạng `yyyy-MM-dd HH:mm` (gạch ngang) đã dùng ở Batch E/G, nên phải
 * format riêng cho đúng theo `toApiDateTime()` trong component.
 */
@Injectable({ providedIn: 'root' })
export class CwaAbnormalApplyService {
  private readonly http = inject(HttpClient);

  getList(startDate: string, endDate: string): Promise<CwaAbnormalRow[]> {
    return firstValueFrom(this.http.get<CwaAbnormalRow[]>(LIST_URL, { params: { startDate, endDate } }));
  }

  getMyInfo(): Promise<MyInfo> {
    return firstValueFrom(this.http.get<MyInfo>(MY_INFO_URL));
  }

  getApprovers(personId: string): Promise<ApproverRow[]> {
    return firstValueFrom(
      this.http.post<ApproverRow[]>(APPROVERS_URL, null, {
        params: { applyTypeNo: APPLY_TYPE_NO, personId, applyTypeCode: APPLY_TYPE_CODE, applyLength: '0' },
      }),
    );
  }

  submit(items: CwaApplyItem[]): Promise<CwaApplyResponse> {
    return firstValueFrom(this.http.post<CwaApplyResponse>(APPLY_URL, items));
  }
}
