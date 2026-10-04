import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ApproverSaveItem } from '../../../shared/approver-chain/approver-chain.service';
import { EssApplyResponse } from '../../../shared/ess-apply-response';

export interface OtBatchApproverRow {
  applyNo?: string;
  personId?: string;
  empId?: string;
  localName?: string;
  deptName?: string;
  postFamily?: string;
  shiftName?: string;
  shiftTime?: string;
  /** DD/MM/YYYY */
  applyOtDate?: string;
  /** DD/MM/YYYY */
  otFromDate?: string;
  /** DD/MM/YYYY */
  otToDate?: string;
  /** HH24:MI */
  otFromTime?: string;
  /** HH24:MI */
  otToTime?: string;
  applyOtRemark?: string;
  carAddress?: string;
  carAddressName?: string;
  carAddressDetail?: string;
  carAddressDetailName?: string;
  otTypeCode?: string;
  otTypeCodeName?: string;
  otApplyHour?: string;
  affirmFlag?: string;
  affirmFlagName?: string;
  confirmFlag?: string;
  offsetYn?: string;
  deductYn?: string;
  usecarYn?: string;
  createdBy?: string;
  indoorTime?: string;
  outdoorTime?: string;
  otTotail?: string;
  otTotailMonth?: string;
  weekdayOtTotail?: string;
  saturdayOtTotail?: string;
  weekendOtTotail?: string;
  hoildayOtTotail?: string;
  otLimitMonth?: string;
  otLimitYear?: string;
  /** YYYY/MM/DD HH24:MI */
  arShiftEndTime?: string;
}

/** Kết quả getValidateInfo / getDefaultOtTimeSST */
export interface OtValidateInfo {
  otTypeCode?: string;
  otTypeCodeName?: string;
  otLength?: string;
  otShiftLength?: string;
  dateType?: string;
  /** HH24:MI */
  shiftStartTime?: string;
  /** HH24:MI */
  shiftEndTime?: string;
  /** HH24:MI */
  shiftEndTime2?: string;
  indoorTime?: string;
  outdoorTime?: string;
}

export interface OtBatchApproverFilter {
  keyword?: string;
  deptNo?: string;
  shiftNo?: string;
  otTypeCode?: string;
  affirmFlag?: string;
  /** YYYY-MM-DD */
  startDate?: string;
  /** YYYY-MM-DD */
  endDate?: string;
}

export interface OtBatchApproverSaveItem {
  applyNo: string;
  personId: string;
  empId: string;
  localName: string;
  /** YYYY-MM-DD */
  applyOtDate: string;
  /** YYYY-MM-DD HH:mm */
  otFromTime: string;
  /** YYYY-MM-DD HH:mm */
  otToTime: string;
  otApplyHour: string;
  otTypeCode: string;
  applyOtRemark: string;
  offsetYn: string;
  deductYn: string;
  usecarYn: string;
  carAddress: string;
  carAddressDetail: string;
  approvers: ApproverSaveItem[];
}

const BASE_URL = '/ess/infoApply/api/otBatchApprover';

/**
 * Tăng ca hàng loạt chọn người duyệt tùy ý - gọi các endpoint
 * /ess/infoApply/api/otBatchApprover/* (EssInfoApplyController), port từ
 * InfoApplyCtroller của dự án Hanwha_HAE. Tham số `over` chọn bảng:
 * false = ESS_APPLY_OT (viewApplyOtLBatchByAnyApproverList),
 * true = ESS_APPLY_OT_OVER (viewApplyOTBatchInfoHAE).
 */
@Injectable({ providedIn: 'root' })
export class ApplyOtBatchApproverService {
  private readonly http = inject(HttpClient);

  getList(filter: OtBatchApproverFilter, over: boolean): Promise<OtBatchApproverRow[]> {
    return firstValueFrom(
      this.http.get<OtBatchApproverRow[]>(`${BASE_URL}/list`, { params: { ...this.toHttpParams({ ...filter }), over: String(over) } }),
    );
  }

  /** applyOtDate: YYYY-MM-DD, otFromTime/otToTime: YYYY-MM-DD HH:mm */
  getValidateInfo(personId: string, applyOtDate: string, otFromTime: string, otToTime: string, deductYn: string): Promise<OtValidateInfo> {
    return firstValueFrom(
      this.http.get<OtValidateInfo>(`${BASE_URL}/validateInfo`, {
        params: this.toHttpParams({ personId, applyOtDate, otFromTime, otToTime, deductYn }),
      }),
    );
  }

  /** applyOtDate: YYYY-MM-DD */
  getRowInfo(personId: string, applyOtDate: string): Promise<OtBatchApproverRow> {
    return firstValueFrom(this.http.get<OtBatchApproverRow>(`${BASE_URL}/rowInfo`, { params: { personId, applyOtDate } }));
  }

  /** applyOtDate: YYYY-MM-DD */
  getDayDefault(applyOtDate: string): Promise<OtValidateInfo> {
    return firstValueFrom(this.http.get<OtValidateInfo>(`${BASE_URL}/dayDefault`, { params: { applyOtDate } }));
  }

  save(items: OtBatchApproverSaveItem[], over: boolean): Promise<EssApplyResponse> {
    return firstValueFrom(this.http.post<EssApplyResponse>(`${BASE_URL}/save`, { items }, { params: { over: String(over) } }));
  }

  delete(applyNos: string[], over: boolean): Promise<EssApplyResponse> {
    return firstValueFrom(this.http.post<EssApplyResponse>(`${BASE_URL}/delete`, applyNos, { params: { over: String(over) } }));
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
