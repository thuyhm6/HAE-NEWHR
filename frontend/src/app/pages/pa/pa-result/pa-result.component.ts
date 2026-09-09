import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';

import { I18nService } from '../../../i18n/i18n.service';
import { EvsAffirmorSetupService } from '../../evs/evs-affirmor-setup/evs-affirmor-setup.service';
import { PaPayScheduleRow, PaPayScheduleService } from '../pa-pay-schedule/pa-pay-schedule.service';
import { PaItemInputItem, PaResultService } from './pa-result.service';

interface ItemMeta {
  itemId: string;
  itemName: string;
}

/**
 * Cấu hình hạng mục kết quả tính lương (viewPaResult) - xem ghi chú trong
 * pa-result.service.ts. 4 nhóm hạng mục (nhân sự/chấm công/nhập/tính) mỗi
 * hạng mục có checkbox chọn + số thứ tự (orderNo) - lưu theo cặp
 * (isUse, itemType) đang chọn ở thanh lọc.
 */
@Component({
  selector: 'app-pa-result',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzInputNumberModule,
    NzModalModule,
    NzSelectModule,
    NzTreeSelectModule,
  ],
  templateUrl: './pa-result.component.html',
  styleUrl: './pa-result.component.scss',
})
export class PaResultComponent implements OnInit {
  private readonly service = inject(PaResultService);
  private readonly payScheduleService = inject(PaPayScheduleService);
  private readonly deptService = inject(EvsAffirmorSetupService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  private itemMetaMap = new Map<string, ItemMeta>();

  protected readonly payScheduleOptions = signal<PaPayScheduleRow[]>([]);
  protected readonly searchPayScheduleNo = signal<string | null>(null);
  protected readonly deptTreeNodes = signal<NzTreeNodeOptions[]>([]);
  protected readonly searchDeptNos = signal<string[]>([]);
  protected readonly isUse = signal<number | null>(null);
  protected readonly itemType = signal<number | null>(null);

  protected readonly hrItems = signal<PaItemInputItem[]>([]);
  protected readonly attendanceItems = signal<PaItemInputItem[]>([]);
  protected readonly inputItems = signal<PaItemInputItem[]>([]);
  protected readonly computeItems = signal<PaItemInputItem[]>([]);

  protected readonly checkedItemNos = signal<Set<string>>(new Set());
  protected readonly orderNos = signal<Map<string, number | null>>(new Map());

  protected readonly saving = signal(false);

  readonly isUseOptions = [1, 2, 3, 4, 5, 6];
  readonly itemTypeOptions = [1, 2, 3, 4];

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      const [sections, schedules, deptFlat] = await Promise.all([
        this.service.getSectionItems(),
        this.payScheduleService.getList('', '', null),
        this.deptService.getAuthorizedDepartments(),
      ]);
      this.hrItems.set(sections.hrItems || []);
      this.attendanceItems.set(sections.attendanceItems || []);
      this.inputItems.set(sections.inputItems || []);
      this.computeItems.set(sections.computeItems || []);
      this.itemMetaMap = new Map(
        [...(sections.hrItems || []), ...(sections.attendanceItems || []), ...(sections.inputItems || []), ...(sections.computeItems || [])]
          .filter((it) => it.itemNo)
          .map((it) => [it.itemNo!, { itemId: it.itemId ?? '', itemName: it.itemName ?? it.itemId ?? it.itemNo! }]),
      );
      this.payScheduleOptions.set(schedules);
      if (schedules.length) this.searchPayScheduleNo.set(schedules[0].payScheduleNo ?? null);
      this.deptTreeNodes.set(this.deptService.buildDeptTree(deptFlat) as NzTreeNodeOptions[]);
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  scheduleLabel(row: PaPayScheduleRow): string {
    return row.payDate + (row.salaryDistinName ? ' ' + row.salaryDistinName : '');
  }

  isChecked(itemNo?: string): boolean {
    return !!itemNo && this.checkedItemNos().has(itemNo);
  }

  orderNoOf(itemNo?: string): number | null {
    return itemNo ? this.orderNos().get(itemNo) ?? null : null;
  }

  toggleChecked(itemNo: string | undefined, checked: boolean): void {
    if (!itemNo) return;
    const set = new Set(this.checkedItemNos());
    if (checked) set.add(itemNo);
    else set.delete(itemNo);
    this.checkedItemNos.set(set);
  }

  setOrderNo(itemNo: string | undefined, value: number | null): void {
    if (!itemNo) return;
    const map = new Map(this.orderNos());
    map.set(itemNo, value);
    this.orderNos.set(map);
  }

  private allItemNos(): string[] {
    return [...this.hrItems(), ...this.attendanceItems(), ...this.inputItems(), ...this.computeItems()]
      .map((i) => i.itemNo)
      .filter((v): v is string => !!v);
  }

  toggleAll(checked: boolean): void {
    this.checkedItemNos.set(checked ? new Set(this.allItemNos()) : new Set());
  }

  toggleInverse(): void {
    const current = this.checkedItemNos();
    const next = new Set<string>();
    for (const itemNo of this.allItemNos()) {
      if (!current.has(itemNo)) next.add(itemNo);
    }
    this.checkedItemNos.set(next);
  }

  toggleSection(items: PaItemInputItem[], checked: boolean): void {
    const set = new Set(this.checkedItemNos());
    for (const item of items) {
      if (!item.itemNo) continue;
      if (checked) set.add(item.itemNo);
      else set.delete(item.itemNo);
    }
    this.checkedItemNos.set(set);
  }

  private validateFilters(): boolean {
    if (!this.isUse()) {
      this.message.warning(this.i18n.t('pa.result.msgSelectIsUse', 'Vui lòng chọn Hạng mục tích chọn!'));
      return false;
    }
    if (!this.itemType()) {
      this.message.warning(this.i18n.t('pa.result.msgSelectType', 'Vui lòng chọn Phân biệt hạng mục!'));
      return false;
    }
    return true;
  }

  async search(): Promise<void> {
    if (!this.validateFilters()) return;
    try {
      const saved = await this.service.getSavedItems(this.isUse()!, this.itemType()!);
      const checked = new Set<string>();
      const orderMap = new Map<string, number | null>();
      for (const item of saved) {
        if (!item.itemNo) continue;
        checked.add(item.itemNo);
        orderMap.set(item.itemNo, item.orderNo ?? null);
      }
      this.checkedItemNos.set(checked);
      this.orderNos.set(orderMap);
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  save(): void {
    if (!this.validateFilters()) return;
    this.modal.confirm({
      nzTitle: this.i18n.t('pa.result.confirmSave', 'Bạn có chắc chắn muốn lưu cấu hình này?'),
      nzOnOk: async () => {
        this.saving.set(true);
        try {
          const items = [...this.checkedItemNos()].map((itemNo) => {
            const meta = this.itemMetaMap.get(itemNo);
            return {
              itemNo,
              itemId: meta?.itemId ?? '',
              itemName: meta?.itemName ?? '',
              orderNo: this.orderNos().get(itemNo) ?? null,
            };
          });
          const res = await this.service.save(this.isUse()!, this.itemType()!, items);
          if (res.success !== false) {
            this.message.success(res.message || this.i18n.t('pa.result.saveSuccess', 'Lưu thành công!'));
          } else {
            this.message.error(res.error || res.message || this.i18n.t('common.error', 'Lỗi'));
          }
        } catch {
          this.message.error(this.i18n.t('common.error', 'Lỗi'));
        } finally {
          this.saving.set(false);
        }
      },
    });
  }

  exportExcel(): void {
    const payScheduleNo = this.searchPayScheduleNo();
    if (!payScheduleNo) {
      this.message.warning(this.i18n.t('pa.result.msgSelectPaySchedule', 'Vui lòng chọn kế hoạch trả lương!'));
      return;
    }
    const itemIds = [...this.checkedItemNos()]
      .map((itemNo) => this.itemMetaMap.get(itemNo)?.itemId)
      .filter((id): id is string => !!id);
    if (!itemIds.length) {
      this.message.warning(this.i18n.t('pa.result.msgNoItemSelected', 'Vui lòng tích chọn ít nhất một hạng mục!'));
      return;
    }
    const url = this.service.buildExportExcelUrl(payScheduleNo, this.searchDeptNos().join(','), itemIds.join(','));
    window.location.href = url;
  }
}
