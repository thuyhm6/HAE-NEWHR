import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import { EduTrainSyllabusRow } from '../edu-plan-manager/edu-plan-manager.service';
import { EduCommonService } from '../shared/edu-common.service';
import { eduClassUnitLabel, eduCourseTitle } from '../shared/edu-labels';
import { EduCalendarDetail, EduCalendarItem, EduTrainCalendarService } from './edu-train-calendar.service';

import { TABLE_PAGE_SIZE_OPTIONS, TABLE_DEFAULT_PAGE_SIZE } from '../../../core/config/table-pagination.config';
interface EtcalCell {
  /** null = ô trống đầu/cuối tuần ngoài tháng */
  day: number | null;
  /** DD/MM/YYYY */
  dateKey?: string;
  isToday?: boolean;
  isSun?: boolean;
  isSat?: boolean;
  items: EduCalendarItem[];
}

/**
 * Lịch đào tạo - port từ /edu/trainfile/trainCalendar (Hanwha_HTSV: trainCalendar.jsp,
 * trainCalendarDetail.jsp, syllabusInfo.jsp). Lưới tháng liệt kê các kế hoạch có lịch học;
 * bấm vào kế hoạch để xem chi tiết + lịch học (dòng của ngày đang chọn được tô sáng).
 * Modal đóng khi bấm ra ngoài vùng modal (nzMaskClosable).
 * Route data `personal: true` = Lịch đào tạo cá nhân (/edu/trainfile/personalTrainCalendar,
 * personalTrainCalendar.jsp bản gốc): cùng giao diện, chỉ hiện kế hoạch mà người đăng nhập là học viên.
 */
@Component({
  selector: 'app-edu-train-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzDescriptionsModule,
    NzIconModule,
    NzModalModule,
    NzSelectModule,
    NzTableModule,
  ],
  templateUrl: './edu-train-calendar.component.html',
  styleUrl: './edu-train-calendar.component.scss',
})
export class EduTrainCalendarComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
  protected readonly defaultPageSize = TABLE_DEFAULT_PAGE_SIZE;

  private readonly service = inject(EduTrainCalendarService);
  private readonly common = inject(EduCommonService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);
  private readonly route = inject(ActivatedRoute);

  /** Lịch cá nhân (actionType=personal bản gốc). */
  protected readonly personal = this.route.snapshot.data['personal'] === true;

  /** Bản gốc: ait:date yearMinus=10 / yearPlus=10 */
  protected readonly years: number[] = (() => {
    const y = new Date().getFullYear();
    return Array.from({ length: 21 }, (_, i) => y - 10 + i);
  })();
  protected readonly months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  protected readonly year = signal(new Date().getFullYear());
  protected readonly month = signal(new Date().getMonth() + 1);
  protected readonly loading = signal(false);
  protected readonly items = signal<EduCalendarItem[]>([]);

  protected readonly weeks = computed(() => this.buildWeeks(this.year(), this.month(), this.items()));

  // ===== Modal chi tiết =====
  protected readonly detailVisible = signal(false);
  protected readonly detailLoading = signal(false);
  protected readonly detail = signal<EduCalendarDetail | null>(null);
  protected readonly detailDate = signal<string | null>(null);

  protected readonly evaluateOptions = [
    { value: '1', key: 'edu.trainResult.SHIFOUXUYAOXUEYUANPINGJIA.a', fallback: 'Đánh giá học viên' },
    { value: '2', key: 'edu.trainResult.SHIFOUXUYAOJIANGSHIPINGJIA.a', fallback: 'Đánh giá giảng viên' },
    { value: '3', key: 'edu.planManager.SHIFOUXUYAOPEIXUNPINGJIA.a', fallback: 'Đánh giá đào tạo' },
  ];

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      this.items.set(await this.service.getMonth(this.year(), this.month(), this.personal));
    } catch {
      this.items.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }

  onYearChange(value: number): void {
    this.year.set(value);
    this.load();
  }

  onMonthChange(value: number): void {
    this.month.set(value);
    this.load();
  }

  prevMonth(): void {
    this.shiftMonth(-1);
  }

  nextMonth(): void {
    this.shiftMonth(1);
  }

  private shiftMonth(delta: number): void {
    const d = new Date(this.year(), this.month() - 1 + delta, 1);
    this.year.set(d.getFullYear());
    this.month.set(d.getMonth() + 1);
    this.load();
  }

  goToday(): void {
    const now = new Date();
    this.year.set(now.getFullYear());
    this.month.set(now.getMonth() + 1);
    this.load();
  }

  private buildWeeks(year: number, month: number, items: EduCalendarItem[]): EtcalCell[][] {
    const byDate = new Map<string, EduCalendarItem[]>();
    items.forEach((it) => byDate.set(it.courseDate, [...(byDate.get(it.courseDate) ?? []), it]));

    const todayKey = this.common.formatDate(new Date());
    const first = new Date(year, month - 1, 1);
    const daysInMonth = new Date(year, month, 0).getDate();
    const cells: EtcalCell[] = Array.from({ length: first.getDay() }, () => ({ day: null, items: [] }));
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month - 1, d);
      const key = this.common.formatDate(date)!;
      cells.push({
        day: d,
        dateKey: key,
        isToday: key === todayKey,
        isSun: date.getDay() === 0,
        isSat: date.getDay() === 6,
        items: byDate.get(key) ?? [],
      });
    }
    while (cells.length % 7 !== 0) cells.push({ day: null, items: [] });

    const weeks: EtcalCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    return weeks;
  }

  protected itemTitle(it: EduCalendarItem): string {
    return eduCourseTitle(this.i18n, it.courseNameCode, it.periodTime);
  }

  async openDetail(it: EduCalendarItem, dateKey: string): Promise<void> {
    this.detailDate.set(dateKey);
    this.detail.set(null);
    this.detailVisible.set(true);
    this.detailLoading.set(true);
    try {
      this.detail.set(await this.service.getDetail(it.planNo));
    } catch {
      this.detailVisible.set(false);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.detailLoading.set(false);
    }
  }

  closeDetail(): void {
    this.detailVisible.set(false);
  }

  protected classUnitLabel(unit?: string | null): string {
    return eduClassUnitLabel(this.i18n, unit);
  }

  protected yesNo(value?: string | null): string {
    return value === 'Y'
      ? this.i18n.t('ar.viewcycle.content.yes', 'Có')
      : this.i18n.t('ar.viewcycle.content.no', 'Không');
  }

  /** ISNOT_EVALUATE dạng "1,2,3" - bản gốc hiển thị Có/Không cho từng loại đánh giá. */
  protected hasEvaluate(csv: string | null | undefined, value: string): string {
    return this.yesNo(this.common.splitCsv(csv).includes(value) ? 'Y' : 'N');
  }

  protected isDetailDate(s: EduTrainSyllabusRow): boolean {
    return !!s.courseDate && s.courseDate === this.detailDate();
  }
}
