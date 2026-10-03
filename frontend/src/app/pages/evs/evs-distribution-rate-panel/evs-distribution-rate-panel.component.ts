import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { I18nService } from '../../../i18n/i18n.service';
import { EvsDistributionRatePanelService, EvsResumeOption, EvsScore } from './evs-distribution-rate-panel.service';

import { TABLE_PAGE_SIZE_OPTIONS, TABLE_DEFAULT_PAGE_SIZE } from '../../../core/config/table-pagination.config';
/**
 * Tỷ lệ phân bổ (viewEvsDistributionRatePanel) - port lại từ
 * evs/manage/viewEvsDistributionRatePanel.html (đã xoá).
 */
@Component({
  selector: 'app-evs-distribution-rate-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzModalModule,
    NzSelectModule,
    NzSwitchModule,
    NzTableModule,
    NzTagModule,
  ],
  templateUrl: './evs-distribution-rate-panel.component.html',
  styleUrl: './evs-distribution-rate-panel.component.scss',
})
export class EvsDistributionRatePanelComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
  protected readonly defaultPageSize = TABLE_DEFAULT_PAGE_SIZE;

  private readonly service = inject(EvsDistributionRatePanelService);
  private readonly message = inject(NzMessageService);
  private readonly route = inject(ActivatedRoute);
  protected readonly i18n = inject(I18nService);

  private evsType = '';

  protected readonly resumeOptions = signal<EvsResumeOption[]>([]);
  protected readonly searchResumeSeq = signal<string | null>(null);
  protected readonly searchScoreType = signal<string | null>(null);
  protected readonly searchActivity = signal<string | null>(null);
  protected readonly rows = signal<EvsScore[]>([]);
  protected readonly listLoading = signal(false);

  protected readonly detailModalVisible = signal(false);
  protected readonly isEditMode = signal(false);
  protected readonly saving = signal(false);
  protected readonly formSeq = signal('');
  protected readonly formResumeSeq = signal('');
  protected readonly formScoreType = signal<string | null>(null);
  protected readonly formNo = signal('');
  protected readonly formName = signal('');
  protected readonly formDeptNo = signal('');
  protected readonly formDeptName = signal('');
  protected readonly formPostGradeNo = signal('');
  protected readonly formPostGradeName = signal('');
  protected readonly formA = signal(0);
  protected readonly formB = signal(0);
  protected readonly formC = signal(0);
  protected readonly formD = signal(0);
  protected readonly formE = signal(0);
  protected readonly formActivity = signal(true);
  protected readonly formAuditDisplay = signal<string | null>(null);

  protected readonly sum = computed(() => {
    const total = (this.formA() || 0) + (this.formB() || 0) + (this.formC() || 0) + (this.formD() || 0) + (this.formE() || 0);
    return Math.round(total * 100) / 100;
  });
  protected readonly sumOk = computed(() => Math.abs(this.sum() - 100) < 0.001);

  protected readonly deleteModalVisible = signal(false);
  private deleteSeq: string | null = null;
  protected readonly deleteConfirmMsg = signal('');

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    this.evsType = this.route.snapshot.queryParamMap.get('evsType') || '';
    try {
      const list = await this.service.getResumeOptions(this.evsType);
      this.resumeOptions.set(list);
      if (list.length) {
        this.searchResumeSeq.set(list[0].seq ?? null);
        await this.search();
      }
    } catch {
      // im lặng bỏ qua - danh sách tùy chọn trống không chặn chức năng chính
    }
  }

  async search(): Promise<void> {
    if (!this.searchResumeSeq()) {
      this.rows.set([]);
      return;
    }
    this.listLoading.set(true);
    try {
      this.rows.set(
        await this.service.getList(this.searchResumeSeq()!, this.searchScoreType() ?? undefined, this.searchActivity() ?? undefined, this.evsType),
      );
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.listLoading.set(false);
    }
  }

  clearSearch(): void {
    this.searchScoreType.set(null);
    this.searchActivity.set(null);
    this.search();
  }

  isRowSumOk(row: EvsScore): boolean {
    return Math.abs((Number(row.sum) || 0) - 100) < 0.001;
  }

  activityLabel(activity?: string): string {
    return activity === '1'
      ? this.i18n.t('evs.manage.viewEvsDistributionRatePanel.badge.active', 'Sử dụng')
      : this.i18n.t('evs.manage.viewEvsDistributionRatePanel.badge.inactive', 'Không sử dụng');
  }

  private resetForm(): void {
    this.formSeq.set('');
    this.formResumeSeq.set(this.searchResumeSeq() ?? '');
    this.formScoreType.set(null);
    this.formNo.set('');
    this.formName.set('');
    this.formDeptNo.set('');
    this.formDeptName.set('');
    this.formPostGradeNo.set('');
    this.formPostGradeName.set('');
    this.formA.set(0);
    this.formB.set(0);
    this.formC.set(0);
    this.formD.set(0);
    this.formE.set(0);
    this.formActivity.set(true);
    this.formAuditDisplay.set(null);
  }

  openAddModal(): void {
    this.isEditMode.set(false);
    this.resetForm();
    this.detailModalVisible.set(true);
  }

  onScoreTypeChange(value: string | null): void {
    this.formScoreType.set(value);
    if (value === 'CPNY') {
      this.formNo.set('CPNY');
      this.formName.set('CPNY');
    }
  }

  async openEditModal(row: EvsScore): Promise<void> {
    try {
      const r = await this.service.getOne(row.seq!);
      this.isEditMode.set(true);
      this.formSeq.set(r.seq ?? '');
      this.formResumeSeq.set(r.resumeSeq ?? '');
      this.formScoreType.set(r.scoreType ?? null);
      this.formNo.set(r.no ?? '');
      this.formName.set(r.name ?? '');
      this.formDeptNo.set(r.deptNo ?? '');
      this.formDeptName.set(r.deptName ?? '');
      this.formPostGradeNo.set(r.postGradeNo ?? '');
      this.formPostGradeName.set(r.postGradeName ?? '');
      this.formA.set(Number(r.a) || 0);
      this.formB.set(Number(r.b) || 0);
      this.formC.set(Number(r.c) || 0);
      this.formD.set(Number(r.d) || 0);
      this.formE.set(Number(r.e) || 0);
      this.formActivity.set(r.activity === '1');
      this.formAuditDisplay.set(r.updatedBy ? `${r.updatedBy} — ${r.updateDate || ''}` : null);
      this.detailModalVisible.set(true);
    } catch {
      this.message.error(this.i18n.t('evs.manage.viewEvsDistributionRatePanel.msg.loadError', 'Lỗi khi tải thông tin tỷ lệ phân bổ.'));
    }
  }

  async save(): Promise<void> {
    if (!this.formScoreType()) {
      this.message.warning(this.i18n.t('evs.manage.viewEvsDistributionRatePanel.msg.selectType', 'Vui lòng chọn Loại.'));
      return;
    }
    const name = this.formName().trim();
    if (!name) {
      this.message.warning(this.i18n.t('evs.manage.viewEvsDistributionRatePanel.msg.enterName', 'Vui lòng nhập Tên.'));
      return;
    }
    if (!this.sumOk()) {
      this.message.warning(
        `${this.i18n.t('evs.manage.viewEvsDistributionRatePanel.msg.sumError', 'Tổng tỷ lệ phân bổ (EX+VG+GD+NI+UN) phải bằng 100. Giá trị hiện tại:')} ${this.sum()}`,
      );
      return;
    }
    this.saving.set(true);
    try {
      await this.service.save({
        seq: this.formSeq() || undefined,
        resumeSeq: this.formResumeSeq() || this.searchResumeSeq() || undefined,
        scoreType: this.formScoreType() ?? undefined,
        no: this.formNo() || undefined,
        name,
        deptNo: this.formDeptNo() || undefined,
        deptName: this.formDeptName() || undefined,
        postGradeNo: this.formPostGradeNo() || undefined,
        postGradeName: this.formPostGradeName() || undefined,
        a: this.formA(),
        b: this.formB(),
        c: this.formC(),
        d: this.formD(),
        e: this.formE(),
        sum: this.sum(),
        activity: this.formActivity() ? '1' : '0',
      });
      this.detailModalVisible.set(false);
      await this.search();
    } catch {
      this.message.error(this.i18n.t('evs.manage.viewEvsDistributionRatePanel.msg.saveError', 'Lỗi khi lưu dữ liệu. Vui lòng thử lại.'));
    } finally {
      this.saving.set(false);
    }
  }

  openDeleteModal(row: EvsScore): void {
    this.deleteSeq = row.seq ?? null;
    this.deleteConfirmMsg.set(
      this.i18n
        .t('evs.manage.viewEvsDistributionRatePanel.modal.deleteConfirm', 'Bạn có chắc muốn xóa tỷ lệ "{0}"?')
        .replace('{0}', row.name || row.seq || ''),
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
      this.message.error(this.i18n.t('evs.manage.viewEvsDistributionRatePanel.msg.deleteError', 'Lỗi khi xóa dữ liệu. Vui lòng thử lại.'));
    }
  }
}
