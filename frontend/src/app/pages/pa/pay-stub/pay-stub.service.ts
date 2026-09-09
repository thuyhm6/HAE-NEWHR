import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface PayStubItem {
  itemName?: string;
  itemValue?: number;
}

export interface PayStubOther {
  returnValue?: number;
  remark?: string;
}

export interface PayStubRow {
  hrEndDate?: string;
  empId?: string;
  localName?: string;
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
  attendanceItems?: PayStubItem[];
  salaryItems?: PayStubItem[];
  deductionItems?: PayStubItem[];
  standardItems?: PayStubItem[];
  otherItems?: PayStubOther[];
}

export interface PayStubSearchParams {
  payScheduleNo: string;
  deptNos: string;
  empSearch: string;
  empOffice: string | null;
  lang: string;
}

export interface SyCodeOption {
  codeNo: string;
  codeName?: string;
}

interface ActionResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

const BASE_URL = '/pa/workManagement/api/payStub';

/**
 * Phiếu lương (payStub) - port lại từ pa/workManagement/payStub.html (đã
 * xoá). Trang phía quản lý - tìm nhiều nhân viên theo phòng ban/từ khoá, có
 * thể tính lại lương. Khác với pa-month-person-info-ess (tự phục vụ, chỉ xem
 * phiếu của chính mình, gọi endpoint /pa/salary/api/monthPersonInfo khác) -
 * 2 endpoint backend tách biệt dù DTO gần như giống hệt nhau, nên khai báo
 * interface riêng ở đây thay vì import chéo.
 */
@Injectable({ providedIn: 'root' })
export class PayStubService {
  private readonly http = inject(HttpClient);

  load(params: PayStubSearchParams): Promise<PayStubRow[]> {
    return firstValueFrom(
      this.http.get<PayStubRow[]>(`${BASE_URL}/load`, {
        params: {
          payScheduleNo: params.payScheduleNo,
          deptNos: params.deptNos,
          empSearch: params.empSearch,
          empOffice: params.empOffice ?? '',
          lang: params.lang,
        },
      }),
    );
  }

  recalc(payScheduleNo: string, deptNos: string, empSearch: string, empOfficeCond: string | null): Promise<ActionResponse> {
    return firstValueFrom(
      this.http.post<ActionResponse>(`${BASE_URL}/recalc`, {
        payScheduleNo,
        deptNos,
        empSearch,
        empOfficeCond: empOfficeCond ?? '',
      }),
    );
  }

  getEmpOfficeOptions(): Promise<SyCodeOption[]> {
    return firstValueFrom(this.http.get<SyCodeOption[]>('/sys/api/getCode/list', { params: { parentCodeNo: '15118' } }));
  }
}
