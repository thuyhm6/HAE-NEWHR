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
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';

import { I18nService } from '../../../i18n/i18n.service';
import { EduAttachmentComponent } from '../shared/edu-attachment/edu-attachment.component';
import { EDU_FILE_TYPE_AGREEMENT, EduCommonService, EduEmployee, EduFile } from '../shared/edu-common.service';
import { EduEmpPickerComponent } from '../shared/edu-emp-picker/edu-emp-picker.component';
import {
  ETA_ERR_NO_PERSON,
  ETA_TEMPLATE_URL,
  EduAgreementQuery,
  EduTrainAgreementRow,
  EduTrainAgreementService,
} from './edu-train-agreement.service';

import { TABLE_PAGE_SIZE_OPTIONS } from '../../../core/config/table-pagination.config';
type EtaFeeField = 'hqFree' | 'cgfyFree' | 'jpFree' | 'zfbzFree' | 'cgbzFree' | 'cgbzFreeFact' | 'sybxFree' | 'yxPay' | 'jtFree' | 'txFree';
type EtaDateField = 'conStartDate' | 'conEndDate' | 'studyStartDate' | 'studyEndDate' | 'agreeStartDate' | 'agreeEndDate';

/**
 * Hợp đồng đào tạo - port từ /edu/traineducation/trainAgreement (Hanwha_HTSV:
 * trainAgreement.jsp / addTrainAgreement.jsp / trainAgreementInfo.jsp / queryPeixun.jsp).
 * - Số ngày đào tạo tự tính từ Ngày bắt đầu/kết thúc đào tạo (yanxiuTime bản gốc).
 * - Tiền thanh toán tự cộng từ các khoản phí (weiyuejinMethod bản gốc), vẫn cho sửa tay.
 * - Import Excel / tải file mẫu / xuất Excel (.xlsx).
 * Modal đóng khi bấm ra ngoài vùng modal (nzMaskClosable).
 */
