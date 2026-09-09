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

export interface EvsItem {
  seq?: string;
  resumeSeq?: string;
  groupNo?: string;
  groupName?: string;
  itemCode?: string;
  itemName?: string;
  itemNameKo?: string;
  remark?: string;
  remarkKo?: string;
  updateDate?: string;
  updatedBy?: string;
}

export interface EvsItemParam {
  seq?: string;
  resumeSeq?: string;
  itemCode?: string;
  itemCodeItem?: string;
  itemName?: string;
  itemRemark?: string;
  groupName?: string;
  evsGroup?: string;
  evsGroupName?: string;
  evsOccGroup?: string;
  evsOccGroupName?: string;
  itemScore?: string;
  updateDate?: string;
  updatedBy?: string;
}

const BASE_URL = '/evs/manage/api';

/**
 * Chỉ tiêu đánh giá (viewEvsItemPanel) - port lại từ
 * evs/manage/viewEvsItemPanel.html (đã xoá). 2 tab: Chỉ tiêu đánh giá
 * (EVS_ITEM) và Hạng mục chỉ tiêu chỉ định (EVS_ITEM_PARAM). Đổi UX
 * inline-edit-trong-bảng sang modal Thêm/Sửa, giống evs-param-panel.
 *
 * Ghi chú: 2 nút "tìm nhóm đánh giá"/"tìm nhóm chức vụ" trong thanh tìm
 * kiếm ở bản gốc chỉ hiện `alert('Chức năng ... chưa được triển khai.')` -
 * đây là tính năng CHƯA TỪNG hoạt động ở bản gốc (chưa cắm API thật), giữ
 * nguyên hành vi placeholder này thay vì tự chế thêm tính năng mới.
 */
@Injectable({ providedIn: 'root' })
export class EvsItemPanelService {
  private readonly http = inject(HttpClient);

  getResumeOptions(evsType: string): Promise<EvsResumeOption[]> {
    return firstValueFrom(this.http.get<EvsResumeOption[]>(`${BASE_URL}/resume/evsResumeList`, { params: { evsType } }));
  }

  getCodeList(parentCodeNo: string): Promise<SyCodeOption[]> {
    if (!parentCodeNo) return Promise.resolve([]);
    return firstValueFrom(this.http.get<SyCodeOption[]>('/sys/api/getCode/list', { params: { parentCodeNo } }));
  }

  async getEvsParamOptions(resumeSeq: string, paramType: string): Promise<SyCodeOption[]> {
    if (!resumeSeq) return [];
    const rows = await firstValueFrom(
      this.http.get<{ codeNo: string; codeName?: string }[]>(`${BASE_URL}/evsParam/list`, { params: { resumeSeq, paramType } }),
    );
    return (rows || []).map((r) => ({ codeNo: r.codeNo, codeName: r.codeName }));
  }

  getItemList(resumeSeq: string, groupNo?: string): Promise<EvsItem[]> {
    return firstValueFrom(this.http.get<EvsItem[]>(`${BASE_URL}/evsItem/list`, { params: { resumeSeq, groupNo: groupNo ?? '' } }));
  }
  saveItem(row: EvsItem): Promise<void> {
    return firstValueFrom(this.http.post<void>(`${BASE_URL}/evsItem/save`, [row]));
  }
  deleteItem(seq: string): Promise<void> {
    return firstValueFrom(this.http.post<void>(`${BASE_URL}/evsItem/delete`, { seqs: [seq] }));
  }

  getItemParamList(resumeSeq: string, groupNo?: string, evsGroup?: string, evsOccGroup?: string): Promise<EvsItemParam[]> {
    return firstValueFrom(
      this.http.get<EvsItemParam[]>(`${BASE_URL}/evsItemParam/list`, {
        params: { resumeSeq, groupNo: groupNo ?? '', evsGroup: evsGroup ?? '', evsOccGroup: evsOccGroup ?? '' },
      }),
    );
  }
  saveItemParam(row: EvsItemParam): Promise<void> {
    return firstValueFrom(this.http.post<void>(`${BASE_URL}/evsItemParam/save`, [row]));
  }
  deleteItemParam(seq: string): Promise<void> {
    return firstValueFrom(this.http.post<void>(`${BASE_URL}/evsItemParam/delete`, { seqs: [seq] }));
  }
}
