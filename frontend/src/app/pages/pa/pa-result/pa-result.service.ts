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
  /** GET_ITEM_GLAG - '1' = mặc định tích chọn */
  itemFlag?: string;
  /** GET_ITEM_NUMBER - số thứ tự mặc định (0 = không có) */
  itemNumber?: number;
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

export interface PaResultExportColumn {
  itemId: string;
  itemName: string;
  orderNo: number | null;
  decimal: boolean;
}

interface ActionResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

const BASE_URL = '/pa/salary/result/api';

/**
 * Kết quả tính lương (viewPaResult) - port từ pa/salary/viewPaResult.jsp.
 * Danh sách kế hoạch trả lương dùng lại PaPayScheduleService.getList().
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

  /** POST vì danh sách cột có thể dài (vượt giới hạn URL của GET). */
  async exportExcel(payScheduleNo: string, deptNo: string | null, columns: PaResultExportColumn[]): Promise<void> {
    const res = await firstValueFrom(
      this.http.post(`${BASE_URL}/exportExcel`, { payScheduleNo, deptNo, columns }, { responseType: 'blob', observe: 'response' }),
    );
    const disposition = res.headers.get('Content-Disposition') ?? '';
    const match = /filename\*=UTF-8''([^;]+)/.exec(disposition);
    const filename = match ? decodeURIComponent(match[1]) : `PaResult_${payScheduleNo}.xlsx`;
    const url = URL.createObjectURL(res.body!);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
