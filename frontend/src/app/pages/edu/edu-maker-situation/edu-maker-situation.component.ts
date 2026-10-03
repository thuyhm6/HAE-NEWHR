import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';

import { I18nService } from '../../../i18n/i18n.service';
import { EduCommonService } from '../shared/edu-common.service';
import {
  EDU_APPLY_FLAG_PASS,
  EDU_APPLY_FLAG_PENDING,
  EDU_APPLY_FLAG_REJECT,
  EduApplyRecord,
  EduCourseApplyService,
  eduApplyErrorMessage,
  eduApplyFlagLabel,
  eduConfirmFlagLabel,
} from '../shared/edu-course-apply.service';
import { eduClassUnitLabel, eduCourseTitle } from '../shared/edu-labels';
import { EduSyllabusModalComponent } from '../shared/edu-syllabus-modal/edu-syllabus-modal.component';

import { TABLE_PAGE_SIZE_OPTIONS } from '../../../core/config/table-pagination.config';
/**
 * Tình hình đăng ký khóa đào tạo - port từ /edu/traineducation/makerSituation và
 * /edu/traineducation/makerSituationHUB (Hanwha_HTSV). Dùng chung component, phân biệt bằng
 * route data `hub`; tiền tố id theo màn (ems- / emsh-) để không trùng khi mở cả 2 tab.
 * - makerSituation: nhân viên xem đơn của mình; phụ trách đào tạo xem đơn của học viên thuộc
 *   danh sách dự kiến của khóa (lọc thêm phòng ban / NV).
 * - HUB: xem toàn bộ đơn.
 * Đơn chưa phê duyệt có thể hủy.
 */
@Component({
  selector: 'app-edu-maker-situation',
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
    NzSelectModule,
    NzTableModule,
    NzTreeSelectModule,
    EduSyllabusModalComponent,
  ],
  templateUrl: './edu-maker-situation.component.html',
  styleUrl: './edu-maker-situation.component.scss',
})
export class EduMakerSituationComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;

  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(EduCourseApplyService);
  private readonly common = inject(EduCommonService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly hub: boolean = !!this.route.snapshot.data['hub'];
  /** Tiền tố id phần tử theo màn */
  protected readonly p = this.hub ? 'emsh' : 'ems';

  protected readonly flagOptions = [
    { value: EDU_APPLY_FLAG_PENDING, key: 'ess.trans.title.notAffirmed', fallback: 'Chưa duyệt' },
    { value: EDU_APPLY_FLAG_PASS, key: 'hr.viewTransactionTransViewList.title.PASS', fallback: 'Duyệt' },
    { value: EDU_APPLY_FLAG_REJECT, key: 'hr.viewTransactionTransViewList.title.VOTE_DOWN', fallback: 'Đã từ chối' },
  ];

  /** Phụ trách đào tạo (hoặc HUB) - được lọc theo phòng ban / nhân viên */
  protected readonly manager = signal(false);
  protected readonly showEmpFilter = computed(() => this.hub || this.manager());

  protected readonly deptNodes = signal<NzTreeNodeOptions[]>([]);

  // ===== Bộ lọc (mặc định trong tháng hiện tại như bản gốc) =====
  protected readonly searchDept = signal<string | null>(null);
  protected readonly searchKeyword = signal('');
  protected readonly searchCourse = signal('');
  protected readonly searchStart = signal<Date | null>(null);
  protected readonly searchEnd = signal<Date | null>(null);
  protected readonly searchFlag = signal<string | null>(null);

  protected readonly keyword = signal('');
  protected readonly listLoading = signal(false);
  protected readonly rows = signal<EduApplyRecord[]>([]);

  protected readonly filteredRows = computed(() => {
    const kw = this.keyword().trim().toLowerCase();
    if (!kw) return this.rows();
    return this.rows().filter((r) =>
      [r.empid, r.stuLocalName, r.deptName, r.postGradeName, r.trainTypeCodeName, r.courseNameCode, r.applyTask, r.makerLocalName]
        .some((v) => (v ?? '').toLowerCase().includes(kw)),
    );
  });

  protected readonly syllabusPlanNo = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    this.resetDates();
    if (!this.hub) {
      try {
        this.manager.set((await this.service.getSituationRole()).manager);
      } catch {
        this.manager.set(false);
      }
    }
    if (this.showEmpFilter()) this.loadDeptTree();
    await this.search();
  }

  private resetDates(): void {
    const d = new Date();
    this.searchStart.set(new Date(d.getFullYear(), d.getMonth(), 1));
    this.searchEnd.set(new Date(d.getFullYear(), d.getMonth() + 1, 0));
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
        await this.service.getSituation(
          {
            deptNo: this.searchDept(),
            keyword: this.searchKeyword(),
            courseName: this.searchCourse(),
            startDate: this.common.formatDate(this.searchStart()),
            endDate: this.common.formatDate(this.searchEnd()),
            flag: this.searchFlag(),
          },
          this.hub,
        ),
      );
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

  protected courseTitle(r: EduApplyRecord): string {
    return eduCourseTitle(this.i18n, r.courseNameCode, r.periodTime);
  }

  protected classHour(r: EduApplyRecord): string {
    return r.impleClassHour ? `${r.impleClassHour} ${eduClassUnitLabel(this.i18n, r.impleClassUnit)}`.trim() : '';
  }

  protected applyLabel(r: EduApplyRecord): string {
    return eduApplyFlagLabel(this.i18n, r.applyFlag);
  }

  protected confirmLabel(r: EduApplyRecord): string {
    return eduConfirmFlagLabel(this.i18n, r.confirmFlag);
  }

  protected canCancel(r: EduApplyRecord): boolean {
    return (r.applyFlag ?? EDU_APPLY_FLAG_PENDING) === EDU_APPLY_FLAG_PENDING;
  }

  cancelApply(r: EduApplyRecord): void {
    this.modal.confirm({
      nzTitle: this.i18n.t('edu.makerSituationHUB.QUEDINGQUXIAO.a', 'Đồng ý hủy bỏ không?'),
      nzOkDanger: true,
      nzMaskClosable: true,
      nzOnOk: async () => {
        try {
          const res = await this.service.cancel(r.applyNo);
          if (res.success) {
            this.message.success(this.i18n.t('alert.message.delete_success', 'Xóa thành công!'));
            await this.search();
          } else {
            this.message.error(eduApplyErrorMessage(this.i18n, res, 'common.deleteFailed', 'Xóa thất bại.'));
          }
        } catch {
          this.message.error(this.i18n.t('common.deleteFailed', 'Xóa thất bại.'));
        }
      },
    });
  }
}
