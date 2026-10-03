import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { I18nService } from '../../../i18n/i18n.service';
import { EduSaveResponse } from './edu-common.service';

export interface EduApplyCourse {
  basicNo: string;
  planNo?: string;
  syllabusCount?: number;
  trainTypeCodeName?: string;
  courseNameCode?: string;
  periodTime?: string;
  trainFormCodeName?: string;
  trainAddress?: string;
  impleStartDate?: string;
  impleEndDate?: string;
  impleClassHour?: string;
  impleClassUnit?: string;
  trainContent?: string;
  applyCount?: number;
  designatedCount?: number;
}

export interface EduApplyMaker {
  empid?: string;
  personId: string;
  localName?: string;
  deptName?: string;
  postGradeName?: string;
  positionName?: string;
}

export interface EduApplyRecord {
  makerNo?: string;
  applyNo: string;
  basicNo?: string;
  planNo?: string;
  syllabusCount?: number;
  makerPersonId?: string;
  makerLocalName?: string;
  /** 1 = chưa duyệt, 2 = đã duyệt, 0 = từ chối */
  applyFlag?: string;
  /** 1 = chờ xác nhận, 2 = đã xác nhận, 0 = từ chối */
  confirmFlag?: string;
  makerLevel?: string;
  createDate?: string;
  empid?: string;
  stuPersonId?: string;
  stuLocalName?: string;
  deptName?: string;
  postGradeName?: string;
  trainTypeCodeName?: string;
  courseNameCode?: string;
  periodTime?: string;
  impleStartDate?: string;
  impleEndDate?: string;
  impleClassHour?: string;
  impleClassUnit?: string;
  applyTask?: string;
  applyCount?: number;
  plannedCount?: number;
}

export interface EduApplyQuery {
  deptNo?: string | null;
  keyword?: string | null;
  courseName?: string | null;
  /** DD/MM/YYYY */
  startDate?: string | null;
  /** DD/MM/YYYY */
  endDate?: string | null;
  flag?: string | null;
}

export interface EduApplyRequest {
  items: { basicNo: string; applyTask?: string | null }[];
  makers: EduApplyMaker[];
}

/** Trạng thái phê duyệt / xác nhận (giá trị giữ nguyên bản gốc). */
export const EDU_APPLY_FLAG_REJECT = '0';
export const EDU_APPLY_FLAG_PENDING = '1';
export const EDU_APPLY_FLAG_PASS = '2';

const BASE = '/edu/api';

/**
 * API đăng ký khóa đào tạo + phê duyệt / xác nhận / tình hình đăng ký - dùng chung cho
 * courseApply, courseMaker, courseConfirm, makerSituation, makerSituationHUB (Hanwha_HTSV).
 */
@Injectable({ providedIn: 'root' })
export class EduCourseApplyService {
  private readonly http = inject(HttpClient);

  private toParams(query: object): Record<string, string> {
    const params: Record<string, string> = {};
    Object.entries(query).forEach(([k, v]) => {
      if (v !== null && v !== undefined && String(v).trim() !== '') params[k] = String(v).trim();
    });
    return params;
  }

  // ===== Đăng ký =====
  getApplyCourses(query: EduApplyQuery): Promise<EduApplyCourse[]> {
    return firstValueFrom(this.http.get<EduApplyCourse[]>(`${BASE}/courseApply/courses`, { params: this.toParams(query) }));
  }

  getDefaultMakers(): Promise<EduApplyMaker[]> {
    return firstValueFrom(this.http.get<EduApplyMaker[]>(`${BASE}/courseApply/defaultMakers`));
  }

  findMakers(keyword: string | null, deptNo: string | null): Promise<EduApplyMaker[]> {
    return firstValueFrom(this.http.get<EduApplyMaker[]>(`${BASE}/courseApply/makers`, { params: this.toParams({ keyword, deptNo }) }));
  }

  apply(request: EduApplyRequest): Promise<EduSaveResponse> {
    return firstValueFrom(this.http.post<EduSaveResponse>(`${BASE}/courseApply/apply`, request));
  }

  // ===== Phê duyệt =====
  getMakerRecords(query: EduApplyQuery): Promise<EduApplyRecord[]> {
    return firstValueFrom(this.http.get<EduApplyRecord[]>(`${BASE}/courseMaker/list`, { params: this.toParams(query) }));
  }

  updateMaker(applyNos: string[], flag: string): Promise<EduSaveResponse> {
    return firstValueFrom(this.http.post<EduSaveResponse>(`${BASE}/courseMaker/update`, { applyNos, flag }));
  }

  // ===== Xác nhận =====
  getConfirmRecords(query: EduApplyQuery): Promise<EduApplyRecord[]> {
    return firstValueFrom(this.http.get<EduApplyRecord[]>(`${BASE}/courseConfirm/list`, { params: this.toParams(query) }));
  }

  updateConfirm(applyNos: string[], flag: string): Promise<EduSaveResponse> {
    return firstValueFrom(this.http.post<EduSaveResponse>(`${BASE}/courseConfirm/update`, { applyNos, flag }));
  }

  // ===== Tình hình đăng ký =====
  getSituation(query: EduApplyQuery, hub: boolean): Promise<EduApplyRecord[]> {
    return firstValueFrom(
      this.http.get<EduApplyRecord[]>(`${BASE}/makerSituation/list`, { params: { ...this.toParams(query), hub: String(hub) } }),
    );
  }

  getSituationRole(): Promise<{ manager: boolean }> {
    return firstValueFrom(this.http.get<{ manager: boolean }>(`${BASE}/makerSituation/role`));
  }

  cancel(applyNo: string): Promise<EduSaveResponse> {
    return firstValueFrom(this.http.post<EduSaveResponse>(`${BASE}/makerSituation/cancel`, null, { params: { applyNo } }));
  }
}

/** Nhãn trạng thái phê duyệt (APPLY_FLAG). */
export function eduApplyFlagLabel(i18n: I18nService, flag?: string | null): string {
  switch (flag) {
    case EDU_APPLY_FLAG_PASS:
      return i18n.t('ess.affirmApply.title.remark.yitongguo', 'Duyệt');
    case EDU_APPLY_FLAG_REJECT:
      return i18n.t('ess.affirmApply.title.remark.yifoujue', 'Từ chối');
    default:
      return i18n.t('ess.trans.title.notAffirmed', 'Chưa duyệt');
  }
}

/** Nhãn trạng thái xác nhận (CONFIRM_FLAG). */
export function eduConfirmFlagLabel(i18n: I18nService, flag?: string | null): string {
  switch (flag) {
    case EDU_APPLY_FLAG_PASS:
      return i18n.t('ar.viewsummaryyiqueren', 'Xác nhận');
    case EDU_APPLY_FLAG_REJECT:
      return i18n.t('hrm.contractInfo.VETO', 'Từ chối');
    default:
      return i18n.t('main.home.message.unconfirm', 'Chờ xác nhận');
  }
}

/** Thông báo lỗi theo errorCode của EduCourseApplyService (fallback: thông báo chung). */
export function eduApplyErrorMessage(i18n: I18nService, res: EduSaveResponse | null, fallbackKey: string, fallback: string): string {
  const code = res?.errorCode;
  return code ? i18n.t(`edu.courseApply.err.${code}`, i18n.t(fallbackKey, fallback)) : i18n.t(fallbackKey, fallback);
}
