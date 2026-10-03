import { formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';
import { firstValueFrom } from 'rxjs';
import { SyCodeOption } from '../../ar/company-calendar/company-calendar.service';

export interface EduDeptNode {
  deptNo: string;
  parentDeptNo?: string;
  deptName?: string;
}

export interface EduEmployee {
  personId: string;
  empid: string;
  localName: string;
  deptNo?: string;
  deptName?: string;
  postGradeName?: string;
  positionName?: string;
}

export interface EduFile {
  fileNo: string;
  applyNo?: string;
  applyType?: string;
  fileName: string;
}

/** Response chung của các API lưu/xóa module đào tạo. */
export interface EduSaveResponse {
  success: boolean;
  errorCode?: string;
  message?: string;
  errors?: string[];
  [key: string]: unknown;
}

export interface EduEmployeeQuery {
  keyword?: string | null;
  deptNos?: string | null;
  deptRoot?: string | null;
  orderBy?: string | null;
}

/** APPLY_TYPE file đính kèm - giữ nguyên giá trị bản gốc (EduCommonService.FILE_TYPE_*). */
export const EDU_FILE_TYPE_PLAN = 'eduPlanManager';
export const EDU_FILE_TYPE_ORGAN = 'eduTrainOrgan';
export const EDU_FILE_TYPE_AGREEMENT = 'eduTrainAgreement';
/** Báo cáo đào tạo - APPLY_NO = BASIC_NO (trainResultTSTOInfo bản gốc). */
export const EDU_FILE_TYPE_RESULT = 'eduTrainResult';
export const EDU_FILE_TYPE_COST = 'eduCostManager';

/** Mã cha danh mục dùng ở module đào tạo (giữ nguyên parentNo bản gốc). */
export const EDU_CODE_TRAIN_DIFF = '14014478';
export const EDU_CODE_TRAIN_FORM = '14014493';
export const EDU_CODE_TEACH_FIELD = '14015148';
export const EDU_CODE_TEACH_LEVEL = '14015140';
export const EDU_CODE_TEACH_STATUS = '14015155';

const CODE_LIST_URL = '/sys/api/getCode/list';
const DEPT_TREE_URL = '/edu/api/common/deptTree';
const EMPLOYEES_URL = '/edu/api/common/employees';
const FILE_LIST_URL = '/edu/api/files/list';
const FILE_UPLOAD_URL = '/edu/api/files/upload';
const FILE_DELETE_URL = '/edu/api/files/delete';
/** Tái sử dụng API download file có sẵn của module ESS (đọc ESS_FILE theo FILE_NO). */
const FILE_DOWNLOAD_URL = '/ess/empinfo/api/files/download/';

/**
 * Service dùng chung cho các màn đào tạo: danh mục mã, cây phòng ban toàn
 * công ty, tìm nhân viên, file đính kèm và tiện ích ngày DD/MM/YYYY.
 */
@Injectable({ providedIn: 'root' })
export class EduCommonService {
  private readonly http = inject(HttpClient);

  getCodeList(parentCodeNo: string): Promise<SyCodeOption[]> {
    return firstValueFrom(this.http.get<SyCodeOption[]>(CODE_LIST_URL, { params: { parentCodeNo } }));
  }

  /** Nạp danh mục, lỗi thì trả về rỗng (không chặn việc hiển thị trang). */
  async getCodeListSafe(parentCodeNo: string | null | undefined): Promise<SyCodeOption[]> {
    if (!parentCodeNo) return [];
    try {
      return await this.getCodeList(parentCodeNo);
    } catch {
      return [];
    }
  }

  getDeptTree(): Promise<EduDeptNode[]> {
    return firstValueFrom(this.http.get<EduDeptNode[]>(DEPT_TREE_URL));
  }

  findEmployees(query: EduEmployeeQuery): Promise<EduEmployee[]> {
    const params: Record<string, string> = {};
    Object.entries(query).forEach(([k, v]) => {
      if (v) params[k] = v;
    });
    return firstValueFrom(this.http.get<EduEmployee[]>(EMPLOYEES_URL, { params }));
  }

  getFiles(applyType: string, applyNo: string): Promise<EduFile[]> {
    return firstValueFrom(this.http.get<EduFile[]>(FILE_LIST_URL, { params: { applyType, applyNo } }));
  }

  uploadFiles(applyType: string, applyNo: string, files: File[]): Promise<EduSaveResponse> {
    const form = new FormData();
    files.forEach((f) => form.append('files', f, f.name));
    return firstValueFrom(this.http.post<EduSaveResponse>(FILE_UPLOAD_URL, form, { params: { applyType, applyNo } }));
  }

  deleteFile(fileNo: string): Promise<EduSaveResponse> {
    return firstValueFrom(this.http.post<EduSaveResponse>(FILE_DELETE_URL, null, { params: { fileNo } }));
  }

  fileDownloadUrl(fileNo: string): string {
    return FILE_DOWNLOAD_URL + encodeURIComponent(fileNo);
  }

  /** Dựng cây nz-tree từ danh sách phẳng phòng ban (parentDeptNo '0'/rỗng = gốc). */
  buildDeptTree(list: EduDeptNode[], checkable = false): NzTreeNodeOptions[] {
    const map = new Map<string, NzTreeNodeOptions>();
    list.forEach((d) => map.set(d.deptNo, { key: d.deptNo, title: d.deptName || d.deptNo, isLeaf: true, checkable }));
    const roots: NzTreeNodeOptions[] = [];
    list.forEach((d) => {
      const node = map.get(d.deptNo)!;
      const parent = d.parentDeptNo ? map.get(d.parentDeptNo) : undefined;
      if (parent && d.parentDeptNo !== '0') {
        parent.children = [...(parent.children ?? []), node];
        parent.isLeaf = false;
      } else {
        roots.push(node);
      }
    });
    return roots;
  }

  /** Map phòng ban cha -> danh sách phòng ban con trực tiếp. */
  buildDeptChildren(list: EduDeptNode[]): Map<string, string[]> {
    const map = new Map<string, string[]>();
    list.forEach((d) => {
      if (d.parentDeptNo) map.set(d.parentDeptNo, [...(map.get(d.parentDeptNo) ?? []), d.deptNo]);
    });
    return map;
  }

  /**
   * Tích phòng ban cha -> tích luôn toàn bộ phòng ban con; bỏ tích cha -> bỏ luôn con
   * (chkboxType {"Y":"s","N":"s"} của zTree bản gốc). Dùng với nz-tree-select nzCheckStrictly.
   */
  cascadeDeptSelection(prev: string[], next: string[] | null, children: Map<string, string[]>): string[] {
    const before = new Set(prev);
    const result = new Set(next ?? []);
    const walk = (key: string, fn: (k: string) => void) => {
      (children.get(key) ?? []).forEach((child) => {
        fn(child);
        walk(child, fn);
      });
    };
    [...result].filter((k) => !before.has(k)).forEach((k) => walk(k, (c) => result.add(c)));
    [...before].filter((k) => !result.has(k)).forEach((k) => walk(k, (c) => result.delete(c)));
    return [...result];
  }

  /** 'DD/MM/YYYY' -> Date (null nếu rỗng/không hợp lệ). */
  parseDate(value: string | null | undefined): Date | null {
    if (!value) return null;
    const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value.trim());
    if (!m) return null;
    const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
    return isNaN(d.getTime()) ? null : d;
  }

  /** Date -> 'DD/MM/YYYY' (undefined nếu null). */
  formatDate(value: Date | null | undefined): string | undefined {
    return value ? formatDate(value, 'dd/MM/yyyy', 'en-US') : undefined;
  }

  /** Tách chuỗi phân cách dấu phẩy thành mảng (bỏ phần tử rỗng). */
  splitCsv(value: string | null | undefined): string[] {
    return (value ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter((s) => !!s);
  }
}
