import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface ArPersonalListItem {
  itemId?: string;
  itemName?: string;
}

/**
 * Mỗi phần tử = 1 nhân viên (LinkedHashMap từ backend). Keys là tên cột
 * Oracle viết hoa: PERSON_ID, EMPID, LOCAL_NAME, DEPT_NAME, POSITION_NAME,
 * EMP_TYPE_CODE, NORMAL_WORK, LATE_EARLY_GO_TOTAL + tất cả ITEM_ID active
 * (vd ANNUAL_VACATION, PERSONAL_LEAVE, ...). Giữ nguyên dạng Record giống
 * hệt payload backend trả về (không camelCase hoá) để khớp với
 * ArPersonalListMapper.xml.
 */
export type ArPersonalListSummaryRow = Record<string, string | number | undefined>;

export interface ArPersonalListDetailRow {
  pkNo?: string;
  personId?: string;
  empId?: string;
  localName?: string;
  shiftNo?: string;
  shiftName?: string;
  arDateStr?: string;
  itemNo?: string;
  itemName?: string;
  fromTimeStr?: string;
  toTimeStr?: string;
  quantity?: string;
}

export interface ArPersonalListFilter {
  keyword?: string;
  deptNos?: string;
  empTypeCode?: string;
  startDate?: string;
  endDate?: string;
  itemGroup?: string;
}

export interface SyCodeOption {
  codeNo: string;
  codeName?: string;
  nameVi?: string;
}

export interface AuthorizedDeptNode {
  id: string;
  text: string;
  parent: string;
}

/** Nhóm nghỉ phép dùng để lọc AR_ITEM, giống hệt bản Thymeleaf cũ. */
export const AR_PERSONAL_LIST_ITEM_GROUP = '!1433';

const ITEMS_URL = '/ess/viewDept/api/arPersonalList/items';
const SUMMARY_URL = '/ess/viewDept/api/arPersonalList/summary';
const DETAIL_URL = '/ess/viewDept/api/arPersonalList/detail';
const CODE_LIST_URL = '/sys/api/getCode/list';
const AUTHORIZED_DEPTS_URL = '/ar/attendanceSettings/api/arSupervisor/authorized-departments';

/**
 * Gọi lại nguyên vẹn API JSON sẵn có của trang viewArPersonalList (không đổi
 * backend) - port lại từ ess/viewDept/viewArPersonalList.html (Thymeleaf, đã
 * xoá) sang Angular + NG-ZORRO.
 */
@Injectable({ providedIn: 'root' })
export class ArPersonalListService {
  private readonly http = inject(HttpClient);

  getItems(itemGroup: string): Promise<ArPersonalListItem[]> {
    return firstValueFrom(this.http.get<ArPersonalListItem[]>(ITEMS_URL, { params: { itemGroup } }));
  }

  getSummary(filter: ArPersonalListFilter): Promise<ArPersonalListSummaryRow[]> {
    return firstValueFrom(
      this.http.get<ArPersonalListSummaryRow[]>(SUMMARY_URL, { params: this.toHttpParams({ ...filter }) }),
    );
  }

  getDetail(personId: string, itemId: string, startDate?: string, endDate?: string): Promise<ArPersonalListDetailRow[]> {
    return firstValueFrom(
      this.http.get<ArPersonalListDetailRow[]>(
        DETAIL_URL,
        { params: this.toHttpParams({ personId, itemId, startDate, endDate }) },
      ),
    );
  }

  getCodeList(parentCodeNo: string): Promise<SyCodeOption[]> {
    return firstValueFrom(this.http.get<SyCodeOption[]>(CODE_LIST_URL, { params: { parentCodeNo } }));
  }

  getAuthorizedDepartments(): Promise<AuthorizedDeptNode[]> {
    return firstValueFrom(this.http.get<AuthorizedDeptNode[]>(AUTHORIZED_DEPTS_URL));
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
