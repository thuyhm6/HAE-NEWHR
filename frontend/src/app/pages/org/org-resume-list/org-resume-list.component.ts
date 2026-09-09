import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import { OrgResumeListService, OrgResumeRow } from './org-resume-list.service';

const ACTIVE_CODE = '14013948';
const INACTIVE_CODE = 'INACTIVE';

interface ResumeForm {
  no: string;
  resumeName: string;
  changeDate: Date | null;
  changeReason: string;
  remark: string;
  activity: string;
}

const EMPTY_FORM: ResumeForm = {
  no: '', resumeName: '', changeDate: null, changeReason: '', remark: '', activity: ACTIVE_CODE,
};

/**
 * Danh sách yêu cầu thay đổi tổ chức (viewResumeList) - xem ghi chú trong org-resume-list.service.ts.
 * DataTables server-side thay bằng nz-table [nzFrontPagination]="false" (đúng pattern các trang server-
 * paged khác trong dự án, ví dụ sy-feedback). Nút "Xuất kết quả" giữ nguyên link tải trực tiếp tới
 * endpoint export đã sửa thành .xlsx thật.
 */
@Component({
  selector: 'app-org-resume-list',
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
    NzTableModule,
  ],
  templateUrl: './org-resume-list.component.html',
  styleUrl: './org-resume-list.component.scss',
})
export class OrgResumeListComponent implements OnInit {
  private readonly service = inject(OrgResumeListService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly activeCode = ACTIVE_CODE;
  protected readonly inactiveCode = INACTIVE_CODE;

  protected readonly searchNo = signal('');
  protected readonly searchResumeName = signal('');
  protected readonly searchChangeDateFrom = signal<Date | null>(null);
  protected readonly searchChangeDateTo = signal<Date | null>(null);
  protected readonly searchActivity = signal<string | null>(null);

  protected readonly rows = signal<OrgResumeRow[]>([]);
  protected readonly loading = signal(false);
  protected readonly recordsFiltered = signal(0);
  protected readonly pageIndex = signal(1);
  protected readonly pageSize = signal(25);

  protected readonly formVisible = signal(false);
  protected readonly formSaving = signal(false);
  protected readonly formIsAdd = signal(true);
  protected form: ResumeForm = { ...EMPTY_FORM };

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.search();
  }

  protected search(): void {
    this.pageIndex.set(1);
    this.loadPage();
  }

  protected clearSearch(): void {
    this.searchNo.set('');
    this.searchResumeName.set('');
    this.searchChangeDateFrom.set(null);
    this.searchChangeDateTo.set(null);
    this.searchActivity.set(null);
    this.search();
  }

  protected onPageIndexChange(index: number): void {
    this.pageIndex.set(index);
    this.loadPage();
  }

