import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface PaArSummaryScheduleOption {
  payScheduleNo?: string;
  payDate?: string;
  salaryDistinName?: string;
  paConfirmFlag?: number;
}

export interface PaArSummaryItemOption {
  itemNo?: string;
  itemName?: string;
}

export interface PaArSummaryRow {
  arSummaryManageNo?: number;
  empId?: string;
  localName?: string;
  deptName?: string;
  postGrade?: string;
  dateStarted?: string;
  itemNo?: string;
  itemName?: string;
  arStartDate?: string;
  calValue?: number | null;
  finalValue?: number | string | null;
  remark?: string | null;
  updatedBy?: string;
  updateDate?: string;
}

export interface PaArSummarySearchParams {
  payScheduleNo: string;
  key: string;
  deptNo: string | null;
  itemNos: string[];
  isSpecialFlag: string;
}

export interface AuthorizedDeptNode {
  id: string;
  text: string;
  parent: string;
}

interface ActionResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

const BASE_URL = '/pa/workManagement/api/arSummaryManage';
/** Cây phòng ban theo quyền quản lý chấm công - giống ait:deptList limit="ar" ở bản gốc. */
const AUTHORIZED_DEPTS_URL = '/ar/attendanceSettings/api/arSupervisor/authorized-departments';
/** SQL_SEQMEAN=292 - truy vấn "Xuất dữ liệu ngoại lệ" đăng ký trong SQL Master (autoExcel). */
const EXCEPTION_SQL_SEQ = '292';

/**
 * Quản lý tổng hợp chấm công (viewPaArSummaryForManageList) - port từ
 * pa/workManagement/viewPaArSummaryForManageList.jsp của dự án cũ Hanwha_HAE.
 */
@Injectable({ providedIn: 'root' })
export class PaArSummaryManageService {
  private readonly http = inject(HttpClient);

  getScheduleList(): Promise<PaArSummaryScheduleOption[]> {
    return firstValueFrom(this.http.get<PaArSummaryScheduleOption[]>(`${BASE_URL}/schedules`));
  }

  getItemList(): Promise<PaArSummaryItemOption[]> {
    return firstValueFrom(this.http.get<PaArSummaryItemOption[]>(`${BASE_URL}/items`));
  }

  getList(p: PaArSummarySearchParams): Promise<PaArSummaryRow[]> {
    return firstValueFrom(
      this.http.get<PaArSummaryRow[]>(`${BASE_URL}/list`, {
        params: {
          payScheduleNo: p.payScheduleNo,
          key: p.key,
          deptNo: p.deptNo ?? '',
          itemNos: p.itemNos.join(','),
          isSpecialFlag: p.isSpecialFlag,
        },
      }),
    );
  }

  save(payScheduleNo: string, items: PaArSummaryRow[]): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/save`, { payScheduleNo, items }));
  }

  getAuthorizedDepartments(): Promise<AuthorizedDeptNode[]> {
    return firstValueFrom(this.http.get<AuthorizedDeptNode[]>(AUTHORIZED_DEPTS_URL));
  }

  buildExportUrl(payScheduleNo: string, key: string, deptNo: string | null): string {
    const qs = new URLSearchParams({ payScheduleNo, key, deptNo: deptNo ?? '' });
    return `${BASE_URL}/export?${qs.toString()}`;
  }

  /**
   * Bản gốc submit toàn bộ form tìm kiếm sang /disc/autoExcel/exportLOtImportExcel?SQL_SEQMEAN=292
   * (tham số SQL được thay theo tên field form) - ở đây truyền lại đúng các tên field đó qua paramsJson
   * cho API xuất Excel theo SQL Master của dự án mới.
   */
  buildExceptionExportUrl(p: PaArSummarySearchParams): string {
    const paramsJson = JSON.stringify({
      PAY_SCHEDULE_NO: p.payScheduleNo,
      seach_KEY: p.key,
      seach_DEPTNO: p.deptNo ?? '',
      seach_AR_SUMMARY_ITEM: p.itemNos.join(','),
      isSpecialFlag: p.isSpecialFlag,
    });
    const qs = new URLSearchParams({ sqlSeq: EXCEPTION_SQL_SEQ, paramsJson });
    return `/disc/api/sqlMaster/export?${qs.toString()}`;
  }
}
