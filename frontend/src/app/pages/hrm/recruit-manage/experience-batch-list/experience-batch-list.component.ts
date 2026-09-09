import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import * as XLSX from 'xlsx';

import { I18nService } from '../../../../i18n/i18n.service';
import { RecruitCodeService, SyCodeOption } from '../shared/recruit-code.service';
import { ExpBatchRegister, ExpBatchRow, ExperienceBatchListService } from './experience-batch-list.service';

const TRANS_CODE_PARENT = '14013956';
const EMP_TYPE_PARENT = '13864';
const POST_FAMILY_PARENT = '14015812';
const DEFAULT_POST_GRADE_PARENT = '400001';
const POSITION_NO_PARENT = '14014036';
const MAIN_BUSINESS_PARENT = '400098';
const TEMPLATE_DOWNLOAD_URL = '/sy/excel/api/downloadTemplate?templateName=StartPoint_add_Template';

/**
 * Quyết định hàng loạt (viewExperienceBatchList) - port lại từ
 * hrm/recruitManage/viewExperienceBatchList.html (đã xoá). Xem ghi chú nút
 * "Xuất Excel" (endpoint export không tồn tại ở bản gốc) trong
 * experience-batch-list.service.ts.
 */
@Component({
  selector: 'app-experience-batch-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCheckboxModule,
    NzDatePickerModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzSelectModule,
    NzTableModule,
    NzTreeSelectModule,
  ],
  templateUrl: './experience-batch-list.component.html',
  styleUrl: './experience-batch-list.component.scss',
})
export class ExperienceBatchListComponent implements OnInit {
  private readonly service = inject(ExperienceBatchListService);
  private readonly codeService = inject(RecruitCodeService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly registerList = signal<ExpBatchRegister[]>([]);
  protected readonly selectedRegisterSeq = signal<string | null>(null);

  protected readonly rows = signal<ExpBatchRow[]>([]);
  protected readonly total = signal(0);
  protected readonly pageIndex = signal(1);
  protected readonly pageSize = signal(50);
  protected readonly listLoading = signal(false);
  protected readonly allProcessed = signal(false);
  protected readonly selectedSeqs = signal<Set<string>>(new Set());
  private drawCounter = 0;

  protected readonly deptTreeNodes = signal<NzTreeNodeOptions[]>([]);
  protected readonly transCodeOptions = signal<SyCodeOption[]>([]);
  protected readonly empTypeOptions = signal<SyCodeOption[]>([]);
  protected readonly postFamilyOptions = signal<SyCodeOption[]>([]);
  protected readonly positionNoOptions = signal<SyCodeOption[]>([]);
  protected readonly mainBusinessOptions = signal<SyCodeOption[]>([]);
  protected readonly transReasonOptions = signal<SyCodeOption[]>([]);
  protected readonly postGradeOptions = signal<SyCodeOption[]>([]);

  // ── Modal: Đăng ký ngày ──
  protected readonly registerModalVisible = signal(false);
  protected readonly savingRegister = signal(false);
  protected readonly formRegDate = signal<Date | null>(null);
  protected readonly formRegRemark = signal('');

  // ── Modal: Chỉnh sửa dòng ──
  protected readonly editModalVisible = signal(false);
  protected readonly editSaving = signal(false);
  protected readonly formEditSeq = signal<string | null>(null);
  protected readonly formEditEmpId = signal('');
  protected readonly formEditLocalName = signal('');
  protected readonly formEditStartDate = signal('');
  protected readonly formEditTransCode = signal<string | null>(null);
  protected readonly formEditTransReason = signal<string | null>(null);
  protected readonly formEditDeptno = signal<string | null>(null);
  protected readonly formEditPostFamily = signal<string | null>(null);
  protected readonly formEditNewPostGradeNo = signal<string | null>(null);
  protected readonly formEditPositionNo = signal<string | null>(null);
  protected readonly formEditEmpTypeCode = signal<string | null>(null);
  protected readonly formEditMainBusiness = signal<string | null>(null);
  protected readonly formEditCostCenter = signal('');
  protected readonly formEditRemarks = signal('');

  // ── Modal: Chèn file (Import Excel) ──
  protected readonly importModalVisible = signal(false);
  protected readonly importFile = signal<File | null>(null);
  protected readonly importing = signal(false);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      const [deptList, transCodeList, empTypeList, postFamilyList, positionNoList, mainBusinessList] = await Promise.all([
        this.codeService.getAuthorizedDepartments(),
        this.codeService.getCodeList(TRANS_CODE_PARENT),
        this.codeService.getCodeList(EMP_TYPE_PARENT),
        this.codeService.getCodeList(POST_FAMILY_PARENT),
        this.codeService.getCodeList(POSITION_NO_PARENT),
        this.codeService.getCodeList(MAIN_BUSINESS_PARENT),
      ]);
      this.deptTreeNodes.set(this.codeService.buildDeptTree(deptList) as NzTreeNodeOptions[]);
      this.transCodeOptions.set(transCodeList);
      this.empTypeOptions.set(empTypeList);
      this.postFamilyOptions.set(postFamilyList);
      this.positionNoOptions.set(positionNoList);
      this.mainBusinessOptions.set(mainBusinessList);
    } catch {
      // im lặng bỏ qua - danh sách tùy chọn trống không chặn chức năng chính
    }
    await this.loadRegisterList();
  }

  private async loadRegisterList(selectSeq?: string): Promise<void> {
    try {
      const list = await this.service.getRegisterList();
      this.registerList.set(list || []);
      const target = selectSeq || this.selectedRegisterSeq();
      const exists = target && (list || []).some((r) => r.registerSeq === target);
      this.selectedRegisterSeq.set(exists ? target! : null);
      if (this.selectedRegisterSeq()) {
        this.pageIndex.set(1);
        await this.loadPage();
      } else {
        this.rows.set([]);
        this.total.set(0);
      }
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  async onRegisterChange(value: string | null): Promise<void> {
    this.selectedRegisterSeq.set(value);
    this.pageIndex.set(1);
    this.selectedSeqs.set(new Set());
    if (value) {
      await this.loadPage();
    } else {
      this.rows.set([]);
      this.total.set(0);
    }
  }

  private async loadPage(): Promise<void> {
    const registerSeq = this.selectedRegisterSeq();
    if (!registerSeq) return;
    this.listLoading.set(true);
    try {
      const start = (this.pageIndex() - 1) * this.pageSize();
      const res = await this.service.getBatchList(registerSeq, ++this.drawCounter, start, this.pageSize());
      this.rows.set(res.data || []);
      this.total.set(res.recordsTotal || 0);
      this.allProcessed.set(!!res.allProcessed);
      this.selectedSeqs.set(new Set());
    } catch {
      this.rows.set([]);
      this.total.set(0);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.listLoading.set(false);
    }
  }

  async onQueryParamsChange(params: NzTableQueryParams): Promise<void> {
    this.pageIndex.set(params.pageIndex);
    this.pageSize.set(params.pageSize);
    await this.loadPage();
  }

  async reload(): Promise<void> {
    await this.loadPage();
  }

  toggleRowSelected(seq: string, checked: boolean): void {
    const set = new Set(this.selectedSeqs());
    if (checked) set.add(seq);
    else set.delete(seq);
    this.selectedSeqs.set(set);
  }

  isRowSelected(seq?: string): boolean {
    return !!seq && this.selectedSeqs().has(seq);
  }

  toggleSelectAll(checked: boolean): void {
    const eligible = this.rows().filter((r) => r.activity !== '1').map((r) => r.seq!).filter(Boolean);
    this.selectedSeqs.set(checked ? new Set(eligible) : new Set());
  }

  // ── Modal Đăng ký ────────────────────────────────────────────────────────
  openRegisterModal(): void {
    this.formRegDate.set(null);
    this.formRegRemark.set('');
    this.registerModalVisible.set(true);
  }

  async saveRegisterModal(): Promise<void> {
    const d = this.formRegDate();
    if (!d) {
      this.message.warning(this.i18n.t('ebl.modal.register.date', 'Ngày đăng ký'));
      return;
    }
    const registerDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    this.savingRegister.set(true);
    try {
      const res = await this.service.saveRegister({ registerDate, registerRemark: this.formRegRemark().trim() || undefined });
      if (res.success) {
        this.registerModalVisible.set(false);
        await this.loadRegisterList(res.registerSeq);
      } else {
        this.message.error(res.message || this.i18n.t('common.error', 'Lỗi'));
      }
    } catch {
      this.message.error(this.i18n.t('common.error', 'Lỗi'));
    } finally {
      this.savingRegister.set(false);
    }
  }

  // ── Tải bản mẫu ─────────────────────────────────────────────────────────
  downloadTemplate(): void {
    window.location.href = TEMPLATE_DOWNLOAD_URL;
  }

  // ── Chèn file (Import Excel) ───────────────────────────────────────────
  openImportModal(): void {
    if (!this.selectedRegisterSeq()) {
      this.message.warning(this.i18n.t('ebl.js.selectRegister', 'Vui lòng chọn Ngày đăng ký trước'));
      return;
    }
    this.importFile.set(null);
    this.importModalVisible.set(true);
  }

  onImportFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.importFile.set(input.files && input.files.length ? input.files[0] : null);
  }

  async submitImport(): Promise<void> {
    const file = this.importFile();
    const registerSeq = this.selectedRegisterSeq();
    if (!file || !registerSeq) return;
    this.importing.set(true);
    try {
      const res = await this.service.importBatchExcel(file, registerSeq);
      this.importModalVisible.set(false);
      if (res.success) {
        this.message.success(`${this.i18n.t('ebl.js.importSuccess', 'Nhập file thành công')} (${res.successCount || 0})`);
      } else {
        this.message.warning(this.i18n.t('ebl.js.importFailed', 'Nhập file thất bại'));
      }
      await this.loadPage();
    } catch {
      this.importModalVisible.set(false);
      this.message.error(this.i18n.t('ebl.js.importFailed', 'Nhập file thất bại'));
    } finally {
      this.importing.set(false);
    }
  }

  // ── Xác nhận hàng loạt ──────────────────────────────────────────────────
  confirmExecute(): void {
    const registerSeq = this.selectedRegisterSeq();
    if (!registerSeq) {
      this.message.warning(this.i18n.t('ebl.js.selectRegister', 'Vui lòng chọn Ngày đăng ký trước'));
      return;
    }
    this.modal.confirm({
      nzTitle: this.i18n.t('ebl.js.confirmExecute', 'Xác nhận thực hiện quyết định hàng loạt?'),
      nzOnOk: async () => {
        try {
          const res = await this.service.execute(registerSeq);
          if (res.success) {
            this.message.success(res.message || this.i18n.t('common.success', 'Thành công'));
            await this.loadPage();
          } else {
            this.message.error(res.message || this.i18n.t('common.error', 'Lỗi'));
          }
        } catch {
          this.message.error(this.i18n.t('common.error', 'Lỗi'));
        }
      },
    });
  }

  // ── Xóa các dòng đã chọn ────────────────────────────────────────────────
  deleteSelected(): void {
    const seqs = Array.from(this.selectedSeqs());
    if (!seqs.length) {
      this.message.warning(this.i18n.t('ebl.js.selectRow', 'Vui lòng chọn ít nhất một dòng'));
      return;
    }
    this.modal.confirm({
      nzTitle: this.i18n.t('ebl.js.confirmDelete', 'Bạn có chắc muốn xóa không?'),
      nzOkDanger: true,
      nzOnOk: async () => {
        await Promise.all(seqs.map((seq) => this.service.deleteBatchItem(seq)));
        await this.loadPage();
      },
    });
  }

  // ── Xuất Excel (client-side, xem ghi chú service) ──────────────────────
  async exportExcel(): Promise<void> {
    const registerSeq = this.selectedRegisterSeq();
    if (!registerSeq) {
      this.message.warning(this.i18n.t('ebl.js.selectRegister', 'Vui lòng chọn Ngày đăng ký trước'));
      return;
    }
    try {
      const res = await this.service.getBatchList(registerSeq, ++this.drawCounter, 0, 100000);
      const allRows = res.data || [];
      const header = [
        this.i18n.t('common.stt', 'STT'),
        this.i18n.t('common.empId', 'Mã nhân viên'),
        this.i18n.t('common.empName', 'Họ tên'),
        this.i18n.t('ebl.col.startDate', 'Thời gian'),
        this.i18n.t('ebl.col.decision', 'Quyết định'),
        this.i18n.t('ebl.col.reason', 'Lý do'),
        this.i18n.t('common.deptName', 'Phòng ban'),
        this.i18n.t('ebl.col.group', 'Nhóm nhân viên'),
        this.i18n.t('ebl.col.level', 'Chức vụ'),
        this.i18n.t('ebl.col.jobTitle', 'Chức danh'),
        this.i18n.t('ebl.col.empType', 'Loại nhân viên'),
        this.i18n.t('ebl.col.job', 'Công việc'),
        this.i18n.t('ebl.col.costCenter', 'Mã chi phí'),
      ];
      const data = allRows.map((r, idx) => [
        idx + 1,
        r.empId ?? '',
        r.localName ?? '',
        r.startDate ?? '',
        r.transCodeName ?? '',
        r.transReasonName ?? '',
        r.deptName ?? '',
        r.postFamilyName ?? '',
        r.postGradeName ?? '',
        r.positionNoName ?? '',
        r.empTypeName ?? '',
        r.mainBusinessName ?? '',
        r.costCenter ?? '',
      ]);
      const worksheet = XLSX.utils.aoa_to_sheet([header, ...data]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      XLSX.writeFile(workbook, 'quyet_dinh_hang_loat_export.xlsx');
    } catch {
      this.message.error(this.i18n.t('common.error', 'Lỗi'));
    }
  }

  // ── Modal Chỉnh sửa ─────────────────────────────────────────────────────
  async openEditModal(row: ExpBatchRow): Promise<void> {
    this.formEditSeq.set(row.seq ?? null);
    this.formEditEmpId.set(row.empId ?? '');
    this.formEditLocalName.set(row.localName ?? '');
    this.formEditStartDate.set(row.startDate ?? '');
    this.formEditCostCenter.set(row.costCenter ?? '');
    this.formEditRemarks.set(row.remarks ?? '');
    this.formEditDeptno.set(row.deptno ?? null);
    this.formEditTransCode.set(row.transCode ?? null);
    this.transReasonOptions.set(row.transCode ? await this.codeService.getCodeList(row.transCode) : []);
    this.formEditTransReason.set(row.transReason ?? null);
    this.formEditPostFamily.set(row.postFamily ?? null);
    this.postGradeOptions.set(await this.codeService.getCodeList(row.postFamily || DEFAULT_POST_GRADE_PARENT));
    this.formEditNewPostGradeNo.set(row.newPostGradeNo ?? null);
    this.formEditPositionNo.set(row.positionNo ?? null);
    this.formEditEmpTypeCode.set(row.empTypeCode ?? null);
    this.formEditMainBusiness.set(row.mainBusiness ?? null);
    this.editModalVisible.set(true);
  }

  async onEditTransCodeChange(value: string | null): Promise<void> {
    this.formEditTransCode.set(value);
    this.formEditTransReason.set(null);
    this.transReasonOptions.set(value ? await this.codeService.getCodeList(value) : []);
  }

  async onEditPostFamilyChange(value: string | null): Promise<void> {
    this.formEditPostFamily.set(value);
    this.formEditNewPostGradeNo.set(null);
    this.postGradeOptions.set(await this.codeService.getCodeList(value || DEFAULT_POST_GRADE_PARENT));
  }

  async saveEditModal(): Promise<void> {
    const seq = this.formEditSeq();
    if (!seq) return;
    this.editSaving.set(true);
    try {
      const res = await this.service.updateBatchItem({
        seq,
        startDate: this.formEditStartDate().trim() || undefined,
        transCode: this.formEditTransCode() ?? undefined,
        transReason: this.formEditTransReason() ?? undefined,
        deptno: this.formEditDeptno() ?? undefined,
        postFamily: this.formEditPostFamily() ?? undefined,
        newPostGradeNo: this.formEditNewPostGradeNo() ?? undefined,
        positionNo: this.formEditPositionNo() ?? undefined,
        empTypeCode: this.formEditEmpTypeCode() ?? undefined,
        mainBusiness: this.formEditMainBusiness() ?? undefined,
        costCenter: this.formEditCostCenter().trim() || undefined,
        remarks: this.formEditRemarks().trim() || undefined,
      });
      if (res.success) {
        this.editModalVisible.set(false);
        await this.loadPage();
      } else {
        this.message.error(res.message || this.i18n.t('common.error', 'Lỗi'));
      }
    } catch {
      this.message.error(this.i18n.t('common.error', 'Lỗi'));
    } finally {
      this.editSaving.set(false);
    }
  }
}
