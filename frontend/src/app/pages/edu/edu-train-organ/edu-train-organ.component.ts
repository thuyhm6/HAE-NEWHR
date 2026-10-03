import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import { EduAttachmentComponent } from '../shared/edu-attachment/edu-attachment.component';
import { EDU_FILE_TYPE_ORGAN, EduCommonService, EduFile } from '../shared/edu-common.service';
import { EduTrainOrganRow, EduTrainOrganService } from './edu-train-organ.service';

import { TABLE_PAGE_SIZE_OPTIONS } from '../../../core/config/table-pagination.config';
/** Các trường văn bản trên form - dùng chung để dựng form và payload. */
type EtoTextField = 'organName' | 'linkman' | 'address' | 'officePhone' | 'cellphone' | 'urlNet' | 'mainField' | 'workTogether' | 'organAbstract';

/**
 * Đơn vị đào tạo - port từ /edu/traineducation/trainOrgan (Hanwha_HTSV:
 * trainOrgan.jsp / addTrainOrgan.jsp / trainOrganInfo.jsp / singleTrainOrganInfo.jsp).
 * - Cột "Hợp đồng" hiển thị file đính kèm; bấm tên đơn vị để xem chi tiết.
 * Modal đóng khi bấm ra ngoài vùng modal (nzMaskClosable).
 */
@Component({
  selector: 'app-edu-train-organ',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCardModule,
    NzDescriptionsModule,
    NzFormModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzTableModule,
    EduAttachmentComponent,
  ],
  templateUrl: './edu-train-organ.component.html',
  styleUrl: './edu-train-organ.component.scss',
})
export class EduTrainOrganComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;

  private readonly service = inject(EduTrainOrganService);
  protected readonly common = inject(EduCommonService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  /** Thứ tự + nhãn các trường giữ nguyên addTrainOrgan.jsp bản gốc. */
  protected readonly fields: { key: EtoTextField; label: string; fallback: string; required?: boolean; wide?: boolean }[] = [
    { key: 'organName', label: 'edu.trainOrgan.PEIXUNJIGOUMINGCHENG.a', fallback: 'Tên đơn vị', required: true },
    { key: 'linkman', label: 'edu.trainOrgan.LIANXIREN.a', fallback: 'Người liên hệ' },
    { key: 'address', label: 'hr.viewRelation.title.FAM_ADDRESS', fallback: 'Địa chỉ' },
    { key: 'officePhone', label: 'hr.viewHire.title.OFFICE_PHONE', fallback: 'Điện thoại văn phòng' },
    { key: 'cellphone', label: 'hrm.empinfo.MOBILE_TELEPHONE', fallback: 'Điện thoại' },
    { key: 'urlNet', label: 'pa.ins.alert.message.exportdata.netAddress', fallback: 'Website' },
    { key: 'mainField', label: 'edu.trainOrgan.ZHUYINGLINGYU.a', fallback: 'Lĩnh vực chính' },
    { key: 'workTogether', label: 'edu.trainOrgan.HEZUOQINGKUANGJIPINGJIA.a', fallback: 'Hợp tác & đánh giá', wide: true },
    { key: 'organAbstract', label: 'edu.trainOrgan.JIGOUJIANJIE.a', fallback: 'Giới thiệu đơn vị', wide: true },
  ];

  // ===== Bộ lọc & danh sách =====
  protected readonly searchName = signal('');
  protected readonly searchAddress = signal('');
  protected readonly keyword = signal('');
  protected readonly listLoading = signal(false);
  protected readonly rows = signal<EduTrainOrganRow[]>([]);
  protected readonly selectedNo = signal<string | null>(null);

  protected readonly filteredRows = computed(() => {
    const kw = this.keyword().trim().toLowerCase();
    if (!kw) return this.rows();
    return this.rows().filter((r) =>
      [r.organName, r.linkman, r.address, r.officePhone, r.cellphone, r.urlNet, r.mainField].some((v) => (v ?? '').toLowerCase().includes(kw)),
    );
  });

  // ===== Modal Thêm/Sửa =====
  protected readonly modalVisible = signal(false);
  protected readonly modalIsEdit = signal(false);
  protected readonly saving = signal(false);
  protected readonly form = signal<EduTrainOrganRow>({});
  protected readonly formFiles = signal<EduFile[]>([]);
  protected readonly formPendingFiles = signal<File[]>([]);

  // ===== Modal Xem chi tiết =====
  protected readonly detailVisible = signal(false);
  protected readonly detail = signal<EduTrainOrganRow | null>(null);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.search();
  }

  async search(): Promise<void> {
    this.listLoading.set(true);
    try {
      this.rows.set(await this.service.getList(this.searchName().trim(), this.searchAddress().trim()));
      this.selectedNo.set(null);
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.listLoading.set(false);
    }
  }

  clearSearch(): void {
    this.searchName.set('');
    this.searchAddress.set('');
    this.keyword.set('');
    this.search();
  }

  selectRow(row: EduTrainOrganRow): void {
    this.selectedNo.set(row.organNo ?? null);
  }

  setField(key: EtoTextField, value: string): void {
    this.form.set({ ...this.form(), [key]: value });
  }

  openAddModal(): void {
    this.modalIsEdit.set(false);
    this.form.set({});
    this.formFiles.set([]);
    this.formPendingFiles.set([]);
    this.modalVisible.set(true);
  }

  async openEditModal(organNo?: string | null): Promise<void> {
    const no = organNo ?? this.selectedNo();
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
      this.form.set({ ...d, files: undefined });
      this.formFiles.set(d.files ?? []);
      this.formPendingFiles.set([]);
      this.modalVisible.set(true);
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  closeModal(): void {
    this.modalVisible.set(false);
  }

  async reloadFiles(): Promise<void> {
    const no = this.form().organNo;
    if (no) this.formFiles.set(await this.common.getFiles(EDU_FILE_TYPE_ORGAN, no));
  }

  async save(): Promise<void> {
    const data = this.form();
    if (!data.organName?.trim()) {
      this.message.warning(this.i18n.t('edu.trainOrgan.msg.nameRequired', 'Vui lòng nhập Tên đơn vị!'));
      return;
    }
    const payload: EduTrainOrganRow = {};
    (Object.keys(data) as (keyof EduTrainOrganRow)[]).forEach((k) => {
      const v = data[k];
      if (typeof v === 'string') (payload as Record<string, string | undefined>)[k] = v.trim() || undefined;
    });
    const isEdit = this.modalIsEdit();
    this.saving.set(true);
    try {
      const res = isEdit ? await this.service.update(payload) : await this.service.add(payload);
      if (!res.success) {
        this.message.error(this.i18n.t('common.saveFailed', 'Lưu thất bại.'));
        return;
      }
      const organNo = isEdit ? payload.organNo : (res['organNo'] as string | undefined);
      const pending = this.formPendingFiles();
      if (pending.length && organNo) {
        const up = await this.common.uploadFiles(EDU_FILE_TYPE_ORGAN, organNo, pending);
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

  async openDetail(organNo?: string): Promise<void> {
    if (!organNo) return;
    try {
      this.detail.set(await this.service.getDetail(organNo));
      this.detailVisible.set(true);
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }
}
