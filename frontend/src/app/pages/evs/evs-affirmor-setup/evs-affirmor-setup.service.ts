import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface EvsResumeOption {
  seq?: string;
  resumeName?: string;
}

export interface AuthorizedDeptNode {
  id: string;
  text: string;
  parent: string;
}

export interface EvsAffirmorRow {
  seq?: string;
  resumeSeq?: string;
  personId?: string;
  empid?: string;
  localName?: string;
  deptno?: string;
  deptname?: string;
  postGradeNo?: string;
  postGradeName?: string;
  dateStarted?: string;
  listTypeName?: string;
  evsGroupName?: string;
  evsOccGroupName?: string;
  updateDate?: string;
  updatedBy?: string;
  localName1?: string;
  postGradeName1?: string;
  personId1?: string;
  localName2?: string;
  postGradeName2?: string;
  personId2?: string;
}

export interface EmployeeOption {
  personId?: string;
  empid?: string;
  localName?: string;
  deptname?: string;
  postGradeName?: string;
}

interface ActionResponse {
  success?: boolean;
  message?: string;
}

const BASE_URL = '/evs/manage/api/affirmorSetup';
const AUTHORIZED_DEPTS_URL = '/ar/attendanceSettings/api/arSupervisor/authorized-departments';

/**
 * Thiết lập người đánh giá (viewEvsAffirmorSetup) - port lại từ
 * evs/manage/viewEvsAffirmorSetup.html (đã xoá). Bản gốc dùng
 * jQuery EmployeeSearchModal popup dùng chung cho nhiều vị trí (từng dòng
 * trong bảng, áp dụng hàng loạt, modal thêm mới) - bản Angular giữ đúng ý
 * tưởng "1 popup tìm nhân viên dùng chung" nhưng viết lại bằng 1 modal
 * NG-ZORRO tái sử dụng (xem employeePickerTarget trong component), thay vì
 * nz-select tìm kiếm server-side lặp lại trên MỖI dòng bảng (tốn kém hơn
 * khi bảng có nhiều dòng).
 */
@Injectable({ providedIn: 'root' })
export class EvsAffirmorSetupService {
  private readonly http = inject(HttpClient);

  getResumeOptions(evsType: string): Promise<EvsResumeOption[]> {
    return firstValueFrom(this.http.get<EvsResumeOption[]>('/evs/manage/api/resume/evsResumeList', { params: { evsType } }));
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

  getList(resumeSeq: string, deptNos: string, affirmorKeyword: string, evsType: string): Promise<EvsAffirmorRow[]> {
    return firstValueFrom(this.http.get<EvsAffirmorRow[]>(`${BASE_URL}/list`, { params: { resumeSeq, deptNos, affirmorKeyword, evsType } }));
  }

  searchEmployee(keyword: string, resumeSeq: string): Promise<EmployeeOption[]> {
    return firstValueFrom(this.http.get<EmployeeOption[]>(`${BASE_URL}/searchEmployee`, { params: { keyword, resumeSeq } }));
  }

  saveAll(
    list: { seq: string; personId1?: string | null; personId2?: string | null; personId3?: string | null; personId4?: string | null }[],
  ): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/save`, list));
  }

  addObject(payload: {
    resumeSeq: string;
    personId: string;
    personId1?: string | null;
    personId2?: string | null;
    personId3?: string | null;
    personId4?: string | null;
  }): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/addObject`, payload));
  }

  createTarget(resumeSeq: string): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/createTarget`, { resumeSeq }));
  }

  evsStart(resumeSeq: string): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/evsStart`, { resumeSeq }));
  }

  deleteObjects(seqList: string[]): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/delete`, seqList));
  }

  importExcel(file: File, resumeSeq: string): Promise<ActionResponse & { errors?: string[] }> {
    const formData = new FormData();
    formData.append('file', file);
    return firstValueFrom(this.http.post<ActionResponse & { errors?: string[] }>(`${BASE_URL}/importExcel`, formData, { params: { resumeSeq } }));
  }
}
