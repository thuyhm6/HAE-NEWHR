import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { I18nService } from '../../../i18n/i18n.service';
import { PaDistinctOption, PaInputItemParamRow, PaInputItemParamService } from './pa-input-item-param.service';

const ITEM_TYPES: { value: number; key: string; fallback: string }[] = [
  { value: 1, key: 'pa.salaryCode.itemType.std', fallback: 'Hạng mục tiêu chuẩn' },
  { value: 2, key: 'pa.salaryCode.itemType.adj', fallback: 'Điều chỉnh trả lương' },
  { value: 3, key: 'pa.salaryCode.itemType.excPay', fallback: 'Trả lương ngoại lệ' },
  { value: 4, key: 'pa.salaryCode.itemType.adjDed', fallback: 'Điều chỉnh khoản trừ' },
  { value: 5, key: 'pa.salaryCode.itemType.excDed', fallback: 'Khoản trừ ngoại lệ' },
  { value: 6, key: 'pa.salaryCode.itemType.calc', fallback: 'Hạng mục tính toán' },
];

/**
 * Thông số mục nhập (viewPaInputItemParam) - xem ghi chú trong
 * pa-input-item-param.service.ts.
 */
@Component({
  selector: 'app-pa-input-item-param',
  standalone: true,
  imports: [CommonModule, FormsModule, NzButtonModule, NzIconModule, NzInputModule, NzModalModule, NzSelectModule, NzTableModule, NzTagModule],
  templateUrl: './pa-input-item-param.component.html',
  styleUrl: './pa-input-item-param.component.scss',
})
export class PaInputItemParamComponent implements OnInit {
  private readonly service = inject(PaInputItemParamService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly itemTypes = ITEM_TYPES;

  protected readonly searchItemType = signal<number | null>(null);
  protected readonly searchAliasName = signal('');

  protected readonly rows = signal<PaInputItemParamRow[]>([]);
  protected readonly loading = signal(false);
  protected readonly recordsTotal = signal(0);
  protected readonly pageIndex = signal(1);
  protected readonly pageSize = signal(20);
  protected readonly checkedSeqs = signal<Set<string>>(new Set());

  protected readonly distinctOptions = signal<PaDistinctOption[]>([]);

  protected readonly formVisible = signal(false);
  protected readonly formSaving = signal(false);
  protected readonly formParamNo = signal('');
  protected readonly formCpnyId = signal('');
  protected readonly formItemTypeName = signal('');
  protected readonly formAliasName = signal('');
  protected readonly formDistinctField = signal<string | null>(null);
  protected readonly formDistinctField2nd = signal<string | null>(null);
  protected readonly formDefaultVal = signal('');
  protected readonly formActivity = signal(1);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      this.distinctOptions.set(await this.service.getDistinctList());
    } catch {
      // im lặng bỏ qua - danh sách tùy chọn trống không chặn chức năng chính
    }
    await this.search();
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
      const resp = await this.service.getList(this.searchItemType(), this.searchAliasName(), this.pageIndex(), start, this.pageSize());
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

  isChecked(paramNo?: string): boolean {
    return !!paramNo && this.checkedSeqs().has(paramNo);
  }

  toggleChecked(paramNo: string | undefined, checked: boolean): void {
    if (!paramNo) return;
    const set = new Set(this.checkedSeqs());
    if (checked) set.add(paramNo);
    else set.delete(paramNo);
    this.checkedSeqs.set(set);
  }

  toggleAll(checked: boolean): void {
    this.checkedSeqs.set(checked ? new Set(this.rows().map((r) => r.paramNo!).filter(Boolean)) : new Set());
  }

  async openEditModal(row: PaInputItemParamRow): Promise<void> {
    if (!row.paramNo) return;
    try {
      const dto = await this.service.getOne(row.paramNo);
      this.formParamNo.set(dto.paramNo ?? '');
      this.formCpnyId.set(dto.cpnyId ?? '');
      this.formItemTypeName.set(this.itemTypeName(dto.itemType));
      this.formAliasName.set(dto.aliasName || dto.paramItemId || '');
      this.formDistinctField.set(dto.distinctField || null);
      this.formDistinctField2nd.set(dto.distinctField2nd || null);
      this.formDefaultVal.set(dto.defaultVal ?? '');
      this.formActivity.set(dto.activity ?? 1);
      this.formVisible.set(true);
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  editChecked(): void {
    const seqs = Array.from(this.checkedSeqs());
    if (seqs.length !== 1) {
      this.message.warning(this.i18n.t('pa.inputItemParam.selectOne', 'Vui lòng chọn đúng một bản ghi để sửa!'));
      return;
    }
    const row = this.rows().find((r) => r.paramNo === seqs[0]);
    if (row) this.openEditModal(row);
  }

  async saveForm(): Promise<void> {
    this.formSaving.set(true);
    try {
      const res = await this.service.update({
        paramNo: this.formParamNo(),
        distinctField: this.formDistinctField() || undefined,
        distinctField2nd: this.formDistinctField2nd() || undefined,
        defaultVal: this.formDefaultVal().trim(),
        activity: this.formActivity(),
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
    const seqs = Array.from(this.checkedSeqs());
    if (!seqs.length) {
      this.message.warning(this.i18n.t('pa.inputItemParam.selectRequired', 'Vui lòng chọn ít nhất một bản ghi!'));
      return;
    }
    this.modal.confirm({
      nzTitle: this.i18n.t('pa.inputItemParam.confirmDelete', 'Bạn có chắc chắn muốn xóa các bản ghi đã chọn?'),
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          const res = await this.service.deleteList(seqs);
          this.message.success(res.message || this.i18n.t('common.deleteSuccess', 'Xóa thành công'));
          await this.loadList();
        } catch {
          this.message.error(this.i18n.t('common.error', 'Lỗi'));
        }
      },
    });
  }
}
