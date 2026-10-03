import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import { ApplyDetailModalComponent } from '../../../shared/apply-detail-modal/apply-detail-modal.component';
import {
  AFFIRM_FLAG_PARENT_CODE,
  CANCELABLE_AFFIRM_FLAGS,
  LEAVE_TYPE_PARENT_CODE,
  MyLeaveApplyListService,
  MyLeaveApplyRow,
  SyCodeOption,
} from './my-leave-apply-list.service';

import { TABLE_PAGE_SIZE_OPTIONS, TABLE_DEFAULT_PAGE_SIZE } from '../../../core/config/table-pagination.config';
function firstDayOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function lastDayOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0);
}

/**
 * Danh sách đơn xin nghỉ phép của chính nhân viên đang đăng nhập, hủy đơn,
 * xem chi tiết duyệt - port lại từ
 * ess/infoApplyAttendance/viewApplyAttendanceInfoList.html (Thymeleaf, đã
 * xoá) sang Angular + NG-ZORRO, dùng nz-table thay cho bảng dựng tay bằng
 * jQuery. Modal chi tiết tái sử dụng ApplyDetailModalComponent
 * (variant="leave", đã port ở Batch A). Gọi lại nguyên vẹn API JSON sẵn có.
 * Không kèm khối "Thông tin nhân viên" (essEmpInfoCard) vì chưa có component
 * Angular tương đương, theo tiền lệ đã áp dụng ở YearUseInfoComponent.
 */
