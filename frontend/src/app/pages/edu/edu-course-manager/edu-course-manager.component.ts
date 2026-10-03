import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import { SyCodeOption } from '../../ar/company-calendar/company-calendar.service';
import { EduSystemManagerRow, EduSystemManagerService } from '../edu-system-manager/edu-system-manager.service';
import { EDU_CODE_TRAIN_DIFF, EduCommonService } from '../shared/edu-common.service';
import { ECM_ERR_DUPLICATE, EduCourseManagerRow, EduCourseManagerService } from './edu-course-manager.service';

import { TABLE_PAGE_SIZE_OPTIONS } from '../../../core/config/table-pagination.config';
/**
 * Quản lý khóa học - port từ /edu/traineducation/courseManager (Hanwha_HTSV:
 * courseManager.jsp / addCourseManager.jsp / courseManagerInfo.jsp).
 * - Thêm mới: chọn Loại hình từ Hệ thống đào tạo (EDU_SYSTEM_MANAGER), mã khóa học tự sinh.
 * - Sửa: cho đổi Tên khóa học + Ghi chú (đồng bộ tên sang Kế hoạch đào tạo).
 * - Chọn 1 dòng rồi bấm Sửa (double-click dòng để sửa nhanh). Bản gốc không có Xóa.
 * Modal đóng khi bấm ra ngoài vùng modal (nzMaskClosable).
 */
@Component({
  selector: 'app-edu-course-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCardModule,
    NzFormModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzSelectModule,
    NzTableModule,
  ],
  templateUrl: './edu-course-manager.component.html',
  styleUrl: './edu-course-manager.component.scss',
})
export class EduCourseManagerComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;

  private readonly service = inject(EduCourseManagerService);
  private readonly systemService = inject(EduSystemManagerService);
  private readonly common = inject(EduCommonService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  // ===== Bộ lọc =====
  protected readonly diffOptions = signal<SyCodeOption[]>([]);
  protected readonly typeOptions = signal<SyCodeOption[]>([]);
  protected readonly searchDiffCode = signal<string | null>(null);
  protected readonly searchTypeCode = signal<string | null>(null);
  protected readonly searchCourseName = signal('');
  protected readonly keyword = signal('');

  // ===== Danh sách =====
  protected readonly listLoading = signal(false);
  protected readonly rows = signal<EduCourseManagerRow[]>([]);
  protected readonly selectedNo = signal<string | null>(null);

  protected readonly filteredRows = computed(() => {
    const kw = this.keyword().trim().toLowerCase();
    if (!kw) return this.rows();
    return this.rows().filter((r) =>
      [r.trainTypeCodeName, r.courseNameCode, r.courseNumber, r.remark].some((v) => (v ?? '').toLowerCase().includes(kw)),
    );
  });

  // ===== Modal Thêm/Sửa =====
  protected readonly modalVisible = signal(false);
  protected readonly modalIsEdit = signal(false);
  protected readonly saving = signal(false);
  protected readonly systemOptions = signal<EduSystemManagerRow[]>([]);
  protected readonly formCourseNo = signal<string | null>(null);
  protected readonly formSysmanaNo = signal<string | null>(null);
  protected readonly formTypeName = signal('');
  protected readonly formCourseName = signal('');
  protected readonly formCourseNumber = signal('');
  protected readonly formRemark = signal('');

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    this.diffOptions.set(await this.common.getCodeListSafe(EDU_CODE_TRAIN_DIFF));
    await this.search();
  }

  protected codeLabel(opt: SyCodeOption): string {
    return opt.codeName || opt.nameVi || opt.codeNo;
  }

  protected systemLabel(s: EduSystemManagerRow): string {
    return `${s.trainTypeNo ?? ''}  ${s.trainTypeCodeName ?? ''}`;
  }

  async onSearchDiffChange(value: string | null): Promise<void> {
    this.searchDiffCode.set(value);
    this.searchTypeCode.set(null);
    this.typeOptions.set(await this.common.getCodeListSafe(value));
  }

  async search(): Promise<void> {
    this.listLoading.set(true);
    try {
      this.rows.set(
        await this.service.getList({
          trainDiffCode: this.searchDiffCode(),
          trainTypeCode: this.searchTypeCode(),
          courseName: this.searchCourseName().trim(),
        }),
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
    this.searchDiffCode.set(null);
    this.searchTypeCode.set(null);
    this.typeOptions.set([]);
    this.searchCourseName.set('');
    this.keyword.set('');
    this.search();
  }

  selectRow(row: EduCourseManagerRow): void {
    this.selectedNo.set(row.courseNo ?? null);
  }

  async openAddModal(): Promise<void> {
    try {
      this.systemOptions.set(await this.systemService.getList());
    } catch {
      this.systemOptions.set([]);
    }
    this.modalIsEdit.set(false);
    this.formCourseNo.set(null);
    this.formSysmanaNo.set(null);
    this.formCourseName.set('');
    this.formCourseNumber.set('');
    this.formRemark.set('');
    this.modalVisible.set(true);
  }

  async openEditModal(courseNo?: string | null): Promise<void> {
    const no = courseNo ?? this.selectedNo();
    if (!no) {
      this.message.warning(this.i18n.t('edu.systemManager.QINGXUANZEQIZHONGYIXIANG.a', 'Xin chọn 1 hạng mục!'));
      return;
    }
    try {
      const d = await this.service.getDetail(no);
      if (!d) {
        this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
        return;
      }
      this.modalIsEdit.set(true);
      this.formCourseNo.set(d.courseNo ?? no);
      this.formTypeName.set(d.trainTypeCodeName ?? '');
      this.formCourseName.set(d.courseNameCode ?? '');
      this.formCourseNumber.set(d.courseNumber ?? '');
      this.formRemark.set(d.remark ?? '');
      this.modalVisible.set(true);
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  closeModal(): void {
    this.modalVisible.set(false);
  }

  async save(): Promise<void> {
    const isEdit = this.modalIsEdit();
    if (!isEdit && !this.formSysmanaNo()) {
      this.message.warning(this.i18n.t('edu.systemManager.msg.selectType', 'Vui lòng chọn Loại hình!'));
      return;
    }
    if (!this.formCourseName().trim()) {
      this.message.warning(this.i18n.t('edu.courseManager.msg.courseNameRequired', 'Vui lòng nhập Tên khóa học!'));
      return;
    }
    const payload: EduCourseManagerRow = {
      courseNo: this.formCourseNo() ?? undefined,
      sysmanaNo: this.formSysmanaNo() ?? undefined,
      courseNameCode: this.formCourseName().trim(),
      remark: this.formRemark().trim() || undefined,
    };
    this.saving.set(true);
    try {
      const res = isEdit ? await this.service.update(payload) : await this.service.add(payload);
      if (res.success) {
        this.message.success(this.i18n.t('common.saveSuccess', 'Lưu thành công'));
        this.modalVisible.set(false);
        await this.search();
      } else if (res.errorCode === ECM_ERR_DUPLICATE) {
        this.message.error(this.i18n.t('edu.courseManager.msg.duplicate', 'Tên khóa học không được trùng lặp!'));
      } else {
        this.message.error(this.i18n.t('common.saveFailed', 'Lưu thất bại.'));
      }
    } catch {
      this.message.error(this.i18n.t('common.saveFailed', 'Lưu thất bại.'));
    } finally {
      this.saving.set(false);
    }
  }
}
