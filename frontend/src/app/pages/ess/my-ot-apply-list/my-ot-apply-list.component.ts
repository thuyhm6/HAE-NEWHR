import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
import { ApplyDetailVariant } from '../../../shared/apply-detail-modal/apply-detail-modal.service';
import {
  AFFIRM_FLAG_PARENT_CODE,
  CANCELABLE_AFFIRM_FLAGS,
  MyOtApplyListService,
  MyOtApplyRow,
  OT_TYPE_PARENT_CODE,
  SyCodeOption,
} from './my-ot-apply-list.service';

import { TABLE_PAGE_SIZE_OPTIONS } from '../../../core/config/table-pagination.config';
function firstDayOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function lastDayOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0);
}

/**
 * Danh sách đơn xin tăng ca của chính nhân viên đang đăng nhập (thường/vượt),
 * hủy đơn, xem chi tiết duyệt - dùng chung cho 2 trang gần như trùng lặp
 * 100%: ess/infoApply/viewPOtApplyInfoList.html (tăng ca thường) và
 * viewPiciOtAffirmPBatchList.html (tăng ca vượt), cả 2 đã xoá. Route data
 * (`apiBase`, `detailVariant`, `applyRoute`) chọn đúng bộ API/route - xem
 * app.routes.ts. Modal chi tiết tái sử dụng ApplyDetailModalComponent thay
 * vì viết lại 2 lần. Không kèm khối "Thông tin nhân viên" (essEmpInfoCard)
 * vì chưa có component Angular tương đương, theo tiền lệ đã áp dụng ở
 * YearUseInfoComponent.
 */
@Component({
  selector: 'app-my-ot-apply-list',
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
  templateUrl: './my-ot-apply-list.component.html',
  styleUrl: './my-ot-apply-list.component.scss',
})
export class MyOtApplyListComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;

  @ViewChild('detailModal') detailModal!: ApplyDetailModalComponent;

  private readonly service = inject(MyOtApplyListService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly i18n = inject(I18nService);

  private apiBase = '';
  private applyRoute = '';
  protected detailVariant: ApplyDetailVariant = 'ot';

  protected readonly otTypeCode = signal<string | null>(null);
  protected readonly affirmFlag = signal<string | null>(null);
  protected readonly fromDate = signal<Date | null>(firstDayOfMonth());
  protected readonly toDate = signal<Date | null>(lastDayOfMonth());
  protected readonly quickFilter = signal('');

  protected readonly otTypeOptions = signal<SyCodeOption[]>([]);
  protected readonly affirmFlagOptions = signal<SyCodeOption[]>([]);

  protected readonly loading = signal(false);
  protected readonly allRows = signal<MyOtApplyRow[]>([]);
  protected readonly filteredRows = signal<MyOtApplyRow[]>([]);
  protected readonly checkedApplyNos = signal<Set<string>>(new Set());
  protected readonly checkAll = signal(false);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    const data = this.route.snapshot.data;
    this.apiBase = data['apiBase'];
    this.applyRoute = data['applyRoute'];
    this.detailVariant = data['detailVariant'];

    try {
      const [otTypes, affirmFlags] = await Promise.all([
        this.service.getCodeList(OT_TYPE_PARENT_CODE),
        this.service.getCodeList(AFFIRM_FLAG_PARENT_CODE),
      ]);
      this.otTypeOptions.set(otTypes);
      this.affirmFlagOptions.set(affirmFlags);
    } catch {
      this.otTypeOptions.set([]);
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

  formatHour(h?: string): string {
    const v = parseFloat(h ?? '');
    if (isNaN(v)) {
      return h ?? '';
    }
    const hrs = Math.floor(v);
    const mins = Math.round((v - hrs) * 60);
    let text = '';
    if (hrs > 0) text += `${hrs} ${this.i18n.t('poi.unit.hour', 'Tiếng')}`;
    if (mins > 0) text += (text ? ' ' : '') + `${mins} ${this.i18n.t('poi.unit.minute', 'Phút')}`;
    return text || String(v);
  }

  yesNo(flag?: string): string {
    return flag === '1' ? this.i18n.t('poi.val.yes', 'Có') : this.i18n.t('poi.val.no', 'Không');
  }

  isCancelable(row: MyOtApplyRow): boolean {
    return CANCELABLE_AFFIRM_FLAGS.includes(String(row.affirmFlag));
  }

  isChecked(row: MyOtApplyRow): boolean {
    return !!row.applyNo && this.checkedApplyNos().has(row.applyNo);
  }

  toggleRow(row: MyOtApplyRow, checked: boolean): void {
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
        await this.service.getList(this.apiBase, {
          otTypeCode: this.otTypeCode() ?? undefined,
          affirmFlag: this.affirmFlag() ?? undefined,
          fromDate: this.toApiDate(this.fromDate()),
          toDate: this.toApiDate(this.toDate()),
        }),
      );
      this.checkedApplyNos.set(new Set());
      this.checkAll.set(false);
      this.applyQuickFilter();
    } catch {
      this.message.error(this.i18n.t('poi.msg.loadError', 'Lỗi tải dữ liệu'));
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
          row.otTypeName,
          row.otTypeCode,
          row.applyOtDate,
          row.otFromTime,
          row.otToTime,
          row.applyOtRemark,
          row.affirmFlagName,
          row.confirmFlagName,
        ].some((v) => v && String(v).toLowerCase().includes(kw)),
      ),
    );
  }

  openDetail(row: MyOtApplyRow): void {
    this.detailModal.open(row.applyNo, row.otTypeCode, null);
  }

  goApply(): void {
    this.router.navigateByUrl(this.applyRoute);
  }

  cancelSelected(): void {
    const selected = Array.from(this.checkedApplyNos());
    if (!selected.length) {
      this.message.warning(this.i18n.t('poi.msg.selectMinOne', 'Vui lòng chọn ít nhất một dòng để hủy bỏ.'));
      return;
    }
    this.modal.confirm({
      nzTitle: `${this.i18n.t('poi.msg.confirmCancel1', 'Bạn có chắc muốn hủy bỏ')} ${selected.length} ${this.i18n.t('poi.msg.confirmCancel2', 'đơn xin tăng ca đã chọn?')}`,
      nzOnOk: () => this.doCancel(selected),
    });
  }

  private async doCancel(applyNos: string[]): Promise<void> {
    try {
      const res = await this.service.cancel(this.apiBase, applyNos);
      if (res.success) {
        this.message.success(res.message || this.i18n.t('poi.msg.cancelSuccess', 'Hủy bỏ thành công.'));
        await this.search();
      } else {
        this.message.error(res.error || this.i18n.t('poi.msg.cancelFailed', 'Hủy bỏ thất bại.'));
      }
    } catch {
      this.message.error(this.i18n.t('poi.msg.cancelError', 'Lỗi khi hủy bỏ đơn.'));
    }
  }
}
