import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';

import { I18nService } from '../../../i18n/i18n.service';
import { EmployeeSearchResult, SstOtApplyService } from '../../ess/sst-ot-apply/sst-ot-apply.service';
import { ArEmpCalenderRow, EmpCalendarService } from './emp-calendar.service';

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
 * Lịch cá nhân (chỉ xem) - port lại từ
 * ar/attendanceSettings/viewEmpCalendar.html (đã xoá). Xem ghi chú chi tiết
 * về quyết định KHÔNG port tính năng click-để-sửa (dead code do `sysMode`
 * không bao giờ được set) trong EmpCalendarService.
 */
@Component({
  selector: 'app-emp-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, NzButtonModule, NzIconModule, NzSelectModule],
  templateUrl: './emp-calendar.component.html',
  styleUrl: './emp-calendar.component.scss',
})
export class EmpCalendarComponent implements OnInit {
  private readonly service = inject(EmpCalendarService);
  private readonly employeeService = inject(SstOtApplyService);
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

  protected readonly selectedPersonId = signal<string | null>(null);
  protected readonly selectedEmpLabel = signal<string | null>(null);
  protected readonly employeeOptions = signal<EmployeeSearchResult[]>([]);
  protected readonly employeeSearching = signal(false);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.load();
  }

  async onEmployeeSearch(keyword: string): Promise<void> {
    const kw = (keyword || '').trim();
    if (!kw) {
      this.employeeOptions.set([]);
      return;
    }
    this.employeeSearching.set(true);
    try {
      this.employeeOptions.set(await this.employeeService.searchEmployees(kw));
    } catch {
      this.employeeOptions.set([]);
    } finally {
      this.employeeSearching.set(false);
    }
  }

  onEmployeeSelected(personId: string | null): void {
    const found = this.employeeOptions().find((e) => e.personId === personId);
    this.selectedPersonId.set(personId);
    this.selectedEmpLabel.set(found ? `${found.empId} - ${found.localName}` : null);
    this.load();
  }

  clearEmployee(): void {
    this.selectedPersonId.set(null);
    this.selectedEmpLabel.set(null);
    this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const records = await this.service.getMonth(this.selectedYear(), this.selectedMonth(), this.selectedPersonId() ?? undefined);
      if (!this.selectedEmpLabel() && records.length > 0 && records[0].empId) {
        this.selectedEmpLabel.set(`${records[0].empId} - ${records[0].localName}`);
      }
      this.weeks.set(this.buildWeeks(records));
    } catch {
      this.weeks.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }

  private buildWeeks(records: ArEmpCalenderRow[]): CalendarCell[][] {
    if (!records || records.length === 0) return [];
    const today = new Date();
    const todayKey = toDateKey(today);

    const firstKey = (records[0].ddateStr || records[0].arDateStr || '').replace(/-/g, '/');
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
      const key = (rec.ddateStr || rec.arDateStr || '').replace(/-/g, '/');
      const p = key.split('/').map((x) => parseInt(x, 10));
      const day = p[2];
      const dow = current.length;
      const isSun = dow === 0;
      const isSat = dow === 6;
      const isWE = isSun || isSat;
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
        shiftLabel: rec.shiftName || rec.shiftNo || (!isWE && !isStat ? this.i18n.t('ar.viewCompanyCalendar.defaultShift', 'Ca hành chính') : undefined),
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
}
