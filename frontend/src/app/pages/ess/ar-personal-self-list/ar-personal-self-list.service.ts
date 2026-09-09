import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface ArPersonalSelfItem {
  itemNo?: string;
  itemName?: string;
}

export interface ArPersonalSelfSummaryRow {
  personId?: string;
  empId?: string;
  localName?: string;
  deptNo?: string;
  deptName?: string;
  itemNo?: string;
  itemName?: string;
  totalQuantity?: string;
}

export interface ArPersonalSelfDetailRow {
  pkNo?: string;
  personId?: string;
  empId?: string;
  localName?: string;
  shiftNo?: string;
  shiftName?: string;
  arDateStr?: string;
  itemNo?: string;
  itemName?: string;
  fromTimeStr?: string;
  toTimeStr?: string;
  quantity?: string;
}

const ITEMS_URL = '/ess/viewDept/api/arPersonalSelf/items';
const SUMMARY_URL = '/ess/viewDept/api/arPersonalSelf/summary';
const DETAIL_URL = '/ess/viewDept/api/arPersonalSelf/detail';

/**
 * Gọi lại nguyên vẹn API JSON sẵn có của trang viewArPersonalSelfList (không
 * đổi backend) - port lại từ ess/viewDept/viewArPersonalSelfList.html
 * (Thymeleaf, đã xoá) sang Angular + NG-ZORRO.
 */
@Injectable({ providedIn: 'root' })
export class ArPersonalSelfListService {
  private readonly http = inject(HttpClient);

  getItems(): Promise<ArPersonalSelfItem[]> {
    return firstValueFrom(this.http.get<ArPersonalSelfItem[]>(ITEMS_URL));
  }

  getSummary(startDate?: string, endDate?: string): Promise<ArPersonalSelfSummaryRow[]> {
    return firstValueFrom(
      this.http.get<ArPersonalSelfSummaryRow[]>(SUMMARY_URL, { params: this.toHttpParams({ startDate, endDate }) }),
    );
  }

  getDetail(
    personId: string,
    itemNo: string,
    startDate?: string,
    endDate?: string,
  ): Promise<ArPersonalSelfDetailRow[]> {
    return firstValueFrom(
      this.http.get<ArPersonalSelfDetailRow[]>(
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
