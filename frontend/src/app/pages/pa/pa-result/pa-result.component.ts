import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';

import { AuthService } from '../../../auth/auth.service';
import { I18nService } from '../../../i18n/i18n.service';
import { EvsAffirmorSetupService } from '../../evs/evs-affirmor-setup/evs-affirmor-setup.service';
import { PaPayScheduleRow, PaPayScheduleService } from '../pa-pay-schedule/pa-pay-schedule.service';
import { PaItemInputItem, PaResultExportColumn, PaResultService } from './pa-result.service';

interface ResultSection {
  titleKey: string;
  fallback: string;
  items: PaItemInputItem[];
  /** Lưu vào PA_ITEM_INPUT (bản cũ không lưu hạng mục nhân sự) */
  savable: boolean;
  /** Định dạng số 0.00000 khi xuất Excel (aliasExpFlag = 1 ở bản cũ) */
  decimal: boolean;
}

/** Bản cũ chỉ hiện nút Tra cứu/Lưu cho các adminID này (viewPaResult.jsp). */
const EDITOR_PERSON_IDS = ['11111111', '11111112', '11111113', '11111114', '11111115', '11111116'];

/**
 * Kết quả tính lương (viewPaResult) - port từ pa/salary/viewPaResult.jsp.
 * - 4 nhóm hạng mục (nhân sự/chấm công/nhập/tính), mỗi hạng mục có checkbox + số thứ tự.
 * - Tra cứu/Lưu: cấu hình PA_ITEM_INPUT theo cặp (IS_USE, ITEM_TYPE).
 * - Xuất Excel: dữ liệu PA_SUMMARY_HAE theo các cột đã tích, sắp theo số thứ tự.
 * Hạng mục được định danh theo itemId (tên cột PA_SUMMARY_HAE - duy nhất giữa các nhóm),
 * giống id "pa" + ITEM_ID của checkbox ở bản cũ.
 */
