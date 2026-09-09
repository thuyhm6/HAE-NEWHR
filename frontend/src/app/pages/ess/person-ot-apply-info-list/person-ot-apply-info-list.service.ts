import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface PersonOtRow {
  pkNo?: string;
  empId?: string;
  localName?: string;
  deptName?: string;
  itemNo?: string;
  itemName?: string;
  shiftNo?: string;
  shiftName?: string;
  arDateStr?: string;
  workTime?: string;
  indoorTime?: string;
  outdoorTime?: string;
  otStartTime?: string;
  otEndTime?: string;
  workHour?: string;
}

export interface PersonOtFilter {
  startDate?: string;
  endDate?: string;
  itemNoSearch?: string;
  minQuantity?: string;
}

export interface OtItemOption {
  itemNo: string;
  itemName?: string;
}

const LIST_URL = '/ess/infoApply/api/personOt/list';
const ITEMS_URL = '/ess/infoApply/api/personOt/items';

/**
 * Báo cáo tăng ca theo hạng mục của chính nhân viên đang đăng nhập - port lại
 * từ ess/infoApply/viewPersonOtApplyInfoList.html (Thymeleaf, đã xoá) sang
 * Angular + NG-ZORRO. Gọi lại nguyên vẹn API JSON sẵn có.
 */
@Injectable({ providedIn: 'root' })
export class PersonOtApplyInfoListService {
  private readonly http = inject(HttpClient);

  getList(filter: PersonOtFilter): Promise<PersonOtRow[]> {
    return firstValueFrom(this.http.get<PersonOtRow[]>(LIST_URL, { params: this.toHttpParams({ ...filter }) }));
  }

  getItemOptions(): Promise<OtItemOption[]> {
    return firstValueFrom(this.http.get<OtItemOption[]>(ITEMS_URL));
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
