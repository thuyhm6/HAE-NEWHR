import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface CardTemporaryRow {
  recordNo?: number;
  personId?: string;
  empId?: string;
  localName?: string;
  cardNo?: string;
  remark?: string;
  /** 1: sử dụng, 0: không sử dụng */
  activity?: string;
  deptName?: string;
  postGradeName?: string;
  createdBy?: string;
  createdName?: string;
  createDate?: string;
  updatedBy?: string;
  updatedName?: string;
  updateDate?: string;
}

export interface CardTemporaryFilter {
  keyword?: string;
  activity?: string;
}

export interface CardTemporarySavePayload {
  recordNo?: number;
  personId?: string;
  cardNo?: string;
  activity: string;
  remark?: string;
}

export interface CardTemporaryResponse {
  success: boolean;
  messageKey?: string;
  message?: string;
}

const LIST_URL = '/ar/attendanceMintenance/api/arCardTemporary/list';
const ADD_URL = '/ar/attendanceMintenance/api/arCardTemporary/add';
const UPDATE_URL = '/ar/attendanceMintenance/api/arCardTemporary/update';

/**
 * Thẻ chấm công tạm thời (AR_MAC_CARDS_LINK) - port lại từ
 * ar/attendanceMintenance/viewArCardTemporary.jsp dự án cũ. Backend:
 * ArCardTemporaryController.
 */
@Injectable({ providedIn: 'root' })
export class CardTemporaryService {
  private readonly http = inject(HttpClient);

  getList(filter: CardTemporaryFilter): Promise<CardTemporaryRow[]> {
    const params: Record<string, string> = {};
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params[key] = String(value);
      }
    });
    return firstValueFrom(this.http.get<CardTemporaryRow[]>(LIST_URL, { params }));
  }

  add(payload: CardTemporarySavePayload): Promise<CardTemporaryResponse> {
    return firstValueFrom(this.http.post<CardTemporaryResponse>(ADD_URL, payload));
  }

  update(payload: CardTemporarySavePayload): Promise<CardTemporaryResponse> {
    return firstValueFrom(this.http.post<CardTemporaryResponse>(UPDATE_URL, payload));
  }
}
