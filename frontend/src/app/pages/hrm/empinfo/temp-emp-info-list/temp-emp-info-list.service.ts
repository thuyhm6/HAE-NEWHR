import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface DataTablesResponse<T> {
  draw?: number;
  recordsTotal?: number;
  recordsFiltered?: number;
  data?: T[];
  error?: string;
}

export interface FemaleEmployeeRow {
  specialNo?: string;
  personId?: string;
  createDate?: string;
  updateDate?: string;
  activity?: number;
  registrationDate?: string;
  inforDisCode?: string;
  generationTitle?: string;
  specialContent?: string;
  startDate?: string;
  endDate?: string;
  otFlag?: number;
  empId?: string;
  localName?: string;
  deptNo?: string;
  position?: string;
}

export interface FemaleEmployeeSearchFilter {
  localName?: string;
  empId?: string;
  deptNo?: string;
  position?: string;
  createDateFrom?: string;
  createDateTo?: string;
  activity?: string;
  otFlag?: string;
}

export interface FemaleEmployeeSavePayload {
  personId?: string;
  empId?: string;
  localName?: string;
  deptNo?: string;
  position?: string;
  specialNo?: string;
  activity?: string;
  otFlag?: string;
  specialContent?: string;
  startDate?: string;
  endDate?: string;
}

const LIST_URL = '/hrm/empinfo/female-employees';
const SPECIAL_MATTER_URL = '/hrm/empinfo/specialMatter';
const EXPORT_URL = '/hrm/empinfo/export';

/**
 * Danh sách nhân sự đặc biệt (viewTempEmpInfoList, tên hiển thị "Quản lý
 * nhân viên nữ") - port lại từ hrm/empinfo/viewTempEmpInfoList.html (đã
 * xoá). Backend dùng DataTablesRequest với `searchParams` là field JSON
 * lồng (không phải @JsonAnySetter phẳng như /hrm/contractInfo/contracts) -
 * phải gửi đúng dạng {draw, start, length, searchParams: {...}}.
 *
 * Bug có thật ở bản gốc (đã sửa khi migrate): form tìm kiếm gửi
 * activity='ACTIVE'/'INACTIVE' và otFlag='Y'/'N', nhưng cột ACTIVITY/OT_FLAG
 * trong Oracle là NUMBER (model Java: Integer) - so sánh NUMBER = 'ACTIVE'
 * luôn ném ORA-01722 (invalid number), khiến 2 bộ lọc này không bao giờ
 * dùng được (luôn lỗi 500). Bản Angular dùng đúng giá trị '1'/'0' khớp với
 * kiểu cột thực tế (khớp đúng quy ước mà chính modal Thêm/Sửa của bản gốc
 * đã dùng cho 2 trường này).
 */
@Injectable({ providedIn: 'root' })
export class TempEmpInfoListService {
  private readonly http = inject(HttpClient);

  getList(
    filter: FemaleEmployeeSearchFilter,
    draw: number,
    start: number,
    length: number,
  ): Promise<DataTablesResponse<FemaleEmployeeRow>> {
    const body = { draw, start, length, searchParams: filter };
    return firstValueFrom(this.http.post<DataTablesResponse<FemaleEmployeeRow>>(LIST_URL, body));
  }

  getById(specialNo: string): Promise<FemaleEmployeeRow> {
    return firstValueFrom(this.http.get<FemaleEmployeeRow>(`${SPECIAL_MATTER_URL}/${specialNo}`));
  }

  add(payload: FemaleEmployeeSavePayload): Promise<string> {
    return firstValueFrom(
      this.http.post(`${SPECIAL_MATTER_URL}/add`, payload, { responseType: 'text' }),
    );
  }

  update(payload: FemaleEmployeeSavePayload): Promise<string> {
    return firstValueFrom(
      this.http.post(`${SPECIAL_MATTER_URL}/update`, payload, { responseType: 'text' }),
    );
  }

  delete(specialNo: string): Promise<string> {
    return firstValueFrom(this.http.delete(`${SPECIAL_MATTER_URL}/delete/${specialNo}`, { responseType: 'text' }));
  }

  buildExportUrl(filter: FemaleEmployeeSearchFilter): string {
    const params = new URLSearchParams();
    Object.entries(filter).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    const qs = params.toString();
    return qs ? `${EXPORT_URL}?${qs}` : EXPORT_URL;
  }
}
