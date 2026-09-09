import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

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

const CODE_LIST_URL = '/sys/api/getCode/list';
const AUTHORIZED_DEPTS_URL = '/ar/attendanceSettings/api/arSupervisor/authorized-departments';

/**
 * Dùng chung cho cả 3 trang module recruitManage (viewRecruitList,
 * viewExperienceBatchList, viewRecruitBatchList) - cả 3 đều tra cứu rất
 * nhiều nhóm mã code (loại nhân viên, nhóm nhân viên, chức vụ...) và cây
 * phòng ban qua cùng 2 endpoint có sẵn ở dự án.
 */
@Injectable({ providedIn: 'root' })
export class RecruitCodeService {
  private readonly http = inject(HttpClient);

  getCodeList(parentCodeNo: string): Promise<SyCodeOption[]> {
    if (!parentCodeNo) return Promise.resolve([]);
    return firstValueFrom(this.http.get<SyCodeOption[]>(CODE_LIST_URL, { params: { parentCodeNo } }));
  }

  getAuthorizedDepartments(): Promise<AuthorizedDeptNode[]> {
    return firstValueFrom(this.http.get<AuthorizedDeptNode[]>(AUTHORIZED_DEPTS_URL));
  }

  buildDeptTree(flatList: AuthorizedDeptNode[]): { key: string; title: string; isLeaf?: boolean; children?: any[] }[] {
    const nodeMap = new Map<string, any>();
    const childKeys = new Map<string, string[]>();
    flatList.forEach((item) => nodeMap.set(item.id, { key: item.id, title: item.text, isLeaf: true }));
    const roots: any[] = [];
    flatList.forEach((item) => {
      if (item.parent && item.parent !== '0' && nodeMap.has(item.parent)) {
        const siblings = childKeys.get(item.parent) ?? [];
        siblings.push(item.id);
        childKeys.set(item.parent, siblings);
      } else {
        const node = nodeMap.get(item.id);
        if (node) roots.push(node);
      }
    });
    nodeMap.forEach((node, id) => {
      const children = childKeys.get(id);
      if (children && children.length) {
        node.isLeaf = false;
        node.children = children.map((cid) => nodeMap.get(cid)).filter(Boolean);
      }
    });
    return roots;
  }
}
