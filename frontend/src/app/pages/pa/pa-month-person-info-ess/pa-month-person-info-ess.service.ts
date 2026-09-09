import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface PaPayScheduleOption {
  payScheduleNo?: string;
  payDate?: string;
  salaryDistinName?: string;
  empOpinion?: string;
}

export interface PaPayStubItem {
  itemName?: string;
  itemValue?: number;
}

export interface PaPayStubOther {
  returnValue?: number;
  remark?: string;
}

export interface PaPayStub {
  hrEndDate?: string;
  localName?: string;
  empId?: string;
  deptName?: string;
  empTypeName?: string;
  postFamily?: string;
  positionName?: string;
  postGrade?: string;
  empOfficeName?: string;
  dependentCount?: number;
  socialInsuranceNo?: string;
  bankName?: string;
  bankAccountNo?: string;
  accountNo?: string;
  attendanceItems?: PaPayStubItem[];
  salaryItems?: PaPayStubItem[];
  deductionItems?: PaPayStubItem[];
  standardItems?: PaPayStubItem[];
  otherItems?: PaPayStubOther[];
}

const BASE_URL = '/pa/salary/api/monthPersonInfo';

/**
 * Phiếu lương cá nhân (viewPaMonthPersonInfoEssList) - self-service, tải và
 * hiển thị phiếu lương của nhân viên đang đăng nhập cho 1 kế hoạch trả
 * lương đã mở. Dùng lại đúng PaPayStubService (đã có sẵn cho payStub.html
 * phía quản lý), chỉ khác endpoint tự động lọc theo người dùng hiện tại.
 */
@Injectable({ providedIn: 'root' })
export class PaMonthPersonInfoEssService {
  private readonly http = inject(HttpClient);

  getOpenScheduleList(): Promise<PaPayScheduleOption[]> {
    return firstValueFrom(this.http.get<PaPayScheduleOption[]>(`${BASE_URL}/payScheduleOpen`));
  }

  loadSelfPayStub(payScheduleNo: string, lang: string): Promise<PaPayStub[]> {
    return firstValueFrom(this.http.get<PaPayStub[]>(`${BASE_URL}/payStub/load`, { params: { payScheduleNo, lang } }));
  }
}