@Component({
  selector: 'app-edu-train-agreement',
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
    NzTreeSelectModule,
    EduAttachmentComponent,
    EduEmpPickerComponent,
  ],
  templateUrl: './edu-train-agreement.component.html',
  styleUrl: './edu-train-agreement.component.scss',
})
export class EduTrainAgreementComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;

  private readonly service = inject(EduTrainAgreementService);
  protected readonly common = inject(EduCommonService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  /** Các khoản phí theo thứ tự addTrainAgreement.jsp bản gốc. */
  protected readonly feeFields: { key: EtaFeeField; label: string; fallback: string }[] = [
    { key: 'hqFree', label: 'edu.trainAgreement.HUQIANFEI.a', fallback: 'Phí bảo vệ' },
    { key: 'cgfyFree', label: 'edu.trainAgreement.CHUGUOFANGYIFEI.a', fallback: 'Phí thuốc phòng dịch' },
    { key: 'jpFree', label: 'edu.trainAgreement.JIPIAOFEI.a', fallback: 'Phí máy bay' },
    { key: 'zfbzFree', label: 'edu.trainAgreement.ZHUFANGBUZHU.a', fallback: 'Trợ cấp nơi ở' },
    { key: 'cgbzFree', label: 'edu.trainAgreement.CHUGUOBUZHU.a', fallback: 'Trợ cấp công tác' },
    { key: 'cgbzFreeFact', label: 'edu.trainAgreement.CHUGUOBUZHUSHIJI.a', fallback: 'Trợ cấp công tác thực tế' },
    { key: 'sybxFree', label: 'edu.trainAgreement.SHANGYEBAOXIANFEI.a', fallback: 'Phí BH thương mại' },
    { key: 'yxPay', label: 'edu.trainAgreement.YANXIUGONGZI.a', fallback: 'Lương đào tạo' },
    { key: 'jtFree', label: 'edu.trainAgreement.JIAOTONGFEI.a', fallback: 'Phụ cấp đi lại' },
    { key: 'txFree', label: 'edu.trainAgreement.TONGXINFEI.a', fallback: 'Trợ cấp điện thoại' },
  ];

  protected readonly dateFields: { key: EtaDateField; label: string; fallback: string }[] = [
    { key: 'conStartDate', label: 'edu.trainAgreement.excel.conStart', fallback: 'Ngày bắt đầu hợp đồng' },
    { key: 'conEndDate', label: 'edu.trainAgreement.excel.conEnd', fallback: 'Ngày kết thúc hợp đồng' },
    { key: 'studyStartDate', label: 'edu.trainAgreement.YANXIUKAISHIRI.a', fallback: 'Ngày bắt đầu đào tạo' },
    { key: 'studyEndDate', label: 'edu.trainAgreement.YANXIUJIESHURI.a', fallback: 'Ngày kết thúc đào tạo' },
  ];

  // ===== Bộ lọc & danh sách =====
  protected readonly deptNodes = signal<NzTreeNodeOptions[]>([]);
  protected readonly searchDept = signal<string | null>(null);
  protected readonly searchKeyword = signal('');
  protected readonly searchConStart = signal<Date | null>(null);
  protected readonly searchConEnd = signal<Date | null>(null);
  protected readonly keyword = signal('');
  protected readonly listLoading = signal(false);
  protected readonly rows = signal<EduTrainAgreementRow[]>([]);
  protected readonly selectedNo = signal<string | null>(null);
  protected readonly importing = signal(false);

  protected readonly filteredRows = computed(() => {
    const kw = this.keyword().trim().toLowerCase();
    if (!kw) return this.rows();
    return this.rows().filter((r) =>
      [r.agreeId, r.agreeName, r.empid, r.localName, r.departName, r.factPay].some((v) => (v ?? '').toLowerCase().includes(kw)),
    );
  });

  // ===== Modal Thêm/Sửa =====
  protected readonly modalVisible = signal(false);
  protected readonly modalIsEdit = signal(false);
  protected readonly saving = signal(false);
  protected readonly formAgreeNo = signal<string | null>(null);
  protected readonly formAgreeId = signal('');
  protected readonly formAgreeName = signal('');
  protected readonly formSearchName = signal('');
  protected readonly formEmpid = signal('');
  protected readonly formLocalName = signal('');
  protected readonly formDates = signal<Record<EtaDateField, Date | null>>(this.emptyDates());
  protected readonly formStudyDay = signal<number | null>(null);
  protected readonly formFees = signal<Record<EtaFeeField, number | null>>(this.emptyFees());
  protected readonly formFactPay = signal<number | null>(null);
  protected readonly formRemark = signal('');
  protected readonly formFiles = signal<EduFile[]>([]);
  protected readonly formPendingFiles = signal<File[]>([]);
  protected readonly empPickerVisible = signal(false);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    this.loadDeptTree();
    await this.search();
  }

  private async loadDeptTree(): Promise<void> {
    try {
      this.deptNodes.set(this.common.buildDeptTree(await this.common.getDeptTree()));
    } catch {
      this.deptNodes.set([]);
    }
  }

  private emptyDates(): Record<EtaDateField, Date | null> {
    return { conStartDate: null, conEndDate: null, studyStartDate: null, studyEndDate: null, agreeStartDate: null, agreeEndDate: null };
  }

  private emptyFees(): Record<EtaFeeField, number | null> {
    return {
      hqFree: null, cgfyFree: null, jpFree: null, zfbzFree: null, cgbzFree: null,
      cgbzFreeFact: null, sybxFree: null, yxPay: null, jtFree: null, txFree: null,
    };
  }

  private buildQuery(): EduAgreementQuery {
    return {
      deptNo: this.searchDept(),
      keyword: this.searchKeyword().trim(),
      conStartDate: this.common.formatDate(this.searchConStart()),
      conEndDate: this.common.formatDate(this.searchConEnd()),
    };
  }

  async search(): Promise<void> {
    this.listLoading.set(true);
    try {
      this.rows.set(await this.service.getList(this.buildQuery()));
      this.selectedNo.set(null);
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
    this.searchConStart.set(null);
    this.searchConEnd.set(null);
    this.keyword.set('');
    this.search();
  }

  selectRow(row: EduTrainAgreementRow): void {
    this.selectedNo.set(row.agreeNo ?? null);
  }

  // ===== Form =====
  setDate(key: EtaDateField, value: Date | null): void {
    this.formDates.set({ ...this.formDates(), [key]: value });
    if (key === 'studyStartDate' || key === 'studyEndDate') this.calcStudyDay();
  }

  /** Số ngày đào tạo = (kết thúc - bắt đầu) + 1 (yanxiuTime/DateDiff bản gốc). */
  private calcStudyDay(): void {
    const { studyStartDate: s, studyEndDate: e } = this.formDates();
    if (!s || !e) return;
    if (e < s) {
      this.message.warning(this.i18n.t('edu.trainAgreement.YANXIUJIESHUSHIJIANDAYUKAISHISHIJIAN.a', 'Ngày kết thúc đào tạo không được sớm hơn ngày bắt đầu!'));
      this.formDates.set({ ...this.formDates(), studyEndDate: null });
      this.formStudyDay.set(null);
      return;
    }
    const start = Date.UTC(s.getFullYear(), s.getMonth(), s.getDate());
    const end = Date.UTC(e.getFullYear(), e.getMonth(), e.getDate());
    this.formStudyDay.set(Math.round((end - start) / 86400000) + 1);
  }

  /** Tiền thanh toán = tổng các khoản phí, làm tròn (weiyuejinMethod bản gốc). */
  setFee(key: EtaFeeField, value: number | null): void {
    const fees = { ...this.formFees(), [key]: value };
    this.formFees.set(fees);
    const total = Object.values(fees).reduce<number>((sum, v) => sum + (v ?? 0), 0);
    this.formFactPay.set(Math.round(total));
  }

  onEmployeePicked(list: EduEmployee[]): void {
    const e = list[0];
    if (!e) return;
    this.formEmpid.set(e.empid);
    this.formLocalName.set(e.localName);
  }

  private resetForm(): void {
    this.formAgreeNo.set(null);
    this.formAgreeId.set('');
    this.formAgreeName.set('');
    this.formSearchName.set('');
    this.formEmpid.set('');
    this.formLocalName.set('');
    this.formDates.set(this.emptyDates());
    this.formStudyDay.set(null);
    this.formFees.set(this.emptyFees());
    this.formFactPay.set(null);
    this.formRemark.set('');
    this.formFiles.set([]);
    this.formPendingFiles.set([]);
  }

  openAddModal(): void {
    this.resetForm();
    this.modalIsEdit.set(false);
    this.modalVisible.set(true);
  }

  async openEditModal(agreeNo?: string | null): Promise<void> {
    const no = agreeNo ?? this.selectedNo();
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
      this.resetForm();
      this.formAgreeNo.set(d.agreeNo ?? no);
      this.formAgreeId.set(d.agreeId ?? '');
      this.formAgreeName.set(d.agreeName ?? '');
      this.formEmpid.set(d.empid ?? '');
      this.formLocalName.set(d.localName ?? '');
      const dates = this.emptyDates();
      (Object.keys(dates) as EtaDateField[]).forEach((k) => (dates[k] = this.common.parseDate(d[k])));
      this.formDates.set(dates);
      this.formStudyDay.set(this.toNumber(d.studyDay));
      const fees = this.emptyFees();
      (Object.keys(fees) as EtaFeeField[]).forEach((k) => (fees[k] = this.toNumber(d[k])));
      this.formFees.set(fees);
      this.formFactPay.set(this.toNumber(d.factPay));
      this.formRemark.set(d.remark ?? '');
      this.formFiles.set(d.files ?? []);
      this.modalIsEdit.set(true);
      this.modalVisible.set(true);
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  private toNumber(value?: string): number | null {
    if (value == null || value === '') return null;
    const n = Number(value);
    return isNaN(n) ? null : n;
  }

  private toText(value: number | null): string | undefined {
    return value == null ? undefined : String(value);
  }

  closeModal(): void {
    this.modalVisible.set(false);
  }

  async reloadFiles(): Promise<void> {
    const no = this.formAgreeNo();
    if (no) this.formFiles.set(await this.common.getFiles(EDU_FILE_TYPE_AGREEMENT, no));
  }

  async save(): Promise<void> {
    if (!this.formAgreeName().trim()) {
      this.message.warning(this.i18n.t('edu.trainAgreement.msg.nameRequired', 'Vui lòng nhập Tên hợp đồng!'));
      return;
    }
    if (!this.formEmpid()) {
      this.message.warning(this.i18n.t('edu.teacherManager.QINGXIANXUANZEYIGEREN.a', 'Xin chọn 1 người!'));
      return;
    }
    const dates = this.formDates();
    const fees = this.formFees();
    const payload: EduTrainAgreementRow = {
      agreeNo: this.formAgreeNo() ?? undefined,
      agreeName: this.formAgreeName().trim(),
      empid: this.formEmpid(),
      studyDay: this.toText(this.formStudyDay()),
      factPay: this.toText(this.formFactPay()),
      remark: this.formRemark().trim() || undefined,
    };
    (Object.keys(dates) as EtaDateField[]).forEach((k) => (payload[k] = this.common.formatDate(dates[k])));
    (Object.keys(fees) as EtaFeeField[]).forEach((k) => (payload[k] = this.toText(fees[k])));
    const isEdit = this.modalIsEdit();
    this.saving.set(true);
    try {
      const res = isEdit ? await this.service.update(payload) : await this.service.add(payload);
      if (!res.success) {
        const msg = res.errorCode === ETA_ERR_NO_PERSON
          ? this.i18n.t('edu.teacherManager.QINGXIANXUANZEYIGEREN.a', 'Xin chọn 1 người!')
          : this.i18n.t('common.saveFailed', 'Lưu thất bại.');
        this.message.error(msg);
        return;
      }
      const agreeNo = isEdit ? payload.agreeNo : (res['agreeNo'] as string | undefined);
      const pending = this.formPendingFiles();
      if (pending.length && agreeNo) {
        const up = await this.common.uploadFiles(EDU_FILE_TYPE_AGREEMENT, agreeNo, pending);
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

  // ===== Excel =====
  async onImportFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    this.importing.set(true);
    try {
      const res = await this.service.importExcel(file);
      if (res.success) {
        this.message.success(this.i18n.t('edu.common.importSuccess', 'Import thành công!'));
        await this.search();
      } else if (res.errors?.length) {
        this.modal.error({
          nzTitle: this.i18n.t('edu.common.importFailed', 'Import thất bại.'),
          nzContent: res.errors.slice(0, 30).join('<br/>') + (res.errors.length > 30 ? '<br/>...' : ''),
          nzMaskClosable: true,
        });
      } else {
        this.message.error(this.i18n.t('edu.common.importFailed', 'Import thất bại.'));
      }
    } catch {
      this.message.error(this.i18n.t('edu.common.importFailed', 'Import thất bại.'));
    } finally {
      this.importing.set(false);
    }
  }

  downloadTemplate(): void {
    window.location.href = ETA_TEMPLATE_URL;
  }

  exportExcel(): void {
    window.location.href = this.service.buildExportUrl(this.buildQuery());
  }
}
