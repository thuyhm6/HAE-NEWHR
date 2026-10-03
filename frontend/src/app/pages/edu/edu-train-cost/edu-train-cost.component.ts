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

import { AuthService } from '../../../auth/auth.service';
import { I18nService } from '../../../i18n/i18n.service';
import { EduAttachmentComponent } from '../shared/edu-attachment/edu-attachment.component';
import { EDU_FILE_TYPE_COST, EduCommonService, EduFile } from '../shared/edu-common.service';
import { eduCourseTitle } from '../shared/edu-labels';
import { ETCM_DIRECT_COST_CPNY, EduTrainCostQuery, EduTrainCostRow, EduTrainCostService } from './edu-train-cost.service';

import { TABLE_PAGE_SIZE_OPTIONS } from '../../../core/config/table-pagination.config';
type EtcmCostField = 'teacherCost' | 'materialCost' | 'fieldCost' | 'foodCost' | 'stayCost' | 'trafficCost' | 'visaCost' | 'otherCost';

/**
 * Chi phí đào tạo - port từ /edu/traineducation/trainCostManager (Hanwha_HTSV:
 * trainCostManager.jsp / trainCostManagerInfo.jsp). Dòng chi phí được tạo tự động khi lập khóa
 * (Thông tin đào tạo cơ bản) nên màn này chỉ có Sửa/Xóa/Xuất Excel như bản gốc.
 * Modal đóng khi bấm ra ngoài vùng modal (nzMaskClosable).
 */
