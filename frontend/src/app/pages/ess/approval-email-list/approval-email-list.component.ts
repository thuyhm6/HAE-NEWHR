import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { I18nService } from '../../../i18n/i18n.service';
import { ApplyDetailModalComponent } from '../../../shared/apply-detail-modal/apply-detail-modal.component';
import { AffirmContext, AffirmExecuteItem, ApplyDetailModalService } from '../../../shared/apply-detail-modal/apply-detail-modal.service';
import { ApprovalEmailListService, ApprovalEmailRow } from './approval-email-list.service';

const STATUS_COLOR: Record<string, string> = {
  '14014309': 'success',
  '14014310': 'error',
  '14014308': 'warning',
};

/**
 * Hàng đợi đơn chờ duyệt (tăng ca/nghỉ phép/nghỉ bất thường) - port lại từ
 * ess/infoApply/viewApprovalEmail.html (đã xoá) sang Angular + NG-ZORRO, dùng
 * nz-table thay bảng dựng tay bằng jQuery. Duyệt/từ chối theo dòng (trong
 * modal chi tiết) lẫn duyệt/từ chối hàng loạt (chọn nhiều checkbox) đều gọi
 * chung `ApplyDetailModalService.executeAffirm` (đã có sẵn từ Batch A, thiết
 * kế sẵn cho cả 2 luồng qua `AffirmContext.fromApprovalEmail`) thay vì viết
 * lại logic gọi API duyệt. Modal chi tiết tái sử dụng ApplyDetailModalComponent
 * (3 instance, chọn theo `affirmUrl` trả về từ API, giống hệt bản gốc).
 */
@Component({
  selector: 'app-approval-email-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ApplyDetailModalComponent,
    NzButtonModule,
    NzCardModule,
    NzCheckboxModule,
    NzFormModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzSelectModule,
    NzTableModule,
    NzTagModule,
  ],
  templateUrl: './approval-email-list.component.html',
  styleUrl: './approval-email-list.component.scss',
})
export class ApprovalEmailListComponent implements OnInit {
  @ViewChild('otModal') otModal!: ApplyDetailModalComponent;
  @ViewChild('leaveModal') leaveModal!: ApplyDetailModalComponent;
  @ViewChild('attendanceExModal') attendanceExModal!: ApplyDetailModalComponent;

  private readonly service = inject(ApprovalEmailListService);
  private readonly detailService = inject(ApplyDetailModalService);
  private readonly message = inject(NzMessageService);
  private readonly route = inject(ActivatedRoute);
  protected readonly i18n = inject(I18nService);

  protected readonly titleSearch = signal('');
  protected readonly applyTypeSearch = signal('');

  protected readonly loading = signal(false);
  protected readonly syncing = signal(false);
  protected readonly allRows = signal<ApprovalEmailRow[]>([]);
  protected readonly filteredRows = signal<ApprovalEmailRow[]>([]);
  protected readonly checkedApplyNos = signal<Set<string>>(new Set());
  protected readonly checkAll = signal(false);

