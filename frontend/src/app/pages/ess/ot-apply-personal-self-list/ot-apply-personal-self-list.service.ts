import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface OtApplyPersonalSelfItem {
  itemNo?: string;
  itemName?: string;
}

export interface OtApplyPersonalSelfSummaryRow {
  personId?: string;
  empId?: string;
  localName?: string;
  deptNo?: string;
  deptName?: string;
  itemNo?: string;
  itemName?: string;
  totalQuantity?: string;
}

export interface OtApplyPersonalSelfDetailRow {
  pkNo?: string;
  personId?: string;
  empId?: string;
  localName?: string;
  shiftNo?: string;
  shiftName?: string;
  workTime?: string;
  arDateStr?: string;
  itemNo?: string;
  itemName?: string;
  fromTimeStr?: string;
  toTimeStr?: string;
  quantity?: string;
}

const ITEMS_URL = '/ess/viewDept/api/otApplyPersonalSelf/items';
const SUMMARY_URL = '/ess/viewDept/api/otApplyPersonalSelf/summary';
const DETAIL_URL = '/ess/viewDept/api/otApplyPersonalSelf/detail';

/**
 * Gọi lại nguyên vẹn API JSON sẵn có của trang viewOtApplyPersonalSelfList
 * (không đổi backend) - port lại từ
 * ess/viewDept/viewOtApplyPersonalSelfList.html (Thymeleaf, đã xoá) sang
 * Angular + NG-ZORRO.
 */
@Injectable({ providedIn: 'root' })
export class OtApplyPersonalSelfListService {
  private readonly http = inject(HttpClient);

  getItems(): Promise<OtApplyPersonalSelfItem[]> {
    return firstValueFrom(this.http.get<OtApplyPersonalSelfItem[]>(ITEMS_URL));
  }

  getSummary(startDate?: string, endDate?: string): Promise<OtApplyPersonalSelfSummaryRow[]> {
    return firstValueFrom(
      this.http.get<OtApplyPersonalSelfSummaryRow[]>(SUMMARY_URL, { params: this.toHttpParams({ startDate, endDate }) }),
    );
  }

  getDetail(
    personId: string,
    itemNo: string,
    startDate?: string,
    endDate?: string,
  ): Promise<OtApplyPersonalSelfDetailRow[]> {
    return firstValueFrom(
      this.http.get<OtApplyPersonalSelfDetailRow[]>(
        DETAIL_URL,
        { params: this.toHttpParams({ personId, itemNo, startDate, endDate }) },
      ),
    );
  }

  private toHttpParams(filter: Record<string, string | undefined>): Record<string, string> {
    const params: Record<string, string> = {};
    Object.keys(filter).forEach((key) => {
      const value = filter[key];
      if (value !== undefined && value !== null && value !== '') {
        params[key] = value;
      }
    });
    return params;
  }
}
