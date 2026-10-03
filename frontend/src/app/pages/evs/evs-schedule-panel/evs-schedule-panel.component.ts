import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

import { I18nService } from '../../../i18n/i18n.service';
import {
  EvsResumeOption,
  EvsSchedulePanelService,
  EvsScheduleRow,
  ScheduleType,
  SyCodeOption,
} from './evs-schedule-panel.service';

import { TABLE_PAGE_SIZE_OPTIONS, TABLE_DEFAULT_PAGE_SIZE } from '../../../core/config/table-pagination.config';
const TYPES: ScheduleType[] = ['CPNY', 'DEPT', 'EMP'];

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

/**
 * Lịch đánh giá (viewEvsSchedulePanel) - port lại từ
 * evs/manage/viewEvsSchedulePanel.html (đã xoá). 3 tab CPNY/DEPT/EMP.
 * Bản gốc dùng inline-edit-trong-bảng + nút "Lưu" hàng loạt. Bản Angular đổi
 * sang modal Thêm/Sửa lưu ngay từng dòng (nhất quán quy ước modal-CRUD của
 * dự án), nên bỏ nút "Lưu" hàng loạt ở cấp trang.
 */
@Component({
  selector: 'app-evs-schedule-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzDatePickerModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzSelectModule,
    NzSwitchModule,
    NzTableModule,
    NzTabsModule,
  ],
  templateUrl: './evs-schedule-panel.component.html',
  styleUrl: './evs-schedule-panel.component.scss',
})
export class EvsSchedulePanelComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
  protected readonly defaultPageSize = TABLE_DEFAULT_PAGE_SIZE;

  private readonly service = inject(EvsSchedulePanelService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  private readonly route = inject(ActivatedRoute);
  protected readonly i18n = inject(I18nService);

  protected readonly types = TYPES;
  private evsType = '';

  protected readonly resumeOptions = signal<EvsResumeOption[]>([]);
  protected readonly searchResumeSeq = signal<string | null>(null);
  protected readonly evsStepOptions = signal<SyCodeOption[]>([]);

  private readonly rowsByType: Record<ScheduleType, ReturnType<typeof signal<EvsScheduleRow[]>>> = {
    CPNY: signal([]),
    DEPT: signal([]),
    EMP: signal([]),
  };
  private readonly loadingByType: Record<ScheduleType, ReturnType<typeof signal<boolean>>> = {
    CPNY: signal(false),
    DEPT: signal(false),
    EMP: signal(false),
  };
  private readonly quickFilterByType: Record<ScheduleType, ReturnType<typeof signal<string>>> = {
    CPNY: signal(''),
    DEPT: signal(''),
    EMP: signal(''),
  };
  private readonly checkedByType: Record<ScheduleType, ReturnType<typeof signal<Set<string>>>> = {
    CPNY: signal(new Set()),
    DEPT: signal(new Set()),
    EMP: signal(new Set()),
  };

  protected readonly deleting = signal(false);

  // ── Modal Thêm/Sửa ──
  protected readonly formVisible = signal(false);
  protected readonly formSaving = signal(false);
  protected readonly formType = signal<ScheduleType>('CPNY');
  protected readonly formSeq = signal('');
  protected readonly formEvsStep = signal<string | null>(null);
  protected readonly formDeptNo = signal('');
  protected readonly formDeptName = signal('');
  protected readonly formDeptType = signal('');
  protected readonly formPostGradeNo = signal('');
  protected readonly formPostGradeName = signal('');
  protected readonly formPersonId = signal('');
  protected readonly formStartDate = signal<Date | null>(null);
  protected readonly formEndDate = signal<Date | null>(null);
  protected readonly formActivity = signal(true);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    this.evsType = this.route.snapshot.queryParamMap.get('evsType') || '';
    try {
      const [resumeList, evsStepOptions] = await Promise.all([
        this.service.getResumeOptions(this.evsType),
        this.service.getEvsStepOptions(),
      ]);
      this.resumeOptions.set(resumeList);
      this.evsStepOptions.set(evsStepOptions);
      if (resumeList.length) {
        this.searchResumeSeq.set(resumeList[0].seq ?? null);
        await this.search();
      }
    } catch {
      // im lặng bỏ qua - danh sách tùy chọn trống không chặn chức năng chính
    }
  }

  protected tabTitle(type: ScheduleType): string {
    const keys: Record<ScheduleType, string> = {
      CPNY: 'evs.viewEvsSchedulePanel.GONGSIRICHENG.a',
      DEPT: 'evs.viewEvsSchedulePanel.BUMENRICHENG.a',
      EMP: 'evs.viewEvsSchedulePanel.GERENRICHENG.a',
    };
    const fallbacks: Record<ScheduleType, string> = { CPNY: 'Công ty', DEPT: 'Phòng ban', EMP: 'Cá nhân' };
    return this.i18n.t(keys[type], fallbacks[type]);
  }

  protected rows(type: ScheduleType): EvsScheduleRow[] {
    return this.rowsByType[type]();
  }

  protected loading(type: ScheduleType): boolean {
    return this.loadingByType[type]();
  }

  protected quickFilter(type: ScheduleType): string {
    return this.quickFilterByType[type]();
  }

  setQuickFilter(type: ScheduleType, value: string): void {
    this.quickFilterByType[type].set(value);
  }

  protected filteredRows(type: ScheduleType): EvsScheduleRow[] {
    const kw = this.quickFilter(type).trim().toLowerCase();
    const rows = this.rows(type);
    if (!kw) return rows;
    return rows.filter(
      (r) =>
        (r.evsStepName || r.evsStep || '').toLowerCase().includes(kw) ||
        (r.deptName || '').toLowerCase().includes(kw) ||
        (r.deptNo || '').toLowerCase().includes(kw) ||
        (r.personId || '').toLowerCase().includes(kw),
    );
  }

  protected checkedSeqs(type: ScheduleType): Set<string> {
    return this.checkedByType[type]();
  }

  isChecked(type: ScheduleType, seq?: string): boolean {
    return !!seq && this.checkedSeqs(type).has(seq);
  }

  toggleChecked(type: ScheduleType, seq: string | undefined, checked: boolean): void {
    if (!seq) return;
    const set = new Set(this.checkedSeqs(type));
    if (checked) set.add(seq);
    else set.delete(seq);
    this.checkedByType[type].set(set);
  }

  toggleAllChecked(type: ScheduleType, checked: boolean): void {
    this.checkedByType[type].set(checked ? new Set(this.filteredRows(type).map((r) => r.seq!).filter(Boolean)) : new Set());
  }

  async search(): Promise<void> {
    const resumeSeq = this.searchResumeSeq();
    if (!resumeSeq) return;
    await Promise.all(TYPES.map((type) => this.loadTab(type, resumeSeq)));
  }

  private async loadTab(type: ScheduleType, resumeSeq: string): Promise<void> {
    this.loadingByType[type].set(true);
    try {
      this.rowsByType[type].set(await this.service.getList(resumeSeq, type, this.evsType));
      this.quickFilterByType[type].set('');
      this.checkedByType[type].set(new Set());
    } catch {
      this.rowsByType[type].set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loadingByType[type].set(false);
    }
  }

  onResumeChange(value: string | null): void {
    this.searchResumeSeq.set(value);
    this.search();
  }

  private evsStepName(code: string | null): string {
    return this.evsStepOptions().find((o) => o.codeNo === code)?.codeName || '';
  }

  openAddModal(type: ScheduleType): void {
    this.formType.set(type);
    this.formSeq.set('');
    this.formEvsStep.set(null);
    this.formDeptNo.set('');
    this.formDeptName.set('');
    this.formDeptType.set('');
    this.formPostGradeNo.set('');
    this.formPostGradeName.set('');
    this.formPersonId.set('');
    this.formStartDate.set(null);
    this.formEndDate.set(null);
    this.formActivity.set(true);
    this.formVisible.set(true);
  }

  openEditModal(type: ScheduleType, row: EvsScheduleRow): void {
    this.formType.set(type);
    this.formSeq.set(row.seq ?? '');
    this.formEvsStep.set(row.evsStep ?? null);
    this.formDeptNo.set(row.deptNo ?? '');
    this.formDeptName.set(row.deptName ?? '');
    this.formDeptType.set(row.deptType ?? '');
    this.formPostGradeNo.set(row.postGradeNo ?? '');
    this.formPostGradeName.set(row.postGradeName ?? '');
    this.formPersonId.set(row.personId ?? '');
    this.formStartDate.set(toDateOrNull(row.startDate));
    this.formEndDate.set(toDateOrNull(row.endDate));
    this.formActivity.set(row.activity === '1' || row.activity === 'Y');
    this.formVisible.set(true);
  }

  async saveForm(): Promise<void> {
    const resumeSeq = this.searchResumeSeq();
    const type = this.formType();
    const evsStep = this.formEvsStep();
    if (!resumeSeq) {
      this.message.warning(this.i18n.t('evs.manage.viewEvsSchedulePanel.msg.selectEvaluationFirst', 'Vui lòng chọn Tên đánh giá trước khi lưu.'));
      return;
    }
    if (!evsStep) {
      this.message.warning(this.i18n.t('evs.manage.viewEvsSchedulePanel.msg.selectEvsStep', 'Vui lòng chọn Giai đoạn thực hiện cho tất cả các dòng.'));
      return;
    }
    this.formSaving.set(true);
    try {
      const res = await this.service.save({
        seq: this.formSeq() || undefined,
        resumeSeq,
        scheduleType: type,
        evsStep,
        evsStepName: this.evsStepName(evsStep),
        name: this.evsStepName(evsStep),
        deptNo: this.formDeptNo() || undefined,
        deptName: this.formDeptName() || undefined,
        deptType: this.formDeptType() || undefined,
        postGradeNo: this.formPostGradeNo() || undefined,
        postGradeName: this.formPostGradeName() || undefined,
        personId: this.formPersonId() || undefined,
        startDate: toDdMmYyyy(this.formStartDate()) || undefined,
        endDate: toDdMmYyyy(this.formEndDate()) || undefined,
        activity: this.formActivity() ? '1' : '0',
        evsType: this.evsType,
      });
      if (res.success !== false) {
        this.formVisible.set(false);
        await this.loadTab(type, resumeSeq);
      } else {
        this.message.error(res.message || this.i18n.t('evs.manage.viewEvsSchedulePanel.msg.saveError', 'Lỗi khi lưu dữ liệu. Vui lòng thử lại.'));
      }
    } catch {
      this.message.error(this.i18n.t('evs.manage.viewEvsSchedulePanel.msg.saveError', 'Lỗi khi lưu dữ liệu. Vui lòng thử lại.'));
    } finally {
      this.formSaving.set(false);
    }
  }

  deleteSelected(type: ScheduleType): void {
    const seqs = Array.from(this.checkedSeqs(type));
    if (!seqs.length) {
      this.message.warning(this.i18n.t('evs.manage.viewEvsSchedulePanel.msg.selectRowToDelete', 'Vui lòng chọn ít nhất một dòng để xóa.'));
      return;
    }
    this.modal.confirm({
      nzTitle: `${this.i18n.t('evs.manage.viewEvsSchedulePanel.modal.deletePrefix', 'Bạn có chắc muốn xóa')} ${seqs.length} ${this.i18n.t('evs.manage.viewEvsSchedulePanel.modal.deleteSuffix', 'dòng đã chọn?')}`,
      nzOkDanger: true,
      nzOnOk: async () => {
        const resumeSeq = this.searchResumeSeq();
        this.deleting.set(true);
        try {
          const res = await this.service.deleteBatch(seqs);
          if (res.success !== false && resumeSeq) {
            await this.loadTab(type, resumeSeq);
          } else if (res.success === false) {
            this.message.error(res.message || this.i18n.t('evs.manage.viewEvsSchedulePanel.msg.deleteError', 'Lỗi khi xóa dữ liệu. Vui lòng thử lại.'));
          }
        } catch {
          this.message.error(this.i18n.t('evs.manage.viewEvsSchedulePanel.msg.deleteError', 'Lỗi khi xóa dữ liệu. Vui lòng thử lại.'));
        } finally {
          this.deleting.set(false);
        }
      },
    });
  }
}
