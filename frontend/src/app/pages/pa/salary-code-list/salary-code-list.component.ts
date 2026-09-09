import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import { PaSalaryCodeRow, SalaryCodeListService } from './salary-code-list.service';

const ITEM_TYPES: { value: number; key: string; fallback: string }[] = [
  { value: 1, key: 'pa.salaryCode.itemType.std', fallback: 'Hạng mục tiêu chuẩn' },
  { value: 2, key: 'pa.salaryCode.itemType.adj', fallback: 'Điều chỉnh trả lương' },
  { value: 3, key: 'pa.salaryCode.itemType.excPay', fallback: 'Trả lương ngoại lệ' },
  { value: 4, key: 'pa.salaryCode.itemType.adjDed', fallback: 'Điều chỉnh khoản trừ' },
  { value: 5, key: 'pa.salaryCode.itemType.excDed', fallback: 'Khoản trừ ngoại lệ' },
  { value: 6, key: 'pa.salaryCode.itemType.calc', fallback: 'Hạng mục tính toán' },
];

/**
 * Danh sách hạng mục lương (viewSalaryCodeList) - port lại từ
 * pa/salarycode/viewSalaryCodeList.html (đã xoá). Bản gốc có 2 checkbox
 * "Công ty sử dụng" trùng lặp id/value ("HAE" x2, lỗi copy-paste rõ ràng vì
 * dữ liệu thực tế có cả HAE và HTSV, ví dụ cột companyUsageStr = "HAE, HTSV")
 * - bản Angular sửa thành đúng 2 checkbox HAE/HTSV.
 */
@Component({
  selector: 'app-salary-code-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCheckboxModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzSelectModule,
    NzTableModule,
  ],
  templateUrl: './salary-code-list.component.html',
  styleUrl: './salary-code-list.component.scss',
})
export class SalaryCodeListComponent implements OnInit {
  private readonly service = inject(SalaryCodeListService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly itemTypes = ITEM_TYPES;

  protected readonly searchItemName = signal('');
  protected readonly searchItemType = signal<number | null>(null);

  protected readonly rows = signal<PaSalaryCodeRow[]>([]);
  protected readonly loading = signal(false);
  protected readonly recordsTotal = signal(0);
  protected readonly pageIndex = signal(1);
  protected readonly pageSize = signal(20);
  protected readonly checkedSeqs = signal<Set<string>>(new Set());

  protected readonly formVisible = signal(false);
  protected readonly formSaving = signal(false);
  protected readonly formItemNo = signal('');
  protected readonly formItemType = signal(1);
  protected readonly formItemId = signal('');
  protected readonly formNameEn = signal('');
  protected readonly formNameKo = signal('');
  protected readonly formNameVi = signal('');
  protected readonly formNameZh = signal('');
  protected readonly formDataType = signal('NUMBER(14,4)');
  protected readonly formDescr = signal('');
  protected readonly formCompanyHae = signal(false);
  protected readonly formCompanyHtsv = signal(false);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.search();
  }

  private rowKey(row: PaSalaryCodeRow): string {
    return `${row.itemType}::${row.itemNo}`;
  }

  itemTypeName(value?: number): string {
    const found = ITEM_TYPES.find((t) => t.value === value);
    return found ? this.i18n.t(found.key, found.fallback) : String(value ?? '');
  }

  async search(): Promise<void> {
    this.pageIndex.set(1);
    await this.loadList();
  }