@Component({
  selector: 'app-pa-result',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCheckboxModule,
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
  private readonly authService = inject(AuthService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly payScheduleOptions = signal<PaPayScheduleRow[]>([]);
  protected readonly searchPayScheduleNo = signal<string | null>(null);
  protected readonly deptTreeNodes = signal<NzTreeNodeOptions[]>([]);
  protected readonly searchDeptNo = signal<string | null>(null);
  protected readonly isUse = signal<number>(1);
  protected readonly itemType = signal<number>(1);

  protected readonly sections = signal<ResultSection[]>([]);
  protected readonly checkedIds = signal<Set<string>>(new Set());
  protected readonly orderNos = signal<Map<string, number | null>>(new Map());

  protected readonly allChecked = signal(false);
  protected readonly inverseChecked = signal(false);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly exporting = signal(false);

  protected readonly canEdit = computed(() => {
    const user = this.authService.currentUser();
    return !!user && (user.admin || EDITOR_PERSON_IDS.includes(user.personId));
  });

  /** Bản cũ: 2 (Báo cáo chênh lệch lương) và 3 (Cấp-Khấu trừ-Bảo hiểm) đã bị ẩn. */
  readonly isUseOptions = [1, 4, 5, 6];
  readonly itemTypeOptions = [1, 2, 3, 4, 5, 6, 7];

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    if (!this.authService.currentUser()) {
      await this.authService.loadCurrentUser();
    }
    this.loading.set(true);
    try {
      const [data, schedules, deptFlat] = await Promise.all([
        this.service.getSectionItems(),
        this.payScheduleService.getList('', '', null),
        this.deptService.getAuthorizedDepartments(),
      ]);
      // Hạng mục nhân sự: luôn có thêm "Kế hoạch trả lương No" đứng đầu (PaResultSerImp#getPaResultAllItem)
      const hrItems: PaItemInputItem[] = [
        { itemId: 'PAY_SCHEDULE_NO', itemName: this.i18n.t('ess.empInfo.pay_plan', 'Kế hoạch trả lương') + ' No' },
        ...(data.hrItems || []),
      ];
      const sections: ResultSection[] = [
        { titleKey: 'pa.salary.title.humanItem', fallback: 'Hạng mục nhân sự', items: hrItems, savable: false, decimal: false },
        { titleKey: 'pa.salary.title.attendanceItem', fallback: 'Hạng mục chấm công', items: data.attendanceItems || [], savable: true, decimal: false },
        { titleKey: 'pa.salary.title.inputItem', fallback: 'Hạng mục nhập', items: data.inputItems || [], savable: true, decimal: true },
        { titleKey: 'pa.salary.title.caculateItem', fallback: 'Hạng mục tính', items: data.computeItems || [], savable: true, decimal: true },
      ];
      this.sections.set(sections);

      // Trạng thái mặc định: ITEM_FLAG = '1' thì tích chọn, ITEM_NUMBER <> 0 thì điền số thứ tự
      const checked = new Set<string>();
      const orders = new Map<string, number | null>();
      for (const item of sections.flatMap((s) => s.items)) {
        if (!item.itemId) continue;
        if (item.itemFlag === '1') checked.add(item.itemId);
        if (item.itemNumber) orders.set(item.itemId, item.itemNumber);
      }
      this.checkedIds.set(checked);
      this.orderNos.set(orders);

      this.payScheduleOptions.set(schedules);
      if (schedules.length) this.searchPayScheduleNo.set(schedules[0].payScheduleNo ?? null);
      this.deptTreeNodes.set(this.deptService.buildDeptTree(deptFlat) as NzTreeNodeOptions[]);
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }

  scheduleLabel(row: PaPayScheduleRow): string {
    return row.payDate + (row.salaryDistinName ? ' ' + row.salaryDistinName : '');
  }

  itemLabel(item: PaItemInputItem): string {
    return item.itemName || item.itemId || item.itemNo || '';
  }

  isChecked(itemId?: string): boolean {
    return !!itemId && this.checkedIds().has(itemId);
  }

  orderNoOf(itemId?: string): number | null {
    return itemId ? this.orderNos().get(itemId) ?? null : null;
  }

  /** Mục đã tích mà chưa nhập số thứ tự - tương ứng class "required" ở bản cũ. */
  isOrderMissing(itemId?: string): boolean {
    return this.isChecked(itemId) && this.orderNoOf(itemId) == null;
  }

  toggleChecked(itemId: string | undefined, checked: boolean): void {
    if (!itemId) return;
    const set = new Set(this.checkedIds());
    if (checked) set.add(itemId);
    else set.delete(itemId);
    this.checkedIds.set(set);
  }

  setOrderNo(itemId: string | undefined, value: number | null): void {
    if (!itemId) return;
    const map = new Map(this.orderNos());
    map.set(itemId, value);
    this.orderNos.set(map);
  }

  private allItemIds(): string[] {
    return this.sections()
      .flatMap((s) => s.items)
      .map((i) => i.itemId)
      .filter((v): v is string => !!v);
  }

  toggleAll(checked: boolean): void {
    this.allChecked.set(checked);
    this.checkedIds.set(checked ? new Set(this.allItemIds()) : new Set());
  }

  toggleInverse(checked: boolean): void {
    this.inverseChecked.set(checked);
    const current = this.checkedIds();
    this.checkedIds.set(new Set(this.allItemIds().filter((id) => !current.has(id))));
  }

  sectionChecked(section: ResultSection): boolean {
    return section.items.length > 0 && section.items.every((i) => this.isChecked(i.itemId));
  }

  sectionIndeterminate(section: ResultSection): boolean {
    return !this.sectionChecked(section) && section.items.some((i) => this.isChecked(i.itemId));
  }

  toggleSection(section: ResultSection, checked: boolean): void {
    const set = new Set(this.checkedIds());
    for (const item of section.items) {
      if (!item.itemId) continue;
      if (checked) set.add(item.itemId);
      else set.delete(item.itemId);
    }
    this.checkedIds.set(set);
  }

  /** Tra cứu cấu hình đã lưu: bỏ chọn các nhóm lưu được rồi tích lại theo PA_ITEM_INPUT (khớp ITEM_NO + ITEM_ID). */
  async search(): Promise<void> {
    this.loading.set(true);
    try {
      const saved = await this.service.getSavedItems(this.isUse(), this.itemType());
      const savedMap = new Map(saved.map((s) => [`${s.itemNo}-${s.itemId}`, s]));
      const checked = new Set(this.checkedIds());
      const orders = new Map(this.orderNos());
      for (const section of this.sections().filter((s) => s.savable)) {
        for (const item of section.items) {
          if (!item.itemId) continue;
          const hit = savedMap.get(`${item.itemNo}-${item.itemId}`);
          if (hit) {
            checked.add(item.itemId);
            orders.set(item.itemId, hit.orderNo ?? null);
          } else {
            checked.delete(item.itemId);
            orders.set(item.itemId, null);
          }
        }
      }
      this.checkedIds.set(checked);
      this.orderNos.set(orders);
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }

  save(): void {
    const items = this.sections()
      .filter((s) => s.savable)
      .flatMap((s) => s.items)
      .filter((i) => this.isChecked(i.itemId));
    if (items.some((i) => this.isOrderMissing(i.itemId))) {
      this.message.warning(this.i18n.t('pa.result.msgOrderRequired', 'Vui lòng nhập số thứ tự cho các hạng mục đã tích chọn!'));
      return;
    }
    this.modal.confirm({
      nzTitle: this.i18n.t('pa.result.confirmSave', 'Bạn có chắc chắn muốn lưu cấu hình này?'),
      nzOnOk: async () => {
        this.saving.set(true);
        try {
          const res = await this.service.save(
            this.isUse(),
            this.itemType(),
            items.map((i) => ({
              itemNo: i.itemNo ?? '',
              itemId: i.itemId ?? '',
              itemName: this.itemLabel(i),
              orderNo: this.orderNoOf(i.itemId),
            })),
          );
          if (res.success !== false) {
            this.message.success(this.i18n.t('pa.result.saveSuccess', 'Lưu thành công!'));
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

  async exportExcel(): Promise<void> {
    const payScheduleNo = this.searchPayScheduleNo();
    if (!payScheduleNo) {
      this.message.warning(this.i18n.t('pa.result.msgSelectPaySchedule', 'Vui lòng chọn kế hoạch trả lương!'));
      return;
    }
    const columns: PaResultExportColumn[] = this.sections().flatMap((s) =>
      s.items
        .filter((i) => this.isChecked(i.itemId))
        .map((i) => ({
          itemId: i.itemId!,
          itemName: this.itemLabel(i),
          orderNo: this.orderNoOf(i.itemId),
          decimal: s.decimal,
        })),
    );
    if (!columns.length) {
      this.message.warning(this.i18n.t('pa.insurance.title.pleaseChooseExportItem', 'Vui lòng chọn hạng mục cần xuất!'));
      return;
    }
    this.exporting.set(true);
    try {
      await this.service.exportExcel(payScheduleNo, this.searchDeptNo(), columns);
    } catch {
      this.message.error(this.i18n.t('pa.insurance.title.exportFaild', 'Xuất Excel thất bại!'));
    } finally {
      this.exporting.set(false);
    }
  }
}
