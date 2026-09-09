import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface EmployeeSearchResult {
  personId?: string;
  empId?: string;
  localName?: string;
  deptNo?: string;
  deptName?: string;
  position?: string;
  positionName?: string;
}

const SEARCH_URL = '/hrm/empinfo/api/employee/search';

/**
 * Dùng chung cho các trang CRUD đơn giản trong module hrm/empinfo
 * (education/address/family/emergency-address/recognition/qualification/
 * punishment/work-experience) - tất cả đều dùng lại đúng 1 endpoint tìm
 * kiếm nhân viên đã có sẵn ở HrEmpinfoController.
 */
@Injectable({ providedIn: 'root' })
export class EmpSearchService {
  private readonly http = inject(HttpClient);

  searchEmployees(keyword: string): Promise<EmployeeSearchResult[]> {
    return firstValueFrom(this.http.get<EmployeeSearchResult[]>(SEARCH_URL, { params: { keyword } }));
  }
}
