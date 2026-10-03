import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import {
  ApplyTypeOption,
  PaComputeItemParamRow,
  PaComputeItemParamService,
  PaItemOption,
} from './pa-compute-item-param.service';

import { TABLE_PAGE_SIZE_OPTIONS, TABLE_DEFAULT_PAGE_SIZE } from '../../../core/config/table-pagination.config';
/**
 * Thông số mục tính toán (viewPaComputeItemParamList) - xem ghi chú trong
 * pa-compute-item-param.service.ts.
 */
@Component({
  selector: 'app-pa-compute-item-param',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzModalModule,
    NzSelectModule,
    NzTableModule,
  ],
  templateUrl: './pa-compute-item-param.component.html',
  styleUrl: './pa-compute-item-param.component.scss',
})
export class PaComputeItemParamComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;

  private readonly service = inject(PaComputeItemParamService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly searchAliasName = signal('');

  protected readonly rows = signal<PaComputeItemParamRow[]>([]);
  protected readonly loading = signal(false);
  protected readonly recordsTotal = signal(0);
  protected readonly pageIndex = signal(1);
  protected readonly pageSize = signal(TABLE_DEFAULT_PAGE_SIZE);
  protected readonly checkedSeqs = signal<Set<string>>(new Set());

  protected readonly itemOptions = signal<PaItemOption[]>([]);
  protected readonly applyTypeOptions = signal<ApplyTypeOption[]>([]);

  protected readonly formVisible = signal(false);
  protected readonly formSaving = signal(false);
  protected readonly formIsAdd = signal(true);
  protected readonly formParamNo = signal('');
  protected readonly formItemNo = signal<string | null>(null);
  protected readonly formCpnyName = signal('');
  protected readonly formAliasName = signal('');
  protected readonly formPricision = signal<number | null>(null);
  protected readonly formCarryBit = signal<number | null>(null);
  protected readonly formApplyType = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      this.applyTypeOptions.set(await this.service.getApplyTypeList());
    } catch {
      // im lặng bỏ qua - danh sách tùy chọn trống không chặn chức năng chính
    }
    await this.search();
  }

  async search(): Promise<void> {
    this.pageIndex.set(1);
    await this.loadList();
  }

  private async loadList(): Promise<void> {
    this.loading.set(true);
    try {
      const start = (this.pageIndex() - 1) * this.pageSize();
      const resp = await this.service.getList(this.searchAliasName(), this.pageIndex(), start, this.pageSize());
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

  async swapOrder(row: PaComputeItemParamRow, direction: 'up' | 'down'): Promise<void> {
    if (!row.paramNo) return;
    try {
      await this.service.swapOrder(row.paramNo, direction);
      await this.loadList();
    } catch {
      this.message.error(this.i18n.t('common.error', 'Lỗi'));
    }
  }

  async openAddModal(): Promise<void> {
    this.formIsAdd.set(true);
    this.formParamNo.set('');
    this.formItemNo.set(null);
    this.formCpnyName.set('');
    this.formAliasName.set('');
    this.formPricision.set(null);
    this.formCarryBit.set(null);
    this.formApplyType.set(null);
    try {
      this.itemOptions.set(await this.service.getItemList());
    } catch {
      this.itemOptions.set([]);
    }
    this.formVisible.set(true);
  }

  async openEditModal(row: PaComputeItemParamRow): Promise<void> {
    if (!row.paramNo) return;
    try {
      const dto = await this.service.getOne(row.paramNo);
      this.formIsAdd.set(false);
      this.formParamNo.set(dto.paramNo ?? '');
      this.formCpnyName.set(dto.cpnyName || dto.cpnyId || '');
      this.formAliasName.set(dto.aliasName || dto.itemId || '');
      this.formPricision.set(dto.pricision ?? null);
      this.formCarryBit.set(dto.carryBit ?? null);
      this.formApplyType.set(dto.applyType || null);
      this.formVisible.set(true);
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  editChecked(): void {
    const seqs = Array.from(this.checkedSeqs());
    if (seqs.length !== 1) {
      this.message.warning(this.i18n.t('pa.computeItemParam.selectOne', 'Vui lòng chọn đúng một bản ghi để sửa!'));
      return;
    }
    const row = this.rows().find((r) => r.paramNo === seqs[0]);
    if (row) this.openEditModal(row);
  }

  async saveForm(): Promise<void> {
    if (this.formIsAdd() && !this.formItemNo()) {
      this.message.warning(this.i18n.t('pa.computeItemParam.validateRequired', 'Vui lòng nhập đầy đủ thông tin bắt buộc!'));
      return;
    }
    this.formSaving.set(true);
    try {
      const dto: PaComputeItemParamRow = this.formIsAdd()
        ? {
            itemNo: this.formItemNo() ?? undefined,
            pricision: this.formPricision(),
            carryBit: this.formCarryBit(),
            applyType: this.formApplyType(),
          }
        : {
            paramNo: this.formParamNo(),
            pricision: this.formPricision(),
            carryBit: this.formCarryBit(),
            applyType: this.formApplyType(),
          };
      const res = this.formIsAdd() ? await this.service.insert(dto) : await this.service.update(dto);
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
      this.message.warning(this.i18n.t('pa.computeItemParam.selectRequired', 'Vui lòng chọn ít nhất một bản ghi!'));
      return;
    }
    this.modal.confirm({
      nzTitle: this.i18n.t('pa.computeItemParam.confirmDelete', 'Bạn có chắc chắn muốn xóa các bản ghi đã chọn?'),
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
