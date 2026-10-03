import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';

import { I18nService } from '../../../i18n/i18n.service';
import { EduCommonService } from '../shared/edu-common.service';
import { eduClassUnitLabel, eduCourseTitle } from '../shared/edu-labels';
import { EduTrainArchiveQuery, EduTrainArchiveRow, EduTrainArchivesService } from './edu-train-archives.service';

import { TABLE_PAGE_SIZE_OPTIONS } from '../../../core/config/table-pagination.config';
/**
 * Hồ sơ đào tạo - port từ /edu/traineducation/trainArchives (Hanwha_HTSV: trainArchives.jsp).
 * Tra cứu lịch sử đào tạo của nhân viên (mặc định trong tháng hiện tại), tải file báo cáo,
 * xuất Excel (.xlsx - thay cho SQL_SEQMEAN=164 bản gốc).
 */
@Component({
  selector: 'app-edu-train-archives',
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
    NzTableModule,
    NzTreeSelectModule,
  ],
  templateUrl: './edu-train-archives.component.html',
  styleUrl: './edu-train-archives.component.scss',
})
export class EduTrainArchivesComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;

  private readonly service = inject(EduTrainArchivesService);
  private readonly common = inject(EduCommonService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly deptNodes = signal<NzTreeNodeOptions[]>([]);

  // ===== Bộ lọc (mặc định đầu - cuối tháng hiện tại như bản gốc) =====
  protected readonly searchKeyword = signal('');
  protected readonly searchDept = signal<string | null>(null);
  protected readonly searchCourse = signal('');
  protected readonly searchStart = signal<Date | null>(this.firstOfMonth());
  protected readonly searchEnd = signal<Date | null>(this.lastOfMonth());
  protected readonly searchContent = signal('');

  protected readonly keyword = signal('');
  protected readonly listLoading = signal(false);
  protected readonly rows = signal<EduTrainArchiveRow[]>([]);

  protected readonly filteredRows = computed(() => {
    const kw = this.keyword().trim().toLowerCase();
    if (!kw) return this.rows();
    return this.rows().filter((r) =>
      [r.empid, r.localName, r.deptName, r.postGradeName, r.courseNameCode, r.trainContent, r.trainAddress, r.departManaName]
        .some((v) => (v ?? '').toLowerCase().includes(kw)),
    );
  });

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    this.loadDeptTree();
    await this.search();
  }

  private firstOfMonth(): Date {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }

  private lastOfMonth(): Date {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 0);
  }

  private async loadDeptTree(): Promise<void> {
    try {
      this.deptNodes.set(this.common.buildDeptTree(await this.common.getDeptTree()));
    } catch {
      this.deptNodes.set([]);
    }
  }

  private buildQuery(): EduTrainArchiveQuery {
    return {
      keyword: this.searchKeyword(),
      deptNo: this.searchDept(),
      courseName: this.searchCourse(),
      startDate: this.common.formatDate(this.searchStart()),
      endDate: this.common.formatDate(this.searchEnd()),
      trainContent: this.searchContent(),
    };
  }

  async search(): Promise<void> {
    this.listLoading.set(true);
    try {
      this.rows.set(await this.service.getList(this.buildQuery()));
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.listLoading.set(false);
    }
  }

  clearSearch(): void {
    this.searchKeyword.set('');
    this.searchDept.set(null);
    this.searchCourse.set('');
    this.searchStart.set(this.firstOfMonth());
    this.searchEnd.set(this.lastOfMonth());
    this.searchContent.set('');
    this.keyword.set('');
    this.search();
  }

  exportExcel(): void {
    window.location.href = this.service.exportUrl(this.buildQuery());
  }

  protected courseTitle(r: EduTrainArchiveRow): string {
    return eduCourseTitle(this.i18n, r.courseNameCode, r.periodTime);
  }

  protected classHour(r: EduTrainArchiveRow): string {
    return r.impleClassHour ? `${r.impleClassHour} ${eduClassUnitLabel(this.i18n, r.impleClassUnit)}`.trim() : '';
  }

  protected fileUrl(fileNo: string): string {
    return this.common.fileDownloadUrl(fileNo);
  }
}
