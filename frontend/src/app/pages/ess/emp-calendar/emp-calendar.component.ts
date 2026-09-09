import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';

import { I18nService } from '../../../i18n/i18n.service';
import { ArEmpCalenderDto, EmpCalendarService } from './emp-calendar.service';

interface CalendarDayCell {
  isEmpty: boolean;
  dateKey?: string;
  day?: number;
  dayOfWeek?: number;
  isToday?: boolean;
  isRest?: boolean;
  isHoliday?: boolean;
  statusLabelKey?: string;
  statusLabelFallback?: string;
  tags?: { labelKey: string; labelFallback: string; cls: string }[];
  shiftTagLabel?: string;
  remark?: string;
}

const MONTH_KEYS = [
  '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12',
] as const;

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

/**
 * Lịch làm việc cá nhân (chỉ xem, không sửa) - port lại từ
 * ess/viewDept/viewEmpCalendar.html (Thymeleaf, đã xoá) sang Angular. Tái sử
 * dụng đúng 2 API JSON sẵn có (myInfo + calender/emp/month) mà bản Thymeleaf
 * cũ dùng. Không phải dữ liệu dạng bảng nên không dùng nz-table, giữ nguyên
 * kiểu lưới lịch (CSS grid) như bản gốc.
 */
@Component({
  selector: 'app-emp-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, NzButtonModule, NzCardModule, NzIconModule, NzSelectModule],
  templateUrl: './emp-calendar.component.html',
  styleUrl: './emp-calendar.component.scss',
})
export class EmpCalendarComponent implements OnInit {
  private readonly service = inject(EmpCalendarService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly year = signal(new Date().getFullYear());
  protected readonly month = signal(new Date().getMonth() + 1);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly weeks = signal<CalendarDayCell[][]>([]);

  protected readonly monthKeys = MONTH_KEYS;
  protected readonly dayKeys = DAY_KEYS;
  protected readonly yearOptions: number[];

  private personId = '';

  constructor() {
    const currentYear = new Date().getFullYear();
    this.yearOptions = Array.from({ length: 11 }, (_, idx) => currentYear - 5 + idx);
  }

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      const info = await this.service.getMyInfo();
      if (!info?.personId) {
        this.errorMessage.set(this.i18n.t('esscal.msg.empNotFound', 'Không tìm thấy thông tin nhân viên.'));
        return;
      }
      this.personId = info.personId;
      await this.load();
    } catch {
      this.message.error(this.i18n.t('esscal.msg.loadEmpFailed', 'Không lấy được thông tin nhân viên!'));
    }
  }

  prevMonth(): void {
    let m = this.month() - 1;
    let y = this.year();
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    this.month.set(m);
    this.year.set(y);
    this.load();
  }

  nextMonth(): void {
    let m = this.month() + 1;
    let y = this.year();
    if (m > 12) {
      m = 1;
      y += 1;
    }
    this.month.set(m);
    this.year.set(y);
    this.load();
  }

  async load(): Promise<void> {
    if (!this.personId) {
      return;
    }
    this.loading.set(true);
    this.errorMessage.set(null);
    try {
      const records = await this.service.getMonth(this.year(), this.month(), this.personId);
      this.weeks.set(this.buildWeeks(records ?? []));
    } catch {
      this.errorMessage.set(this.i18n.t('esscal.msg.loadError', 'Lỗi tải lịch!'));
      this.weeks.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  private buildWeeks(records: ArEmpCalenderDto[]): CalendarDayCell[][] {
    if (!records.length) {
      return [];
    }

    const today = new Date();
    const todayKey = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;

    const cells: CalendarDayCell[] = [];

    const firstKey = (records[0].ddateStr || records[0].ddateFormatted || '').replace(/-/g, '/');
    const firstParts = firstKey.split('/').map(Number);
    const firstDow = new Date(firstParts[0], firstParts[1] - 1, firstParts[2]).getDay();
    for (let i = 0; i < firstDow; i++) {
      cells.push({ isEmpty: true });
    }

    records.forEach((rec, index) => {
      const key = (rec.ddateStr || rec.ddateFormatted || '').replace(/-/g, '/');
      const parts = key.split('/').map(Number);
      const day = parts[2];
      const dow = (firstDow + index) % 7;
      const isSun = dow === 0;
      const isSat = dow === 6;
      const isWeekend = isSun || isSat;
      const isToday = key === todayKey;
      const isRest = rec.workdayflag === 0;
      const isHoliday = rec.statutoryFlag === 1;

      const tags: CalendarDayCell['tags'] = [];
      tags.push(
        isWeekend
          ? { labelKey: 'esscal.status.weekend', labelFallback: 'Cuối tuần', cls: 'ecal-tag-we' }
          : { labelKey: 'esscal.status.weekday', labelFallback: 'Ngày thường', cls: 'ecal-tag-wd' },
      );
      if (isHoliday) {
        tags.push({ labelKey: 'esscal.status.holidayStar', labelFallback: '★ Lễ', cls: 'ecal-tag-hol' });
      }

      let shiftTagLabel: string | undefined;
      if (rec.shiftName || rec.shiftNo) {
        shiftTagLabel = rec.shiftName || rec.shiftNo;
      } else if (!isWeekend && !isHoliday) {
        shiftTagLabel = this.i18n.t('esscal.status.adminShift', 'Ca hành chính');
      }

      cells.push({
        isEmpty: false,
        dateKey: key,
        day,
        dayOfWeek: dow,
        isToday,
        isRest,
        isHoliday,
        statusLabelKey: isHoliday ? 'esscal.status.holiday' : isRest ? 'esscal.status.rest' : 'esscal.status.work',
        statusLabelFallback: isHoliday ? 'Ngày lễ' : isRest ? 'Nghỉ' : 'Làm việc',
        tags,
        shiftTagLabel,
        remark: rec.remark,
      });
    });

    const weeks: CalendarDayCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      const week = cells.slice(i, i + 7);
      while (week.length < 7) {
        week.push({ isEmpty: true });
      }
      weeks.push(week);
    }
    return weeks;
  }
}
