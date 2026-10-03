import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';

import { I18nService } from '../../../i18n/i18n.service';
import { EduCommonService, EduSaveResponse } from '../shared/edu-common.service';
import {
  EDU_APPLY_FLAG_PASS,
  EDU_APPLY_FLAG_PENDING,
  EDU_APPLY_FLAG_REJECT,
  EduApplyRecord,
  EduCourseApplyService,
  eduApplyErrorMessage,
  eduApplyFlagLabel,
} from '../shared/edu-course-apply.service';
import { eduClassUnitLabel, eduCourseTitle } from '../shared/edu-labels';
import { EduSyllabusModalComponent } from '../shared/edu-syllabus-modal/edu-syllabus-modal.component';

import { TABLE_PAGE_SIZE_OPTIONS } from '../../../core/config/table-pagination.config';
/** maker = Phê duyệt (courseMaker), confirm = Xác nhận (courseConfirm) */
export type EduCourseReviewMode = 'maker' | 'confirm';

interface ErvOption {
  value: string;
  key: string;
  fallback: string;
}

/**
 * Phê duyệt / Xác nhận đăng ký khóa đào tạo - port từ /edu/traineducation/courseMaker và
 * /edu/traineducation/courseConfirm (Hanwha_HTSV). Hai màn gần như giống nhau nên dùng chung
 * component, phân biệt bằng route data `mode`; tiền tố id theo màn (ecmk- / ecc-) để không trùng
 * khi mở cả 2 tab.
 * - maker: người duyệt xem đơn gửi cho mình, đổi trạng thái từng đơn hoặc duyệt hàng loạt.
 * - confirm: phụ trách đào tạo xác nhận đơn đã duyệt; xác nhận thì học viên được thêm vào khóa.
 */
