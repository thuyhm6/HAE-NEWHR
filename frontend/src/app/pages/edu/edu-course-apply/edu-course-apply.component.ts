import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';

import { AuthService } from '../../../auth/auth.service';
import { I18nService } from '../../../i18n/i18n.service';
import { EduCommonService } from '../shared/edu-common.service';
import { EduApplyCourse, EduApplyMaker, EduCourseApplyService, eduApplyErrorMessage } from '../shared/edu-course-apply.service';
import { eduClassUnitLabel, eduCourseTitle } from '../shared/edu-labels';
import { EduSyllabusModalComponent } from '../shared/edu-syllabus-modal/edu-syllabus-modal.component';

import { TABLE_PAGE_SIZE_OPTIONS, TABLE_DEFAULT_PAGE_SIZE } from '../../../core/config/table-pagination.config';
interface EcaMakerRow extends EduApplyMaker {
  /** Người duyệt mặc định (trưởng phòng ban) - bản gốc không cho xóa */
  fixed: boolean;
}

/**
 * Đăng ký khóa đào tạo - port từ /edu/traineducation/courseApply (Hanwha_HTSV: courseApply.jsp,
 * queryMaker.jsp). Nhân viên chọn các khóa mình được chỉ định (còn hạn đăng ký), nhập lý do,
 * chọn thêm người duyệt (mặc định trưởng phòng ban) rồi gửi đăng ký.
 * Modal đóng khi bấm ra ngoài vùng modal (nzMaskClosable).
 */
