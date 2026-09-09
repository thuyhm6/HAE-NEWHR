import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface OtBatchRow {
  applyNo?: string;
  personId?: string;
  empId?: string;
  localName?: string;
  deptName?: string;
  otTypeCode?: string;
  otTypeName?: string;
  applyOtDate?: string;
  otFromTime?: string;
  otToTime?: string;
  indoorTime?: string;
  outdoorTime?: string;
  otApplyHour?: string;
  deductYn?: string;
  applyOtRemark?: string;
  usecarYn?: string;
  carAddress?: string;
  carAddressName?: string;
  carAddressDetail?: string;
  carAddressDetailName?: string;
  otTotalMonth?: string;
  otTotalYear?: string;
  affirmFlag?: string;
  affirmStr?: string;
  createdBy?: string;
  createDate?: string;
  updatedBy?: string;
  updateDate?: string;
  postFamily?: string;
  shiftEndTime?: string;
}

export interface OtBatchFilter {
  empId?: string;
  localName?: string;
  fromDate?: string;
  toDate?: string;
  affirmFlag?: string;
  confirmFlag?: string;
}

export interface ApproverInput {
  personId: string;
  localName: string;
  empId: string;
}

export interface OtBatchSavePayload {
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

export interface CancelBatchResponse {
  success: boolean;
  count?: number;
  error?: string;
}

export interface ImportResponse {
  success: boolean;
  message?: string;
  errors?: string[];
}

const LIST_URL = '/ar/attendanceMintenance/api/overtime/list';
const AUTO_FILL_URL = '/ar/attendanceMintenance/api/overtime/auto-fill-by-emp';
const DEFAULT_INFO_URL = '/ar/attendanceMintenance/api/overtime/default-info';
const OT_TOTALS_URL = '/ar/attendanceMintenance/api/overtime/ot-totals';
const SAVE_BATCH_URL = '/ar/attendanceMintenance/api/overtime/saveBatch';
const RESUBMIT_URL = '/ar/attendanceMintenance/api/overtime/resubmit';
const CANCEL_BATCH_URL = '/ar/attendanceMintenance/api/overtime/cancel-batch';
const IMPORT_URL = '/sy/excel/api/importTemplate';
export const IMPORT_TEMPLATE_NAME = 'OvertimeApply_add_Template';
export const DOWNLOAD_TEMPLATE_URL = `/sy/excel/api/downloadTemplate?templateName=${IMPORT_TEMPLATE_NAME}`;

/**
 * HR/quản lý xem+xin tăng ca hàng loạt thay bất kỳ nhân viên nào (thêm dòng
 * mới, chỉnh sửa dòng đã lưu, hủy hàng loạt, import Excel) - port lại từ
 * ess/infoApply/viewApplyOtLBatchByAnyApproverList.html (đã xoá). Gọi lại
 * nguyên vẹn các endpoint REST sẵn có của ArOvertimeManagentController (dùng
 * chung với trang tương đương ở module `ar`, chưa migrate). Employee-search,
 * car-address, hrDeptManager tái sử dụng nguyên vẹn SstOtApplyService.
 */
@Injectable({ providedIn: 'root' })
export class ApplyOtBatchService {
  private readonly http = inject(HttpClient);

  getList(filter: OtBatchFilter): Promise<OtBatchRow[]> {
    return firstValueFrom(this.http.get<OtBatchRow[]>(LIST_URL, { params: this.toHttpParams({ ...filter }) }));
  }

  getAutoFillByEmp(personId: string, applyOtDate: string, deductYn: string): Promise<OtBatchRow> {
    return firstValueFrom(this.http.get<OtBatchRow>(AUTO_FILL_URL, { params: { personId, applyOtDate, deductYn } }));
  }

  getDefaultOtInfo(
    personId: string,
    applyOtDate: string,
    otFromTime: string,
    otToTime: string,
    deductYn: string,
  ): Promise<OtBatchRow> {
    return firstValueFrom(
      this.http.get<OtBatchRow>(DEFAULT_INFO_URL, { params: { personId, applyOtDate, otFromTime, otToTime, deductYn } }),
    );
  }

  getOtTotals(personId: string, applyOtDate: string): Promise<OtBatchRow> {
    return firstValueFrom(this.http.get<OtBatchRow>(OT_TOTALS_URL, { params: { personId, applyOtDate } }));
  }

  saveBatch(payloads: OtBatchSavePayload[]): Promise<SaveResponse> {
    return firstValueFrom(this.http.post<SaveResponse>(SAVE_BATCH_URL, payloads));
  }

  resubmit(payload: OtBatchSavePayload): Promise<SaveResponse> {
    return firstValueFrom(this.http.post<SaveResponse>(RESUBMIT_URL, payload));
  }

  cancelBatch(applyNos: string[]): Promise<CancelBatchResponse> {
    return firstValueFrom(this.http.post<CancelBatchResponse>(CANCEL_BATCH_URL, { applyNos }));
  }

  importTemplate(file: File): Promise<ImportResponse> {
    const form = new FormData();
    form.append('templateName', IMPORT_TEMPLATE_NAME);
    form.append('file', file);
    return firstValueFrom(this.http.post<ImportResponse>(IMPORT_URL, form));
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
