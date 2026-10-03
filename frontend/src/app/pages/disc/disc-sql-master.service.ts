import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface DiscSqlParamRow {
  sqlSeq?: string;
  sqlParamNo?: string;
  param: string;
  enSqlParamDesc?: string;
  cnSqlParamDesc?: string;
  sqlParamTp?: string;
  sqlParamTpDesc?: string;
  defaultVal?: string;
  sortCd?: string;
  useYn?: string;
}

export interface DiscSqlMasterRow {
  sqlSeq?: string;
  pgmNm?: string;
  sqlNm?: string;
  sqlFromStmt?: string;
  sqlOrderById?: string;
  sqlDesc?: string;
  sqlStat?: string;
  useYn?: string;
  isSpecial?: string;
  rgstDtime?: string;
  updtDtime?: string;
  updtUser?: string;
}

export interface DiscSqlMasterDetail extends DiscSqlMasterRow {
  sqlStmt?: string;
  params: DiscSqlParamRow[];
}

interface ActionResponse {
  success?: boolean;
  message?: string;
  sqlSeq?: string;
}

const BASE_URL = '/disc/api/sqlMaster';

/** Danh sách giá trị cố định của trường PGM_NM (Tên chương trình), dùng chung cho ô tìm kiếm và modal Thêm/Sửa. */
export const DISC_SQL_MASTER_PGM_OPTIONS: { value: string; label: string }[] = [
  { value: 'PAGEOUT', label: 'PAGEOUT - Nhân sự' },
  { value: 'ATT', label: 'ATT - Chấm công' },
  { value: 'EMP', label: 'EMP - Nhân viên' },
  { value: 'PAY', label: 'PAY - Lương' },
];

/**
 * Service cho màn hình Quản lý truy vấn SQL tự động xuất Excel (disc-sql-master-list).
 */
@Injectable({ providedIn: 'root' })
export class DiscSqlMasterService {
  private readonly http = inject(HttpClient);

  getList(keyword: string, pgmNm?: string | null): Promise<DiscSqlMasterRow[]> {
    return firstValueFrom(
      this.http.get<DiscSqlMasterRow[]>(`${BASE_URL}/list`, { params: { keyword, pgmNm: pgmNm ?? '' } }),
    );
  }

  getDetail(sqlSeq: string): Promise<DiscSqlMasterDetail> {
    return firstValueFrom(this.http.get<DiscSqlMasterDetail>(`${BASE_URL}/detail`, { params: { sqlSeq } }));
  }

  save(dto: DiscSqlMasterDetail): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/save`, dto));
  }

  delete(sqlSeq: string): Promise<ActionResponse> {
    return firstValueFrom(this.http.post<ActionResponse>(`${BASE_URL}/delete`, null, { params: { sqlSeq } }));
  }

  /** Câu lệnh SQL được thực thi trực tiếp khi tải file, nên dùng điều hướng trình duyệt thay vì HttpClient blob. */
  buildExportUrl(sqlSeq: string, paramValues: Record<string, string>): string {
    const params = new URLSearchParams();
    params.set('sqlSeq', sqlSeq);
    params.set('paramsJson', JSON.stringify(paramValues ?? {}));
    return `${BASE_URL}/export?${params.toString()}`;
  }
}
