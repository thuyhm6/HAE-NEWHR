import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface SyCompanyRow {
  cpnyId?: string;
  cpnyNo?: string;
  operationId?: string;
  nameVi?: string;
  nameEn?: string;
  nameZh?: string;
  nameKo?: string;
  cpnyAddr?: string;
  cpnyPostalcode?: string;
  cpnyLocation?: string;
  cpnyTelNo?: string;
  cpnyFaxNo?: string;
  cpnyWebAddr?: string;
  cpnyIntro?: string;
  cpnyHistory?: string;
  orderNo?: number;
  ggsYn?: string;
  activity?: string;
}

interface ActionResponse {
  success?: boolean;
  message?: string;
}

const BASE_URL = '/sys/api/company';

/**
 * Quản lý Công ty (viewCompany) - port lại từ
 * sys/basicMaintenance/viewCompany.html (đã xoá). CPNY_ID do người dùng
 * nhập (khóa nghiệp vụ, không sửa được khi edit), CPNY_NO tự sinh từ
 * sequence dùng làm khóa nội bộ cho update/delete - xem
 * HrCompanyServiceImpl.saveCompany(). Nút "Xuất Excel" bản gốc thực ra xuất
 * file .csv (content-type text/csv) dù tên hàm là exportExcel - đã sửa
 * thành .xlsx thật (Apache POI) khớp quy định dự án.
 */
@Injectable({ providedIn: 'root' })
export class SyCompanyService {
  private readonly http = inject(HttpClient);

  getList(keyword: string): Promise<SyCompanyRow[]> {
    return firstValueFrom(this.http.get<SyCompanyRow[]>(`${BASE_URL}/list`, { params: { keyword } }));
  }

  save(dto: SyCompanyRow): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/save`, dto));
  }

  delete(cpnyNo: string): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/delete`, null, { params: { cpnyNo } }));
  }

  readonly exportUrl = `${BASE_URL}/export`;
}
