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
  arLockFlag?: number;
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
 * Quy trình tính lương (viewPaWorkFlow) - port từ viewPaWorkFlow.jsp (Hanwha_HAE).
 * Mọi thao tác (createPaObj/arMonthCal/paMonthCal/paConfirm/paUnConfirm/paOpen/
 * paUnOpen/arLockYes/arLockNo) đều gọi PKG_PA_WORK_FLOW.PA_WORKFLOW_EXECUTE qua
 * cùng 1 endpoint execute.
 */
@Injectable({ providedIn: 'root' })
export class PaWorkFlowService {
  private readonly http = inject(HttpClient);

  getWorkFlow(payScheduleNo: string): Promise<PaWorkFlowRow | null> {
    return firstValueFrom(this.http.get<PaWorkFlowRow | null>(BASE_URL, { params: { payScheduleNo } }));
  }

  /** flowSteps dạng "1" hoặc "4,6" / "5,7" (gồm cả bước hủy) giống FLOW_STEP của bản gốc. */
  getRecords(payScheduleNo: string, flowSteps: string): Promise<PaWorkFlowRecordRow[]> {
    const params = { payScheduleNo, flowSteps };
    return firstValueFrom(this.http.get<PaWorkFlowRecordRow[]>(`${BASE_URL}/records`, { params }));
  }

  execute(payScheduleNo: string, type: string): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/execute`, { payScheduleNo, type }));
  }
}
