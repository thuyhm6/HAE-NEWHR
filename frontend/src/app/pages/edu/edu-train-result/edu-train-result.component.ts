import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import { EduAttachmentComponent } from '../shared/edu-attachment/edu-attachment.component';
import { EDU_FILE_TYPE_RESULT, EduCommonService, EduFile } from '../shared/edu-common.service';
import { EduCourseSummaryComponent, EduCourseSummaryData } from '../shared/edu-course-summary/edu-course-summary.component';
import { EDU_EVAL_RESULT, EduEvalCourse, EduEvaluateService, EduScoreStat, EduTrainResult } from '../shared/edu-evaluate.service';
import { showEduImportResult } from '../shared/edu-import-feedback';
import { eduClassUnitLabel, eduCourseTitle } from '../shared/edu-labels';

import { TABLE_PAGE_SIZE_OPTIONS, TABLE_DEFAULT_PAGE_SIZE } from '../../../core/config/table-pagination.config';
const MODULE = 'trainResult';

/**
 * Kết quả đào tạo (học viên đánh giá khóa học) - port từ /edu/traineducation/trainResult (Hanwha_HTSV:
 * trainResult.jsp / trainResultTSTOInfo.jsp / alreadyTrainResultInfoSingle.jsp / checkTrainResultTSTOInfoPer.jsp).
 * - Chỉ các khóa có yêu cầu "Đánh giá khóa học"; người không thuộc nhóm quản trị/phụ trách đào tạo
 *   chỉ thấy khóa mình là học viên (lọc ở backend như bản gốc).
 * - Popup đánh giá: thống kê theo tiêu chí, danh sách người đánh giá, báo cáo đào tạo (file), import Excel.
 * - Popup xem: danh sách phiếu đã đánh giá + xuất Excel.
 * Modal đóng khi bấm ra ngoài vùng modal (nzMaskClosable).
 */
@Component({
  selector: 'app-edu-train-result',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCardModule,
    NzDatePickerModule,
    NzFormModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzTableModule,
    EduAttachmentComponent,
    EduCourseSummaryComponent,
  ],
  templateUrl: './edu-train-result.component.html',
  styleUrl: './edu-train-result.component.scss',
})
export class EduTrainResultComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
  protected readonly defaultPageSize = TABLE_DEFAULT_PAGE_SIZE;

  private readonly service = inject(EduEvaluateService);
  protected readonly common = inject(EduCommonService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  /** Nhãn tiêu chí theo mã trả về từ backend (EduEvaluateServiceImpl.CRITERIA_*). */
  private readonly criteriaLabels: Record<string, [string, string]> = {
    DIFFICULTY: ['edu.trainResult.KECHENGDEZHENGTIMANYIDU.a', 'Mức độ hài lòng'],
    CONTENT_RICH: ['edu.trainResult.KECHENGYIZHANGWODECHENGDU.a', 'Mức độ khó dễ'],
    TIME_MODERATE: ['edu.trainResult.KECHENGDESHIJIANCHANGDU.a', 'Thời gian học'],
    PRACTICABILITY: ['edu.trainResult.KECHENGNEIRONGSHIFOUSHIYONG.a', 'Nội dung đào tạo thực dụng không'],
  };

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

  // ===== Popup đánh giá =====
  protected readonly evalVisible = signal(false);
  protected readonly basicNo = signal<string | null>(null);
  protected readonly course = signal<EduCourseSummaryData | null>(null);
  protected readonly stats = signal<EduScoreStat[]>([]);
  protected readonly reportFiles = signal<EduFile[]>([]);
  protected readonly evalLoading = signal(false);
  protected readonly importing = signal(false);
  protected readonly uploading = signal(false);

  // ===== Popup danh sách người đánh giá / xem =====
  protected readonly resultsVisible = signal(false);
  protected readonly resultsReadonlyView = signal(false);
  protected readonly results = signal<EduTrainResult[]>([]);
  protected readonly resultsLoading = signal(false);

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

  protected criteriaLabel(key: string): string {
    const l = this.criteriaLabels[key];
    return l ? this.i18n.t(l[0], l[1]) : key;
  }

  async search(): Promise<void> {
    this.listLoading.set(true);
    try {
      this.rows.set(
        await this.service.getCourses(EDU_EVAL_RESULT, this.common.formatDate(this.searchStart()), this.common.formatDate(this.searchEnd())),
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

  private async loadCourse(basicNo: string): Promise<void> {
    this.basicNo.set(basicNo);
    this.course.set(await this.service.getCourse(basicNo));
  }

  // ===== Đánh giá (trainResultTSTOInfo) =====
  async openEvaluate(row: EduEvalCourse): Promise<void> {
    if (!row.canEvaluate) return;
    this.evalVisible.set(true);
    this.evalLoading.set(true);
    try {
      await this.loadCourse(row.basicNo);
      const [stats, files] = await Promise.all([
        this.service.getResultStats(row.basicNo),
        this.common.getFiles(EDU_FILE_TYPE_RESULT, row.basicNo),
      ]);
      this.stats.set(stats);
      this.reportFiles.set(files);
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.evalLoading.set(false);
    }
  }

  async reloadReportFiles(): Promise<void> {
    const no = this.basicNo();
    if (no) this.reportFiles.set(await this.common.getFiles(EDU_FILE_TYPE_RESULT, no));
  }

  /** Báo cáo đào tạo: khóa đã tồn tại nên upload ngay khi chọn file (bản gốc: uploadAttDialog_new). */
  async onReportFilesSelected(files: File[]): Promise<void> {
    const no = this.basicNo();
    if (!no || !files.length) return;
    this.uploading.set(true);
    try {
      const res = await this.common.uploadFiles(EDU_FILE_TYPE_RESULT, no, files);
      if (!res.success) {
        this.message.error(this.i18n.t('edu.common.uploadFailed', 'Đã lưu dữ liệu nhưng tải file đính kèm thất bại.'));
      }
      await this.reloadReportFiles();
    } catch {
      this.message.error(this.i18n.t('edu.common.uploadFailed', 'Đã lưu dữ liệu nhưng tải file đính kèm thất bại.'));
    } finally {
      this.uploading.set(false);
    }
  }

  async onImportFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    const no = this.basicNo();
    if (!file || !no) return;
    this.importing.set(true);
    try {
      const res = await this.service.importExcel(MODULE, file, { basicNo: no });
      if (showEduImportResult(res, this.i18n, this.message, this.modal)) {
        this.stats.set(await this.service.getResultStats(no));
        await this.search();
      }
    } catch {
      this.message.error(this.i18n.t('edu.common.importFailed', 'Import thất bại.'));
    } finally {
      this.importing.set(false);
    }
  }

  downloadTemplate(): void {
    window.location.href = this.service.templateUrl(MODULE);
  }

  // ===== Danh sách phiếu (checkTrainResultTSTOInfoPer / alreadyTrainResultInfoSingle) =====
  /** readonlyView = true: popup "Xem" ở danh sách (chỉ phiếu đã đánh giá, có file + xuất Excel). */
  async openResults(basicNo: string, readonlyView: boolean): Promise<void> {
    this.resultsReadonlyView.set(readonlyView);
    this.resultsVisible.set(true);
    this.resultsLoading.set(true);
    try {
      if (readonlyView) await this.loadCourse(basicNo);
      this.results.set(await this.service.getTrainResults(basicNo, readonlyView));
    } catch {
      this.results.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.resultsLoading.set(false);
    }
  }

  exportExcel(): void {
    const no = this.basicNo();
    if (no) window.location.href = this.service.exportUrl(MODULE, no);
  }
}
