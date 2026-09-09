import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface EvsResumeOption {
  seq?: string;
  resumeName?: string;
}

export interface SyCodeOption {
  codeNo: string;
  codeName?: string;
  nameVi?: string;
}

export interface EvsGrade {
  seq?: string;
  resumeSeq?: string;
  evsType?: string;
  evsTypeName?: string;
  evsGrade?: string;
  evsGradeName?: string;
  isInclude?: string;
  startScore?: string;
  endScore?: string;
  score?: string;
  remark?: string;
  updatedBy?: string;
  updateDate?: string;
}

export interface EvsParamRow {
  seq?: string;
  resumeSeq?: string;
  paramType?: string;
  evsType?: string;
  codeNo?: string;
  codeName?: string;
  formula?: string;
  formulaName?: string;
  startStep?: string;
  startStepName?: string;
  evsScore?: string;
  updatedBy?: string;
  updateDate?: string;
  seqs?: string[];
}

export interface EvsParamObject {
  seq?: string;
  resumeSeq?: string;
  codeNo?: string;
  codeName?: string;
  formula?: string;
  formulaName?: string;
  isInclude?: string;
  evsGrade?: string;
  evsGradeName?: string;
  updatedBy?: string;
  updateDate?: string;
}

export interface EvsAffirmRule {
  seq?: string;
  resumeSeq?: string;
  evsStep?: string;
  evsStepName?: string;
  evsGroup?: string;
  evsGroupName?: string;
  ruleId?: string;
  ruleName?: string;
  updatedBy?: string;
  updateDate?: string;
}

const BASE_URL = '/evs/manage/api';

/**
 * Tiêu chuẩn đánh giá (viewEvsParamPanel) - port lại từ
 * evs/manage/viewEvsParamPanel.html (đã xoá). 7 tab con dùng chung 1
 * "Tên đánh giá" (resumeSeq): Cấp đánh giá (EVS_GRADE), 4 loại tham số dùng
 * chung bảng EVS_PARAM phân biệt bằng paramType (ITEM/LIST/GROUP/FAMILY),
 * Đối tượng đánh giá (EVS_PARAM_OBJECT), Người đánh giá (EVS_AFFIRM_RULE).
 *
 * Bản gốc dùng UX inline-edit-trong-bảng (click dòng để sửa tại chỗ, thêm
 * dòng mới rồi bấm "Lưu" hàng loạt). Bản Angular đổi sang modal Thêm/Sửa +
 * xóa từng dòng, nhất quán với mọi trang CRUD khác đã migrate trong dự án
 * (xem quyết định tương tự đã ghi trong recruit-list.component.ts).
 */
@Injectable({ providedIn: 'root' })
export class EvsParamPanelService {
  private readonly http = inject(HttpClient);

  getResumeOptions(evsType: string): Promise<EvsResumeOption[]> {
    return firstValueFrom(this.http.get<EvsResumeOption[]>(`${BASE_URL}/resume/evsResumeList`, { params: { evsType } }));
  }

  getCodeList(parentCodeNo: string): Promise<SyCodeOption[]> {
    if (!parentCodeNo) return Promise.resolve([]);
    return firstValueFrom(this.http.get<SyCodeOption[]>('/sys/api/getCode/list', { params: { parentCodeNo } }));
  }

  getFormulaOptions(): Promise<SyCodeOption[]> {
    return firstValueFrom(this.http.get<SyCodeOption[]>(`${BASE_URL}/evsFormula/formulaOptions`));
  }

  getGroupOptions(resumeSeq: string): Promise<SyCodeOption[]> {
    if (!resumeSeq) return Promise.resolve([]);
    return firstValueFrom(this.http.get<SyCodeOption[]>(`${BASE_URL}/evsParam/groupOptions`, { params: { resumeSeq } }));
  }

  // ── Cấp đánh giá (EVS_GRADE) ──
  getGradeList(resumeSeq: string, evsType: string): Promise<EvsGrade[]> {
    return firstValueFrom(this.http.get<EvsGrade[]>(`${BASE_URL}/evsGrade/list`, { params: { resumeSeq, evsType } }));
  }
  saveGrade(row: EvsGrade): Promise<void> {
    return firstValueFrom(this.http.post<void>(`${BASE_URL}/evsGrade/save`, [row]));
  }
  deleteGrade(seq: string): Promise<void> {
    return firstValueFrom(this.http.post<void>(`${BASE_URL}/evsGrade/delete`, { seqs: [seq] }));
  }

  // ── EVS_PARAM (ITEM/LIST/GROUP/FAMILY) ──
  getParamList(resumeSeq: string, paramType: string, evsType: string): Promise<EvsParamRow[]> {
    return firstValueFrom(this.http.get<EvsParamRow[]>(`${BASE_URL}/evsParam/list`, { params: { resumeSeq, paramType, evsType } }));
  }
  saveParam(row: EvsParamRow): Promise<void> {
    return firstValueFrom(this.http.post<void>(`${BASE_URL}/evsParam/save`, [row]));
  }
  deleteParam(seq: string): Promise<void> {
    return firstValueFrom(this.http.post<void>(`${BASE_URL}/evsParam/delete`, { seqs: [seq] }));
  }

  // ── Đối tượng đánh giá (EVS_PARAM_OBJECT) ──
  getParamObjectList(resumeSeq: string, evsType: string): Promise<EvsParamObject[]> {
    return firstValueFrom(this.http.get<EvsParamObject[]>(`${BASE_URL}/evsParamObject/list`, { params: { resumeSeq, evsType } }));
  }
  saveParamObject(row: EvsParamObject): Promise<void> {
    return firstValueFrom(this.http.post<void>(`${BASE_URL}/evsParamObject/save`, [row]));
  }
  deleteParamObject(seq: string): Promise<void> {
    return firstValueFrom(this.http.post<void>(`${BASE_URL}/evsParamObject/delete`, { seqs: [seq] }));
  }

  // ── Người đánh giá (EVS_AFFIRM_RULE) ──
  getAffirmRuleList(resumeSeq: string): Promise<EvsAffirmRule[]> {
    return firstValueFrom(this.http.get<EvsAffirmRule[]>(`${BASE_URL}/evsAffirmRule/list`, { params: { resumeSeq } }));
  }
  saveAffirmRule(row: EvsAffirmRule): Promise<void> {
    return firstValueFrom(this.http.post<void>(`${BASE_URL}/evsAffirmRule/save`, [row]));
  }
  deleteAffirmRule(seq: string): Promise<void> {
    return firstValueFrom(this.http.post<void>(`${BASE_URL}/evsAffirmRule/delete`, { seqs: [seq] }));
  }
}
