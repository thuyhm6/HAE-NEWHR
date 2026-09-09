import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface CheckAttendanceExRow {
  applyNo?: string;
  empId?: string;
  localName?: string;
  deptName?: string;
  postGradeName?: string;
  postFamilyName?: string;
  shiftName?: string;
  itemNo?: string;
  itemNoName?: string;
  arDateStr?: string;
  fromDateTime?: string;
  toDateTime?: string;
  remark?: string;
  createdName?: string;
  createDate?: string;
}

export interface CheckAttendanceExFilter {
  keyword?: string;
  deptNos?: string;
  fromDate?: string;
  toDate?: string;
  postFamily?: string;
  shiftNo?: string;
  itemNo?: string;
}

export interface SyCodeOption {
  codeNo: string;
  codeName?: string;
  nameVi?: string;
}

export interface ShiftOption {
  shiftNo?: string;
  shiftName?: string;
  nameVi?: string;
}

export interface AuthorizedDeptNode {
  id: string;
  text: string;
  parent: string;
}

const LIST_URL = '/ess/infoApplyAttendance/api/checkAttendanceEx/list';
const SHIFT_URL = '/ar/attendanceSettings/api/shift';
const CODE_LIST_URL = '/sys/api/getCode/list';
const AUTHORIZED_DEPTS_URL = '/ar/attendanceSettings/api/arSupervisor/authorized-departments';

const POST_FAMILY_PARENT_CODE = '14015812';

/**
 * Tra cứu (chỉ xem) đơn xin phép chấm công ngoại lệ đã tạo, xem chi tiết
 * duyệt - port lại từ
 * ess/infoApplyAttendance/viewCheckAttencetanceExForBatchList.html (Thymeleaf
 * + DataTables client-side, đã xoá) sang Angular + NG-ZORRO. Modal chi tiết
 * tái sử dụng ApplyDetailModalComponent (variant="attendanceEx") thay vì viết
 * lại fragment ess/infoApply/viewAttendanceEx.html đã port ở Batch A. Gọi lại
 * nguyên vẹn API JSON sẵn có.
 */
@Injectable({ providedIn: 'root' })
export class CheckAttendanceExListService {
  private readonly http = inject(HttpClient);

  getList(filter: CheckAttendanceExFilter): Promise<CheckAttendanceExRow[]> {
    return firstValueFrom(this.http.get<CheckAttendanceExRow[]>(LIST_URL, { params: this.toHttpParams({ ...filter }) }));
  }

  getShiftOptions(): Promise<ShiftOption[]> {
    return firstValueFrom(this.http.get<ShiftOption[]>(SHIFT_URL));
  }

  getPostFamilyOptions(): Promise<SyCodeOption[]> {
    return firstValueFrom(this.http.get<SyCodeOption[]>(CODE_LIST_URL, { params: { parentCodeNo: POST_FAMILY_PARENT_CODE } }));
  }

  getAuthorizedDepartments(): Promise<AuthorizedDeptNode[]> {
    return firstValueFrom(this.http.get<AuthorizedDeptNode[]>(AUTHORIZED_DEPTS_URL));
  }

  private toHttpParams(filter: Record<string, string | undefined>): Record<string, string> {
    const params: Record<string, string> = {};
    Object.keys(filter).forEach((key) => {
      const value = filter[key];
      if (value !== undefined && value !== null && value !== '') {
        params[key] = value;
      }
    });
    return params;
  }
}
