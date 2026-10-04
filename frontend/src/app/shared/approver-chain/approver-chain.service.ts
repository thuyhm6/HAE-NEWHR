import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

/** Một dòng người duyệt trong bảng (tương ứng 1 <tr> của addApply*Affirm_list ở JSP cũ) */
export interface ApproverChainItem {
  key: string;
  personId: string;
  empId: string;
  localName: string;
  deptName: string;
  positionName: string;
  /** AFFIRM_TYPE: '1' = Phê duyệt, '3' = Thông báo */
  approvType: string;
  /** true = lấy từ dây chuyền duyệt mặc định (hiển thị dạng text như bản cũ) */
  fromDefault: boolean;
}

/** Dữ liệu người duyệt gửi lên khi lưu đơn */
export interface ApproverSaveItem {
  personId: string;
  empId: string;
  localName: string;
  approvType: string;
}

export interface ApproverEmployee {
  personId?: string;
  empId?: string;
  localName?: string;
  deptName?: string;
  positionName?: string;
}

interface DefaultAffirmor {
  affirmorId?: string;
  affirmPersonId?: string;
  affirmLevel?: string | number;
  empId?: string;
  localName?: string;
  deptName?: string;
  positionName?: string;
}

export const APPROV_TYPE_APPROVAL = '1';
export const APPROV_TYPE_NOTICE = '3';

const DEFAULT_APPROVERS_URL = '/ar/attendanceMintenance/api/leaveApply/approvers';
const EMPLOYEE_SEARCH_URL = '/hrm/empinfo/api/employee/search';

let keySeq = 0;
export function newApproverKey(): string {
  keySeq += 1;
  return `apc-${Date.now()}-${keySeq}`;
}

/**
 * API cho bảng người duyệt dùng chung: dây chuyền duyệt mặc định
 * (viewAffirmorList ở bản cũ - GET_AFFIRMOR_LIST_IMPROVE) và tìm nhân viên
 * khi nhập mã + Enter (getPersonCntByEmpid / viewAddAffirmList ở bản cũ).
 */
@Injectable({ providedIn: 'root' })
export class ApproverChainService {
  private readonly http = inject(HttpClient);

  async getDefaultApprovers(
    applyTypeNo: string,
    personId: string,
    applyTypeCode: string,
    applyLength: string,
  ): Promise<ApproverChainItem[]> {
    const list = await firstValueFrom(
      this.http.post<DefaultAffirmor[]>(DEFAULT_APPROVERS_URL, null, {
        params: { applyTypeNo, personId, applyTypeCode: applyTypeCode ?? '', applyLength: applyLength || '0' },
      }),
    );
    return (list ?? [])
      .filter((a) => a && String(a.affirmLevel ?? '') !== '0')
      .map((a) => ({
        key: newApproverKey(),
        personId: a.affirmorId || a.affirmPersonId || '',
        empId: a.empId ?? '',
        localName: a.localName ?? '',
        deptName: a.deptName ?? '',
        positionName: a.positionName ?? '',
        approvType: APPROV_TYPE_APPROVAL,
        fromDefault: true,
      }));
  }

  searchEmployees(keyword: string): Promise<ApproverEmployee[]> {
    return firstValueFrom(this.http.get<ApproverEmployee[]>(EMPLOYEE_SEARCH_URL, { params: { keyword } }));
  }

  /** Trả về message key lỗi (giống JSP cũ) hoặc null nếu hợp lệ */
  static validate(list: ApproverChainItem[]): { key: string; fallback: string } | null {
    if (!list.length) {
      return { key: 'alert.message.pleaseFirstSetRuler.b', fallback: 'Xin thiết lập người duyệt' };
    }
    if (list.some((a) => !a.personId)) {
      return { key: 'alert.message.Please_Affirmor_Complete.b', fallback: 'Xin bổ sung đầy đủ thông tin người duyệt!' };
    }
    return null;
  }

  static toSaveItems(list: ApproverChainItem[]): ApproverSaveItem[] {
    return list.map((a) => ({ personId: a.personId, empId: a.empId, localName: a.localName, approvType: a.approvType }));
  }
}
