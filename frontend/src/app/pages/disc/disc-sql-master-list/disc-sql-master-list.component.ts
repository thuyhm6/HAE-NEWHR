import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import {
  DISC_SQL_MASTER_PGM_OPTIONS,
  DiscSqlMasterRow,
  DiscSqlMasterService,
  DiscSqlParamRow,
} from '../disc-sql-master.service';

import { TABLE_PAGE_SIZE_OPTIONS } from '../../../core/config/table-pagination.config';
/**
 * Quản lý truy vấn SQL tự động xuất Excel (viewRetrieveSqlMasterList).
 * "Thêm mới" hoặc bấm vào Tên truy vấn -> mở modal Thêm/Sửa (nhập câu lệnh
 * SQL + danh sách tham số), giống mẫu sy-menu-list (không điều hướng sang
 * trang khác). Chọn 1 dòng (radio) + bấm "Xuất Excel" -> mở modal nhập giá
 * trị tham số rồi tải file .xlsx (server thực thi trực tiếp SQL_STMT đã lưu).
 */
@Component({
  selector: 'app-disc-sql-master-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzSelectModule,
    NzSwitchModule,
    NzTableModule,
  ],
  templateUrl: './disc-sql-master-list.component.html',
  styleUrl: './disc-sql-master-list.component.scss',
})
export class DiscSqlMasterListComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;

  private readonly service = inject(DiscSqlMasterService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly pgmOptions = DISC_SQL_MASTER_PGM_OPTIONS;

  protected readonly searchKeyword = signal('');
  protected readonly searchPgmNm = signal<string | null>(null);
  protected readonly rows = signal<DiscSqlMasterRow[]>([]);
  protected readonly loading = signal(false);
  protected readonly selectedSqlSeq = signal<string | null>(null);

  // ── Modal Thêm/Sửa truy vấn SQL ──
  protected readonly formVisible = signal(false);
  protected readonly formSaving = signal(false);
  protected readonly formIsAdd = signal(true);
  protected readonly formSqlSeq = signal('');
  protected readonly formPgmNm = signal('');
  protected readonly formSqlNm = signal('');
  protected readonly formSqlDesc = signal('');
  protected readonly formSqlStmt = signal('');
  protected readonly formSqlFromStmt = signal('');
  protected readonly formSqlOrderById = signal('');
  protected readonly formSqlStat = signal('');
  protected readonly formIsSpecial = signal('');
  protected readonly formUseYn = signal(true);
  protected readonly formParams = signal<DiscSqlParamRow[]>([]);

  // ── Modal nhập tham số trước khi xuất Excel ──
  protected readonly exportVisible = signal(false);
  protected readonly exportSaving = signal(false);
  protected readonly exportParams = signal<DiscSqlParamRow[]>([]);
  protected readonly exportValues: Record<string, string> = {};
  private exportSqlSeq = '';

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.search();
  }

  async search(): Promise<void> {
    this.loading.set(true);
    try {
      this.rows.set(await this.service.getList(this.searchKeyword(), this.searchPgmNm()));
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }

  clearSearch(): void {
    this.searchKeyword.set('');
    this.searchPgmNm.set(null);
    this.search();
  }

  openAddModal(): void {
    this.formIsAdd.set(true);
    this.formSqlSeq.set('');
    this.formPgmNm.set('');
    this.formSqlNm.set('');
    this.formSqlDesc.set('');
    this.formSqlStmt.set('');
    this.formSqlFromStmt.set('');
    this.formSqlOrderById.set('');
    this.formSqlStat.set('');
    this.formIsSpecial.set('');
    this.formUseYn.set(true);
    this.formParams.set([]);
    this.formVisible.set(true);
  }

  async openEditModal(row: DiscSqlMasterRow): Promise<void> {
    if (!row.sqlSeq) return;
    this.loading.set(true);
    try {
      const detail = await this.service.getDetail(row.sqlSeq);
      if (!detail) {
        this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
        return;
      }
      this.formIsAdd.set(false);
      this.formSqlSeq.set(detail.sqlSeq ?? '');
      this.formPgmNm.set(detail.pgmNm ?? '');
      this.formSqlNm.set(detail.sqlNm ?? '');
      this.formSqlDesc.set(detail.sqlDesc ?? '');
      this.formSqlStmt.set(detail.sqlStmt ?? '');
      this.formSqlFromStmt.set(detail.sqlFromStmt ?? '');
      this.formSqlOrderById.set(detail.sqlOrderById ?? '');
      this.formSqlStat.set(detail.sqlStat ?? '');
      this.formIsSpecial.set(detail.isSpecial ?? '');
      this.formUseYn.set(detail.useYn !== 'N');
      this.formParams.set(detail.params ?? []);
      this.formVisible.set(true);
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }

  addFormParamRow(): void {
    this.formParams.update((rows) => [...rows, { param: '', sqlParamTp: 'VARCHAR2', useYn: 'Y' } as DiscSqlParamRow]);
  }

  removeFormParamRow(index: number): void {
    this.formParams.update((rows) => rows.filter((_, i) => i !== index));
  }

  async saveForm(): Promise<void> {
    if (!this.formSqlNm().trim()) {
      this.message.warning(this.i18n.t('disc.sqlMaster.detail.msg.validateSqlNmRequired', 'Vui lòng nhập Tên truy vấn!'));
      return;
    }
    if (!this.formSqlStmt().trim()) {
      this.message.warning(
        this.i18n.t('disc.sqlMaster.detail.msg.validateSqlStmtRequired', 'Vui lòng nhập câu lệnh SQL!'),
      );
      return;
    }
    this.formSaving.set(true);
    try {
      const res = await this.service.save({
        sqlSeq: this.formSqlSeq() || undefined,
        pgmNm: this.formPgmNm(),
        sqlNm: this.formSqlNm().trim(),
        sqlDesc: this.formSqlDesc(),
        sqlStmt: this.formSqlStmt().trim(),
        sqlFromStmt: this.formSqlFromStmt(),
        sqlOrderById: this.formSqlOrderById(),
        sqlStat: this.formSqlStat(),
        isSpecial: this.formIsSpecial(),
        useYn: this.formUseYn() ? 'Y' : 'N',
        params: this.formParams(),
      });
      if (res.success !== false) {
        this.message.success(res.message || this.i18n.t('common.saveSuccess', 'Lưu thành công'));
        this.formVisible.set(false);
        await this.search();
      } else {
        this.message.error(res.message || this.i18n.t('common.error', 'Lỗi'));
      }
    } catch {
      this.message.error(this.i18n.t('common.error', 'Lỗi'));
    } finally {
      this.formSaving.set(false);
    }
  }

  deleteRow(row: DiscSqlMasterRow): void {
    if (!row.sqlSeq) return;
    const sqlSeq = row.sqlSeq;
    this.modal.confirm({
      nzTitle: this.i18n.t('disc.sqlMaster.list.msg.confirmDelete', 'Bạn có chắc muốn xóa truy vấn này?'),
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          const res = await this.service.delete(sqlSeq);
          if (res.success !== false) {
            this.message.success(res.message || this.i18n.t('common.deleteSuccess', 'Xóa thành công'));
            if (this.selectedSqlSeq() === sqlSeq) {
              this.selectedSqlSeq.set(null);
            }
            await this.search();
          } else {
            this.message.error(res.message || this.i18n.t('common.error', 'Lỗi'));
          }
        } catch {
          this.message.error(this.i18n.t('common.error', 'Lỗi'));
        }
      },
    });
  }

  async openExportModal(): Promise<void> {
    const sqlSeq = this.selectedSqlSeq();
    if (!sqlSeq) {
      this.message.warning(
        this.i18n.t('disc.sqlMaster.list.msg.selectRowForExport', 'Vui lòng chọn một truy vấn để xuất Excel'),
      );
      return;
    }
    try {
      const detail = await this.service.getDetail(sqlSeq);
      this.exportSqlSeq = sqlSeq;
      const activeParams = (detail?.params || []).filter((p) => p.useYn !== 'N');
      this.exportParams.set(activeParams);
      Object.keys(this.exportValues).forEach((k) => delete this.exportValues[k]);
      activeParams.forEach((p) => (this.exportValues[p.param] = p.defaultVal ?? ''));
      this.exportVisible.set(true);
    } catch {
      this.message.error(this.i18n.t('common.error', 'Lỗi'));
    }
  }

  confirmExport(): void {
    const url = this.service.buildExportUrl(this.exportSqlSeq, this.exportValues);
    window.location.href = url;
    this.exportVisible.set(false);
  }
}
