import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';

import { I18nService } from '../../../i18n/i18n.service';
import { ArCalenderRow } from '../statutory-holidays/statutory-holidays.service';
import {
  COMPANY_CALENDAR_TYPE_PARENT_CODE,
  CompanyCalendarService,
  ShiftOption,
  SyCodeOption,
} from './company-calendar.service';

interface CalendarCell {
  isEmpty: boolean;
  ddateStr?: string;
  day?: number;
  isSun?: boolean;
  isSat?: boolean;
  isToday?: boolean;
  isRest?: boolean;
  isWork?: boolean;
  isStat?: boolean;
  shiftLabel?: string;
  typeidName?: string;
  remark?: string;
}

function toDateKey(d: Date): string {
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Lịch công ty dạng calendar-grid (không phải bảng) - port lại từ
 * ar/attendanceSettings/viewCompanyCalendar.html (đã xoá). Click 1 ô ngày để
 * xem/sửa; nút "Thêm mới" luôn mở modal cho ngày hôm nay (giữ đúng hành vi
 * `ccalOpenAddModal()` bản gốc). Backend dùng chung endpoint
 * `.../api/calender/holidays/{detail,save}` cho mọi loại ngày (không riêng
 * ngày lễ) - xem ghi chú trong CompanyCalendarService.
 */
@Component({
  selector: 'app-company-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzFormModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzModalModule,
    NzSelectModule,
  ],
  templateUrl: './company-calendar.component.html',
  styleUrl: './company-calendar.component.scss',
})
export class CompanyCalendarComponent implements OnInit {
  private readonly service = inject(CompanyCalendarService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly selectedYear = signal(new Date().getFullYear());
  protected readonly selectedMonth = signal(new Date().getMonth() + 1);
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
  protected readonly typeOptions = signal<SyCodeOption[]>([]);

  protected readonly modalVisible = signal(false);
  protected readonly modalTitle = signal('');
  protected readonly savingRecord = signal(false);

  protected readonly editDdateStr = signal<string | null>(null);
  protected readonly formWorkdayflag = signal(1);
  protected readonly formShiftNo = signal<string | null>(null);
  protected readonly formTypeid = signal<string | null>(null);
  protected readonly formOvertypeid = signal<string | null>(null);
  protected readonly formTypeidDefault = signal<string | null>(null);
  protected readonly formStatutoryFlag = signal(0);
  protected readonly formOperationId = signal('');
  protected readonly formOrderno = signal<number | null>(0);
  protected readonly formRemark = signal('');
  protected readonly formActivity = signal(1);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      const [shifts, types] = await Promise.all([
        this.service.getShiftList(),
        this.service.getCodeList(COMPANY_CALENDAR_TYPE_PARENT_CODE),
      ]);
      this.shiftOptions.set(shifts);
      this.typeOptions.set(types);
    } catch {
      this.shiftOptions.set([]);
      this.typeOptions.set([]);
    }
    await this.load();
  }

  typeLabel(t: SyCodeOption): string {
    return t.nameVi || t.codeName || t.codeNo;
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const records = await this.service.getMonth(this.selectedYear(), this.selectedMonth());
      this.weeks.set(this.buildWeeks(records));
    } catch {
      this.weeks.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }

  private buildWeeks(records: ArCalenderRow[]): CalendarCell[][] {
    if (!records || records.length === 0) return [];
    const today = new Date();
    const todayKey = toDateKey(today);

    const firstKey = (records[0].ddateStr || '').replace(/-/g, '/');
    const firstParts = firstKey.split('/').map((p) => parseInt(p, 10));
    const firstDow = new Date(firstParts[0], firstParts[1] - 1, firstParts[2]).getDay();

    const weeks: CalendarCell[][] = [];
    let current: CalendarCell[] = [];
    for (let i = 0; i < firstDow; i++) {
      current.push({ isEmpty: true });
    }

    records.forEach((rec) => {
      if (current.length === 7) {
        weeks.push(current);
        current = [];
      }
      const key = (rec.ddateStr || '').replace(/-/g, '/');
      const p = key.split('/').map((x) => parseInt(x, 10));
      const day = p[2];
      const dow = current.length;
      const isSun = dow === 0;
      const isSat = dow === 6;
      const isRest = rec.workdayflag === 0;
      const isWork = rec.workdayflag === 1;
      const isStat = rec.statutoryFlag === 1;
      current.push({
        isEmpty: false,
        ddateStr: key,
        day,
        isSun,
        isSat,
        isToday: key === todayKey,
        isRest,
        isWork,
        isStat,
        shiftLabel: rec.shiftName || rec.shiftNo || (isSun || isSat ? undefined : this.i18n.t('ar.viewCompanyCalendar.defaultShift', 'Ca hành chính')),
        typeidName: rec.typeidName,
        remark: rec.remark,
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

  async onDayClick(cell: CalendarCell): Promise<void> {
    if (cell.isEmpty || !cell.ddateStr) return;
    this.selectedDdateStr.set(cell.ddateStr);
    try {
      const data = await this.service.getByPk(cell.ddateStr);
      this.fillModal(data, cell.ddateStr, false);
    } catch {
      this.fillModal(null, cell.ddateStr, false);
    }
  }

  openAddModal(): void {
    const key = toDateKey(new Date());
    this.fillModal(null, key, true);
  }

  private displayDate(ddateStr: string): string {
    const p = ddateStr.split('/');
    return `${p[2]}/${p[1]}/${p[0]}`;
  }

  private fillModal(data: ArCalenderRow | null, ddateStr: string, forceAdd: boolean): void {
    this.modalTitle.set(
      `${forceAdd || !data ? this.i18n.t('common.addNew', 'Thêm mới') : this.i18n.t('common.edit', 'Cập nhật')} — ${this.displayDate(ddateStr)}`,
    );
    this.editDdateStr.set(ddateStr);

    if (data && !forceAdd) {
      this.formWorkdayflag.set(data.workdayflag ?? 0);
      this.formShiftNo.set(data.shiftNo ?? null);
      this.formTypeid.set(data.typeid ?? null);
      this.formOvertypeid.set(data.overtypeid ?? null);
      this.formTypeidDefault.set(data.typeidDefault ?? null);
      this.formStatutoryFlag.set(data.statutoryFlag ?? 0);
      this.formOperationId.set(data.operationId ?? '');
      this.formOrderno.set(data.orderno ?? 0);
      this.formRemark.set(data.remark ?? '');
      this.formActivity.set(data.activity ?? 1);
    } else {
      const p = ddateStr.split('/').map((x) => parseInt(x, 10));
      const d = new Date(p[0], p[1] - 1, p[2]);
      const dow = d.getDay();
      this.formWorkdayflag.set(dow === 0 || dow === 6 ? 0 : 1);
      this.formShiftNo.set(null);
      this.formTypeid.set(null);
      this.formOvertypeid.set(null);
      this.formTypeidDefault.set(null);
      this.formStatutoryFlag.set(0);
      this.formOperationId.set('');
      this.formOrderno.set(0);
      this.formRemark.set('');
      this.formActivity.set(1);
    }

    this.modalVisible.set(true);
  }

  closeModal(): void {
    this.modalVisible.set(false);
  }

  async saveRecord(): Promise<void> {
    const ddateStr = this.editDdateStr();
    if (!ddateStr) {
      this.message.warning(this.i18n.t('ar.viewCompanyCalendar.msg.invalidData', 'Dữ liệu không hợp lệ!'));
      return;
    }
    const payload: ArCalenderRow = {
      ddateStr,
      workdayflag: this.formWorkdayflag(),
      shiftNo: this.formShiftNo() || undefined,
      typeid: this.formTypeid() || undefined,
      overtypeid: this.formOvertypeid() || undefined,
      typeidDefault: this.formTypeidDefault() || undefined,
      statutoryFlag: this.formStatutoryFlag(),
      operationId: this.formOperationId().trim() || undefined,
      orderno: this.formOrderno() ?? 0,
      remark: this.formRemark().trim() || undefined,
      activity: this.formActivity(),
    };
    this.savingRecord.set(true);
    try {
      const res = await this.service.save(payload);
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
}
