import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import { PaFormulaItem, PaFormulaRow, PaFormulaService, PaFormulaToolItem, PaFormulaToolItems } from './pa-formula.service';

/**
 * Cấu hình công thức tính toán (viewPaFormula) - xem ghi chú trong
 * pa-formula.service.ts. Panel "Công cụ" trong modal cho phép click 1 mục để
 * chèn ITEM_ID vào vị trí con trỏ của ô Condition/Formular đang focus gần
 * nhất - giữ đúng UX gốc (chèn tại cursor, không phải append cuối chuỗi).
 */
@Component({
  selector: 'app-pa-formula',
  standalone: true,
  imports: [CommonModule, FormsModule, NzButtonModule, NzIconModule, NzInputModule, NzModalModule, NzTableModule],
  templateUrl: './pa-formula.component.html',
  styleUrl: './pa-formula.component.scss',
})
export class PaFormulaComponent implements OnInit {
  private readonly service = inject(PaFormulaService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  private readonly sanitizer = inject(DomSanitizer);
  protected readonly i18n = inject(I18nService);

  @ViewChild('conditionInput') conditionInputRef?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('formularInput') formularInputRef?: ElementRef<HTMLTextAreaElement>;

  protected readonly items = signal<PaFormulaItem[]>([]);
  protected readonly selectedItemNo = signal<string>('');
  protected readonly selectedItemName = computed(() => this.items().find((i) => i.itemNo === this.selectedItemNo())?.itemName ?? '');

  protected readonly rows = signal<PaFormulaRow[]>([]);
  protected readonly loading = signal(false);
  protected readonly recordsTotal = signal(0);
  protected readonly pageIndex = signal(1);
  protected readonly pageSize = signal(20);
  protected readonly checkedSeqs = signal<Set<number>>(new Set());

  protected readonly toolItems = signal<PaFormulaToolItems>({});
  private itemNameMap = new Map<string, string>();

  protected readonly formVisible = signal(false);
  protected readonly formSaving = signal(false);
  protected readonly formFormularNo = signal<number | null>(null);
  protected readonly formCondition = signal('');
  protected readonly formFormular = signal('');
  protected readonly formDescription = signal('');
  private lastFocusedField: 'condition' | 'formular' = 'formular';

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      const [items, toolItems, allNames] = await Promise.all([
        this.service.getItemList(),
        this.service.getToolItems(),
        this.service.getAllItemNames(),
      ]);
      this.items.set(items);
      this.toolItems.set(toolItems);
      this.itemNameMap = new Map(allNames.filter((n) => n.itemId && n.itemName).map((n) => [n.itemId!, n.itemName!]));
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  selectItem(item: PaFormulaItem): void {
    if (!item.itemNo) return;
    this.selectedItemNo.set(item.itemNo);
    this.pageIndex.set(1);
    this.loadList();
  }

  private async loadList(): Promise<void> {
    if (!this.selectedItemNo()) return;
    this.loading.set(true);
    try {
      const start = (this.pageIndex() - 1) * this.pageSize();
      const resp = await this.service.getList(this.selectedItemNo(), this.pageIndex(), start, this.pageSize());
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

  protected highlightExpr(expr?: string): SafeHtml {
    if (!expr) return '';
    const escaped = expr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const replaced = escaped.replace(/\S+/g, (token) => {
      const name = this.itemNameMap.get(token);
      return name && name !== token ? `<span class="vpf-token" title="${token}">${name}</span>` : token;
    });
    return this.sanitizer.bypassSecurityTrustHtml(replaced);
  }

  isChecked(formularNo?: number): boolean {
    return formularNo != null && this.checkedSeqs().has(formularNo);
  }

  toggleChecked(formularNo: number | undefined, checked: boolean): void {
    if (formularNo == null) return;
    const set = new Set(this.checkedSeqs());
    if (checked) set.add(formularNo);
    else set.delete(formularNo);
    this.checkedSeqs.set(set);
  }

  toggleAll(checked: boolean): void {
    this.checkedSeqs.set(checked ? new Set(this.rows().map((r) => r.formularNo!).filter((v) => v != null)) : new Set());
  }

  async swapSeq(row: PaFormulaRow, direction: 'up' | 'down'): Promise<void> {
    if (row.formularNo == null || !row.itemNo) return;
    try {
      await this.service.swapSeq(row.formularNo, row.itemNo, direction);
      await this.loadList();
    } catch {
      this.message.error(this.i18n.t('common.error', 'Lỗi'));
    }
  }

  openAddModal(): void {
    if (!this.selectedItemNo()) {
      this.message.warning(this.i18n.t('pa.formula.selectItemFirst', 'Vui lòng chọn Hạng mục ở bên trái trước!'));
      return;
    }
    this.formFormularNo.set(null);
    this.formCondition.set('');
    this.formFormular.set('');
    this.formDescription.set('');
    this.lastFocusedField = 'formular';
    this.formVisible.set(true);
  }

  async openEditModal(row: PaFormulaRow): Promise<void> {
    if (row.formularNo == null) return;
    try {
      const dto = await this.service.getOne(row.formularNo);
      this.formFormularNo.set(dto.formularNo ?? null);
      this.formCondition.set(dto.condition ?? '');
      this.formFormular.set(dto.formular ?? '');
      this.formDescription.set(dto.description ?? '');
      this.lastFocusedField = 'formular';
      this.formVisible.set(true);
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  onFieldFocus(field: 'condition' | 'formular'): void {
    this.lastFocusedField = field;
  }

  insertToken(itemId?: string): void {
    if (!itemId) return;
    const ref = this.lastFocusedField === 'condition' ? this.conditionInputRef : this.formularInputRef;
    const targetSignal = this.lastFocusedField === 'condition' ? this.formCondition : this.formFormular;
    const el = ref?.nativeElement;
    const val = targetSignal();
    const start = el?.selectionStart ?? val.length;
    const end = el?.selectionEnd ?? start;
    const newVal = val.substring(0, start) + itemId + val.substring(end);
    targetSignal.set(newVal);
    const caret = start + itemId.length;
    setTimeout(() => {
      el?.focus();
      el?.setSelectionRange(caret, caret);
    });
  }

  async saveForm(): Promise<void> {
    const formular = this.formFormular().trim();
    if (!formular) {
      this.message.warning(this.i18n.t('pa.formula.formularRequired', 'Vui lòng nhập nội dung công thức!'));
      return;
    }
    this.formSaving.set(true);
    try {
      const dto: PaFormulaRow = {
        formularNo: this.formFormularNo() ?? undefined,
        itemNo: this.selectedItemNo(),
        condition: this.formCondition(),
        formular,
        description: this.formDescription(),
      };
      const res = this.formFormularNo() != null ? await this.service.update(dto) : await this.service.insert(dto);
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
      this.message.warning(this.i18n.t('pa.formula.selectRequired', 'Vui lòng chọn ít nhất một bản ghi!'));
      return;
    }
    this.modal.confirm({
      nzTitle: this.i18n.t('pa.formula.confirmDelete', 'Bạn có chắc chắn muốn xóa công thức đã chọn?'),
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          for (const seq of seqs) {
            await this.service.delete(seq);
          }
          this.message.success(this.i18n.t('common.deleteSuccess', 'Xóa thành công'));
          await this.loadList();
        } catch {
          this.message.error(this.i18n.t('common.error', 'Lỗi'));
        }
      },
    });
  }
}
