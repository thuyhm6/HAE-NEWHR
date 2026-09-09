import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface PaItemInputItem {
  inputNo?: number;
  itemNo?: string;
  itemName?: string;
  itemId?: string;
  orderNo?: number;
  isUse?: number;
  itemType?: number;
  activity?: number;
}

export interface PaResultSections {
  hrItems?: PaItemInputItem[];
  attendanceItems?: PaItemInputItem[];
  inputItems?: PaItemInputItem[];
  computeItems?: PaItemInputItem[];
}

export interface PaResultSaveItem {
  itemNo: string;
  itemId: string;
  itemName: string;
  orderNo: number | null;
}

interface ActionResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

const BASE_URL = '/pa/salary/result/api';

/**
 * Cấu hình hạng mục kết quả tính lương (viewPaResult) - port lại từ
 * pa/salary/viewPaResult.html (đã xoá). Danh sách kế hoạch trả lương dùng lại
 * PaPayScheduleService.getList() (endpoint /pa/workManagement/api/paySchedule
 * đã có sẵn cho trang pa-pay-schedule, gọi không truyền filter để lấy tất cả
 * - đúng như bản gốc) thay vì viết lại 1 service riêng.
 */
@Injectable({ providedIn: 'root' })
export class PaResultService {
  private readonly http = inject(HttpClient);

  getSectionItems(): Promise<PaResultSections> {
    return firstValueFrom(this.http.get<PaResultSections>(`${BASE_URL}/sectionItems`));
  }

  getSavedItems(isUse: number, itemType: number): Promise<PaItemInputItem[]> {
    return firstValueFrom(this.http.get<PaItemInputItem[]>(`${BASE_URL}/savedItems`, { params: { isUse, itemType } }));
  }

  save(isUse: number, itemType: number, items: PaResultSaveItem[]): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/save`, { isUse, itemType, items }));
  }

  buildExportExcelUrl(payScheduleNo: string, deptNos: string, itemIds: string): string {
    const params = new URLSearchParams({ payScheduleNo, deptNos, itemIds });
    return `${BASE_URL}/exportExcel?${params.toString()}`;
  }
}