  protected onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.pageIndex.set(1);
    this.loadPage();
  }

  private async loadPage(): Promise<void> {
    this.loading.set(true);
    try {
      const start = (this.pageIndex() - 1) * this.pageSize();
      const res = await this.service.getPageList(this.buildFilter(), this.pageIndex(), start, this.pageSize());
      if (res.error) {
        this.message.error(res.error);
        this.rows.set([]);
        this.recordsFiltered.set(0);
      } else {
        this.rows.set(res.data ?? []);
        this.recordsFiltered.set(res.recordsFiltered ?? 0);
      }
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
      this.rows.set([]);
      this.recordsFiltered.set(0);
    } finally {
      this.loading.set(false);
    }
  }

  private buildFilter() {
    return {
      no: this.searchNo().trim(),
      resumeName: this.searchResumeName().trim(),
      changeDateFrom: this.formatYmd(this.searchChangeDateFrom()),
      changeDateTo: this.formatYmd(this.searchChangeDateTo()),
      activity: this.searchActivity() ?? '',
    };
  }

  protected formatDisplayDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : formatDate(d, 'dd/MM/yyyy', 'vi');
  }

  protected formatDisplayDateTime(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : formatDate(d, 'dd/MM/yyyy HH:mm', 'vi');
  }

  protected exportUrl(): string {
    return this.service.buildExportUrl(this.buildFilter());
  }

  // ==================== Thêm mới / Sửa ====================

  protected openAddModal(): void {
    this.formIsAdd.set(true);
    this.form = { ...EMPTY_FORM };
    this.formVisible.set(true);
  }

  protected async openEditModal(row: OrgResumeRow): Promise<void> {
    try {
      const data = await this.service.getByNo(row.no);
      this.formIsAdd.set(false);
      this.form = {
        no: data.no,
        resumeName: data.resumeName || '',
        changeDate: this.toDate(data.changeDate),
        changeReason: data.changeReason || '',
        remark: data.remark || '',
        activity: data.activity || ACTIVE_CODE,
      };
      this.formVisible.set(true);
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  protected async saveForm(): Promise<void> {
    if (!this.form.resumeName.trim()) {
      this.message.warning(this.i18n.t('org.resume.msg.pleaseEnterResumeName', 'Vui lòng nhập Tên thay đổi'));
      return;
    }
    if (!this.form.changeDate) {
      this.message.warning(this.i18n.t('org.resume.msg.pleaseEnterChangeDate', 'Vui lòng nhập Ngày hiệu lực'));
      return;
    }
    this.formSaving.set(true);
    try {
      const payload = {
        no: this.form.no,
        changeDate: this.formatDmy(this.form.changeDate),
        resumeName: this.form.resumeName.trim(),
        changeReason: this.form.changeReason,
        remark: this.form.remark,
        activity: this.form.activity,
      };
      const res = this.formIsAdd() ? await this.service.add(payload) : await this.service.update(payload);
      if (res.error) {
        this.message.error(res.error);
        return;
      }
      this.message.success(res.message || this.i18n.t('common.saveSuccess', 'Lưu thành công'));
      this.formVisible.set(false);
      await this.loadPage();
    } catch {
      this.message.error(this.i18n.t('common.saveFail', 'Lưu thất bại!'));
    } finally {
      this.formSaving.set(false);
    }
  }

  protected deleteRow(row: OrgResumeRow): void {
    this.modal.confirm({
      nzTitle: `${this.i18n.t('org.resume.confirmDelete', 'Bạn có chắc chắn muốn xóa?')} ${row.no}`,
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          const res = await this.service.delete(row.no);
          if (res.error) {
            this.message.error(res.error);
            return;
          }
          this.message.success(res.message || this.i18n.t('common.deleteSuccess', 'Xóa thành công'));
          await this.loadPage();
        } catch {
          this.message.error(this.i18n.t('common.deleteFail', 'Xóa thất bại!'));
        }
      },
    });
  }

  /** CHANGE_DATE trong DB lưu sẵn dạng chuỗi "dd/MM/yyyy" (không phải ISO) - parse thủ công thay vì
   *  new Date(dateStr) vì JS không tự nhận dạng đúng định dạng dd/MM/yyyy. */
  private toDate(dateStr: string | null | undefined): Date | null {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = Number(parts[0]);
      const month = Number(parts[1]);
      const year = Number(parts[2]);
      const d = new Date(year, month - 1, day);
      return isNaN(d.getTime()) ? null : d;
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  }

  private formatYmd(d: Date | null): string | undefined {
    return d ? formatDate(d, 'yyyy-MM-dd', 'vi') : undefined;
  }

  /** Đúng định dạng "dd/MM/yyyy" đã lưu sẵn trong cột CHANGE_DATE (VARCHAR2) - dùng khi lưu để không
   *  làm lệch định dạng so với các dòng dữ liệu cũ. */
  private formatDmy(d: Date | null): string {
    return d ? formatDate(d, 'dd/MM/yyyy', 'vi') : '';
  }
}