  protected readonly actionModalVisible = signal(false);
  protected readonly actionFlag = signal<1 | 2>(1);
  protected readonly affirmContent = signal('');

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    // Mở từ link thông báo trên topbar (vd: /ess/infoApply/viewApprovalEmail?applyTypeCode=21) -
    // áp applyTypeCode vào điều kiện tìm kiếm Loại đơn ngay khi vào trang.
    const applyTypeCode = this.route.snapshot.queryParamMap.get('applyTypeCode');
    if (applyTypeCode) {
      this.applyTypeSearch.set(applyTypeCode);
    }
    await this.loadList();
  }

  protected async loadList(): Promise<void> {
    this.loading.set(true);
    try {
      this.allRows.set(await this.service.getList());
      this.checkedApplyNos.set(new Set());
      this.checkAll.set(false);
      this.applyFilter();
    } catch {
      this.message.error(this.i18n.t('vae.msg.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }

  search(): void {
    this.applyFilter();
  }

  private applyFilter(): void {
    const typeFilter = this.applyTypeSearch();
    const titleFilter = this.titleSearch().trim().toLowerCase();
    this.filteredRows.set(
      this.allRows().filter((row) => {
        const matchType = !typeFilter || row.applyTypeCode === typeFilter;
        const matchTitle = !titleFilter || (row.title ?? '').toLowerCase().includes(titleFilter);
        return matchType && matchTitle;
      }),
    );
  }

  statusColor(applyAffirmFlag?: string): string {
    return (applyAffirmFlag && STATUS_COLOR[applyAffirmFlag]) || 'default';
  }

  isChecked(row: ApprovalEmailRow): boolean {
    return !!row.applyNo && this.checkedApplyNos().has(row.applyNo);
  }

  toggleRow(row: ApprovalEmailRow, checked: boolean): void {
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
    this.filteredRows().forEach((row) => row.applyNo && set.add(row.applyNo));
    this.checkedApplyNos.set(set);
  }

  private getSelectedRows(): ApprovalEmailRow[] {
    return this.filteredRows().filter((row) => row.applyNo && this.checkedApplyNos().has(row.applyNo));
  }

  openDetail(row: ApprovalEmailRow): void {
    const url = row.affirmUrl ?? '';
    const ctx: AffirmContext = {
      applyNo: row.applyNo ?? '',
      applyType: row.applyType,
      applyFlag: row.applyFlag,
      affirmLevel: row.affirmLevel,
      affirmPersonId: row.affirmPersonId,
      affirmFlag: row.affirmFlag,
      fromApprovalEmail: true,
    };
    if (url.includes('viewApprovaledOt')) {
      this.otModal.open(row.applyNo, row.applyType, ctx);
    } else if (url.includes('viewApprovaledLeave')) {
      this.leaveModal.open(row.applyNo, row.applyType, ctx);
    } else if (url.includes('viewAttendanceEx')) {
      this.attendanceExModal.open(row.applyNo, row.applyType, ctx);
    }
  }

  openActionModal(flag: 1 | 2): void {
    if (!this.getSelectedRows().length) {
      this.message.warning(this.i18n.t('vae.msg.noSelect', 'Vui lòng chọn ít nhất một đơn.'));
      return;
    }
    this.actionFlag.set(flag);
    this.affirmContent.set(flag === 1 ? 'Ok' : 'Reject');
    this.actionModalVisible.set(true);
  }

  closeActionModal(): void {
    this.actionModalVisible.set(false);
  }

  async confirmAction(): Promise<void> {
    const selected = this.getSelectedRows();
    const flag = this.actionFlag();
    const content = this.affirmContent().trim() || (flag === 1 ? 'Ok' : 'Reject');
    const items: AffirmExecuteItem[] = selected.map((row) => ({
      applyNo: row.applyNo ?? '',
      applyType: row.applyType,
      applyFlag: row.applyFlag,
      affirmLevel: row.affirmLevel,
      flag,
      affirmContent: content,
    }));
    this.actionModalVisible.set(false);
    try {
      const res = await this.detailService.executeAffirm(items);
      if (res.success) {
        this.message.success(flag === 1 ? this.i18n.t('vae.msg.approveSuccess', 'Phê duyệt thành công!') : this.i18n.t('vae.msg.rejectSuccess', 'Từ chối thành công!'));
      } else {
        this.message.error(res.message || this.i18n.t('vae.msg.executeFail', 'Có lỗi xảy ra trong quá trình xử lý.'));
      }
    } catch {
      this.message.error(this.i18n.t('vae.msg.executeFail', 'Có lỗi xảy ra trong quá trình xử lý.'));
    } finally {
      await this.loadList();
    }
  }

  async syncEagleOffice(): Promise<void> {
    this.syncing.set(true);
    try {
      const res = await this.service.syncEagleOffice();
      if (res.success) {
        this.message.success(res.message || this.i18n.t('vae.msg.syncSuccess', 'Đồng bộ Clever thành công!'));
        await this.loadList();
      } else {
        this.message.error(res.message || this.i18n.t('vae.msg.syncFail', 'Đồng bộ Clever thất bại.'));
      }
    } catch {
      this.message.error(this.i18n.t('vae.msg.syncFail', 'Đồng bộ Clever thất bại.'));
    } finally {
      this.syncing.set(false);
    }
  }
}
