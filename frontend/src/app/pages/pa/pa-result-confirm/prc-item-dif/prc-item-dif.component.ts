import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../../i18n/i18n.service';
import {
  PaItemDifSummaryRow,
  PaSalaryCheckEmpRow,
  PaSalaryCheckService,
  paFormatNumber,
} from '../../shared/pa-salary-check.service';

/** Nhóm MONTH_DIF theo đúng thứ tự hiển thị bản gốc (XZ / TJ / CW / JE / MY) */
const PRCD_GROUPS = [
  { monthDif: '0', labelKey: 'pa.viewResultConfirmSonList.XINZENGDUIXIANG.b', fallback: 'Thêm đối tượng mới' },
  { monthDif: '1', labelKey: 'hrm.empinfo.ADD_PROJECT', fallback: 'Hạng mục thêm mới' },
  { monthDif: '2', labelKey: 'pa.viewResultConfirmSonList.CHUWAIXIANGMU.b', fallback: 'Hạng mục ngoại lệ' },
  { monthDif: '4', labelKey: 'pa.viewResultConfirmSonList.JINEBIANGENG.b', fallback: 'Thay đổi số tiền' },
  { monthDif: '3', labelKey: 'pa.viewResultConfirmSonList.MEIYOUBIANGENG.b', fallback: 'Không thay đổi' },
];

/**
 * Tab "Đối chiếu hạng mục chi trả" (itemType = 1) / "Đối chiếu bảo hiểm" (itemType = 3) của Đối chiếu
 * kết quả - port từ viewResultConfirmSonList.jsp (currentIndex 1 / 3) + viewResultConfirmList3Right.jsp
 * của Hanwha_HAE: cây tổng hợp theo loại thay đổi bên trái, bấm số người -> danh sách NV bên phải.
 */
@Component({
  selector: 'app-prc-item-dif',
  standalone: true,
  imports: [CommonModule, NzIconModule, NzTableModule],
  templateUrl: './prc-item-dif.component.html',
  styleUrl: './prc-item-dif.component.scss',
})
export class PrcItemDifComponent {
  private readonly service = inject(PaSalaryCheckService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  /** '1' chi trả, '3' bảo hiểm */
  readonly itemType = input.required<string>();
  /** Dùng làm tiền tố id phần tử (prcPay / prcIns) */
  readonly idPrefix = input.required<string>();

  protected readonly loading = signal(false);
  private readonly summary = signal<PaItemDifSummaryRow[]>([]);
  protected readonly expanded = signal<Set<string>>(new Set(['0', '1', '2', '4', '3']));
  protected readonly groups = computed(() =>
    PRCD_GROUPS.map((g) => {
      const items = this.summary().filter((s) => String(s.monthDif) === g.monthDif);
      return { ...g, items, total: items.reduce((sum, i) => sum + (Number(i.personNum) || 0), 0) };
    }),
  );
  protected readonly totalRows = computed(() => this.summary().length);

  protected readonly selected = signal<PaItemDifSummaryRow | null>(null);
  protected readonly empLoading = signal(false);
  protected readonly empRows = signal<PaSalaryCheckEmpRow[]>([]);

  protected readonly fmt = paFormatNumber;

  private query: { salaryDistinNo: string; payDate: string } | null = null;

  /** Gọi procedure PA_MONTH_DIF_ITEM_VIEW (PAGE_TYPE = 2) rồi lấy tổng hợp (viewResultConfirmSonList3) */
  async load(salaryDistinNo: string, payDate: string): Promise<void> {
    this.query = { salaryDistinNo, payDate };
    this.loading.set(true);
    this.selected.set(null);
    this.empRows.set([]);
    try {
      this.summary.set(await this.service.getItemDifSummary({ salaryDistinNo, payDate, itemType: this.itemType(), pageType: '2' }));
    } catch {
      this.summary.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }

  toggle(monthDif: string): void {
    this.expanded.update((set) => {
      const next = new Set(set);
      if (next.has(monthDif)) next.delete(monthDif);
      else next.add(monthDif);
      return next;
    });
  }

  /** Bấm số người -> danh sách NV (changeUrlDetail -> viewResultConfirmList3Right bản gốc) */
  async selectItem(row: PaItemDifSummaryRow): Promise<void> {
    if (!this.query || !row.itemId) return;
    this.selected.set(row);
    this.empLoading.set(true);
    try {
      this.empRows.set(
        await this.service.getItemDifEmpList({
          ...this.query,
          itemId: row.itemId,
          monthDif: row.monthDif,
          itemType: row.itemType ?? this.itemType(),
          pageType: '2',
        }),
      );
    } catch {
      this.empRows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.empLoading.set(false);
    }
  }

  dif(row: { monthNow?: number; monthPro?: number }): number {
    return (Number(row.monthNow) || 0) - (Number(row.monthPro) || 0);
  }

  shortFormula(val: string | undefined): string {
    if (!val) return '';
    return val.length > 20 ? val.substring(0, 20) + '...' : val;
  }
}
