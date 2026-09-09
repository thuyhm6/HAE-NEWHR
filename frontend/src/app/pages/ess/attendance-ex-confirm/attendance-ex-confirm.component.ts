import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { I18nService } from '../../../i18n/i18n.service';
import {
  ApplyDetailResponse,
  AttendanceExConfirmFilter,
  AttendanceExConfirmRow,
  AttendanceExConfirmService,
  DataTablesResponse,
} from './attendance-ex-confirm.service';

interface EditableRow extends AttendanceExConfirmRow {
  checked: boolean;
  editHrComment: string;
}

/**
 * Xác nhận đơn xin nghỉ bất thường (nhân sự duyệt/từ chối) - port lại từ
 * ess/arConfirm/viewAttendanceExConfirm.html (Thymeleaf + DataTables
 * server-side, đã xoá) sang Angular + NG-ZORRO, dùng nz-table phân trang
 * server-side (giống ManageCountInfoListComponent). Modal chi tiết đơn chỉ ở
 * dạng xem (read-only) - duyệt/từ chối thực hiện trực tiếp trên bảng, giống
 * hành vi bản gốc khi mở từ trang này (không đi qua approvalEmail flow).
 */
@Component({
  selector: 'app-attendance-ex-confirm',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
    NzTagModule,
  ],
  templateUrl: './attendance-ex-confirm.component.html',
  styleUrl: './attendance-ex-confirm.component.scss',
})
export class AttendanceExConfirmComponent implements OnInit {
  private readonly service = inject(AttendanceExConfirmService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly searchEmpId = signal('');
  protected readonly fromDate = signal<Date | null>(null);
  protected readonly toDate = signal<Date | null>(null);
  protected readonly confirmFlag = signal<string | null>('0');
  protected readonly checkAll = signal(false);

  protected readonly loading = signal(false);
  protected readonly rows = signal<EditableRow[]>([]);
  protected readonly pageIndex = signal(1);
  protected readonly pageSize = signal(25);
  protected readonly total = signal(0);

  protected readonly showDetailModal = signal(false);
  protected readonly detailLoading = signal(false);
  protected readonly detail = signal<ApplyDetailResponse | null>(null);

  protected readonly showRejectModal = signal(false);
  protected readonly rejectComment = signal('');

  private listBootstrapped = false;
  private drawCounter = 0;
  private pendingBatchApplyNos: string[] = [];

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.search();
  }

  async search(): Promise<void> {
    this.pageIndex.set(1);
    await this.loadPage();
  }

  clearSearch(): void {
    this.searchEmpId.set('');
    this.fromDate.set(null);
    this.toDate.set(null);
    this.confirmFlag.set('0');
    this.search();
  }

  private buildFilter(): AttendanceExConfirmFilter {
    return {
      searchEmpId: this.searchEmpId() || undefined,
      fromDate: this.toApiDate(this.fromDate()),
      toDate: this.toApiDate(this.toDate()),
      confirmFlag: this.confirmFlag() ?? undefined,
    };
  }

  private toApiDate(value: Date | null): string | undefined {
    return value ? formatDate(value, 'yyyy-MM-dd', 'en-US') : undefined;
  }

  async onQueryParamsChange(params: NzTableQueryParams): Promise<void> {
    this.pageIndex.set(params.pageIndex);
    this.pageSize.set(params.pageSize);
    if (!this.listBootstrapped) {
      this.listBootstrapped = true;
      return;
    }
    await this.loadPage();
  }

  private async loadPage(): Promise<void> {
    this.loading.set(true);
    try {
      const start = (this.pageIndex() - 1) * this.pageSize();
      const res: DataTablesResponse<AttendanceExConfirmRow> = await this.service.getPageList(
        this.buildFilter(),
        ++this.drawCounter,
        start,
        this.pageSize(),
      );
      this.rows.set((res.data ?? []).map((row) => ({ ...row, checked: false, editHrComment: row.hrComment ?? '' })));
      this.total.set(res.recordsTotal ?? 0);
      this.checkAll.set(false);
    } catch {
      this.message.error(this.i18n.t('common.loadFail', 'Tải dữ liệu thất bại!'));
    } finally {
      this.loading.set(false);
    }
  }

