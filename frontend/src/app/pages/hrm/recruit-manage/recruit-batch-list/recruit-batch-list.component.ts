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
import { RblRegister, RblRow, RecruitBatchListService } from './recruit-batch-list.service';

import { TABLE_PAGE_SIZE_OPTIONS } from '../../../../core/config/table-pagination.config';
/**
 * Bug thật đã sửa (có ở bản gốc, không phải do migrate): HTML gốc
 * `rbl_editJoinType` dùng `data-parent-code="400001"` cho dropdown "Loại
 * nhập" - đã xác minh qua API `/sy/api/getCode/list?parentCodeNo=400001`
 * trả về danh sách thành phố Trung Quốc (北京/天津...), hoàn toàn không liên
 * quan. Nhóm mã đúng là '1359' (xác nhận chứa "Kinh nghiệm"/"Chuyên
 * gia"/"Mới tốt nghiệp", khớp với JOIN_TYPE_NAME thực tế hiển thị trong
 * bảng) - đây cũng chính là nhóm mã đã dùng đúng cho field cùng ý nghĩa
 * (joinType) ở recruit-list.component.ts. 400001 vẫn được giữ lại làm
 * fallback cho dropdown "Chức vụ" phụ thuộc postFamily (JOIN_DETAIL_TYPE
 * fallback riêng), không đụng tới phần đó.
 */
const JOIN_TYPE_PARENT = '1359';
const JOIN_DETAIL_TYPE_FALLBACK_PARENT = '14014036';
const POST_FAMILY_PARENT = '14015812';
const DEFAULT_POST_GRADE_PARENT = '400001';
const POSITION_NO_PARENT = '14014036';
const EMP_TYPE_PARENT = '13864';
const MAIN_BUSINESS_PARENT = '400098';
const SEXCODE_PARENT = '1324';
const NATIONALITY_PARENT = '870';
const NATION_PARENT = '210942';
const MARITAL_STATUS_PARENT = '1709';
const DEGREE_PARENT = '13769';
const TEMPLATE_DOWNLOAD_URL = '/sy/excel/api/downloadTemplate?templateName=NewEmp_add_Template';

/**
 * Nhận việc hàng loạt (viewRecruitBatchList) - port lại từ
 * hrm/recruitManage/viewRecruitBatchList.html (đã xoá). Xem ghi chú nút
 * "Xuất Excel" (endpoint export không tồn tại ở bản gốc) trong
 * recruit-batch-list.service.ts.
 */
