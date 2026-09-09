import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface ArShiftGroupRow {
  pkNo?: number;
  personId?: string;
  empId?: string;
  localName?: string;
  beforShiftNo?: string;
  beforShiftName?: string;
  shiftNo?: string;
  shiftName?: string;
  startDate?: string;
  remark?: string;
}

export interface SyCodeOption {
  codeNo: string;
  codeName?: string;
  description?: string;
}

export interface SaveShiftGroupPayload {
  PERSON_ID: string;
  BEFOR_SHIFT_NO?: string;
  SHIFT_NO: string;
  START_DATE: string;
  REMARK?: string;
}

const LIST_URL = '/ess/deptEmpAtt/api/shiftGroup/list';
const SAVE_URL = '/ess/deptEmpAtt/api/shiftGroup/save';
const CODE_LIST_URL = '/sys/api/getCode/list';
const SHIFT_PARENT_CODE = '400223';

/**
 * Gọi lại nguyên vẹn API JSON sẵn có của trang viewArShiftGroupList (không
 * đổi backend) - port lại từ ess/deptEmpAtt/viewArShiftGroupList.html
 * (Thymeleaf, đã xoá) sang Angular + NG-ZORRO.
 */
@Injectable({ providedIn: 'root' })
export class ArShiftGroupListService {
  private readonly http = inject(HttpClient);

  getList(empId?: string, empName?: string): Promise<ArShiftGroupRow[]> {
    return firstValueFrom(
      this.http.get<ArShiftGroupRow[]>(LIST_URL, { params: this.toHttpParams({ empId, empName }) }),
    );
  }

  save(payload: SaveShiftGroupPayload): Promise<{ success: boolean; message?: string; error?: string }> {
    return firstValueFrom(
      this.http.post<{ success: boolean; message?: string; error?: string }>(SAVE_URL, payload),
    );
  }

  getShiftOptions(): Promise<SyCodeOption[]> {
    return firstValueFrom(this.http.get<SyCodeOption[]>(CODE_LIST_URL, { params: { parentCodeNo: SHIFT_PARENT_CODE } }));
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
