import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface OtConfirmRow {
  applyNo?: string;
  personId?: string;
  applyTime?: string;
  otTypeCode?: string;
  otTypeCodeName?: string;
  otApplyHour?: string;
  applyOtDate?: string;
  otFromDate?: string;
  otToDate?: string;
  otFromTime?: string;
  otToTime?: string;
  activity?: string;
  confirmFlag?: string;
  applyOtRemark?: string;
  localName?: string;
  empId?: string;
  deptNo?: string;
  empOffice?: string;
  otOver?: string;
  deptName?: string;
  postGradeNo?: string;
  postGradeName?: string;
  postFamily?: string;
  postFamilyName?: string;
  confirmBy?: string;
  otTotail?: string;
}

export interface OtConfirmFilter {
  searchEmpId?: string;
  searchDeptNos?: string[];
  searchOtTypeCode?: string;
  searchOtOver?: string;
  fromDate?: string;
  toDate?: string;
  confirmFlag?: string;
}

export interface DataTablesResponse<T> {
  draw: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: T[];
}

export interface OtDetailInfo {
  applyNo?: string;
  personId?: string;
  empId?: string;
  localName?: string;
  deptNo?: string;
  deptName?: string;
  postGradeNo?: string;
  postGradeName?: string;
  applyOtDate?: string;
  otFromTime?: string;
  otToTime?: string;
  applyOtRemark?: string;
  otTypeCode?: string;
  otTypeName?: string;
  otApplyHour?: string;
  affirmFlagName?: string;
  confirmFlag?: string;
  confirmBy?: string;
}

export interface OtDetailApprovalRow {
  affirmLevel?: string;
  affirmTypeName?: string;
  affirmFlagName?: string;
  affirmName?: string;
  affirmContent?: string;
  updateDate?: string;
  deptName?: string;
}

export interface OtDetailResponse {
  otInfo?: OtDetailInfo;
  employeeInfo?: OtDetailInfo;
  approvalList?: OtDetailApprovalRow[];
}

export interface SyCodeOption {
  codeNo: string;
  codeName?: string;
  nameVi?: string;
}

const LIST_URL = '/ess/arConfirm/api/otConfirm/list';
const CONFIRM_URL = '/ess/arConfirm/api/otConfirm/confirm';
const CONFIRM_BATCH_URL = '/ess/arConfirm/api/otConfirm/confirmBatch';
const DETAIL_URL = '/ar/attendanceMintenance/api/overtime/detail';
const DETAIL_OVER_URL = '/ar/attendanceMintenance/api/overtime/detailOver';
const CODE_LIST_URL = '/sys/api/getCode/list';
const OT_TYPE_PARENT_CODE = '31';

/**
 * Xác nhận đơn tăng ca (nhân sự duyệt/từ chối) - cùng cấu trúc với
 * LeaveConfirmService nhưng gọi API /ess/arConfirm/api/otConfirm/* (dữ liệu
 * lấy từ ESS_APPLY_OT/ESS_APPLY_OT_OVER). Chi tiết đơn dùng lại API sẵn có
 * của ArOvertimeManagentController (/ar/attendanceMintenance/api/overtime/detail
 * và detailOver) tuỳ theo cờ OT_OVER của dòng.
 */
@Injectable({ providedIn: 'root' })
export class OtConfirmService {
  private readonly http = inject(HttpClient);

  getPageList(
    filter: OtConfirmFilter,
    draw: number,
    start: number,
    length: number,
  ): Promise<DataTablesResponse<OtConfirmRow>> {
    return firstValueFrom(
      this.http.get<DataTablesResponse<OtConfirmRow>>(LIST_URL, {
        params: this.toHttpParams({
          ...filter,
          searchDeptNos: filter.searchDeptNos?.length ? filter.searchDeptNos.join(',') : undefined,
          draw: String(draw),
          start: String(start),
          length: String(length),
        }),
      }),
    );
  }

  confirmLine(applyNo: string, flag: string, hrComment: string): Promise<{ success: boolean; error?: string }> {
    return firstValueFrom(
      this.http.post<{ success: boolean; error?: string }>(CONFIRM_URL, { applyNo, flag, hrComment }),
    );
  }

  confirmBatch(applyNos: string[], flag: string, hrComment: string): Promise<{ success: boolean; error?: string }> {
    return firstValueFrom(
      this.http.post<{ success: boolean; error?: string }>(CONFIRM_BATCH_URL, { applyNos, flag, hrComment }),
    );
  }

  getDetail(applyNo: string, otOver: string | undefined): Promise<OtDetailResponse> {
    const url = otOver === '1' ? DETAIL_OVER_URL : DETAIL_URL;
    return firstValueFrom(this.http.get<OtDetailResponse>(url, { params: { applyNo } }));
  }

  getOtTypeOptions(): Promise<SyCodeOption[]> {
    return firstValueFrom(this.http.get<SyCodeOption[]>(CODE_LIST_URL, { params: { parentCodeNo: OT_TYPE_PARENT_CODE } }));
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