@Component({
  selector: 'app-recruit-batch-list',
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
  templateUrl: './recruit-batch-list.component.html',
  styleUrl: './recruit-batch-list.component.scss',
})
export class RecruitBatchListComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;

  private readonly service = inject(RecruitBatchListService);
  private readonly codeService = inject(RecruitCodeService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly registerList = signal<RblRegister[]>([]);
  protected readonly selectedRegisterSeq = signal<string | null>(null);

  protected readonly rows = signal<RblRow[]>([]);
  protected readonly total = signal(0);
  protected readonly pageIndex = signal(1);
  protected readonly pageSize = signal(50);
  protected readonly listLoading = signal(false);
  protected readonly allProcessed = signal(false);
  protected readonly selectedSeqs = signal<Set<string>>(new Set());
  private drawCounter = 0;

  protected readonly deptTreeNodes = signal<NzTreeNodeOptions[]>([]);
  protected readonly joinTypeOptions = signal<SyCodeOption[]>([]);
  protected readonly joinDetailTypeOptions = signal<SyCodeOption[]>([]);
  protected readonly postFamilyOptions = signal<SyCodeOption[]>([]);
  protected readonly postGradeOptions = signal<SyCodeOption[]>([]);
  protected readonly positionNoOptions = signal<SyCodeOption[]>([]);
  protected readonly empTypeOptions = signal<SyCodeOption[]>([]);
  protected readonly mainBusinessOptions = signal<SyCodeOption[]>([]);
  protected readonly sexOptions = signal<SyCodeOption[]>([]);
  protected readonly nationalityOptions = signal<SyCodeOption[]>([]);
  protected readonly nationOptions = signal<SyCodeOption[]>([]);
  protected readonly maritalStatusOptions = signal<SyCodeOption[]>([]);
  protected readonly degreeOptions = signal<SyCodeOption[]>([]);

  // ── Modal: Đăng ký ngày ──
  protected readonly registerModalVisible = signal(false);
  protected readonly savingRegister = signal(false);
  protected readonly formRegDate = signal<Date | null>(null);
  protected readonly formRegRemark = signal('');

  // ── Modal: Chỉnh sửa dòng ──
  protected readonly editModalVisible = signal(false);
  protected readonly editSaving = signal(false);
  protected readonly editReadOnly = signal(false);
  protected readonly formEditSeq = signal<string | null>(null);
  protected readonly formEditEmpId = signal('');
  protected readonly formEditVietnamName = signal('');
  protected readonly formEditEnglishName = signal('');
  protected readonly formEditDob = signal('');
  protected readonly formEditSexcode = signal<string | null>(null);
  protected readonly formEditNationalityCode = signal<string | null>(null);
  protected readonly formEditNationCode = signal<string | null>(null);
  protected readonly formEditMaritalStatusCode = signal<string | null>(null);
  protected readonly formEditDateStarted = signal('');
  protected readonly formEditEndProbationDate = signal('');
  protected readonly formEditJoinType = signal<string | null>(null);
  protected readonly formEditJoinDetailType = signal<string | null>(null);
  protected readonly formEditDeptno = signal<string | null>(null);
  protected readonly formEditPostFamily = signal<string | null>(null);
  protected readonly formEditPostGradeNo = signal<string | null>(null);
  protected readonly formEditPositionNo = signal<string | null>(null);
  protected readonly formEditEmpTypeCode = signal<string | null>(null);
  protected readonly formEditMainBusiness = signal<string | null>(null);
  protected readonly formEditCostCenter = signal('');
  protected readonly formEditIdcardNo = signal('');
  protected readonly formEditIdcardSDate = signal('');
  protected readonly formEditIssuingAuthority = signal('');
  protected readonly formEditFinalDegreeCode = signal<string | null>(null);
  protected readonly formEditEndDate = signal('');
  protected readonly formEditInstitutionName = signal('');
  protected readonly formEditSubjectName = signal('');
  protected readonly formEditEmailSecond = signal('');
  protected readonly formEditHomePhone = signal('');
  protected readonly formEditTelephone = signal('');
  protected readonly formEditAddressContent = signal('');
  protected readonly formEditRegPlace = signal('');

  // ── Modal: Chèn file (Import Excel) ──
  protected readonly importModalVisible = signal(false);
  protected readonly importFile = signal<File | null>(null);
  protected readonly importing = signal(false);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      const [
        deptList,
        joinTypeList,
        postFamilyList,
        positionNoList,
        empTypeList,
        mainBusinessList,
        sexList,
        nationalityList,
        nationList,
        maritalList,
        degreeList,
      ] = await Promise.all([
        this.codeService.getAuthorizedDepartments(),
        this.codeService.getCodeList(JOIN_TYPE_PARENT),
        this.codeService.getCodeList(POST_FAMILY_PARENT),
        this.codeService.getCodeList(POSITION_NO_PARENT),
        this.codeService.getCodeList(EMP_TYPE_PARENT),
        this.codeService.getCodeList(MAIN_BUSINESS_PARENT),
        this.codeService.getCodeList(SEXCODE_PARENT),
        this.codeService.getCodeList(NATIONALITY_PARENT),
        this.codeService.getCodeList(NATION_PARENT),
        this.codeService.getCodeList(MARITAL_STATUS_PARENT),
        this.codeService.getCodeList(DEGREE_PARENT),
      ]);
      this.deptTreeNodes.set(this.codeService.buildDeptTree(deptList) as NzTreeNodeOptions[]);
      this.joinTypeOptions.set(joinTypeList);
      this.postFamilyOptions.set(postFamilyList);
      this.positionNoOptions.set(positionNoList);
      this.empTypeOptions.set(empTypeList);
      this.mainBusinessOptions.set(mainBusinessList);
      this.sexOptions.set(sexList);
      this.nationalityOptions.set(nationalityList);
      this.nationOptions.set(nationList);
      this.maritalStatusOptions.set(maritalList);
      this.degreeOptions.set(degreeList);
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
      this.message.warning(this.i18n.t('rbl.modal.register.date', 'Ngày đăng ký'));
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
      this.message.warning(this.i18n.t('rbl.js.selectRegister', 'Vui lòng chọn Ngày đăng ký trước'));
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
        this.message.success(`${this.i18n.t('rbl.js.importSuccess', 'Nhập file thành công')} (${res.successCount || 0})`);
      } else {
        this.message.warning(this.i18n.t('rbl.js.importFailed', 'Nhập file thất bại'));
      }
      await this.loadPage();
    } catch {
      this.importModalVisible.set(false);
      this.message.error(this.i18n.t('rbl.js.importFailed', 'Nhập file thất bại'));
    } finally {
      this.importing.set(false);
    }
  }

  // ── Xác nhận hàng loạt ──────────────────────────────────────────────────
  confirmExecute(): void {
    const registerSeq = this.selectedRegisterSeq();
    if (!registerSeq) {
      this.message.warning(this.i18n.t('rbl.js.selectRegister', 'Vui lòng chọn Ngày đăng ký trước'));
      return;
    }
    this.modal.confirm({
      nzTitle: this.i18n.t('rbl.js.confirmExecute', 'Xác nhận nhận việc hàng loạt?'),
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
      this.message.warning(this.i18n.t('rbl.js.selectRow', 'Vui lòng chọn ít nhất một dòng'));
      return;
    }
    this.modal.confirm({
      nzTitle: this.i18n.t('rbl.js.confirmDelete', 'Bạn có chắc muốn xóa không?'),
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
      this.message.warning(this.i18n.t('rbl.js.selectRegister', 'Vui lòng chọn Ngày đăng ký trước'));
      return;
    }
    try {
      const res = await this.service.getBatchList(registerSeq, ++this.drawCounter, 0, 100000);
      const allRows = res.data || [];
      const header = [
        this.i18n.t('common.stt', 'STT'),
        this.i18n.t('common.empName', 'Họ tên'),
        this.i18n.t('common.empId', 'Mã nhân viên'),
        this.i18n.t('recruit.list.field.englishName', 'Tên tiếng Anh'),
        this.i18n.t('recruit.list.field.dob', 'Ngày sinh'),
        this.i18n.t('rbl.col.dateStarted', 'Ngày vào làm'),
        this.i18n.t('recruit.list.field.endProbationDate', 'Ngày hết thử việc'),
        this.i18n.t('rbl.col.joinType', 'Loại nhập'),
        this.i18n.t('rbl.col.joinDetailType', 'Chi tiết'),
        this.i18n.t('common.deptName', 'Phòng ban'),
        this.i18n.t('rbl.col.postGrade', 'Chức vụ'),
        this.i18n.t('rbl.col.postFamily', 'Nhóm nhân viên'),
        this.i18n.t('rbl.col.mainBusiness', 'Công việc'),
        this.i18n.t('rbl.col.empType', 'Loại nhân viên'),
        this.i18n.t('rbl.col.position', 'Chức danh'),
        this.i18n.t('rbl.col.costCenter', 'Mã chi phí'),
        this.i18n.t('recruit.list.field.sexcode', 'Giới tính'),
        this.i18n.t('recruit.list.field.nationalityCode', 'Quốc tịch'),
        this.i18n.t('recruit.list.field.nationCode', 'Dân tộc'),
        this.i18n.t('recruit.list.field.maritalStatusCode', 'Tình trạng hôn nhân'),
        this.i18n.t('recruit.list.edu.finalDegree', 'Học vị cuối'),
        this.i18n.t('recruit.list.edu.endDate', 'Đến ngày TN'),
        this.i18n.t('recruit.list.edu.institutionName', 'Tên trường'),
        this.i18n.t('recruit.list.edu.subject', 'Chuyên ngành'),
        this.i18n.t('recruit.list.field.idcardNo', 'Số CMND/CCCD'),
        this.i18n.t('recruit.list.field.idcardStartDate', 'Ngày cấp'),
        this.i18n.t('recruit.list.field.issuingAuthority', 'Nơi cấp'),
        this.i18n.t('rbl.col.emailSecond', 'Email cá nhân'),
        this.i18n.t('recruit.list.field.homePhone', 'ĐT nhà'),
        this.i18n.t('rbl.col.telephone', 'Điện thoại'),
        this.i18n.t('recruit.list.field.addressContent', 'Địa chỉ'),
        this.i18n.t('rbl.col.regPlace', 'Hộ khẩu'),
      ];
      const data = allRows.map((r, idx) => [
        idx + 1,
        r.vietnamName ?? '',
        r.empId ?? '',
        r.englishName ?? '',
        r.dob ?? '',
        r.dateStarted ?? '',
        r.endProbationDate ?? '',
        r.joinTypeName ?? '',
        r.joinDetailTypeName ?? '',
        r.deptName ?? '',
        r.postGradeName ?? '',
        r.postFamilyName ?? '',
        r.mainBusinessName ?? '',
        r.empTypeName ?? '',
        r.positionNoName ?? '',
        r.costCenter ?? '',
        r.sexName ?? '',
        r.nationalityName ?? '',
        r.nationName ?? '',
        r.maritalStatusName ?? '',
        r.finalDegreeName ?? '',
        r.endDate ?? '',
        r.institutionName ?? '',
        r.subjectName ?? '',
        r.idcardNo ?? '',
        r.idcardSDate ?? '',
        r.issuingAuthority ?? '',
        r.emailSecond ?? '',
        r.homePhone ?? '',
        r.telephone ?? '',
        r.addressContent ?? '',
        r.regPlace ?? '',
      ]);
      const worksheet = XLSX.utils.aoa_to_sheet([header, ...data]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      XLSX.writeFile(workbook, 'nhan_viec_hang_loat_export.xlsx');
    } catch {
      this.message.error(this.i18n.t('common.error', 'Lỗi'));
    }
  }

  // ── Modal Chỉnh sửa ─────────────────────────────────────────────────────
  async openEditModal(row: RblRow): Promise<void> {
    this.formEditSeq.set(row.seq ?? null);
    this.formEditEmpId.set(row.empId ?? '');
    this.formEditVietnamName.set(row.vietnamName ?? '');
    this.formEditEnglishName.set(row.englishName ?? '');
    this.formEditDob.set(row.dob ?? '');
    this.formEditDateStarted.set(row.dateStarted ?? '');
    this.formEditEndProbationDate.set(row.endProbationDate ?? '');
    this.formEditCostCenter.set(row.costCenter ?? '');
    this.formEditDeptno.set(row.deptno ?? null);
    this.formEditIdcardNo.set(row.idcardNo ?? '');
    this.formEditIdcardSDate.set(row.idcardSDate ?? '');
    this.formEditIssuingAuthority.set(row.issuingAuthority ?? '');
    this.formEditEndDate.set(row.endDate ?? '');
    this.formEditInstitutionName.set(row.institutionName ?? '');
    this.formEditSubjectName.set(row.subjectName ?? '');
    this.formEditEmailSecond.set(row.emailSecond ?? '');
    this.formEditHomePhone.set(row.homePhone ?? '');
    this.formEditTelephone.set(row.telephone ?? '');
    this.formEditAddressContent.set(row.addressContent ?? '');
    this.formEditRegPlace.set(row.regPlace ?? '');

    this.formEditJoinType.set(row.joinType ?? null);
    this.joinDetailTypeOptions.set(await this.codeService.getCodeList(row.joinType || JOIN_DETAIL_TYPE_FALLBACK_PARENT));
    this.formEditJoinDetailType.set(row.joinDetailType ?? null);
    this.formEditPostFamily.set(row.postFamily ?? null);
    this.postGradeOptions.set(await this.codeService.getCodeList(row.postFamily || DEFAULT_POST_GRADE_PARENT));
    this.formEditPostGradeNo.set(row.postGradeNo ?? null);
    this.formEditPositionNo.set(row.positionNo ?? null);
    this.formEditEmpTypeCode.set(row.empTypeCode ?? null);
    this.formEditMainBusiness.set(row.mainBusiness ?? null);
    this.formEditSexcode.set(row.sexcode ?? null);
    this.formEditNationalityCode.set(row.nationalityCode ?? null);
    this.formEditNationCode.set(row.nationCode ?? null);
    this.formEditMaritalStatusCode.set(row.maritalStatusCode ?? null);
    this.formEditFinalDegreeCode.set(row.finalDegreeCode ?? null);

    this.editReadOnly.set(row.activity === '1');
    this.editModalVisible.set(true);
  }

  onDeptnoChange(value: string | null): void {
    this.formEditDeptno.set(value);
    this.formEditCostCenter.set(value ?? '');
  }

  async onEditJoinTypeChange(value: string | null): Promise<void> {
    this.formEditJoinType.set(value);
    this.formEditJoinDetailType.set(null);
    this.joinDetailTypeOptions.set(await this.codeService.getCodeList(value || JOIN_DETAIL_TYPE_FALLBACK_PARENT));
  }

  async onEditPostFamilyChange(value: string | null): Promise<void> {
    this.formEditPostFamily.set(value);
    this.formEditPostGradeNo.set(null);
    this.postGradeOptions.set(await this.codeService.getCodeList(value || DEFAULT_POST_GRADE_PARENT));
  }

  async saveEditModal(): Promise<void> {
    const seq = this.formEditSeq();
    if (!seq || this.editReadOnly()) return;
    this.editSaving.set(true);
    try {
      const res = await this.service.updateBatchItem({
        seq,
        vietnamName: this.formEditVietnamName().trim() || undefined,
        englishName: this.formEditEnglishName().trim() || undefined,
        dob: this.formEditDob().trim() || undefined,
        dateStarted: this.formEditDateStarted().trim() || undefined,
        endProbationDate: this.formEditEndProbationDate().trim() || undefined,
        joinType: this.formEditJoinType() ?? undefined,
        joinDetailType: this.formEditJoinDetailType() ?? undefined,
        deptno: this.formEditDeptno() ?? undefined,
        postFamily: this.formEditPostFamily() ?? undefined,
        postGradeNo: this.formEditPostGradeNo() ?? undefined,
        positionNo: this.formEditPositionNo() ?? undefined,
        empTypeCode: this.formEditEmpTypeCode() ?? undefined,
        mainBusiness: this.formEditMainBusiness() ?? undefined,
        costCenter: this.formEditCostCenter().trim() || undefined,
        sexcode: this.formEditSexcode() ?? undefined,
        nationalityCode: this.formEditNationalityCode() ?? undefined,
        nationCode: this.formEditNationCode() ?? undefined,
        maritalStatusCode: this.formEditMaritalStatusCode() ?? undefined,
        finalDegreeCode: this.formEditFinalDegreeCode() ?? undefined,
        endDate: this.formEditEndDate().trim() || undefined,
        institutionName: this.formEditInstitutionName().trim() || undefined,
        subjectName: this.formEditSubjectName().trim() || undefined,
        idcardNo: this.formEditIdcardNo().trim() || undefined,
        idcardSDate: this.formEditIdcardSDate().trim() || undefined,
        issuingAuthority: this.formEditIssuingAuthority().trim() || undefined,
        emailSecond: this.formEditEmailSecond().trim() || undefined,
        homePhone: this.formEditHomePhone().trim() || undefined,
        telephone: this.formEditTelephone().trim() || undefined,
        addressContent: this.formEditAddressContent().trim() || undefined,
        regPlace: this.formEditRegPlace().trim() || undefined,
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
