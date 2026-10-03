import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { I18nService } from '../../../i18n/i18n.service';
import { EvsResume, ResumeListService, SyCodeOption } from './resume-list.service';

import { TABLE_PAGE_SIZE_OPTIONS, TABLE_DEFAULT_PAGE_SIZE } from '../../../core/config/table-pagination.config';
const CYCLE_PARENT = '14015038';
const EVS_LEVEL_PARENT = '14015060';

function toDateOrNull(value: string | undefined): Date | null {
  if (!value) return null;
  const [d, m, y] = value.includes('/') ? value.split('/') : [];
  if (d && m && y) return new Date(Number(y), Number(m) - 1, Number(d));
  const dd = new Date(value);
  return isNaN(dd.getTime()) ? null : dd;
}

function toDdMmYyyy(value: Date | null): string {
  if (!value) return '';
  const d = String(value.getDate()).padStart(2, '0');
  const m = String(value.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}/${value.getFullYear()}`;
}

const ACTIVITY_COLOR: Record<string, string> = { '1': 'blue', '2': 'gold', '3': 'geekblue', '4': 'green' };

/**
 * Danh sách đánh giá (viewResumeList) - port lại từ
 * evs/manage/viewResumeList.html (đã xoá). Xem ghi chú resumeSeq "master"
 * và evsType query param trong resume-list.service.ts.
 */
@Component({
  selector: 'app-resume-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzDatePickerModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzModalModule,
    NzSelectModule,
    NzTableModule,
    NzTagModule,
  ],
  templateUrl: './resume-list.component.html',
  styleUrl: './resume-list.component.scss',
})
export class ResumeListComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
  protected readonly defaultPageSize = TABLE_DEFAULT_PAGE_SIZE;

  private readonly service = inject(ResumeListService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  private readonly route = inject(ActivatedRoute);
  protected readonly i18n = inject(I18nService);

  private evsType = '';

  protected readonly searchYear = signal<number | null>(null);
  protected readonly searchCycle = signal<string | null>(null);
  protected readonly rows = signal<EvsResume[]>([]);
  protected readonly listLoading = signal(false);

  protected readonly cycleOptions = signal<SyCodeOption[]>([]);
  protected readonly monthOptions = signal<SyCodeOption[]>([]);
  protected readonly evsLevelOptions = signal<SyCodeOption[]>([]);
  protected readonly copyOptions = signal<EvsResume[]>([]);

  protected readonly detailModalVisible = signal(false);
  protected readonly isEditMode = signal(false);
  protected readonly saving = signal(false);
  protected readonly formSeq = signal('');
  protected readonly formResumeName = signal('');
  protected readonly formRemark = signal('');
  protected readonly formEvsCycle = signal<string | null>(null);
  protected readonly formEvsYear = signal<number | null>(null);
  protected readonly formEvsMonth = signal<string | null>(null);
  protected readonly formStandardDate = signal<Date | null>(null);
  protected readonly formEvsStartDate = signal<Date | null>(null);
  protected readonly formEvsEndDate = signal<Date | null>(null);
  protected readonly formEvsLevel = signal<string | null>(null);
  protected readonly formCopyObject = signal<string | null>(null);
  protected readonly formActivityName = signal<string | null>(null);

  protected readonly deleteModalVisible = signal(false);
  private deleteSeq: string | null = null;
  protected readonly deleteConfirmMsg = signal('');

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    this.evsType = this.route.snapshot.queryParamMap.get('evsType') || '';
    try {
      const [cycleList, levelList] = await Promise.all([
        this.service.getCodeList(CYCLE_PARENT),
        this.service.getCodeList(EVS_LEVEL_PARENT),
      ]);
      this.cycleOptions.set(cycleList);
      this.evsLevelOptions.set(levelList);
    } catch {
      // im lặng bỏ qua - danh sách tùy chọn trống không chặn chức năng chính
    }
    await this.search();
  }

  async search(): Promise<void> {
    this.listLoading.set(true);
    try {
      this.rows.set(await this.service.getList(this.evsType, this.searchYear()?.toString(), this.searchCycle() ?? undefined));
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.listLoading.set(false);
    }
  }

  clearSearch(): void {
    this.searchYear.set(null);
    this.searchCycle.set(null);
    this.search();
  }

  activityColor(activity?: string): string {
    return (activity && ACTIVITY_COLOR[activity]) || 'default';
  }

  private async loadMonthOptions(cycleValue: string | null): Promise<void> {
    this.monthOptions.set(cycleValue ? await this.service.getCodeList(cycleValue) : []);
  }

  async onCycleChange(value: string | null): Promise<void> {
    this.formEvsCycle.set(value);
    this.formEvsMonth.set(null);
    await this.loadMonthOptions(value);
  }

  private async loadCopyOptions(): Promise<void> {
    try {
      this.copyOptions.set(await this.service.getCopyOptions(this.evsType));
    } catch {
      this.copyOptions.set([]);
    }
  }

  async openAddModal(): Promise<void> {
    this.isEditMode.set(false);
    this.formSeq.set('');
    this.formResumeName.set('');
    this.formRemark.set('');
    this.formEvsCycle.set(null);
    this.formEvsYear.set(null);
    this.monthOptions.set([]);
    this.formEvsMonth.set(null);
    this.formStandardDate.set(null);
    this.formEvsStartDate.set(null);
    this.formEvsEndDate.set(null);
    this.formEvsLevel.set(null);
    this.formCopyObject.set(null);
    this.formActivityName.set(null);
    await this.loadCopyOptions();
    this.detailModalVisible.set(true);
  }

  async openEditModal(row: EvsResume): Promise<void> {
    try {
      const r = await this.service.getOne(row.seq!, this.evsType);
      this.isEditMode.set(true);
      this.formSeq.set(r.seq ?? '');
      this.formResumeName.set(r.resumeName ?? '');
      this.formRemark.set(r.remark ?? '');
      this.formEvsCycle.set(r.evsCycle ?? null);
      await this.loadMonthOptions(r.evsCycle ?? null);
      this.formEvsMonth.set(r.evsMonth ?? null);
      this.formEvsYear.set(r.evsYear ? Number(r.evsYear) : null);
      this.formStandardDate.set(toDateOrNull(r.standardDate));
      this.formEvsStartDate.set(toDateOrNull(r.evsStartDate));
      this.formEvsEndDate.set(toDateOrNull(r.evsEndDate));
      this.formEvsLevel.set(r.evsLevel ?? null);
      this.formCopyObject.set(r.copyObject ?? null);
      this.formActivityName.set(r.activityName ?? null);
      await this.loadCopyOptions();
      this.detailModalVisible.set(true);
    } catch {
      this.message.error(this.i18n.t('evs.manage.viewResumeList.msg.loadError', 'Lỗi khi tải thông tin đánh giá.'));
    }
  }

  async save(): Promise<void> {
    const resumeName = this.formResumeName().trim();
    if (!resumeName) {
      this.message.warning(this.i18n.t('evs.manage.viewResumeList.msg.requiredResumeName', 'Vui lòng nhập Tên đánh giá.'));
      return;
    }
    if (!this.formStandardDate()) {
      this.message.warning(this.i18n.t('evs.manage.viewResumeList.msg.requiredStandardDate', 'Vui lòng nhập Ngày tiêu chuẩn.'));
      return;
    }
    this.saving.set(true);
    try {
      await this.service.save({
        seq: this.formSeq() || undefined,
        resumeName,
        remark: this.formRemark().trim() || undefined,
        evsCycle: this.formEvsCycle() ?? undefined,
        evsYear: this.formEvsYear() != null ? String(this.formEvsYear()) : undefined,
        evsMonth: this.formEvsMonth() ?? undefined,
        standardDate: toDdMmYyyy(this.formStandardDate()),
        evsStartDate: toDdMmYyyy(this.formEvsStartDate()) || undefined,
        evsEndDate: toDdMmYyyy(this.formEvsEndDate()) || undefined,
        evsLevel: this.formEvsLevel() ?? undefined,
        copyObject: this.formCopyObject() ?? undefined,
        evsType: this.evsType,
      });
      this.detailModalVisible.set(false);
      await this.search();
    } catch {
      this.message.error(this.i18n.t('evs.manage.viewResumeList.msg.saveError', 'Lỗi khi lưu dữ liệu. Vui lòng thử lại.'));
    } finally {
      this.saving.set(false);
    }
  }

  openDeleteModal(row: EvsResume): void {
    this.deleteSeq = row.seq ?? null;
    this.deleteConfirmMsg.set(
      this.i18n
        .t('evs.manage.viewResumeList.modal.deleteConfirm', 'Bạn có chắc muốn xóa đánh giá "{0}"?')
        .replace('{0}', row.resumeName || row.seq || ''),
    );
    this.deleteModalVisible.set(true);
  }

  async confirmDelete(): Promise<void> {
    if (!this.deleteSeq) return;
    try {
      await this.service.delete(this.deleteSeq, this.evsType);
      this.deleteModalVisible.set(false);
      this.deleteSeq = null;
      await this.search();
    } catch {
      this.message.error(this.i18n.t('evs.manage.viewResumeList.msg.deleteError', 'Lỗi khi xóa dữ liệu. Vui lòng thử lại.'));
    }
  }
}
