import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import {
  ApplyDetailResponse,
  ApplyLeaveInfoListService,
  CANCELLABLE_AFFIRM_FLAGS,
  CardApplyRow,
  SyCodeOption,
} from './apply-leave-info-list.service';

interface SelectableRow extends CardApplyRow {
  checked: boolean;
}

/**
 * Danh sách đơn xin nghỉ/xin phép chấm công của bản thân - port lại từ
 * ess/infoApplyLeave/viewApplyLeaveInfoList.html (Thymeleaf, đã xoá) sang
 * Angular + NG-ZORRO, dùng nz-table (phân trang client-side) thay cho bảng
 * dựng tay bằng jQuery. Gọi lại nguyên vẹn API JSON sẵn có. Bỏ khối "Thông
 * tin nhân viên" (essEmpInfoCard) vì chưa có component Angular tương đương.
 */
@Component({
  selector: 'app-apply-leave-info-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCardModule,
    NzCheckboxModule,
    NzDatePickerModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzSelectModule,
    NzTableModule,
  ],
  templateUrl: './apply-leave-info-list.component.html',
  styleUrl: './apply-leave-info-list.component.scss',
})
export class ApplyLeaveInfoListComponent implements OnInit {
  private readonly service = inject(ApplyLeaveInfoListService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly startDate = signal<Date | null>(null);
  protected readonly endDate = signal<Date | null>(null);
  protected readonly affirmFlag = signal<string | null>(null);
  protected readonly quickFilter = signal('');
  protected readonly affirmFlagOptions = signal<SyCodeOption[]>([]);

  protected readonly loading = signal(false);
  protected readonly allRows = signal<SelectableRow[]>([]);
  protected readonly filteredRows = signal<SelectableRow[]>([]);

  protected readonly showDetailModal = signal(false);
  protected readonly detailLoading = signal(false);
  protected readonly detail = signal<ApplyDetailResponse | null>(null);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      this.affirmFlagOptions.set(await this.service.getAffirmFlagOptions());
    } catch {
      this.affirmFlagOptions.set([]);
    }
    this.setDefaultDateRange();
    await this.search();
  }

  private setDefaultDateRange(): void {
    const now = new Date();
    this.startDate.set(new Date(now.getFullYear(), now.getMonth(), 1));
    this.endDate.set(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  }

  private toApiDate(value: Date | null): string | undefined {
    return value ? formatDate(value, 'dd/MM/yyyy', 'en-US') : undefined;
  }

  async search(): Promise<void> {
    this.loading.set(true);
    try {
      const rows = await this.service.getMyList(
        this.affirmFlag() ?? undefined,
        this.toApiDate(this.startDate()),
        this.toApiDate(this.endDate()),
      );
      this.allRows.set(rows.map((row) => ({ ...row, checked: false })));
      this.applyQuickFilter();
    } catch {
      this.message.error(this.i18n.t('common.loadFail', 'Tải dữ liệu thất bại!'));
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
        [row.itemName, row.itemNo, row.arDateStr, row.fromTime, row.toTime, row.shiftName, row.applyReason, row.affirmFlagName]
          .some((v) => v && String(v).toLowerCase().includes(kw)),
      ),
    );
  }

  isCancellable(row: CardApplyRow): boolean {
    return CANCELLABLE_AFFIRM_FLAGS.includes(String(row.affirmFlag));
  }

  cancelSelected(): void {
    const selected = this.filteredRows()
      .filter((row) => row.checked && row.applyNo)
      .map((row) => row.applyNo!);
    if (!selected.length) {
      this.message.warning(this.i18n.t('essCommon.selectAtLeastOne', 'Vui lòng chọn ít nhất một dòng để hủy bỏ.'));
      return;
    }
    const confirmTitle = `${this.i18n.t('essCommon.confirmCancel1', 'Bạn có chắc muốn hủy bỏ')} ${selected.length} ${this.i18n.t('essCommon.confirmCancel2', 'đơn đã chọn?')}`;
    this.modal.confirm({
      nzTitle: confirmTitle,
      nzOnOk: () => this.doCancel(selected),
    });
  }

  private async doCancel(applyNos: string[]): Promise<void> {
    try {
      const res = await this.service.cancel(applyNos);
      if (res.success) {
        this.message.success(res.message || this.i18n.t('essCommon.cancelSuccess', 'Hủy bỏ thành công.'));
        await this.search();
      } else {
        this.message.error(res.error || this.i18n.t('essCommon.cancelFail', 'Hủy bỏ thất bại.'));
      }
    } catch {
      this.message.error(this.i18n.t('essCommon.cancelFail', 'Hủy bỏ thất bại.'));
    }
  }

  async openDetail(row: CardApplyRow): Promise<void> {
    if (!row.applyNo) {
      return;
    }
    this.showDetailModal.set(true);
    this.detailLoading.set(true);
    this.detail.set(null);
    try {
      this.detail.set(await this.service.getDetail(row.applyNo, row.itemNo));
    } catch {
      this.message.error(this.i18n.t('applyAtt.loadFailed', 'Tải dữ liệu thất bại'));
    } finally {
      this.detailLoading.set(false);
    }
  }

  closeDetail(): void {
    this.showDetailModal.set(false);
  }

  approvalStt(row: { affirmLevel?: string }, idx: number): string {
    const stt = row.affirmLevel || String(idx + 1);
    return stt === '100' ? 'HR' : stt;
  }
}