@Component({
  selector: 'app-edu-course-review',
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
    NzSelectModule,
    NzTableModule,
    NzTreeSelectModule,
    EduSyllabusModalComponent,
  ],
  templateUrl: './edu-course-review.component.html',
  styleUrl: './edu-course-review.component.scss',
})
export class EduCourseReviewComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;

  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(EduCourseApplyService);
  private readonly common = inject(EduCommonService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly mode: EduCourseReviewMode = this.route.snapshot.data['mode'] === 'confirm' ? 'confirm' : 'maker';
  /** Tiền tố id phần tử theo màn */
  protected readonly p = this.mode === 'confirm' ? 'ecc' : 'ecmk';

  /** Trạng thái lọc (maker_flag / confirm_flag bản gốc) */
  protected readonly filterOptions: ErvOption[] =
    this.mode === 'maker'
      ? [
          { value: EDU_APPLY_FLAG_PENDING, key: 'ess.trans.title.notAffirmed', fallback: 'Chưa duyệt' },
          { value: EDU_APPLY_FLAG_PASS, key: 'hr.viewTransactionTransViewList.title.PASS', fallback: 'Duyệt' },
          { value: EDU_APPLY_FLAG_REJECT, key: 'hr.viewTransactionTransViewList.title.VOTE_DOWN', fallback: 'Đã từ chối' },
        ]
      : [
          { value: EDU_APPLY_FLAG_PENDING, key: 'ess.title.WEIQUEREN', fallback: 'Chưa xác nhận' },
          { value: EDU_APPLY_FLAG_PASS, key: 'ar.viewsummaryyiqueren', fallback: 'Xác nhận' },
        ];

  /** Lựa chọn trạng thái trên từng dòng */
  protected readonly rowOptions: ErvOption[] =
    this.mode === 'maker'
      ? [
          { value: EDU_APPLY_FLAG_PENDING, key: 'ess.trans.title.notAffirmed', fallback: 'Chưa duyệt' },
          { value: EDU_APPLY_FLAG_PASS, key: 'ess.trans.title.pass', fallback: 'Duyệt' },
          { value: EDU_APPLY_FLAG_REJECT, key: 'ess.trans.title.reject', fallback: 'Từ chối' },
        ]
      : [
          { value: EDU_APPLY_FLAG_PENDING, key: 'main.home.message.unconfirm', fallback: 'Chờ xác nhận' },
          { value: EDU_APPLY_FLAG_PASS, key: 'pa.insurance.title.confirm', fallback: 'Xác nhận' },
          { value: EDU_APPLY_FLAG_REJECT, key: 'hrm.contractInfo.VETO', fallback: 'Từ chối' },
        ];

  protected readonly deptNodes = signal<NzTreeNodeOptions[]>([]);

  // ===== Bộ lọc (Xác nhận: mặc định trong tháng hiện tại như bản gốc) =====
  protected readonly searchDept = signal<string | null>(null);
  protected readonly searchKeyword = signal('');
  protected readonly searchCourse = signal('');
  protected readonly searchStart = signal<Date | null>(null);
  protected readonly searchEnd = signal<Date | null>(null);
  protected readonly searchFlag = signal<string | null>(null);

  protected readonly keyword = signal('');
  protected readonly listLoading = signal(false);
  protected readonly saving = signal(false);
  protected readonly rows = signal<EduApplyRecord[]>([]);
  protected readonly checked = signal<Set<string>>(new Set());

  protected readonly filteredRows = computed(() => {
    const kw = this.keyword().trim().toLowerCase();
    if (!kw) return this.rows();
    return this.rows().filter((r) =>
      [r.empid, r.stuLocalName, r.deptName, r.postGradeName, r.trainTypeCodeName, r.courseNameCode, r.applyTask, r.makerLocalName]
        .some((v) => (v ?? '').toLowerCase().includes(kw)),
    );
  });
  private readonly eligibleRows = computed(() => this.filteredRows().filter((r) => this.canCheck(r)));
  protected readonly allChecked = computed(() => {
    const rows = this.eligibleRows();
    return rows.length > 0 && rows.every((r) => this.checked().has(r.applyNo));
  });
  protected readonly someChecked = computed(() => !this.allChecked() && this.eligibleRows().some((r) => this.checked().has(r.applyNo)));

  protected readonly syllabusPlanNo = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    this.resetDates();
    this.loadDeptTree();
    await this.search();
  }

  private resetDates(): void {
    if (this.mode === 'confirm') {
      const d = new Date();
      this.searchStart.set(new Date(d.getFullYear(), d.getMonth(), 1));
      this.searchEnd.set(new Date(d.getFullYear(), d.getMonth() + 1, 0));
    } else {
      this.searchStart.set(null);
      this.searchEnd.set(null);
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
    const query = {
      deptNo: this.searchDept(),
      keyword: this.searchKeyword(),
      courseName: this.searchCourse(),
      startDate: this.common.formatDate(this.searchStart()),
      endDate: this.common.formatDate(this.searchEnd()),
      flag: this.searchFlag(),
    };
    try {
      this.rows.set(this.mode === 'maker' ? await this.service.getMakerRecords(query) : await this.service.getConfirmRecords(query));
      this.checked.set(new Set());
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.listLoading.set(false);
    }
  }

  clearSearch(): void {
    this.searchDept.set(null);
    this.searchKeyword.set('');
    this.searchCourse.set('');
    this.searchFlag.set(null);
    this.keyword.set('');
    this.resetDates();
    this.search();
  }

  /** Bản gốc: Phê duyệt - chỉ đơn chưa xác nhận; Xác nhận - đơn đã duyệt và đang chờ xác nhận. */
  protected canCheck(r: EduApplyRecord): boolean {
    return this.mode === 'maker'
      ? (r.confirmFlag ?? EDU_APPLY_FLAG_PENDING) === EDU_APPLY_FLAG_PENDING
      : r.applyFlag === EDU_APPLY_FLAG_PASS && (r.confirmFlag ?? EDU_APPLY_FLAG_PENDING) === EDU_APPLY_FLAG_PENDING;
  }

  /** Ô chọn trạng thái trên dòng: Phê duyệt - khi chưa xác nhận; Xác nhận - khi đã duyệt. */
  protected canChange(r: EduApplyRecord): boolean {
    return this.mode === 'maker'
      ? (r.confirmFlag ?? EDU_APPLY_FLAG_PENDING) === EDU_APPLY_FLAG_PENDING
      : r.applyFlag === EDU_APPLY_FLAG_PASS;
  }

  protected rowFlag(r: EduApplyRecord): string {
    return (this.mode === 'maker' ? r.applyFlag : r.confirmFlag) ?? EDU_APPLY_FLAG_PENDING;
  }

  toggleRow(r: EduApplyRecord, value?: boolean): void {
    if (!this.canCheck(r)) return;
    const next = new Set(this.checked());
    const on = value ?? !next.has(r.applyNo);
    if (on) next.add(r.applyNo);
    else next.delete(r.applyNo);
    this.checked.set(next);
  }

  toggleAll(value: boolean): void {
    const next = new Set(this.checked());
    this.eligibleRows().forEach((r) => (value ? next.add(r.applyNo) : next.delete(r.applyNo)));
    this.checked.set(next);
  }

  protected courseTitle(r: EduApplyRecord): string {
    return eduCourseTitle(this.i18n, r.courseNameCode, r.periodTime);
  }

  protected classHour(r: EduApplyRecord): string {
    return r.impleClassHour ? `${r.impleClassHour} ${eduClassUnitLabel(this.i18n, r.impleClassUnit)}`.trim() : '';
  }

  protected applyLabel(r: EduApplyRecord): string {
    return eduApplyFlagLabel(this.i18n, r.applyFlag);
  }

  /** Nút hàng loạt: Duyệt (maker) / Xác nhận (confirm) các dòng đã chọn. */
  async passChecked(): Promise<void> {
    const applyNos = [...this.checked()];
    if (applyNos.length === 0) {
      this.message.warning(this.i18n.t('edu.systemManager.QINGXUANZEQIZHONGYIXIANG.a', 'Xin chọn 1 hạng mục!'));
      return;
    }
    await this.update(applyNos, EDU_APPLY_FLAG_PASS);
  }

  /** Đổi trạng thái 1 dòng (changeMaker / changeConfirm bản gốc - cập nhật ngay). */
  async changeRow(r: EduApplyRecord, flag: string): Promise<void> {
    if (flag === this.rowFlag(r)) return;
    await this.update([r.applyNo], flag);
  }

  private async update(applyNos: string[], flag: string): Promise<void> {
    this.saving.set(true);
    try {
      const res: EduSaveResponse =
        this.mode === 'maker' ? await this.service.updateMaker(applyNos, flag) : await this.service.updateConfirm(applyNos, flag);
      if (res.success) {
        this.message.success(this.i18n.t('pa.salary.canShu.caozuo_success', 'Thực hiện thành công!'));
      } else {
        this.message.error(eduApplyErrorMessage(this.i18n, res, 'common.saveFailed', 'Lưu thất bại.'));
      }
    } catch {
      this.message.error(this.i18n.t('common.saveFailed', 'Lưu thất bại.'));
    } finally {
      this.saving.set(false);
      await this.search();
    }
  }
}
