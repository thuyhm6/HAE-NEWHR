import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import { OrgCostCenterPageService, OrgCostCenterRow } from './org-cost-center.service';

/**
 * Quản lý trung tâm chi phí (viewOrgCostCenter) - xem ghi chú trong org-cost-center.service.ts. DataTables
 * (search server-side qua POST /org/api/costCenter/list) thay bằng nz-table phân trang phía client (API
 * trả về nguyên danh sách đã lọc, không phải DataTables server-side phân trang thật). Modal Bootstrap
 * thêm/sửa thay bằng nz-modal, giữ nguyên các field y hệt bản gốc (kể cả "Trạng thái" là ô nhập tự do vì
 * ORG_COST_CENTER.ACTIVITY là giá trị code, không phải boolean 1/0).
 */
@Component({
  selector: 'app-org-cost-center',
  standalone: true,
  imports: [CommonModule, FormsModule, NzButtonModule, NzIconModule, NzInputModule, NzInputNumberModule, NzModalModule, NzTableModule],
  templateUrl: './org-cost-center.component.html',
  styleUrl: './org-cost-center.component.scss',
})
export class OrgCostCenterComponent implements OnInit {
  private readonly service = inject(OrgCostCenterPageService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly searchCodeNo = signal('');
  protected readonly searchCodeName = signal('');

  protected readonly rows = signal<OrgCostCenterRow[]>([]);
  protected readonly loading = signal(false);

  protected readonly formVisible = signal(false);
  protected readonly formSaving = signal(false);
  protected readonly formIsAdd = signal(true);
  protected readonly formSeq = signal<string | null>(null);
  protected readonly formCodeNo = signal('');
  protected readonly formCodeName = signal('');
  protected readonly formCodeEngName = signal('');
  protected readonly formCodeKoreanName = signal('');
  protected readonly formCodeVietnameseName = signal('');
  protected readonly formOrderNo = signal<number | null>(0);
  protected readonly formStartDate = signal('');
  protected readonly formEndDate = signal('');
  protected readonly formCountry = signal('');
  protected readonly formAddress = signal('');
  protected readonly formActivity = signal('');
  protected readonly formRemark = signal('');
  protected readonly formBusinessScope = signal('');
  protected readonly formProfitCenter = signal('');

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.search();
  }

  protected async search(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await this.service.getList(this.searchCodeNo().trim(), this.searchCodeName().trim());
      this.rows.set(res.data ?? []);
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }

  protected clearSearch(): void {
    this.searchCodeNo.set('');
    this.searchCodeName.set('');
    this.search();
  }

  protected openAddModal(): void {
    this.formIsAdd.set(true);
    this.formSeq.set(null);
    this.formCodeNo.set('');
    this.formCodeName.set('');
    this.formCodeEngName.set('');
    this.formCodeKoreanName.set('');
    this.formCodeVietnameseName.set('');
    this.formOrderNo.set(0);
    this.formStartDate.set('');
    this.formEndDate.set('');
    this.formCountry.set('');
    this.formAddress.set('');
    this.formActivity.set('');
    this.formRemark.set('');
    this.formBusinessScope.set('');
    this.formProfitCenter.set('');
    this.formVisible.set(true);
  }

  protected openEditModal(row: OrgCostCenterRow): void {
    this.formIsAdd.set(false);
    this.formSeq.set(row.seq ?? null);
    this.formCodeNo.set(row.codeNo ?? '');
    this.formCodeName.set(row.codeName ?? '');
    this.formCodeEngName.set(row.codeEngName ?? '');
    this.formCodeKoreanName.set(row.codeKoreanName ?? '');
    this.formCodeVietnameseName.set(row.codeVietnameseName ?? '');
    this.formOrderNo.set(row.orderNo ?? 0);
    this.formStartDate.set(row.startDate ?? '');
    this.formEndDate.set(row.endDate ?? '');
    this.formCountry.set(row.country ?? '');
    this.formAddress.set(row.address ?? '');
    this.formActivity.set(row.activity ?? '');
    this.formRemark.set(row.remark ?? '');
    this.formBusinessScope.set(row.businessScope ?? '');
    this.formProfitCenter.set(row.profitCenter ?? '');
    this.formVisible.set(true);
  }

  protected async saveForm(): Promise<void> {
    if (!this.formCodeNo().trim()) {
      this.message.warning(this.i18n.t('org.costCenter.msg.pleaseEnterCodeNo', 'Vui lòng nhập Mã chi phí'));
      return;
    }
    this.formSaving.set(true);
    try {
      const res = await this.service.save({
        seq: this.formSeq(),
        codeNo: this.formCodeNo().trim(),
        codeName: this.formCodeName(),
        codeEngName: this.formCodeEngName(),
        codeKoreanName: this.formCodeKoreanName(),
        codeVietnameseName: this.formCodeVietnameseName(),
        orderNo: this.formOrderNo() ?? 0,
        startDate: this.formStartDate(),
        endDate: this.formEndDate(),
        country: this.formCountry(),
        address: this.formAddress(),
        activity: this.formActivity(),
        remark: this.formRemark(),
        businessScope: this.formBusinessScope(),
        profitCenter: this.formProfitCenter(),
      });
      this.message.success(res.message || this.i18n.t('common.saveSuccess', 'Lưu thành công'));
      this.formVisible.set(false);
      await this.search();
    } catch {
      this.message.error(this.i18n.t('common.saveFail', 'Lưu thất bại!'));
    } finally {
      this.formSaving.set(false);
    }
  }

  protected deleteRow(row: OrgCostCenterRow): void {
    if (!row.seq) return;
    const seq = row.seq;
    this.modal.confirm({
      nzTitle: `${this.i18n.t('org.costCenter.confirmDeletePrefix', 'Bạn có chắc chắn muốn xóa trung tâm chi phí:')} ${row.codeNo}?`,
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          const res = await this.service.delete(seq);
          this.message.success(res.message || this.i18n.t('common.deleteSuccess', 'Xóa thành công'));
          await this.search();
        } catch {
          this.message.error(this.i18n.t('common.deleteFail', 'Xóa thất bại!'));
        }
      },
    });
  }
}
