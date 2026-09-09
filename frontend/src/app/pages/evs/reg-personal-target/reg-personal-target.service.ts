import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface EvsResumeOption {
  seq?: string;
  resumeName?: string;
}

export interface EvsPersonalTargetInfo {
  seq?: string;
  evsYear?: string;
  resumeSeq?: string;
  localName?: string;
  postGradeName?: string;
  deptname?: string;
  dateStarted?: string;
  activity?: string;
  evsStartDate?: string;
  evsEndDate?: string;
  localName1?: string;
  localName2?: string;
  affirmComment1?: string;
  affirmComment2?: string;
}

export interface EvsItemSst {
  seq?: string;
  resumeSeq?: string;
  evsObjectSeq?: string;
  itemName?: string;
  itemContent?: string;
  itemType?: string;
  itemScore?: string;
  flag?: string;
}

interface ActionResponse {
  success?: boolean;
  message?: string;
}

const BASE_URL = '/evs/manage/api/personalTarget';
const RESUME_LIST_URL = '/evs/manage/api/resume/evsResumeList';
const REG_EVS_LEVEL = '14015066';

/**
 * Đăng ký mục tiêu cá nhân (viewRegPersonalTarget) - port lại từ
 * evs/manage/viewRegPersonalTarget.html (đã xoá).
 *
 * Bản gốc dùng UX inline-edit-trong-bảng với Quill rich-text editor cho ô
 * "Nội dung mục tiêu" và nút "Lưu tạm thời" để lưu HÀNG LOẠT các dòng đang
 * sửa/mới cùng lúc (flag=0). Bản Angular đổi sang modal Thêm/Sửa từng dòng
 * (lưu ngay khi bấm Lưu trong modal, không còn khái niệm "dòng đang sửa dở
 * chưa lưu"), nhất quán với quy ước modal-CRUD của toàn bộ dự án - vì vậy
 * nút "Lưu tạm thời" ở cấp trang không còn cần thiết (mỗi lần Lưu trong
 * modal đã tương đương một lần lưu tạm thời cho đúng 1 dòng). Nút "Thực
 * hiện" (flag=1, gọi stored procedure) được giữ nguyên.
 *
 * Ô nhập "Nội dung mục tiêu" đổi từ Quill WYSIWYG sang textarea văn bản
 * thuần (dự án Angular chưa có rich-text editor nào được tích hợp sẵn -
 * thêm thư viện mới chỉ cho 1 trường ở 1 trang là không tương xứng).
 */
@Injectable({ providedIn: 'root' })
export class RegPersonalTargetService {
  private readonly http = inject(HttpClient);

  getResumeOptions(evsType: string): Promise<EvsResumeOption[]> {
    return firstValueFrom(this.http.get<EvsResumeOption[]>(RESUME_LIST_URL, { params: { evsType, evsLevel: REG_EVS_LEVEL } }));
  }

  getObjectInfo(resumeSeq: string, evsType: string): Promise<EvsPersonalTargetInfo> {
    return firstValueFrom(this.http.get<EvsPersonalTargetInfo>(`${BASE_URL}/objectInfo`, { params: { resumeSeq, evsType } }));
  }

  getItemList(evsObjectSeq: string): Promise<EvsItemSst[]> {
    return firstValueFrom(this.http.get<EvsItemSst[]>(`${BASE_URL}/itemList`, { params: { evsObjectSeq } }));
  }

  saveItem(payload: EvsItemSst): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/saveItem`, payload));
  }

  execute(evsObjectSeq: string): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/saveItem`, { evsObjectSeq, flag: '1' }));
  }

  deleteItem(seq: string): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/deleteItem`, { seq }));
  }
}
