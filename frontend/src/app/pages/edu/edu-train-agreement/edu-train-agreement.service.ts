import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { EduFile, EduSaveResponse } from '../shared/edu-common.service';

export interface EduTrainAgreementRow {
  agreeNo?: string;
  agreeId?: string;
  agreeName?: string;
  personId?: string;
  empid?: string;
  localName?: string;
  departName?: string;
  conStartDate?: string;
  conEndDate?: string;
  studyStartDate?: string;
  studyEndDate?: string;
  studyDay?: string;
  hqFree?: string;
  cgfyFree?: string;
  jpFree?: string;
  zfbzFree?: string;
  cgbzFree?: string;
  cgbzFreeFact?: string;
  sybxFree?: string;
  yxPay?: string;
  jtFree?: string;
  txFree?: string;
  factPay?: string;
  agreeStartDate?: string;
  agreeEndDate?: string;
  remark?: string;
  files?: EduFile[];
}

export interface EduAgreementQuery {
  deptNo?: string | null;
  keyword?: string | null;
  conStartDate?: string | null;
  conEndDate?: string | null;
}

/** Mã lỗi backend khi chưa chọn người ký (EduTrainAgreementService.ERR_NO_PERSON). */
export const ETA_ERR_NO_PERSON = 'EDU_TRAIN_AGREEMENT_NO_PERSON';

const BASE = '/edu/api/trainAgreement';
export const ETA_TEMPLATE_URL = `${BASE}/template`;

/**
 * Hợp đồng đào tạo (EDU_TRAIN_AGREEMENT) - port từ /edu/traineducation/trainAgreement (Hanwha_HTSV).
 */
@Injectable({ providedIn: 'root' })
export class EduTrainAgreementService {
  private readonly http = inject(HttpClient);

  private toParams(query: EduAgreementQuery): Record<string, string> {
    const params: Record<string, string> = {};
    Object.entries(query).forEach(([k, v]) => {
      if (v) params[k] = v;
    });
    return params;
  }

  getList(query: EduAgreementQuery = {}): Promise<EduTrainAgreementRow[]> {
    return firstValueFrom(this.http.get<EduTrainAgreementRow[]>(`${BASE}/list`, { params: this.toParams(query) }));
  }

  getDetail(agreeNo: string): Promise<EduTrainAgreementRow> {
    return firstValueFrom(this.http.get<EduTrainAgreementRow>(`${BASE}/detail`, { params: { agreeNo } }));
  }

  add(payload: EduTrainAgreementRow): Promise<EduSaveResponse> {
    return firstValueFrom(this.http.post<EduSaveResponse>(`${BASE}/add`, payload));
  }

  update(payload: EduTrainAgreementRow): Promise<EduSaveResponse> {
    return firstValueFrom(this.http.post<EduSaveResponse>(`${BASE}/update`, payload));
  }

  delete(agreeNo: string): Promise<EduSaveResponse> {
    return firstValueFrom(this.http.post<EduSaveResponse>(`${BASE}/delete`, null, { params: { agreeNo } }));
  }

  importExcel(file: File): Promise<EduSaveResponse> {
    const form = new FormData();
    form.append('file', file, file.name);
    return firstValueFrom(this.http.post<EduSaveResponse>(`${BASE}/import`, form));
  }

  buildExportUrl(query: EduAgreementQuery): string {
    const qs = new URLSearchParams(this.toParams(query)).toString();
    return `${BASE}/export${qs ? '?' + qs : ''}`;
  }
}
