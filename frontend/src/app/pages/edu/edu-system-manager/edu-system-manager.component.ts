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

import { AuthService } from '../../../auth/auth.service';
import { I18nService } from '../../../i18n/i18n.service';
import { SyCodeOption } from '../../ar/company-calendar/company-calendar.service';
import {
  ESM_DELETE_ALLOWED_CPNY,
  ESM_ERR_DUPLICATE,
  ESM_TRAIN_DIFF_PARENT_CODE,
  EduSystemManagerRow,
  EduSystemManagerService,
} from './edu-system-manager.service';

import { TABLE_PAGE_SIZE_OPTIONS, TABLE_DEFAULT_PAGE_SIZE } from '../../../core/config/table-pagination.config';
/**
 * Hệ thống đào tạo - port từ /edu/traineducation/systemManager (Hanwha_HAE:
 * systemManager.jsp / addSystemManager.jsp / systemManagerInfo.jsp).
 * Giữ nguyên hành vi bản gốc:
 * - Loại hình (TRAIN_TYPE_CODE) là mã con, nạp lại theo Chương trình đào tạo đã chọn.
 * - Chọn 1 dòng rồi bấm Sửa/Xóa (có thêm double-click dòng để Sửa nhanh).
 * - Sửa chỉ cho đổi Ghi chú; Mã loại hình tự sinh khi thêm mới.
 * - Nút Xóa chỉ hiện với công ty HAE.
 * Modal đóng khi bấm ra ngoài vùng modal (nzMaskClosable).
 */