@Component({
  selector: 'app-edu-course-apply',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCardModule,
    NzCheckboxModule,
    NzDatePickerModule,
    NzFormModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzTableModule,
    NzTreeSelectModule,
    EduSyllabusModalComponent,
  ],
  templateUrl: './edu-course-apply.component.html',
  styleUrl: './edu-course-apply.component.scss',
})
export class EduCourseApplyComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
  protected readonly defaultPageSize = TABLE_DEFAULT_PAGE_SIZE;

  private readonly service = inject(EduCourseApplyService);
  private readonly common = inject(EduCommonService);
  private readonly authService = inject(AuthService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly applicantName = computed(() => this.authService.currentUser()?.employeeName ?? '');

  // ===== Bộ lọc & danh sách khóa =====
  protected readonly searchName = signal('');
  protected readonly searchStart = signal<Date | null>(null);
  protected readonly searchEnd = signal<Date | null>(null);
  protected readonly keyword = signal('');
  protected readonly listLoading = signal(false);
  protected readonly rows = signal<EduApplyCourse[]>([]);
  protected readonly checked = signal<Set<string>>(new Set());
  protected readonly tasks = signal<Record<string, string>>({});
  protected readonly applying = signal(false);

  protected readonly filteredRows = computed(() => {
    const kw = this.keyword().trim().toLowerCase();
    if (!kw) return this.rows();
    return this.rows().filter((r) =>
      [r.trainTypeCodeName, r.courseNameCode, r.trainAddress].some((v) => (v ?? '').toLowerCase().includes(kw)),
    );
  });
  protected readonly allChecked = computed(() => {
    const rows = this.filteredRows();
    return rows.length > 0 && rows.every((r) => this.checked().has(r.basicNo));
  });
  protected readonly someChecked = computed(() => !this.allChecked() && this.filteredRows().some((r) => this.checked().has(r.basicNo)));

  // ===== Người duyệt =====
  protected readonly makers = signal<EcaMakerRow[]>([]);

  // ===== Modal chọn người duyệt (queryMaker.jsp) =====
  protected readonly pickerVisible = signal(false);
  protected readonly pickerKeyword = signal('');
  protected readonly pickerDept = signal<string | null>(null);
  protected readonly pickerLoading = signal(false);
  protected readonly pickerRows = signal<EduApplyMaker[]>([]);
  protected readonly pickerSelected = signal<EduApplyMaker | null>(null);
  protected readonly deptNodes = signal<NzTreeNodeOptions[]>([]);

  // ===== Lịch học =====
  protected readonly syllabusPlanNo = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    if (!this.authService.currentUser()) {
      await this.authService.loadCurrentUser();
    }
    this.loadDefaultMakers();
    this.loadDeptTree();
    await this.search();
  }

  private async loadDefaultMakers(): Promise<void> {
    try {
      const list = await this.service.getDefaultMakers();
      this.makers.set(list.map((m) => ({ ...m, fixed: true })));
    } catch {
      this.makers.set([]);
    }
  }

  private async loadDeptTree(): Promise<void> {
    try {
      this.deptNodes.set(this.common.buildDeptTree(await this.common.getDeptTree()));
    } catch {
      this.deptNodes.set([]);
    }
  }

  async search(): Promise<void> {
    this.listLoading.set(true);
    try {
      this.rows.set(
        await this.service.getApplyCourses({
          courseName: this.searchName(),
          startDate: this.common.formatDate(this.searchStart()),
          endDate: this.common.formatDate(this.searchEnd()),
        }),
      );
      this.checked.set(new Set());
      this.tasks.set({});
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.listLoading.set(false);
    }
  }

  clearSearch(): void {
    this.searchName.set('');
    this.searchStart.set(null);
    this.searchEnd.set(null);
    this.keyword.set('');
    this.search();
  }

  // ===== Chọn khóa =====
  toggleRow(basicNo: string, value?: boolean): void {
    const next = new Set(this.checked());
    const on = value ?? !next.has(basicNo);
    if (on) next.add(basicNo);
    else next.delete(basicNo);
    this.checked.set(next);
  }

  toggleAll(value: boolean): void {
    const next = new Set(this.checked());
    this.filteredRows().forEach((r) => (value ? next.add(r.basicNo) : next.delete(r.basicNo)));
    this.checked.set(next);
  }

  setTask(basicNo: string, value: string): void {
    this.tasks.set({ ...this.tasks(), [basicNo]: value });
  }

  protected courseTitle(r: EduApplyCourse): string {
    return eduCourseTitle(this.i18n, r.courseNameCode, r.periodTime);
  }

  protected classHour(r: EduApplyCourse): string {
    return r.impleClassHour ? `${r.impleClassHour} ${eduClassUnitLabel(this.i18n, r.impleClassUnit)}`.trim() : '';
  }

  protected levelLabel(index: number): string {
    return `${this.i18n.t('edu.courseApply.JIJUECAIZHE.a', 'Cấp')} ${index + 1}`;
  }

  // ===== Người duyệt =====
  removeMaker(index: number): void {
    this.makers.set(this.makers().filter((_, i) => i !== index));
  }

  openPicker(): void {
    this.pickerKeyword.set('');
    this.pickerDept.set(null);
    this.pickerRows.set([]);
    this.pickerSelected.set(null);
    this.pickerVisible.set(true);
  }

  async searchMakers(): Promise<void> {
    this.pickerLoading.set(true);
    try {
      const list = await this.service.findMakers(this.pickerKeyword(), this.pickerDept());
      this.pickerRows.set(list);
      this.pickerSelected.set(null);
      // Bản gốc: chỉ 1 kết quả thì chọn luôn
      if (list.length === 1) {
        this.pickerSelected.set(list[0]);
        this.confirmPicker();
      }
    } catch {
      this.pickerRows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.pickerLoading.set(false);
    }
  }

  confirmPicker(row?: EduApplyMaker): void {
    const m = row ?? this.pickerSelected();
    if (!m) {
      this.message.warning(this.i18n.t('edu.teacherManager.QINGXIANXUANZEYIGEREN.a', 'Xin chọn 1 người!'));
      return;
    }
    if (!this.makers().some((x) => x.personId === m.personId)) {
      this.makers.set([...this.makers(), { ...m, fixed: false }]);
    }
    this.pickerVisible.set(false);
  }

  // ===== Đăng ký =====
  submitApply(): void {
    const selected = this.rows().filter((r) => this.checked().has(r.basicNo));
    if (selected.length === 0) {
      this.message.warning(this.i18n.t('edu.courseApply.msg.noCourse', 'Xin chọn khóa đào tạo cần đăng ký!'));
      return;
    }
    if (this.makers().length === 0) {
      this.message.warning(this.i18n.t('edu.courseApply.msg.noMaker', 'Xin thêm người duyệt!'));
      return;
    }
    this.modal.confirm({
      nzTitle: this.i18n.t('edu.courseApply.QUEDINGSHIFOUSHENQING.a', 'Đồng ý đăng ký?'),
      nzMaskClosable: true,
      nzOnOk: async () => {
        this.applying.set(true);
        try {
          const res = await this.service.apply({
            items: selected.map((r) => ({ basicNo: r.basicNo, applyTask: this.tasks()[r.basicNo]?.trim() || null })),
            makers: this.makers().map(({ fixed: _fixed, ...m }) => m),
          });
          if (res.success) {
            this.message.success(this.i18n.t('alert.message.add_success', 'Thêm thành công!'));
            await this.search();
          } else {
            this.message.error(eduApplyErrorMessage(this.i18n, res, 'common.saveFailed', 'Lưu thất bại.'));
          }
        } catch {
          this.message.error(this.i18n.t('common.saveFailed', 'Lưu thất bại.'));
        } finally {
          this.applying.set(false);
        }
      },
    });
  }
}
