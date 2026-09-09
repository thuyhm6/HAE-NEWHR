import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';

import { I18nService } from '../../../i18n/i18n.service';
import { ShiftOption, SyCodeOption, COMPANY_CALENDAR_TYPE_PARENT_CODE } from '../company-calendar/company-calendar.service';
import {
  ArCalenderGroupRow,
  CLASS_CALENDAR_DEFAULT_GROUP_ID,
  CLASS_CALENDAR_GROUP_PARENT_CODE,
  ClassCalendarService,
} from './class-calendar.service';

interface CalendarCell {
  isEmpty: boolean;
  ddateStr?: string;
  day?: number;
  isSun?: boolean;
  isSat?: boolean;
  isToday?: boolean;
  hasWork?: boolean;
  items?: ArCalenderGroupRow[];
}

function toDateKey(d: Date): string {
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Lịch Nhóm Ca (Class Calendar) - port lại từ
 * ar/attendanceSettings/viewClassCalendar.html (đã xoá). Khác với
 * CompanyCalendarComponent: có bộ lọc Nhóm ca (nhóm ca mặc định 400224 khi
 * chưa chọn), và việc TẠO MỚI luôn qua thủ tục hàng loạt theo khoảng ngày
 * (AR_ADD_CALENDER_DATE_BANCI_P) - click vào 1 ngày CHƯA có dữ liệu của
 * nhóm ca đang lọc sẽ báo "Không tìm thấy dữ liệu" thay vì mở modal thêm
 * mới cho riêng ngày đó (đúng hành vi `cccalOpenEditModal` bản gốc: chỉ
 * dùng để SỬA, không tạo mới).
 */
@Component({
  selector: 'app-class-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzDatePickerModule,
    NzFormModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzModalModule,
    NzSelectModule,
  ],
  templateUrl: './class-calendar.component.html',
  styleUrl: './class-calendar.component.scss',
})
export class ClassCalendarComponent implements OnInit {
  private readonly service = inject(ClassCalendarService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly selectedYear = signal(new Date().getFullYear());
  protected readonly selectedMonth = signal(new Date().getMonth() + 1);
  protected readonly selectedGroupId = signal<string | null>(null);
  protected readonly years: number[] = (() => {
    const y = new Date().getFullYear();
    const list: number[] = [];
    for (let i = y - 5; i <= y + 5; i++) list.push(i);
    return list;
  })();
  protected readonly months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  protected readonly loading = signal(false);
  protected readonly weeks = signal<CalendarCell[][]>([]);
  protected readonly selectedDdateStr = signal<string | null>(null);

  protected readonly shiftOptions = signal<ShiftOption[]>([]);
  protected readonly groupOptions = signal<SyCodeOption[]>([]);
  protected readonly typeOptions = signal<SyCodeOption[]>([]);

  // --- Edit single day modal ---
  protected readonly modalVisible = signal(false);
  protected readonly modalTitle = signal('');
  protected readonly savingRecord = signal(false);
  protected readonly editArDateStr = signal<string | null>(null);
  protected readonly editGroupId = signal<string | null>(null);
  protected readonly formWorkdayflag = signal(1);
  protected readonly formShiftNo = signal<string | null>(null);
  protected readonly formTypeid = signal<string | null>(null);
  protected readonly formOvertypeid = signal<string | null>(null);
  protected readonly formTypeidDefault = signal<string | null>(null);
  protected readonly formOperationId = signal('');
  protected readonly formOrderno = signal<number | null>(0);
  protected readonly formActivity = signal(1);

  // --- Add batch modal ---
  protected readonly addModalVisible = signal(false);
  protected readonly addSaving = signal(false);
  protected readonly addStartDate = signal<Date | null>(null);
  protected readonly addEndDate = signal<Date | null>(null);
  protected readonly addGroupId = signal<string | null>(null);
  protected readonly addWorkShift = signal<string | null>(null);
  protected readonly addRestShift = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      const [shifts, groups, types] = await Promise.all([
        this.service.getShiftList(),
        this.service.getCodeList(CLASS_CALENDAR_GROUP_PARENT_CODE),
        this.service.getCodeList(COMPANY_CALENDAR_TYPE_PARENT_CODE),
      ]);
      this.shiftOptions.set(shifts);
      this.groupOptions.set(groups);
      this.typeOptions.set(types);
    } catch {
      this.shiftOptions.set([]);
      this.groupOptions.set([]);
      this.typeOptions.set([]);
    }
    await this.load();
  }

  groupLabel(g: SyCodeOption): string {
    return g.nameVi || g.codeName || g.codeNo;
  }

  typeLabel(t: SyCodeOption): string {
    return t.nameVi || t.codeName || t.codeNo;
  }

  private effectiveGroupId(): string {
    return this.selectedGroupId() || CLASS_CALENDAR_DEFAULT_GROUP_ID;
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const records = await this.service.getMonth(this.selectedYear(), this.selectedMonth(), this.effectiveGroupId());
      this.weeks.set(this.buildWeeks(records));
    } catch {
      this.weeks.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }

  private buildWeeks(records: ArCalenderGroupRow[]): CalendarCell[][] {
    if (!records || records.length === 0) return [];
    const map = new Map<string, ArCalenderGroupRow[]>();
    records.forEach((r) => {
      const k = (r.arDateStr || '').replace(/-/g, '/');
      if (!k) return;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(r);
    });
    const dateKeys = Array.from(map.keys()).sort();
    if (dateKeys.length === 0) return [];

    const today = new Date();
    const todayKey = toDateKey(today);

    const firstParts = dateKeys[0].split('/').map((p) => parseInt(p, 10));
    const firstDow = new Date(firstParts[0], firstParts[1] - 1, firstParts[2]).getDay();

    const weeks: CalendarCell[][] = [];
    let current: CalendarCell[] = [];
    for (let i = 0; i < firstDow; i++) {
      current.push({ isEmpty: true });
    }

    dateKeys.forEach((key) => {
      if (current.length === 7) {
        weeks.push(current);
        current = [];
      }
      const items = map.get(key) || [];
      const p = key.split('/').map((x) => parseInt(x, 10));
      const day = p[2];
      const dow = current.length;
      const isSun = dow === 0;
      const isSat = dow === 6;
      const defaultWork = !(isSun || isSat);
      const hasWork = items.length > 0 ? items.some((it) => it.workdayflag === 1) : defaultWork;
      current.push({
        isEmpty: false,
        ddateStr: key,
        day,
        isSun,
        isSat,
        isToday: key === todayKey,
        hasWork,
        items,
      });
    });

    while (current.length > 0 && current.length < 7) {
      current.push({ isEmpty: true });
    }
    if (current.length > 0) weeks.push(current);
    return weeks;
  }

  prevMonth(): void {
    let m = this.selectedMonth();
    let y = this.selectedYear();
    if (--m < 1) {
      m = 12;
      y--;
    }
    this.selectedMonth.set(m);
    this.selectedYear.set(y);
    this.load();
  }

  nextMonth(): void {
    let m = this.selectedMonth();
    let y = this.selectedYear();
    if (++m > 12) {
      m = 1;
      y++;
    }
    this.selectedMonth.set(m);
    this.selectedYear.set(y);
    this.load();
  }

  onGroupFilterChange(value: string | null): void {
    this.selectedGroupId.set(value);
    this.load();
  }

  private displayDate(ddateStr: string): string {
    const p = ddateStr.split('/');
    return `${p[2]}/${p[1]}/${p[0]}`;
  }

  async onDayClick(cell: CalendarCell): Promise<void> {
    if (cell.isEmpty || !cell.ddateStr) return;
    this.selectedDdateStr.set(cell.ddateStr);
    const groupId = this.effectiveGroupId();
    try {
      const item = await this.service.getDetail(cell.ddateStr, groupId);
      if (!item) {
        this.message.warning(this.i18n.t('ar.viewClassCalendar.msg.notFound', 'Không tìm thấy dữ liệu!'));
        return;
      }
      const prefix = this.i18n.t('ar.viewClassCalendar.modal.editTitlePrefix', 'Cập nhật');
      const groupLabel = this.i18n.t('ar.viewClassCalendar.modal.editTitleGroup', 'Nhóm');
      this.modalTitle.set(`${prefix} — ${this.displayDate(cell.ddateStr)} / ${groupLabel}: ${item.groupName || item.groupId}`);
      this.editArDateStr.set(item.arDateStr ?? cell.ddateStr);
      this.editGroupId.set(item.groupId ?? groupId);
      this.formWorkdayflag.set(item.workdayflag ?? 0);
      this.formShiftNo.set(item.shiftNo != null ? String(item.shiftNo) : null);
      this.formTypeid.set(item.typeid != null ? String(item.typeid) : null);
      this.formOvertypeid.set(item.overtypeid != null ? String(item.overtypeid) : null);
      this.formTypeidDefault.set(item.typeidDefault != null ? String(item.typeidDefault) : null);
      this.formOperationId.set(item.operationId ?? '');
      this.formOrderno.set(item.orderno ?? 0);
      this.formActivity.set(item.activity ?? 1);
      this.modalVisible.set(true);
    } catch {
      this.message.warning(this.i18n.t('ar.viewClassCalendar.msg.notFound', 'Không tìm thấy dữ liệu!'));
    }
  }

  closeModal(): void {
    this.modalVisible.set(false);
  }

  async saveRecord(): Promise<void> {
    const arDateStr = this.editArDateStr();
    if (!arDateStr) {
      this.message.warning(this.i18n.t('ar.viewCompanyCalendar.msg.invalidData', 'Dữ liệu không hợp lệ!'));
      return;
    }
    this.savingRecord.set(true);
    try {
      const res = await this.service.save({
        arDateStr,
        groupId: this.editGroupId(),
        workdayflag: this.formWorkdayflag(),
        shiftNo: this.formShiftNo(),
        typeid: this.formTypeid(),
        overtypeid: this.formOvertypeid(),
        typeidDefault: this.formTypeidDefault(),
        operationId: this.formOperationId().trim() || null,
        orderno: this.formOrderno() ?? 0,
        activity: this.formActivity(),
      });
      if (res.success) {
        this.message.success(res.message || this.i18n.t('common.saveSuccess', 'Lưu thành công'));
        this.modalVisible.set(false);
        await this.load();
      } else {
        this.message.error(res.error || this.i18n.t('common.saveFailed', 'Lưu thất bại.'));
      }
    } catch {
      this.message.error(this.i18n.t('common.saveFailed', 'Lưu thất bại.'));
    } finally {
      this.savingRecord.set(false);
    }
  }

  openAddModal(): void {
    this.addStartDate.set(null);
    this.addEndDate.set(null);
    this.addGroupId.set(this.selectedGroupId());
    this.addWorkShift.set(null);
    this.addRestShift.set(null);
    this.addModalVisible.set(true);
  }

  closeAddModal(): void {
    this.addModalVisible.set(false);
  }

  async saveAddBatch(): Promise<void> {
    const start = this.addStartDate();
    const end = this.addEndDate();
    const groupId = this.addGroupId();
    const workShift = this.addWorkShift();
    const restShift = this.addRestShift();
    if (!start || !end || !groupId || !workShift || !restShift) {
      this.message.warning(this.i18n.t('ar.viewClassCalendar.msg.requiredFields', 'Vui lòng điền đủ thông tin bắt buộc!'));
      return;
    }
    this.addSaving.set(true);
    try {
      const res = await this.service.saveBatch(
        formatDate(start, 'dd-MM-yyyy', 'en-US'),
        formatDate(end, 'dd-MM-yyyy', 'en-US'),
        groupId,
        workShift,
        restShift,
      );
      if (res.success) {
        this.message.success(res.message || this.i18n.t('ar.viewClassCalendar.msg.addSuccess', 'Thêm mới thành công!'));
        this.addModalVisible.set(false);
        await this.load();
      } else {
        this.message.error(res.error || this.i18n.t('common.saveFailed', 'Lưu thất bại.'));
      }
    } catch {
      this.message.error(this.i18n.t('ar.viewClassCalendar.msg.connectionError', 'Lỗi kết nối!'));
    } finally {
      this.addSaving.set(false);
    }
  }
}
