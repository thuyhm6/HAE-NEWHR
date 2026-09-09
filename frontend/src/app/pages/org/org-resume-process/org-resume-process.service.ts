import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface ExecuteProcessPayload {
  resumeNo: string;
  types: string[];
}

/**
 * Quy trình xử lý thay đổi tổ chức (viewResumeProcess) - gọi lại nguyên API JSON đã có sẵn ở
 * OrgResumeInfoController#executeProcess, không đổi backend. Dropdown phiên bản thay đổi tái sử dụng
 * OrgComposeService.getResumeDropdown() (cùng API với trang org-compose).
 */
@Injectable({ providedIn: 'root' })
export class OrgResumeProcessService {
  private readonly http = inject(HttpClient);

  executeProcess(payload: ExecuteProcessPayload): Promise<{ message: string }> {
    return firstValueFrom(this.http.post<{ message: string }>('/org/api/process/execute', payload));
  }
}