  toggleCheckAll(checked: boolean): void {
    this.checkAll.set(checked);
    this.rows().forEach((row) => (row.checked = checked));
  }

  async openDetail(row: EditableRow): Promise<void> {
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

  confirmLine(row: EditableRow, flag: '1' | '2'): void {
    if (!row.applyNo) {
      return;
    }
    if (flag === '2' && !row.editHrComment.trim()) {
      this.message.warning(this.i18n.t('lc.msg.hrCommentRequired', 'Vui lòng nhập ý kiến khi từ chối!'));
      return;
    }
    const titleKey = flag === '1' ? 'lc.confirm.approveLine' : 'lc.confirm.rejectLine';
    const fallback = flag === '1' ? 'Bạn có chắc chắn muốn duyệt đơn này?' : 'Bạn có chắc chắn muốn từ chối đơn này?';
    this.modal.confirm({
      nzTitle: this.i18n.t(titleKey, fallback),
      nzOnOk: () => this.doConfirmLine(row, flag),
    });
  }

  private async doConfirmLine(row: EditableRow, flag: '1' | '2'): Promise<void> {
    try {
      const res = await this.service.confirmLine(row.applyNo!, flag, row.editHrComment);
      if (res.success) {
        this.message.success(
          flag === '1' ? this.i18n.t('lc.msg.approveSuccess', 'Duyệt thành công!') : this.i18n.t('lc.msg.rejectSuccess', 'Từ chối thành công!'),
        );
        await this.loadPage();
      } else {
        this.message.error(res.error || this.i18n.t('common.systemError', 'Lỗi hệ thống'));
      }
    } catch {
      this.message.error(this.i18n.t('common.systemError', 'Lỗi hệ thống'));
    }
  }

  batchAction(flag: '1' | '2'): void {
    const applyNos = this.rows()
      .filter((row) => row.checked && row.applyNo)
      .map((row) => row.applyNo!);
    if (!applyNos.length) {
      this.message.warning(this.i18n.t('lc.msg.selectApply', 'Vui lòng chọn đơn cần xử lý!'));
      return;
    }
    if (flag === '1') {
      const title = `${this.i18n.t('lc.confirm.approveBatchPrefix', 'Bạn có chắc chắn muốn duyệt')} ${applyNos.length} ${this.i18n.t('lc.confirm.approveBatchSuffix', 'đơn đã chọn?')}`;
      this.modal.confirm({
        nzTitle: title,
        nzOnOk: () => this.sendBatch(applyNos, '1', ''),
      });
    } else {
      this.pendingBatchApplyNos = applyNos;
      this.rejectComment.set('');
      this.showRejectModal.set(true);
    }
  }

  confirmBatchReject(): void {
    const comment = this.rejectComment().trim();
    if (!comment) {
      this.message.warning(this.i18n.t('lc.msg.hrCommentRequired', 'Vui lòng nhập ý kiến khi từ chối!'));
      return;
    }
    this.showRejectModal.set(false);
    this.sendBatch(this.pendingBatchApplyNos, '2', comment);
  }

  closeRejectModal(): void {
    this.showRejectModal.set(false);
  }

  private async sendBatch(applyNos: string[], flag: '1' | '2', hrComment: string): Promise<void> {
    try {
      const res = await this.service.confirmBatch(applyNos, flag, hrComment);
      if (res.success) {
        this.message.success(
          flag === '1'
            ? this.i18n.t('lc.msg.approveBatchSuccess', 'Duyệt hàng loạt thành công!')
            : this.i18n.t('lc.msg.rejectBatchSuccess', 'Từ chối hàng loạt thành công!'),
        );
      } else {
        this.message.error(res.error || this.i18n.t('common.systemError', 'Lỗi hệ thống'));
      }
    } catch {
      this.message.error(this.i18n.t('common.systemError', 'Lỗi hệ thống'));
    } finally {
      await this.loadPage();
    }
  }
}
