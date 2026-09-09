import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface VacEmpRow {
  empId?: string;
  localName?: string;
  deptName?: string;
  postGradeName?: string;
  totVacCnt?: string;
  lastYearVac?: string;
  addVac?: string;
  useVacCnt?: string;
  useVac?: string;
  affirmUseVac?: string;
  useVac1?: string;
  useVac2?: string;
  useVac3?: string;
  useVac4?: string;
  useVac5?: string;
  useVac6?: string;
  useVac7?: string;
  useVac8?: string;
  useVac9?: string;
  useVac10?: string;
  useVac11?: string;
  useVac12?: string;
  mentVac?: string;
  workMonth?: string;
  isLocked?: string;
  remark?: string;
}

export interface VacEmpFilter {
  keyword?: string;
  deptNos?: string;
  vacId?: string;
  empOffice?: string;
}

const LIST_URL = '/ar/attendanceSettings/api/vacEmp/list';

/**
 * Tra cứu tổng hợp phép năm của nhân viên (chỉ xem + xuất Excel, không CRUD)
 * - port lại từ ar/attendanceSettings/viewVacEmpList.html (đã xoá). "Năm
 * phép" luôn là năm hiện tại, không có UI cho phép đổi năm ở bản gốc (input
 * readonly) - giữ nguyên hành vi này.
 *
 * Lỗi backend đã phát hiện và sửa: `ArVacEmpController#getVacEmpList` thiếu
 * tham số `empOffice` dù `ArVacEmpDto`/mapper đã hỗ trợ đầy đủ - khiến filter
 * "Trạng thái làm việc" ở bản gốc chưa từng có tác dụng. Đã bổ sung tham số
 * này vào controller khi migrate.
 */
@Injectable({ providedIn: 'root' })
export class VacEmpListService {
  private readonly http = inject(HttpClient);

  getList(filter: VacEmpFilter): Promise<VacEmpRow[]> {
    return firstValueFrom(this.http.get<VacEmpRow[]>(LIST_URL, { params: this.toHttpParams(filter) }));
  }

  private toHttpParams(filter: object): Record<string, string> {
    const params: Record<string, string> = {};
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params[key] = String(value);
      }
    });
    return params;
  }
}
