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
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import { EduCommonService } from '../shared/edu-common.service';
import { EduCourseSummaryComponent, EduCourseSummaryData } from '../shared/edu-course-summary/edu-course-summary.component';
import { EDU_EVAL_STUDENT, EduEvalCourse, EduEvalStudent, EduEvaluateService } from '../shared/edu-evaluate.service';
import { showEduImportResult } from '../shared/edu-import-feedback';
import { eduClassUnitLabel, eduCourseTitle } from '../shared/edu-labels';

import { TABLE_PAGE_SIZE_OPTIONS, TABLE_DEFAULT_PAGE_SIZE } from '../../../core/config/table-pagination.config';
const MODULE = 'studentEvaluate';

/**
 * Đánh giá học viên (nhập điểm thi) - port từ /edu/traineducation/studentEvaluate (Hanwha_HTSV:
 * studentEvaluate.jsp / studentEvaluateInfo.jsp / studentEvaluateSingle.jsp).
 * - Chỉ các khóa có yêu cầu "Đánh giá học viên"; người không thuộc nhóm quản trị/phụ trách đào tạo
 *   chỉ thấy khóa mình là giảng viên đánh giá (lọc ở backend như bản gốc).
 * - Popup đánh giá: nhập điểm (0-100), import/xuất Excel, tải file mẫu.
 * Modal đóng khi bấm ra ngoài vùng modal (nzMaskClosable).
 */
@Component({
  selector: 'app-edu-student-evaluate',
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
    NzInputNumberModule,
    NzModalModule,
    NzTableModule,
    EduCourseSummaryComponent,
  ],
  templateUrl: './edu-student-evaluate.component.html',
  styleUrl: './edu-student-evaluate.component.scss',
})
export class EduStudentEvaluateComponent implements OnInit {
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
  protected readonly students = signal<EduEvalStudent[]>([]);
  protected readonly scores = signal<Record<string, number | null>>({});
  protected readonly evalLoading = signal(false);
  protected readonly saving = signal(false);
  protected readonly importing = signal(false);

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
        await this.service.getCourses(EDU_EVAL_STUDENT, this.common.formatDate(this.searchStart()), this.common.formatDate(this.searchEnd())),
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
      const [course, students] = await Promise.all([this.service.getCourse(no), this.service.getStudents(no)]);
      this.evalCourse.set(course);
      this.setStudents(students);
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.evalLoading.set(false);
    }
  }

  private setStudents(list: EduEvalStudent[]): void {
    this.students.set(list);
    const map: Record<string, number | null> = {};
    list.forEach((s) => (map[s.freeNo] = s.evaResult != null && s.evaResult !== '' ? Number(s.evaResult) : null));
    this.scores.set(map);
  }

  setScore(freeNo: string, value: number | null): void {
    this.scores.set({ ...this.scores(), [freeNo]: value });
  }

  async save(): Promise<void> {
    const no = this.evalBasicNo();
    if (!no) return;
    const payload: Record<string, string> = {};
    Object.entries(this.scores()).forEach(([k, v]) => (payload[k] = v == null ? '' : String(v)));
    if (!Object.values(payload).some((v) => v !== '')) {
      this.message.warning(this.i18n.t('edu.studentEvaluate.QINGXIANTIANJIAKAOSHICHENGJI.a', 'Thêm điểm số sau đó lưu!'));
      return;
    }
    this.saving.set(true);
    try {
      const res = await this.service.saveStudentScores(no, payload);
      if (res.success) {
        this.message.success(this.i18n.t('common.saveSuccess', 'Lưu thành công'));
        this.evalVisible.set(false);
        await this.search();
      } else {
        this.message.error(res.message || this.i18n.t('common.saveFailed', 'Lưu thất bại.'));
      }
    } catch {
      this.message.error(this.i18n.t('common.saveFailed', 'Lưu thất bại.'));
    } finally {
      this.saving.set(false);
    }
  }

  async onImportFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    const no = this.evalBasicNo();
    if (!file || !no) return;
    this.importing.set(true);
    try {
      const res = await this.service.importExcel(MODULE, file, { basicNo: no });
      if (showEduImportResult(res, this.i18n, this.message, this.modal)) {
        this.setStudents(await this.service.getStudents(no));
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

  exportExcel(): void {
    const no = this.evalBasicNo();
    if (no) window.location.href = this.service.exportUrl(MODULE, no);
  }
}
