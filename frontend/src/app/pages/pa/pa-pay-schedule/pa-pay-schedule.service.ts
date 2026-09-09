import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface PaPayScheduleRow {
  payScheduleNo?: string;
  payDate?: string;
  salaryDistinNo?: string;
  salaryDistinName?: string;
  hrStartDate?: string;
  hrEndDate?: string;
  arStartDate?: string;
  arEndDate?: string;
  paOpenDate?: string;
  paTransDate?: string;
  empOpinion?: string;
  updatedBy?: string;
  updateDate?: string;
}

export interface SyCodeOption {
  codeNo: string;
  codeName?: string;
}

interface ActionResponse {
  success?: boolean;
  message?: string;
}

const BASE_URL = '/pa/workManagement/api/paySchedule';
const SALARY_DISTIN_PARENT = '14013797';

/**
 * Kế hoạch trả lương (viewPaPaySchedule) - port lại từ
 * pa/workManagement/viewPaPaySchedule.html (đã xoá). Chú ý: ngày hiển thị
 * trong danh sách là DD-MM-YYYY (do backend TO_CHAR sẵn), nhưng khi Lưu/Sửa
 * phải gửi đúng định dạng YYYY-MM-DD (khớp mapper TO_DATE(... 'YYYY-MM-DD')).
 */
@Injectable({ providedIn: 'root' })
export class PaPayScheduleService {
  private readonly http = inject(HttpClient);

  getList(fromDate: string, toDate: string, salaryDistinNo: string | null): Promise<PaPayScheduleRow[]> {
    return firstValueFrom(this.http.get<PaPayScheduleRow[]>(BASE_URL, { params: { fromDate, toDate, salaryDistinNo: salaryDistinNo ?? '' } }));
  }

  getOne(payScheduleNo: string): Promise<PaPayScheduleRow> {
    return firstValueFrom(this.http.get<PaPayScheduleRow>(`${BASE_URL}/${payScheduleNo}`));
  }

  save(dto: PaPayScheduleRow): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/save`, dto));
  }

  delete(payScheduleNo: string): Promise<ActionResponse> {
    return firstValueFrom(this.http.request<ActionResponse>('DELETE', `${BASE_URL}/delete/${payScheduleNo}`));
  }

  getSalaryDistinOptions(): Promise<SyCodeOption[]> {
    return firstValueFrom(this.http.get<SyCodeOption[]>('/sys/api/getCode/list', { params: { parentCodeNo: SALARY_DISTIN_PARENT } }));
  }
}
