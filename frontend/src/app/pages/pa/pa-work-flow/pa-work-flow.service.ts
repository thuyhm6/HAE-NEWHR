import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface PaWorkFlowRow {
  payScheduleNo?: string;
  hrStartDate?: string;
  hrEndDate?: string;
  arStartDate?: string;
  arEndDate?: string;
  objCreateFlag?: number;
  arMonthCalFlag?: number;
  paCalFlag?: number;
  paConfirmFlag?: number;
  paOpenFlag?: number;
  empCount?: number;
}

export interface PaWorkFlowRecordRow {
  recordNo?: number;
  flowStep?: number;
  createDate?: string;
  createdBy?: string;
  createdIp?: string;
  rowNum?: number;
}

interface ActionResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

const BASE_URL = '/pa/workManagement/api/workFlow';

/**
 * Quy trình tính lương (viewPaWorkFlow) - port lại từ
 * pa/workManagement/viewPaWorkFlow.html (đã xoá). Sơ đồ quy trình 5 cột, 3
 * bước có checkbox thực hiện qua stored procedure (objCreate/arMonthCal/
 * paCal/paConfirm/paOpen chạy tuần tự), các bước còn lại chỉ xem lịch sử
 * thao tác hoặc điều hướng sang trang khác.
 */
@Injectable({ providedIn: 'root' })
export class PaWorkFlowService {
  private readonly http = inject(HttpClient);

  getWorkFlow(payScheduleNo: string): Promise<PaWorkFlowRow | null> {
    return firstValueFrom(this.http.get<PaWorkFlowRow | null>(BASE_URL, { params: { payScheduleNo } }));
  }

  getRecords(payScheduleNo: string, flowStep: number | null): Promise<PaWorkFlowRecordRow[]> {
    const params: Record<string, string | number> = { payScheduleNo };
    if (flowStep != null) params['flowStep'] = flowStep;
    return firstValueFrom(this.http.get<PaWorkFlowRecordRow[]>(`${BASE_URL}/records`, { params }));
  }

  execute(payScheduleNo: string, type: string): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/execute`, { payScheduleNo, type }));
  }
}
