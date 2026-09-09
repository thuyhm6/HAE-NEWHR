import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface EvsResumeOption {
  seq?: string;
  resumeName?: string;
}

export interface ConfirmTargetRow {
  seq?: string;
  empid?: string;
  localName?: string;
  deptname?: string;
  postGradeName?: string;
  objectType?: string;
  objectTypeName?: string;
  activity?: string;
  activityName?: string;
}

export interface DataTablesResponse<T> {
  draw?: number;
  recordsTotal?: number;
  recordsFiltered?: number;
  data?: T[];
}

export interface ConfirmTargetDetail {
  seq?: string;
  evsYear?: string;
  localName?: string;
  postGradeName?: string;
  deptname?: string;
  dateStarted?: string;
  evsStartDate?: string;
  evsEndDate?: string;
  localName1?: string;
  localName2?: string;
  affirmComment1?: string;
  affirmComment2?: string;
}

export interface ConfirmTargetItem {
  itemName?: string;
  itemContent?: string;
  itemType?: string;
  itemScore?: string;
}

interface ActionResponse {
  success?: boolean;
  message?: string;
}

const RESUME_LIST_URL = '/evs/manage/api/resume/evsResumeList';
const ITEM_LIST_URL = '/evs/manage/api/personalTarget/itemList';

/**
 * Dùng chung cho viewConfirmTarget1 và viewConfirmTarget2 (đã xoá) - 2 trang
 * legacy có cấu trúc giao diện + luồng xử lý giống hệt nhau (chỉ khác API
 * base path, EVS_LEVEL tra cứu, ACTIVITY xác nhận, và cấp xác nhận cố định
 * hay lấy theo query param), nên gộp thành 1 component dùng chung, cấu hình
 * qua route data - tránh lặp lại ~250 dòng code (theo quy tắc "ưu tiên tái sử
 * dụng code" của dự án).
 */
@Injectable({ providedIn: 'root' })
export class ConfirmTargetService {
  private readonly http = inject(HttpClient);

  getResumeOptions(evsType: string, evsLevel: string): Promise<EvsResumeOption[]> {
    return firstValueFrom(this.http.get<EvsResumeOption[]>(RESUME_LIST_URL, { params: { evsType, evsLevel } }));
  }

  getObjectList(
    apiBase: string,
    resumeSeq: string,
    evsType: string,
    affirmLevel: string,
    draw: number,
    start: number,
    length: number,
  ): Promise<DataTablesResponse<ConfirmTargetRow>> {
    return firstValueFrom(
      this.http.get<DataTablesResponse<ConfirmTargetRow>>(`/evs/manage/api/${apiBase}/objectList`, {
        params: { resumeSeq, evsType, affirmLevel, draw, start, length },
      }),
    );
  }

  getObjectInfo(apiBase: string, evsObjectSeq: string): Promise<ConfirmTargetDetail> {
    return firstValueFrom(this.http.get<ConfirmTargetDetail>(`/evs/manage/api/${apiBase}/objectInfo`, { params: { evsObjectSeq } }));
  }

  getItemList(evsObjectSeq: string): Promise<ConfirmTargetItem[]> {
    return firstValueFrom(this.http.get<ConfirmTargetItem[]>(ITEM_LIST_URL, { params: { evsObjectSeq } }));
  }

  confirm(
    apiBase: string,
    payload: { evsObjectSeq: string; affirmComment: string; affirmLevel: string; flag: string },
  ): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`/evs/manage/api/${apiBase}/confirm`, payload));
  }
}