  private async loadList(): Promise<void> {
    this.loading.set(true);
    try {
      const start = (this.pageIndex() - 1) * this.pageSize();
      const resp = await this.service.getList(
        this.searchItemName(),
        this.searchItemType() != null ? String(this.searchItemType()) : null,
        this.pageIndex(),
        start,
        this.pageSize(),
      );
      this.recordsTotal.set(resp.recordsTotal || 0);
      this.rows.set(resp.data || []);
      this.checkedSeqs.set(new Set());
    } catch {
      this.rows.set([]);
      this.recordsTotal.set(0);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }

  onPageIndexChange(index: number): void {
    this.pageIndex.set(index);
    this.loadList();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.pageIndex.set(1);
    this.loadList();
  }

  isChecked(row: PaSalaryCodeRow): boolean {
    return this.checkedSeqs().has(this.rowKey(row));
  }

  toggleChecked(row: PaSalaryCodeRow, checked: boolean): void {
    const set = new Set(this.checkedSeqs());
    const key = this.rowKey(row);
    if (checked) set.add(key);
    else set.delete(key);
    this.checkedSeqs.set(set);
  }

  toggleAll(checked: boolean): void {
    this.checkedSeqs.set(checked ? new Set(this.rows().map((r) => this.rowKey(r))) : new Set());
  }

  openAddModal(): void {
    this.formItemNo.set('');
    this.formItemType.set(1);
    this.formItemId.set('');
    this.formNameEn.set('');
    this.formNameKo.set('');
    this.formNameVi.set('');
    this.formNameZh.set('');
    this.formDataType.set('NUMBER(14,4)');
    this.formDescr.set('');
    this.formCompanyHae.set(false);
    this.formCompanyHtsv.set(false);
    this.formVisible.set(true);
  }

  async openEditModal(row: PaSalaryCodeRow): Promise<void> {
    if (row.itemType == null || !row.itemNo) return;
    try {
      const dto = await this.service.getOne(row.itemType, row.itemNo);
      this.formItemNo.set(dto.itemNo ?? '');
      this.formItemType.set(dto.itemType ?? 1);
      this.formItemId.set(dto.itemId ?? '');
      this.formNameEn.set(dto.nameEn ?? '');
      this.formNameKo.set(dto.nameKo ?? '');
      this.formNameVi.set(dto.nameVi ?? '');
      this.formNameZh.set(dto.nameZh ?? '');
      this.formDataType.set(dto.dataType ?? 'NUMBER(14,4)');
      this.formDescr.set(dto.descr ?? '');
      this.formCompanyHae.set(!!dto.companyUsage?.includes('HAE'));
      this.formCompanyHtsv.set(!!dto.companyUsage?.includes('HTSV'));
      this.formVisible.set(true);
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  async saveForm(): Promise<void> {
    const itemId = this.formItemId().trim();
    if (!this.formItemType() || !itemId) {
      this.message.warning(this.i18n.t('pa.salaryCode.validateRequired', 'Vui lòng nhập đầy đủ thông tin bắt buộc!'));
      return;
    }
    this.formSaving.set(true);
    try {
      const res = await this.service.save({
        itemNo: this.formItemNo() || undefined,
        itemType: this.formItemType(),
        itemId,
        nameEn: this.formNameEn().trim(),
        nameKo: this.formNameKo().trim(),
        nameVi: this.formNameVi().trim(),
        nameZh: this.formNameZh().trim(),
        dataType: this.formDataType(),
        descr: this.formDescr().trim(),
        companyUsage: [...(this.formCompanyHae() ? ['HAE'] : []), ...(this.formCompanyHtsv() ? ['HTSV'] : [])],
      });
      if (res.success !== false) {
        this.message.success(res.message || this.i18n.t('common.saveSuccess', 'Lưu thành công'));
        this.formVisible.set(false);
        await this.loadList();
      } else {
        this.message.error(res.message || this.i18n.t('common.error', 'Lỗi'));
      }
    } catch {
      this.message.error(this.i18n.t('common.error', 'Lỗi'));
    } finally {
      this.formSaving.set(false);
    }
  }

  deleteSelected(): void {
    const keys = this.rows()
      .filter((r) => this.isChecked(r))
      .map((r) => ({ itemType: r.itemType!, itemNo: r.itemNo! }));
    if (!keys.length) {
      this.message.warning(this.i18n.t('pa.salaryCode.selectRequired', 'Vui lòng chọn ít nhất một bản ghi!'));
      return;
    }
    this.modal.confirm({
      nzTitle: this.i18n.t('pa.salaryCode.confirmDelete', 'Bạn có chắc chắn muốn xóa các bản ghi đã chọn?'),
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          const res = await this.service.deleteList(keys);
          this.message.success(res.message || this.i18n.t('common.deleteSuccess', 'Xóa thành công'));
          await this.loadList();
        } catch {
          this.message.error(this.i18n.t('common.error', 'Lỗi'));
        }
      },
    });
  }
}
