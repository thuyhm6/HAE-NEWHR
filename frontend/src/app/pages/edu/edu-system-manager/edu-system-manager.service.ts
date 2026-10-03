import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { SyCodeOption } from '../../ar/company-calendar/company-calendar.service';

export interface EduSystemManagerRow {
  sysmanaNo?: string;
  trainDiffCode?: string;
  trainTypeCode?: string;
  trainDiffCodeName?: string;
  trainTypeCodeName?: string;
  trainTypeNo?: string;
  remark?: string;
}

export interface EduSystemManagerSaveResponse {
  success: boolean;
  errorCode?: string;
  message?: string;
  trainTypeNo?: string;
}

/** Mã cha (parent code) của danh mục Chương trình đào tạo, giữ nguyên `parentNo="14014478"` bản gốc. */
export const ESM_TRAIN_DIFF_PARENT_CODE = '14014478';
/** Mã lỗi backend khi thêm trùng Loại hình (EduSystemManagerService.ERR_DUPLICATE). */
export const ESM_ERR_DUPLICATE = 'EDU_SYSTEM_MANAGER_DUPLICATE';
/** Chỉ công ty HAE mới được xóa, giữ nguyên `<c:if test="${LoginUser.cpnyId eq 'HAE'}">` bản gốc. */
export const ESM_DELETE_ALLOWED_CPNY = 'HAE';

const LIST_URL = '/edu/api/systemManager/list';
const DETAIL_URL = '/edu/api/systemManager/detail';
const ADD_URL = '/edu/api/systemManager/add';
const UPDATE_URL = '/edu/api/systemManager/update';
const DELETE_URL = '/edu/api/systemManager/delete';
const CODE_LIST_URL = '/sys/api/getCode/list';

/**
 * Hệ thống đào tạo (EDU_SYSTEM_MANAGER) - port từ
 * /edu/traineducation/systemManager (Hanwha_HAE).
 */
@Injectable({ providedIn: 'root' })
export class EduSystemManagerService {
  private readonly http = inject(HttpClient);

  getList(trainDiffCode?: string | null, trainTypeCode?: string | null): Promise<EduSystemManagerRow[]> {
    const params: Record<string, string> = {};
    if (trainDiffCode) params['trainDiffCode'] = trainDiffCode;
    if (trainTypeCode) params['trainTypeCode'] = trainTypeCode;
    return firstValueFrom(this.http.get<EduSystemManagerRow[]>(LIST_URL, { params }));
  }

  getDetail(sysmanaNo: string): Promise<EduSystemManagerRow> {
    return firstValueFrom(this.http.get<EduSystemManagerRow>(DETAIL_URL, { params: { sysmanaNo } }));
  }

  add(payload: EduSystemManagerRow): Promise<EduSystemManagerSaveResponse> {
    return firstValueFrom(this.http.post<EduSystemManagerSaveResponse>(ADD_URL, payload));
  }

  update(payload: EduSystemManagerRow): Promise<EduSystemManagerSaveResponse> {
    return firstValueFrom(this.http.post<EduSystemManagerSaveResponse>(UPDATE_URL, payload));
  }

  delete(sysmanaNo: string): Promise<EduSystemManagerSaveResponse> {
    return firstValueFrom(this.http.post<EduSystemManagerSaveResponse>(DELETE_URL, null, { params: { sysmanaNo } }));
  }

  /** Danh mục mã con theo mã cha - thay cho /sys/basicMaintenance/getCodeRelation bản gốc. */
  getCodeList(parentCodeNo: string): Promise<SyCodeOption[]> {
    return firstValueFrom(this.http.get<SyCodeOption[]>(CODE_LIST_URL, { params: { parentCodeNo } }));
  }
}
