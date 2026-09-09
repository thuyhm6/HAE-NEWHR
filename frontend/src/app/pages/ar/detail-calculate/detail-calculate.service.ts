import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface DetailCalculatePayload {
  caltype: 'EMP' | 'DEPT';
  fromDate: string;
  toDate: string;
  deptId: string;
  sonDeptFlag: 'YES' | 'NO';
  personId: string;
}

export interface DetailCalculateResponse {
  success: boolean;
  message?: string;
  error?: string;
  personId?: string;
}

const RUN_URL = '/ar/attendanceMintenance/api/detailCalculate/run';

/**
 * Form trigger tính lại công chi tiết theo nhân viên hoặc phòng ban - port
 * lại từ ar/attendanceMintenance/viewArDetailCalculate.html (đã xoá). Không
 * có bảng dữ liệu, chỉ gọi 1 API chạy thủ tục PL/SQL tính công
 * (AR_DETAIL_CAL_P) rồi báo kết quả thành công/thất bại.
 */
@Injectable({ providedIn: 'root' })
export class DetailCalculateService {
  private readonly http = inject(HttpClient);

  run(payload: DetailCalculatePayload): Promise<DetailCalculateResponse> {
    return firstValueFrom(this.http.post<DetailCalculateResponse>(RUN_URL, payload));
  }
}
