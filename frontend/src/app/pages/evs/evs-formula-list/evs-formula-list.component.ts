import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { I18nService } from '../../../i18n/i18n.service';
import { EvsFormula, EvsFormulaListService } from './evs-formula-list.service';

/**
 * Công thức đánh giá (viewEvsFormulaList) - port lại từ
 * evs/manage/viewEvsFormulaList.html (đã xoá).
 */
@Component({
  selector: 'app-evs-formula-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzModalModule,
    NzSelectModule,
    NzSwitchModule,
    NzTableModule,
    NzTagModule,
  ],
  templateUrl: './evs-formula-list.component.html',
  styleUrl: './evs-formula-list.component.scss',
})
export class EvsFormulaListComponent implements OnInit {
  private readonly service = inject(EvsFormulaListService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly searchCodeNo = signal('');
  protected readonly searchCodeName = signal('');
  protected readonly searchActivity = signal<string | null>(null);
  protected readonly rows = signal<EvsFormula[]>([]);
  protected readonly listLoading = signal(false);

  protected readonly detailModalVisible = signal(false);
  protected readonly isEditMode = signal(false);
  protected readonly saving = signal(false);
  protected readonly formSeq = signal('');
  protected readonly formCodeNo = signal('');
  protected readonly formCodeName = signal('');
  protected readonly formFormula = signal('');
  protected readonly formRemark = signal('');
  protected readonly formOrderNo = signal<number | null>(null);
  protected readonly formActivity = signal(true);
  protected readonly formAuditDisplay = signal<string | null>(null);

  protected readonly deleteModalVisible = signal(false);
  private deleteSeq: string | null = null;
  protected readonly deleteConfirmMsg = signal('');

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.search();
  }

  async search(): Promise<void> {
    this.listLoading.set(true);
    try {
      this.rows.set(await this.service.getList(this.searchCodeNo().trim(), this.searchCodeName().trim(), this.searchActivity() ?? undefined));
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.listLoading.set(false);
    }
  }

  clearSearch(): void {
    this.searchCodeNo.set('');
    this.searchCodeName.set('');
    this.searchActivity.set(null);
    this.search();
  }

  truncate(value: string | undefined, max: number): string {
    if (!value) return '';
    return value.length > max ? value.substring(0, max) + '…' : value;
  }

  openAddModal(): void {
    this.isEditMode.set(false);
    this.formSeq.set('');
    this.formCodeNo.set('');
    this.formCodeName.set('');
    this.formFormula.set('');
    this.formRemark.set('');
    this.formOrderNo.set(null);
    this.formActivity.set(true);
    this.formAuditDisplay.set(null);
    this.detailModalVisible.set(true);
  }

  async openEditModal(row: EvsFormula): Promise<void> {
    try {
      const r = await this.service.getOne(row.seq!);
      this.isEditMode.set(true);
      this.formSeq.set(r.seq ?? '');
      this.formCodeNo.set(r.codeNo ?? '');
      this.formCodeName.set(r.codeName ?? '');
      this.formFormula.set(r.formula ?? '');
      this.formRemark.set(r.remark ?? '');
      this.formOrderNo.set(r.orderNo != null ? Number(r.orderNo) : null);
      this.formActivity.set(r.activity === '1');
      this.formAuditDisplay.set(r.updatedBy ? `${r.updatedBy} — ${r.updateDate || ''}` : null);
      this.detailModalVisible.set(true);
    } catch {
      this.message.error(this.i18n.t('evs.manage.viewEvsFormulaList.msg.loadError', 'Lỗi khi tải thông tin công thức.'));
    }
  }

  async save(): Promise<void> {
    const codeNo = this.formCodeNo().trim();
    if (!codeNo) {
      this.message.warning(this.i18n.t('evs.manage.viewEvsFormulaList.msg.enterCode', 'Vui lòng nhập Mã.'));
      return;
    }
    const codeName = this.formCodeName().trim();
    if (!codeName) {
      this.message.warning(this.i18n.t('evs.manage.viewEvsFormulaList.msg.enterName', 'Vui lòng nhập Tên.'));
      return;
    }
    this.saving.set(true);
    try {
      await this.service.save({
        seq: this.formSeq() || undefined,
        codeNo,
        codeName,
        formula: this.formFormula() || undefined,
        remark: this.formRemark() || undefined,
        orderNo: this.formOrderNo() != null ? String(this.formOrderNo()) : undefined,
        activity: this.formActivity() ? '1' : '0',
      });
      this.detailModalVisible.set(false);
      await this.search();
    } catch {
      this.message.error(this.i18n.t('evs.manage.viewEvsFormulaList.msg.saveError', 'Lỗi khi lưu dữ liệu. Vui lòng thử lại.'));
    } finally {
      this.saving.set(false);
    }
  }

  openDeleteModal(row: EvsFormula): void {
    this.deleteSeq = row.seq ?? null;
    this.deleteConfirmMsg.set(
      this.i18n
        .t('evs.manage.viewEvsFormulaList.modal.deleteConfirm', 'Bạn có chắc muốn xóa công thức "{0}"?')
        .replace('{0}', row.codeName || row.seq || ''),
    );
    this.deleteModalVisible.set(true);
  }

  async confirmDelete(): Promise<void> {
    if (!this.deleteSeq) return;
    try {
      await this.service.delete(this.deleteSeq);
      this.deleteModalVisible.set(false);
      this.deleteSeq = null;
      await this.search();
    } catch {
      this.message.error(this.i18n.t('evs.manage.viewEvsFormulaList.msg.deleteError', 'Lỗi khi xóa dữ liệu. Vui lòng thử lại.'));
    }
  }
}