@Component({
  selector: 'app-edu-system-manager',
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
  templateUrl: './edu-system-manager.component.html',
  styleUrl: './edu-system-manager.component.scss',
})
export class EduSystemManagerComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
  protected readonly defaultPageSize = TABLE_DEFAULT_PAGE_SIZE;

  private readonly service = inject(EduSystemManagerService);
  private readonly authService = inject(AuthService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  // ===== Bộ lọc =====
  protected readonly diffOptions = signal<SyCodeOption[]>([]);
  protected readonly searchDiffCode = signal<string | null>(null);
  protected readonly searchTypeOptions = signal<SyCodeOption[]>([]);
  protected readonly searchTypeCode = signal<string | null>(null);
  protected readonly keyword = signal('');

  // ===== Danh sách =====
  protected readonly listLoading = signal(false);
  protected readonly rows = signal<EduSystemManagerRow[]>([]);
  protected readonly selectedNo = signal<string | null>(null);

  /** Lọc nhanh phía client (thay cho ô "Lọc nhanh" của DataTables bản gốc). */
  protected readonly filteredRows = computed(() => {
    const kw = this.keyword().trim().toLowerCase();
    if (!kw) return this.rows();
    return this.rows().filter((r) =>
      [r.trainDiffCodeName, r.trainTypeCodeName, r.trainTypeNo, r.remark].some((v) => (v ?? '').toLowerCase().includes(kw)),
    );
  });

  protected readonly canDelete = computed(() => this.authService.currentUser()?.cpnyId === ESM_DELETE_ALLOWED_CPNY);

  // ===== Modal Thêm/Sửa =====
  protected readonly modalVisible = signal(false);
  protected readonly modalIsEdit = signal(false);
  protected readonly saving = signal(false);
  protected readonly formSysmanaNo = signal<string | null>(null);
  protected readonly formDiffCode = signal<string | null>(null);
  protected readonly formTypeCode = signal<string | null>(null);
  protected readonly formTypeOptions = signal<SyCodeOption[]>([]);
  protected readonly formDiffName = signal('');
  protected readonly formTypeName = signal('');
  protected readonly formTrainTypeNo = signal('');
  protected readonly formRemark = signal('');

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    if (!this.authService.currentUser()) {
      await this.authService.loadCurrentUser();
    }
    await Promise.all([this.loadDiffOptions(), this.search()]);
  }

  private async loadDiffOptions(): Promise<void> {
    try {
      this.diffOptions.set(await this.service.getCodeList(ESM_TRAIN_DIFF_PARENT_CODE));
    } catch {
      this.diffOptions.set([]);
    }
  }

  private async loadTypeOptions(parentCode: string | null): Promise<SyCodeOption[]> {
    if (!parentCode) return [];
    try {
      return await this.service.getCodeList(parentCode);
    } catch {
      return [];
    }
  }

  protected codeLabel(opt: SyCodeOption): string {
    return opt.codeName || opt.nameVi || opt.codeNo;
  }

  async onSearchDiffChange(value: string | null): Promise<void> {
    this.searchDiffCode.set(value);
    this.searchTypeCode.set(null);
    this.searchTypeOptions.set(await this.loadTypeOptions(value));
  }

  async search(): Promise<void> {
    this.listLoading.set(true);
    try {
      this.rows.set(await this.service.getList(this.searchDiffCode(), this.searchTypeCode()));
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
    this.searchTypeOptions.set([]);
    this.keyword.set('');
    this.search();
  }

  selectRow(row: EduSystemManagerRow): void {
    this.selectedNo.set(row.sysmanaNo ?? null);
  }

  // ===== Thêm mới =====
  openAddModal(): void {
    this.modalIsEdit.set(false);
    this.formSysmanaNo.set(null);
    this.formDiffCode.set(null);
    this.formTypeCode.set(null);
    this.formTypeOptions.set([]);
    this.formTrainTypeNo.set('');
    this.formRemark.set('');
    this.modalVisible.set(true);
  }

  async onFormDiffChange(value: string | null): Promise<void> {
    this.formDiffCode.set(value);
    this.formTypeCode.set(null);
    this.formTypeOptions.set(await this.loadTypeOptions(value));
  }

  // ===== Sửa =====
  async openEditModal(sysmanaNo?: string | null): Promise<void> {
    const no = sysmanaNo ?? this.selectedNo();
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
      this.formSysmanaNo.set(d.sysmanaNo ?? no);
      this.formDiffCode.set(d.trainDiffCode ?? null);
      this.formTypeCode.set(d.trainTypeCode ?? null);
      this.formDiffName.set(d.trainDiffCodeName ?? '');
      this.formTypeName.set(d.trainTypeCodeName ?? '');
      this.formTrainTypeNo.set(d.trainTypeNo ?? '');
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
    if (!isEdit) {
      if (!this.formDiffCode()) {
        this.message.warning(this.i18n.t('edu.systemManager.msg.selectDiff', 'Vui lòng chọn Chương trình đào tạo!'));
        return;
      }
      if (!this.formTypeCode()) {
        this.message.warning(this.i18n.t('edu.systemManager.msg.selectType', 'Vui lòng chọn Loại hình!'));
        return;
      }
    }
    const payload: EduSystemManagerRow = {
      sysmanaNo: this.formSysmanaNo() ?? undefined,
      trainDiffCode: this.formDiffCode() ?? undefined,
      trainTypeCode: this.formTypeCode() ?? undefined,
      remark: this.formRemark().trim() || undefined,
    };
    this.saving.set(true);
    try {
      const res = isEdit ? await this.service.update(payload) : await this.service.add(payload);
      if (res.success) {
        this.message.success(this.i18n.t('common.saveSuccess', 'Lưu thành công'));
        this.modalVisible.set(false);
        await this.search();
      } else if (res.errorCode === ESM_ERR_DUPLICATE) {
        this.message.error(this.i18n.t('edu.systemManager.msg.duplicate', 'Loại hình đào tạo không được trùng lặp!'));
      } else {
        this.message.error(this.i18n.t('common.saveFailed', 'Lưu thất bại.'));
      }
    } catch {
      this.message.error(this.i18n.t('common.saveFailed', 'Lưu thất bại.'));
    } finally {
      this.saving.set(false);
    }
  }

  // ===== Xóa =====
  deleteSelected(): void {
    const no = this.selectedNo();
    if (!no) {
      this.message.warning(this.i18n.t('edu.systemManager.QINGXUANZEQIZHONGYIXIANG.a', 'Xin chọn 1 hạng mục!'));
      return;
    }
    this.modal.confirm({
      nzTitle: this.i18n.t('edu.systemManager.QUEDINGSHIFOUSHANCHU.a', 'Đồng ý xóa không?'),
      nzOkDanger: true,
      nzMaskClosable: true,
      nzOnOk: async () => {
        try {
          const res = await this.service.delete(no);
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
