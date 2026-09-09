import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface MyOtApplyRow {
  applyNo?: string;
  otTypeCode?: string;
  otTypeName?: string;
  applyOtDate?: string;
  otFromTime?: string;
  otToTime?: string;
  otApplyHour?: string;
  deductYn?: string;
  applyOtRemark?: string;
  affirmFlag?: string;
  affirmFlagName?: string;
  confirmFlagName?: string;
  usecarYn?: string;
  carAddressName?: string;
  carAddressDetailName?: string;
}

export interface MyOtApplyFilter {
  otTypeCode?: string;
  affirmFlag?: string;
  fromDate?: string;
  toDate?: string;
}

export interface SyCodeOption {
  codeNo: string;
  codeName?: string;
  nameVi?: string;
}

export interface CancelResponse {
  success: boolean;
  message?: string;
  error?: string;
}

const CODE_LIST_URL = '/sys/api/getCode/list';

export const OT_TYPE_PARENT_CODE = '31';
export const AFFIRM_FLAG_PARENT_CODE = '14014304';
export const CANCELABLE_AFFIRM_FLAGS = ['14014306', '14014307', '14014308'];

/**
 * Danh sách đơn xin tăng ca của chính nhân viên đang đăng nhập (thường/vượt),
 * hủy đơn, xem chi tiết duyệt - dùng chung cho 2 trang gần như trùng lặp
 * 100%: ess/infoApply/viewPOtApplyInfoList.html (tăng ca thường) và
 * viewPiciOtAffirmPBatchList.html (tăng ca vượt), cả 2 đã xoá, chỉ khác URL
 * API (chọn qua route data `apiBase` - xem app.routes.ts). Modal chi tiết
 * tái sử dụng ApplyDetailModalComponent (variant="ot"/"otOver", đã port ở
 * Batch A/F) thay vì viết lại modal riêng gần như trùng lặp. Gọi lại nguyên
 * vẹn API JSON sẵn có.
 */
@Injectable({ providedIn: 'root' })
export class MyOtApplyListService {
  private readonly http = inject(HttpClient);

  getList(apiBase: string, filter: MyOtApplyFilter): Promise<MyOtApplyRow[]> {
    return firstValueFrom(this.http.get<MyOtApplyRow[]>(`${apiBase}/list`, { params: this.toHttpParams({ ...filter }) }));
  }

  cancel(apiBase: string, applyNos: string[]): Promise<CancelResponse> {
    return firstValueFrom(this.http.post<CancelResponse>(`${apiBase}/cancel`, applyNos));
  }

  getCodeList(parentCodeNo: string): Promise<SyCodeOption[]> {
    return firstValueFrom(this.http.get<SyCodeOption[]>(CODE_LIST_URL, { params: { parentCodeNo } }));
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
