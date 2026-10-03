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
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import { SyCodeOption } from '../../ar/company-calendar/company-calendar.service';
import { EduCommonService } from '../shared/edu-common.service';
import {
  ECS_ERR_DUPLICATE,
  ECS_MAIN_BUSINESS_PARENT_CODE,
  EduCourseSubjectRow,
  EduCourseSubjectsService,
} from './edu-course-subjects.service';

import { TABLE_PAGE_SIZE_OPTIONS } from '../../../core/config/table-pagination.config';
/**
 * Môn học đào tạo - port từ /edu/traineducation/courseSubjects (Hanwha_HAE:
 * courseSubjects.jsp / addCourseSubjects.jsp / courseSubjectsInfo.jsp; Hanwha_HTSV không có màn này).
 * Công việc (MAIN_BUSINESS) chọn nhiều, lưu dạng mã/tên phân cách dấu phẩy như thẻ selectCodeMulti bản gốc.
 * Modal đóng khi bấm ra ngoài vùng modal (nzMaskClosable).
 */
@Component({
  selector: 'app-edu-course-subjects',
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
  templateUrl: './edu-course-subjects.component.html',
  styleUrl: './edu-course-subjects.component.scss',
})
export class EduCourseSubjectsComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;

  private readonly service = inject(EduCourseSubjectsService);
  private readonly common = inject(EduCommonService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly businessOptions = signal<SyCodeOption[]>([]);

  // ===== Bộ lọc & danh sách =====
  protected readonly searchNo = signal('');
  protected readonly searchName = signal('');
  protected readonly searchBusiness = signal<string | null>(null);
  protected readonly keyword = signal('');
  protected readonly listLoading = signal(false);
  protected readonly rows = signal<EduCourseSubjectRow[]>([]);
  protected readonly selectedId = signal<string | null>(null);

  protected readonly filteredRows = computed(() => {
    const kw = this.keyword().trim().toLowerCase();
    if (!kw) return this.rows();
    return this.rows().filter((r) =>
      [r.subjectNo, r.subjectName, r.mainBusinessName].some((v) => (v ?? '').toLowerCase().includes(kw)),
    );
  });

  // ===== Modal Thêm/Sửa =====
  protected readonly modalVisible = signal(false);
  protected readonly modalIsEdit = signal(false);
  protected readonly saving = signal(false);
  protected readonly formId = signal<string | null>(null);
  protected readonly formNo = signal('');
  protected readonly formName = signal('');
  protected readonly formBusiness = signal<string[]>([]);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    this.businessOptions.set(await this.common.getCodeListSafe(ECS_MAIN_BUSINESS_PARENT_CODE));
    await this.search();
  }

  protected codeLabel(opt: SyCodeOption): string {
    return opt.codeName || opt.nameVi || opt.codeNo;
  }

  async search(): Promise<void> {
    this.listLoading.set(true);
    try {
      this.rows.set(await this.service.getList(this.searchNo().trim(), this.searchName().trim(), this.searchBusiness()));
      this.selectedId.set(null);
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.listLoading.set(false);
    }
  }

  clearSearch(): void {
    this.searchNo.set('');
    this.searchName.set('');
    this.searchBusiness.set(null);
    this.keyword.set('');
    this.search();
  }

  selectRow(row: EduCourseSubjectRow): void {
    this.selectedId.set(row.subjectId ?? null);
  }

  openAddModal(): void {
    this.modalIsEdit.set(false);
    this.formId.set(null);
    this.formNo.set('');
    this.formName.set('');
    this.formBusiness.set([]);
    this.modalVisible.set(true);
  }

  async openEditModal(subjectId?: string | null): Promise<void> {
    const id = subjectId ?? this.selectedId();
    if (!id) {
      this.message.warning(this.i18n.t('edu.systemManager.QINGXUANZEQIZHONGYIXIANG.a', 'Xin chọn 1 hạng mục!'));
      return;
    }
    try {
      const d = await this.service.getDetail(id);
      if (!d) {
        this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
        return;
      }
      this.modalIsEdit.set(true);
      this.formId.set(d.subjectId ?? id);
      this.formNo.set(d.subjectNo ?? '');
      this.formName.set(d.subjectName ?? '');
      this.formBusiness.set(this.common.splitCsv(d.mainBusiness));
      this.modalVisible.set(true);
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  closeModal(): void {
    this.modalVisible.set(false);
  }

  async save(): Promise<void> {
    if (!this.formNo().trim() || !this.formName().trim()) {
      this.message.warning(this.i18n.t('edu.courseSubjects.msg.required', 'Vui lòng nhập Mã môn học và Tên môn học!'));
      return;
    }
    const codes = this.formBusiness();
    const nameMap = new Map(this.businessOptions().map((o) => [o.codeNo, this.codeLabel(o)]));
    const payload: EduCourseSubjectRow = {
      subjectId: this.formId() ?? undefined,
      subjectNo: this.formNo().trim(),
      subjectName: this.formName().trim(),
      mainBusiness: codes.join(',') || undefined,
      mainBusinessName: codes.map((c) => nameMap.get(c) ?? c).join(',') || undefined,
    };
    this.saving.set(true);
    try {
      const res = this.modalIsEdit() ? await this.service.update(payload) : await this.service.add(payload);
      if (res.success) {
        this.message.success(this.i18n.t('common.saveSuccess', 'Lưu thành công'));
        this.modalVisible.set(false);
        await this.search();
      } else if (res.errorCode === ECS_ERR_DUPLICATE) {
        this.message.error(this.i18n.t('edu.courseSubjects.msg.duplicate', 'Mã môn học đã tồn tại!'));
      } else {
        this.message.error(this.i18n.t('common.saveFailed', 'Lưu thất bại.'));
      }
    } catch {
      this.message.error(this.i18n.t('common.saveFailed', 'Lưu thất bại.'));
    } finally {
      this.saving.set(false);
    }
  }

  deleteSelected(): void {
    const id = this.selectedId();
    if (!id) {
      this.message.warning(this.i18n.t('edu.systemManager.QINGXUANZEQIZHONGYIXIANG.a', 'Xin chọn 1 hạng mục!'));
      return;
    }
    this.modal.confirm({
      nzTitle: this.i18n.t('edu.systemManager.QUEDINGSHIFOUSHANCHU.a', 'Đồng ý xóa không?'),
      nzOkDanger: true,
      nzMaskClosable: true,
      nzOnOk: async () => {
        try {
          const res = await this.service.delete(id);
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
}