@Component({
  selector: 'app-my-leave-apply-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ApplyDetailModalComponent,
    NzButtonModule,
    NzCardModule,
    NzCheckboxModule,
    NzDatePickerModule,
    NzFormModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzSelectModule,
    NzTableModule,
  ],
  templateUrl: './my-leave-apply-list.component.html',
  styleUrl: './my-leave-apply-list.component.scss',
})
export class MyLeaveApplyListComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
  protected readonly defaultPageSize = TABLE_DEFAULT_PAGE_SIZE;

  @ViewChild('detailModal') detailModal!: ApplyDetailModalComponent;

  private readonly service = inject(MyLeaveApplyListService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  private readonly router = inject(Router);
  protected readonly i18n = inject(I18nService);

  protected readonly leaveTypeCode = signal<string | null>(null);
  protected readonly affirmFlag = signal<string | null>(null);
  protected readonly fromDate = signal<Date | null>(firstDayOfMonth());
  protected readonly toDate = signal<Date | null>(lastDayOfMonth());
  protected readonly quickFilter = signal('');

  protected readonly leaveTypeOptions = signal<SyCodeOption[]>([]);
  protected readonly affirmFlagOptions = signal<SyCodeOption[]>([]);

  protected readonly loading = signal(false);
  protected readonly allRows = signal<MyLeaveApplyRow[]>([]);
  protected readonly filteredRows = signal<MyLeaveApplyRow[]>([]);
  protected readonly checkedApplyNos = signal<Set<string>>(new Set());
  protected readonly checkAll = signal(false);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      const [leaveTypes, affirmFlags] = await Promise.all([
        this.service.getCodeList(LEAVE_TYPE_PARENT_CODE),
        this.service.getCodeList(AFFIRM_FLAG_PARENT_CODE),
      ]);
      this.leaveTypeOptions.set(leaveTypes);
      this.affirmFlagOptions.set(affirmFlags);
    } catch {
      this.leaveTypeOptions.set([]);
      this.affirmFlagOptions.set([]);
    }
    await this.search();
  }

  codeLabel(opt: SyCodeOption): string {
    return opt.codeName || opt.nameVi || opt.codeNo;
  }

  private toApiDate(value: Date | null): string | undefined {
    return value ? formatDate(value, 'yyyy-MM-dd', 'en-US') : undefined;
  }

  formatDuration(applyLength?: string, dayHours?: string): string {
    const len = parseFloat(applyLength ?? '');
    const dh = parseFloat(dayHours ?? '');
    if (isNaN(len) || isNaN(dh) || dh === 0) {
      return applyLength ?? '';
    }
    const days = Math.floor(len / dh);
    const hours = len - days * dh;
    let text = '';
    if (days > 0) text += `${days} ${this.i18n.t('al.js.day', 'Ngày')}`;
    if (hours > 0) text += (text ? ' ' : '') + `${hours} ${this.i18n.t('al.js.hour', 'Giờ')}`;
    return text || String(len);
  }

  isCancelable(row: MyLeaveApplyRow): boolean {
    return CANCELABLE_AFFIRM_FLAGS.includes(String(row.affirmFlag));
  }

  isChecked(row: MyLeaveApplyRow): boolean {
    return !!row.applyNo && this.checkedApplyNos().has(row.applyNo);
  }

  toggleRow(row: MyLeaveApplyRow, checked: boolean): void {
    if (!row.applyNo) {
      return;
    }
    const set = new Set(this.checkedApplyNos());
    if (checked) {
      set.add(row.applyNo);
    } else {
      set.delete(row.applyNo);
      this.checkAll.set(false);
    }
    this.checkedApplyNos.set(set);
  }

  toggleAll(checked: boolean): void {
    this.checkAll.set(checked);
    if (!checked) {
      this.checkedApplyNos.set(new Set());
      return;
    }
    const set = new Set<string>();
    this.filteredRows()
      .filter((row) => this.isCancelable(row))
      .forEach((row) => row.applyNo && set.add(row.applyNo));
    this.checkedApplyNos.set(set);
  }

  async search(): Promise<void> {
    this.loading.set(true);
    try {
      this.allRows.set(
        await this.service.getList({
          leaveTypeCode: this.leaveTypeCode() ?? undefined,
          affirmFlag: this.affirmFlag() ?? undefined,
          fromDate: this.toApiDate(this.fromDate()),
          toDate: this.toApiDate(this.toDate()),
        }),
      );
      this.checkedApplyNos.set(new Set());
      this.checkAll.set(false);
      this.applyQuickFilter();
    } catch {
      this.message.error(this.i18n.t('al.msg.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }

  onQuickFilterChange(value: string): void {
    this.quickFilter.set(value);
    this.applyQuickFilter();
  }

  private applyQuickFilter(): void {
    const kw = this.quickFilter().trim().toLowerCase();
    if (!kw) {
      this.filteredRows.set(this.allRows());
      return;
    }
    this.filteredRows.set(
      this.allRows().filter((row) =>
        [
          row.leaveTypeName,
          row.leaveTypeCode,
          row.applyDate,
          row.leaveFromDate,
          row.leaveToDate,
          row.leaveReason,
          row.affirmFlagName,
          row.hrComment,
          row.confirmFlagName,
          row.createdBy,
          row.createdIp,
        ].some((v) => v && String(v).toLowerCase().includes(kw)),
      ),
    );
  }

  openDetail(row: MyLeaveApplyRow): void {
    this.detailModal.open(row.applyNo, row.leaveTypeCode, null);
  }

  goApply(): void {
    this.router.navigateByUrl('/ess/infoApplyAttendance/viewSSTApplyAttendance');
  }

  cancelSelected(): void {
    const selected = Array.from(this.checkedApplyNos());
    if (!selected.length) {
      this.message.warning(this.i18n.t('al.msg.selectRow', 'Vui lòng chọn ít nhất một dòng để hủy bỏ.'));
      return;
    }
    this.modal.confirm({
      nzTitle: `${this.i18n.t('al.msg.confirmCancel1', 'Bạn có chắc muốn hủy bỏ')} ${selected.length} ${this.i18n.t('al.msg.confirmCancel2', 'đơn xin nghỉ phép đã chọn?')}`,
      nzOnOk: () => this.doCancel(selected),
    });
  }

  private async doCancel(applyNos: string[]): Promise<void> {
    try {
      const res = await this.service.cancel(applyNos);
      if (res.success) {
        this.message.success(res.message || this.i18n.t('al.msg.cancelSuccess', 'Hủy bỏ thành công.'));
        await this.search();
      } else {
        this.message.error(res.error || this.i18n.t('al.msg.cancelFailed', 'Hủy bỏ thất bại.'));
      }
    } catch {
      this.message.error(this.i18n.t('al.msg.cancelError', 'Lỗi khi hủy bỏ đơn.'));
    }
  }
}
