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
}

const SEARCH_URL = '/hrm/empinfo/api/employee/search';
const CHANGE_USER_URL = '/ess/change/api/changeUser';

/**
 * Gọi lại nguyên vẹn API JSON sẵn có của trang changeUser (không đổi backend)
 * - port lại từ ess/change/changeUser.html (Thymeleaf, đã xoá) sang Angular +
 * NG-ZORRO. Thay EmployeeSearchModal (jQuery, chưa có bản Angular) bằng
 * nz-select tìm kiếm server-side, tái sử dụng API tìm nhân viên sẵn có
 * (/hrm/empinfo/api/employee/search) mà modal cũ cũng gọi.
 */
@Injectable({ providedIn: 'root' })
export class ChangeUserService {
  private readonly http = inject(HttpClient);

  searchEmployees(keyword: string): Promise<EmployeeSearchResult[]> {
    return firstValueFrom(this.http.get<EmployeeSearchResult[]>(SEARCH_URL, { params: { keyword } }));
  }

  changeUser(personId: string): Promise<{ message?: string; error?: string }> {
    const body = new URLSearchParams();
    body.set('personId', personId);
    return firstValueFrom(
      this.http.post<{ message?: string; error?: string }>(CHANGE_USER_URL, body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }),
    );
  }
}
