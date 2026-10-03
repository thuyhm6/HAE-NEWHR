import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import { EduCommonService } from '../shared/edu-common.service';
import { EduCourseSummaryComponent, EduCourseSummaryData } from '../shared/edu-course-summary/edu-course-summary.component';
import {
  EDU_EVAL_TEACHER,
  EduEvalCourse,
  EduEvaluateService,
  EduScoreStat,
  EduTeacherCheck,
} from '../shared/edu-evaluate.service';
import { showEduImportResult } from '../shared/edu-import-feedback';
import { eduClassUnitLabel, eduCourseTitle } from '../shared/edu-labels';

import { TABLE_PAGE_SIZE_OPTIONS, TABLE_DEFAULT_PAGE_SIZE } from '../../../core/config/table-pagination.config';
const MODULE = 'teacherEvaluate';

/**
 * Đánh giá giảng viên - port từ /edu/traineducation/teacherEvaluate (Hanwha_HTSV:
 * teacherEvaluate.jsp / teacherEvaluateTSTOInfo.jsp / teacherEvaluateTSTOSingle.jsp / teacherTSTOChakan.jsp).
 * - Chỉ các khóa có yêu cầu "Đánh giá giảng viên"; người không thuộc nhóm quản trị/phụ trách đào tạo
 *   chỉ thấy khóa mình là học viên (lọc ở backend như bản gốc).
 * - Popup đánh giá: thống kê tỉ lệ 5 mức theo từng giảng viên, xem phiếu, import điểm theo giảng viên.
 * Modal đóng khi bấm ra ngoài vùng modal (nzMaskClosable).
 */
@Component({
  selector: 'app-edu-teacher-evaluate',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCardModule,
    NzDatePickerModule,
    NzDescriptionsModule,
    NzFormModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzTableModule,
    EduCourseSummaryComponent,
  ],
  templateUrl: './edu-teacher-evaluate.component.html',
  styleUrl: './edu-teacher-evaluate.component.scss',
})
export class EduTeacherEvaluateComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
  protected readonly defaultPageSize = TABLE_DEFAULT_PAGE_SIZE;

  private readonly service = inject(EduEvaluateService);
  private readonly common = inject(EduCommonService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly searchStart = signal<Date | null>(null);
  protected readonly searchEnd = signal<Date | null>(null);
  protected readonly keyword = signal('');
  protected readonly listLoading = signal(false);
  protected readonly rows = signal<EduEvalCourse[]>([]);
  protected readonly selectedNo = signal<string | null>(null);

  protected readonly filteredRows = computed(() => {
    const kw = this.keyword().trim().toLowerCase();
    if (!kw) return this.rows();
    return this.rows().filter((r) => [r.trainTypeCodeName, r.courseNameCode].some((v) => (v ?? '').toLowerCase().includes(kw)));
  });

  // ===== Popup đánh giá / xem =====
  protected readonly evalVisible = signal(false);
  protected readonly evalReadonly = signal(false);
  protected readonly evalBasicNo = signal<string | null>(null);
  protected readonly evalCourse = signal<EduCourseSummaryData | null>(null);
  protected readonly stats = signal<EduScoreStat[]>([]);
  protected readonly evalLoading = signal(false);
  protected readonly importing = signal<string | null>(null);
  private importTeacher: string | null = null;

  // ===== Popup phiếu đánh giá của 1 giảng viên =====
  protected readonly checksVisible = signal(false);
  protected readonly checksTeacher = signal<EduScoreStat | null>(null);
  protected readonly checks = signal<EduTeacherCheck[]>([]);
  protected readonly checksLoading = signal(false);
  protected readonly averageScore = computed(() => {
    const scores = this.checks()
      .map((c) => Number(c.grooming))
      .filter((v) => !isNaN(v) && v > 0);
    return scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  });

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.search();
  }

  protected unitLabel(unit?: string | null): string {
    return eduClassUnitLabel(this.i18n, unit);
  }

  protected courseTitle(name?: string | null, period?: string | null): string {
    return eduCourseTitle(this.i18n, name, period);
  }

  async search(): Promise<void> {
    this.listLoading.set(true);
    try {
      this.rows.set(
        await this.service.getCourses(EDU_EVAL_TEACHER, this.common.formatDate(this.searchStart()), this.common.formatDate(this.searchEnd())),
      );
      this.selectedNo.set(null);
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.listLoading.set(false);
    }
  }

  clearSearch(): void {
    this.searchStart.set(null);
    this.searchEnd.set(null);
    this.keyword.set('');
    this.search();
  }

  selectRow(row: EduEvalCourse): void {
    this.selectedNo.set(row.basicNo);
  }

  async openEvaluate(basicNo?: string | null, readonly = false): Promise<void> {
    const no = basicNo ?? this.selectedNo();
    if (!no) {
      this.message.warning(this.i18n.t('edu.systemManager.QINGXUANZEQIZHONGYIXIANG.a', 'Xin chọn 1 hạng mục!'));
      return;
    }
    this.evalBasicNo.set(no);
    this.evalReadonly.set(readonly);
    this.evalVisible.set(true);
    this.evalLoading.set(true);
    try {
      const [course, stats] = await Promise.all([this.service.getCourse(no), this.service.getTeacherStats(no)]);
      this.evalCourse.set(course);
      this.stats.set(stats);
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.evalLoading.set(false);
    }
  }

  async openChecks(stat: EduScoreStat): Promise<void> {
    const no = this.evalBasicNo();
    if (!no) return;
    this.checksTeacher.set(stat);
    this.checksVisible.set(true);
    this.checksLoading.set(true);
    try {
      this.checks.set(await this.service.getTeacherChecks(no, stat.key));
    } catch {
      this.checks.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.checksLoading.set(false);
    }
  }

  startImport(teaEmpid: string, input: HTMLInputElement): void {
    this.importTeacher = teaEmpid;
    input.click();
  }

  async onImportFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    const no = this.evalBasicNo();
    const teaEmpid = this.importTeacher;
    if (!file || !no || !teaEmpid) return;
    this.importing.set(teaEmpid);
    try {
      const res = await this.service.importExcel(MODULE, file, { basicNo: no, teaEmpid });
      if (showEduImportResult(res, this.i18n, this.message, this.modal)) {
        this.stats.set(await this.service.getTeacherStats(no));
      }
    } catch {
      this.message.error(this.i18n.t('edu.common.importFailed', 'Import thất bại.'));
    } finally {
      this.importing.set(null);
    }
  }

  downloadTemplate(): void {
    window.location.href = this.service.templateUrl(MODULE);
  }

  exportExcel(): void {
    const no = this.evalBasicNo();
    if (no) window.location.href = this.service.exportUrl(MODULE, no);
  }
}