@Component({
  selector: 'app-edu-train-cost',
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
    EduAttachmentComponent,
  ],
  templateUrl: './edu-train-cost.component.html',
  styleUrl: './edu-train-cost.component.scss',
})
export class EduTrainCostComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;

  private readonly service = inject(EduTrainCostService);
  private readonly common = inject(EduCommonService);
  private readonly authService = inject(AuthService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  /** Các khoản chi phí theo thứ tự trainCostManagerInfo.jsp bản gốc (3 khoản đầu = chi phí trực tiếp). */
  protected readonly costFields: { key: EtcmCostField; label: string; fallback: string }[] = [
    { key: 'teacherCost', label: 'edu.trainCostMANAGER.JIANGSHIFEI.a', fallback: 'Thù lao giảng viên' },
    { key: 'materialCost', label: 'edu.trainCostMANAGER.JIAOCAIFEI.a', fallback: 'Tiền tài liệu' },
    { key: 'fieldCost', label: 'edu.trainCostMANAGER.CHANGDIFEI.a', fallback: 'Tiền thuê chỗ học' },
    { key: 'foodCost', label: 'edu.trainCostMANAGER.CANYINFEI.a', fallback: 'Tiền ăn uống' },
    { key: 'stayCost', label: 'edu.trainCostMANAGER.ZHUSUFEI.a', fallback: 'Tiền ở' },
    { key: 'trafficCost', label: 'edu.trainAgreement.JIAOTONGFEI.a', fallback: 'Phụ cấp đi lại' },
    { key: 'visaCost', label: 'edu.trainCostMANAGER.QIANZHENGJIXIANGGUANFEIYONG.a', fallback: 'Visa và phí liên quan' },
    { key: 'otherCost', label: 'edu.trainCostMANAGER.QITAFEIYONG.a', fallback: 'Chi phí khác' },
  ];
  private readonly directFields: EtcmCostField[] = ['teacherCost', 'materialCost', 'fieldCost'];

  protected readonly showDirectCost = computed(() => this.authService.currentUser()?.cpnyId === ETCM_DIRECT_COST_CPNY);

  // ===== Bộ lọc & danh sách =====
  protected readonly searchName = signal('');
  protected readonly searchStart = signal<Date | null>(null);
  protected readonly searchEnd = signal<Date | null>(null);
  protected readonly keyword = signal('');
  protected readonly listLoading = signal(false);
  protected readonly rows = signal<EduTrainCostRow[]>([]);
  protected readonly selected = signal<EduTrainCostRow | null>(null);

  protected readonly filteredRows = computed(() => {
    const kw = this.keyword().trim().toLowerCase();
    if (!kw) return this.rows();
    return this.rows().filter((r) => [r.trainTypeCodeName, r.courseNameCode, r.budget].some((v) => (v ?? '').toLowerCase().includes(kw)));
  });

  // ===== Modal Sửa =====
  protected readonly modalVisible = signal(false);
  protected readonly saving = signal(false);
  protected readonly detail = signal<EduTrainCostRow | null>(null);
  protected readonly costs = signal<Record<EtcmCostField, number | null>>(this.emptyCosts());
  protected readonly remark = signal('');
  protected readonly files = signal<EduFile[]>([]);
  protected readonly pendingFiles = signal<File[]>([]);

  protected readonly totalCost = computed(() => Object.values(this.costs()).reduce<number>((s, v) => s + (v ?? 0), 0));
  protected readonly avgCost = computed(() => Math.round(this.totalCost() / Math.max(this.detail()?.totalCount ?? 1, 1)));
  protected readonly directCost = computed(() => this.directFields.reduce((s, k) => s + (this.costs()[k] ?? 0), 0));

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    if (!this.authService.currentUser()) {
      await this.authService.loadCurrentUser();
    }
    await this.search();
  }

  private emptyCosts(): Record<EtcmCostField, number | null> {
    return {
      teacherCost: null, materialCost: null, fieldCost: null, foodCost: null,
      stayCost: null, trafficCost: null, visaCost: null, otherCost: null,
    };
  }

  protected courseTitle(name?: string | null, period?: string | null): string {
    return eduCourseTitle(this.i18n, name, period);
  }

  private buildQuery(): EduTrainCostQuery {
    return {
      courseName: this.searchName().trim(),
      startDate: this.common.formatDate(this.searchStart()),
      endDate: this.common.formatDate(this.searchEnd()),
    };
  }

  async search(): Promise<void> {
    this.listLoading.set(true);
    try {
      this.rows.set(await this.service.getList(this.buildQuery()));
      this.selected.set(null);
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

  selectRow(row: EduTrainCostRow): void {
    this.selected.set(row);
  }

  private requireCostNo(row: EduTrainCostRow | null): string | null {
    if (!row) {
      this.message.warning(this.i18n.t('edu.systemManager.QINGXUANZEQIZHONGYIXIANG.a', 'Xin chọn 1 hạng mục!'));
      return null;
    }
    if (!row.costNo) {
      this.message.warning(this.i18n.t('edu.trainCost.msg.noCostRow', 'Khóa này chưa có dòng chi phí.'));
      return null;
    }
    return row.costNo;
  }

  async openEditModal(row?: EduTrainCostRow | null): Promise<void> {
    const costNo = this.requireCostNo(row ?? this.selected());
    if (!costNo) return;
    try {
      const d = await this.service.getDetail(costNo);
      if (!d) {
        this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
        return;
      }
      this.detail.set(d);
      const c = this.emptyCosts();
      (Object.keys(c) as EtcmCostField[]).forEach((k) => (c[k] = d[k] ?? null));
      this.costs.set(c);
      this.remark.set(d.remark ?? '');
      this.files.set(d.files ?? []);
      this.pendingFiles.set([]);
      this.modalVisible.set(true);
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  closeModal(): void {
    this.modalVisible.set(false);
  }

  setCost(key: EtcmCostField, value: number | null): void {
    this.costs.set({ ...this.costs(), [key]: value });
  }

  async reloadFiles(): Promise<void> {
    const no = this.detail()?.costNo;
    if (no) this.files.set(await this.common.getFiles(EDU_FILE_TYPE_COST, no));
  }

  async save(): Promise<void> {
    const d = this.detail();
    if (!d?.costNo) return;
    const payload: EduTrainCostRow = { costNo: d.costNo, remark: this.remark().trim() || undefined, ...this.costs() };
    this.saving.set(true);
    try {
      const res = await this.service.update(payload);
      if (!res.success) {
        this.message.error(this.i18n.t('common.saveFailed', 'Lưu thất bại.'));
        return;
      }
      const pending = this.pendingFiles();
      if (pending.length) {
        const up = await this.common.uploadFiles(EDU_FILE_TYPE_COST, d.costNo, pending);
        if (!up.success) {
          this.message.warning(this.i18n.t('edu.common.uploadFailed', 'Đã lưu dữ liệu nhưng tải file đính kèm thất bại.'));
        }
      }
      this.message.success(this.i18n.t('common.saveSuccess', 'Lưu thành công'));
      this.modalVisible.set(false);
      await this.search();
    } catch {
      this.message.error(this.i18n.t('common.saveFailed', 'Lưu thất bại.'));
    } finally {
      this.saving.set(false);
    }
  }

  deleteSelected(): void {
    const costNo = this.requireCostNo(this.selected());
    if (!costNo) return;
    this.modal.confirm({
      nzTitle: this.i18n.t('edu.systemManager.QUEDINGSHIFOUSHANCHU.a', 'Đồng ý xóa không?'),
      nzOkDanger: true,
      nzMaskClosable: true,
      nzOnOk: async () => {
        try {
          const res = await this.service.delete(costNo);
          if (res.success) {
            this.message.success(this.i18n.t('common.deleteSuccess', 'Xóa thành công!'));
            await this.search();
          } else {
            this.message.error(this.i18n.t('common.deleteFailed', 'Xóa thất bại.'));
          }
        } catch {
          this.message.error(this.i18n.t('common.deleteFailed', 'Xóa thất bại.'));
        }
      },
    });
  }

  exportList(): void {
    window.location.href = this.service.exportUrl(this.buildQuery());
  }

  exportDetail(): void {
    const no = this.detail()?.costNo;
    if (no) window.location.href = this.service.exportDetailUrl(no);
  }
}
