import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';

import { I18nService } from '../../../../i18n/i18n.service';
import { RecruitCodeService, SyCodeOption } from '../shared/recruit-code.service';
import {
  RecruitEducationRow,
  RecruitEmployeeRow,
  RecruitFamilyRow,
  RecruitListService,
  RecruitWorkExpRow,
} from './recruit-list.service';

const SEXCODE_PARENT = '1324';
const NATIONALITY_PARENT = '870';
const NATION_PARENT = '210942';
const MARITAL_STATUS_PARENT = '1709';
const POST_FAMILY_PARENT = '14015812';
const POSITION_NO_PARENT = '14014036';
const EMP_TYPE_PARENT = '13864';
const JOIN_TYPE_PARENT = '1359';
const DEGREE_PARENT = '13769';
const FAM_TYPE_PARENT = '950';

/**
 * Quyết định nhận việc (viewRecruitList) - port lại từ
 * hrm/recruitManage/viewRecruitList.html (đã xoá). Xem ghi chú bug dữ liệu
 * nghiêm trọng (11 trường bị xóa trắng mỗi lần lưu) trong recruit-list.service.ts.
 *
 * 3 tab con (Giáo dục/Quá trình làm việc/Gia đình) ở bản gốc dùng UX
 * inline-edit-trong-bảng (click dòng để sửa tại chỗ) - bản Angular này đổi
 * sang modal Thêm/Sửa cho nhất quán với toàn bộ phần còn lại của ứng dụng
 * (mọi trang CRUD khác trong dự án đều dùng modal, không có trang nào dùng
 * inline-edit) - đây là lựa chọn UX nhất quán, không phải bỏ sót tính năng.
 */
@Component({
  selector: 'app-recruit-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCheckboxModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzSelectModule,
    NzTableModule,
    NzTabsModule,
    NzTreeSelectModule,
  ],
  templateUrl: './recruit-list.component.html',
  styleUrl: './recruit-list.component.scss',
})
export class RecruitListComponent implements OnInit {
  private readonly service = inject(RecruitListService);
  private readonly codeService = inject(RecruitCodeService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  // ── Danh sách bên trái ──
  protected readonly searchName = signal('');
  protected readonly searchEmpId = signal('');
  protected readonly showCompleted = signal(false);
  protected readonly listLoading = signal(false);
  protected readonly rows = signal<RecruitEmployeeRow[]>([]);
  protected readonly total = signal(0);
  protected readonly pageIndex = signal(1);
  protected readonly pageSize = 20;
  protected readonly selectedPersonIds = signal<Set<string>>(new Set());
  protected readonly selectedPersonId = signal<string | null>(null);

  // ── Dropdown options ──
  protected readonly deptTreeNodes = signal<NzTreeNodeOptions[]>([]);
  protected readonly sexOptions = signal<SyCodeOption[]>([]);
  protected readonly nationalityOptions = signal<SyCodeOption[]>([]);
  protected readonly nationOptions = signal<SyCodeOption[]>([]);
  protected readonly maritalStatusOptions = signal<SyCodeOption[]>([]);
  protected readonly postFamilyOptions = signal<SyCodeOption[]>([]);
  protected readonly postGradeOptions = signal<SyCodeOption[]>([]);
  protected readonly positionNoOptions = signal<SyCodeOption[]>([]);
  protected readonly empTypeOptions = signal<SyCodeOption[]>([]);
  protected readonly joinTypeOptions = signal<SyCodeOption[]>([]);
  protected readonly joinDetailTypeOptions = signal<SyCodeOption[]>([]);
  protected readonly degreeOptions = signal<SyCodeOption[]>([]);
  protected readonly famTypeOptions = signal<SyCodeOption[]>([]);

  // ── Form: tab Chung ──
  protected readonly formPersonId = signal('');
  protected readonly formLocalName = signal('');
  protected readonly formEmpId = signal('');
  protected readonly formEnglishName = signal('');
  protected readonly formKoreanName = signal('');
  protected readonly formSexcode = signal<string | null>(null);
  protected readonly formDob = signal('');
  protected readonly formNationalityCode = signal<string | null>(null);
  protected readonly formNationCode = signal<string | null>(null);
  protected readonly formMaritalStatusCode = signal<string | null>(null);
  protected readonly formDeptNo = signal<string | null>(null);
  protected readonly formPostFamily = signal<string | null>(null);
  protected readonly formPostGradeNo = signal<string | null>(null);
  protected readonly formPositionNo = signal<string | null>(null);
  protected readonly formEmpTypeCode = signal<string | null>(null);
  protected readonly formJoinType = signal<string | null>(null);
  protected readonly formJoinDetailType = signal<string | null>(null);
  protected readonly formDateStarted = signal('');
  protected readonly formIsProbation = signal<string | null>(null);
  protected readonly formEndProbationDate = signal('');
  protected readonly formContractStartDate = signal('');
  protected readonly formCostCenter = signal<string | null>(null);

  // ── Form: tab Bổ sung ──
  protected readonly formHomePhone = signal('');
  protected readonly formCompanyPhone = signal('');
  protected readonly formOfficePhone = signal('');
  protected readonly formEmail = signal('');
  protected readonly formIdcardNo = signal('');
  protected readonly formDocumentType = signal('');
  protected readonly formIdcardStartDate = signal('');
  protected readonly formIssuingAuthority = signal('');
  protected readonly formAddressContent = signal('');
  protected readonly formHujiaddressContent = signal('');
  protected readonly formNationality = signal<string | null>(null);
  protected readonly formAccountNo = signal('');
  protected readonly formOldPay = signal('');
  protected readonly formExperience = signal('');
  protected readonly formRecruitType = signal('');
  protected readonly formRecommend = signal('');
  protected readonly formRemark = signal('');

  // Trường ẩn không còn UI ở bản gốc - giữ nguyên giá trị khi lưu (xem ghi chú service).
  private hiddenStandardPosition: string | undefined;
  private hiddenWorkArea: string | undefined;
  private hiddenConfirmWorkDate: string | undefined;
  private hiddenContractEndDate: string | undefined;
  private hiddenTimeStarted: string | undefined;
  private hiddenCoinCode: string | undefined;
  private hiddenInsuranceType: string | undefined;
  private hiddenInsuranceArea: string | undefined;
  private hiddenInsuranceDistinguish: string | undefined;
  private hiddenJingshebao: string | undefined;
  private hiddenWageType: string | undefined;

  protected readonly savingGeneral = signal(false);
  protected readonly activeTabIndex = signal(0);
  private readonly loadedSubTabs = new Set<number>();

  // ── Tab con: Giáo dục ──
  protected readonly eduList = signal<RecruitEducationRow[]>([]);
  protected readonly eduModalVisible = signal(false);
  protected readonly eduSaving = signal(false);
  protected readonly formEduSeq = signal<number | null>(null);
  protected readonly formEduDegreeCode = signal<string | null>(null);
  protected readonly formEduDegreesCode = signal('');
  protected readonly formEduInstitutionName = signal('');
  protected readonly formEduSubject = signal('');
  protected readonly formEduStartDate = signal('');
  protected readonly formEduEndDate = signal('');
  protected readonly formEduFinalDegree = signal(false);
  protected readonly formEduAbroad = signal(false);
  protected readonly formEduRemark = signal('');

  // ── Tab con: Quá trình làm việc ──
  protected readonly workList = signal<RecruitWorkExpRow[]>([]);
  protected readonly workModalVisible = signal(false);
  protected readonly workSaving = signal(false);
  protected readonly formWorkSeq = signal<number | null>(null);
  protected readonly formWorkCpnyName = signal('');
  protected readonly formWorkDeptName = signal('');
  protected readonly formWorkPosition = signal('');
  protected readonly formWorkStartDate = signal('');
  protected readonly formWorkEndDate = signal('');
  protected readonly formWorkPayroll = signal('');
  protected readonly formWorkLeftReason = signal('');
  protected readonly formWorkRemark = signal('');

  // ── Tab con: Gia đình ──
  protected readonly familyList = signal<RecruitFamilyRow[]>([]);
  protected readonly familyModalVisible = signal(false);
  protected readonly familySaving = signal(false);
  protected readonly formFamSeq = signal<number | null>(null);
  protected readonly formFamName = signal('');
  protected readonly formFamTypeCode = signal<string | null>(null);
  protected readonly formFamGender = signal<string | null>(null);
  protected readonly formFamBorndate = signal('');
  protected readonly formFamPhone = signal('');
  protected readonly formFamEmergency = signal(false);
  protected readonly formFamOccupation = signal('');
  protected readonly formFamRemark = signal('');

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await Promise.all([this.loadFilterOptions(), this.search()]);
  }

  private async loadFilterOptions(): Promise<void> {
    try {
      const [deptList, sexList, nationalityList, nationList, maritalList, postFamilyList, positionNoList, empTypeList, joinTypeList, degreeList, famTypeList] =
        await Promise.all([
          this.codeService.getAuthorizedDepartments(),
          this.codeService.getCodeList(SEXCODE_PARENT),
          this.codeService.getCodeList(NATIONALITY_PARENT),
          this.codeService.getCodeList(NATION_PARENT),
          this.codeService.getCodeList(MARITAL_STATUS_PARENT),
          this.codeService.getCodeList(POST_FAMILY_PARENT),
          this.codeService.getCodeList(POSITION_NO_PARENT),
          this.codeService.getCodeList(EMP_TYPE_PARENT),
          this.codeService.getCodeList(JOIN_TYPE_PARENT),
          this.codeService.getCodeList(DEGREE_PARENT),
          this.codeService.getCodeList(FAM_TYPE_PARENT),
        ]);
      this.deptTreeNodes.set(this.codeService.buildDeptTree(deptList) as NzTreeNodeOptions[]);
      this.sexOptions.set(sexList);
      this.nationalityOptions.set(nationalityList);
      this.nationOptions.set(nationList);
      this.maritalStatusOptions.set(maritalList);
      this.postFamilyOptions.set(postFamilyList);
      this.positionNoOptions.set(positionNoList);
      this.empTypeOptions.set(empTypeList);
      this.joinTypeOptions.set(joinTypeList);
      this.degreeOptions.set(degreeList);
      this.famTypeOptions.set(famTypeList);
    } catch {
      // im lặng bỏ qua - danh sách tùy chọn trống không chặn chức năng chính
    }
  }

  private async loadPage(): Promise<void> {
    this.listLoading.set(true);
    try {
      const start = (this.pageIndex() - 1) * this.pageSize;
      const res = await this.service.getEmployeeList(
        {
          activity: this.showCompleted() ? '1' : '0',
          searchName: this.searchName().trim() || undefined,
          searchEmpId: this.searchEmpId().trim() || undefined,
        },
        this.pageIndex(),
        start,
        this.pageSize,
      );
      this.total.set(res.recordsTotal || 0);
      this.rows.set(res.data || []);
    } catch {
      this.rows.set([]);
      this.total.set(0);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.listLoading.set(false);
    }
  }

  async search(): Promise<void> {
    this.pageIndex.set(1);
    await this.loadPage();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total() / this.pageSize));
  }

  async pageChange(dir: number): Promise<void> {
    const next = Math.min(this.totalPages, Math.max(1, this.pageIndex() + dir));
    if (next === this.pageIndex()) return;
    this.pageIndex.set(next);
    await this.loadPage();
  }

  toggleRowSelected(personId: string, checked: boolean): void {
    const set = new Set(this.selectedPersonIds());
    if (checked) set.add(personId);
    else set.delete(personId);
    this.selectedPersonIds.set(set);
  }

  isRowSelected(personId?: string): boolean {
    return !!personId && this.selectedPersonIds().has(personId);
  }

  toggleSelectAll(checked: boolean): void {
    this.selectedPersonIds.set(checked ? new Set(this.rows().map((r) => r.personId!).filter(Boolean)) : new Set());
  }

  get showConfirmBtn(): boolean {
    return !this.showCompleted() && this.selectedPersonIds().size > 0;
  }

  get showCancelBtn(): boolean {
    return this.showCompleted() && this.selectedPersonIds().size > 0;
  }

  private clearForm(): void {
    this.formPersonId.set('');
    this.formLocalName.set('');
    this.formEmpId.set('');
    this.formEnglishName.set('');
    this.formKoreanName.set('');
    this.formSexcode.set(null);
    this.formDob.set('');
    this.formNationalityCode.set(null);
    this.formNationCode.set(null);
    this.formMaritalStatusCode.set(null);
    this.formDeptNo.set(null);
    this.formPostFamily.set(null);
    this.formPostGradeNo.set(null);
    this.formPositionNo.set(null);
    this.formEmpTypeCode.set(null);
    this.formJoinType.set(null);
    this.formJoinDetailType.set(null);
    this.formDateStarted.set('');
    this.formIsProbation.set(null);
    this.formEndProbationDate.set('');
    this.formContractStartDate.set('');
    this.formCostCenter.set(null);
    this.formHomePhone.set('');
    this.formCompanyPhone.set('');
    this.formOfficePhone.set('');
    this.formEmail.set('');
    this.formIdcardNo.set('');
    this.formDocumentType.set('');
    this.formIdcardStartDate.set('');
    this.formIssuingAuthority.set('');
    this.formAddressContent.set('');
    this.formHujiaddressContent.set('');
    this.formNationality.set(null);
    this.formAccountNo.set('');
    this.formOldPay.set('');
    this.formExperience.set('');
    this.formRecruitType.set('');
    this.formRecommend.set('');
    this.formRemark.set('');
    this.hiddenStandardPosition = undefined;
    this.hiddenWorkArea = undefined;
    this.hiddenConfirmWorkDate = undefined;
    this.hiddenContractEndDate = undefined;
    this.hiddenTimeStarted = undefined;
    this.hiddenCoinCode = undefined;
    this.hiddenInsuranceType = undefined;
    this.hiddenInsuranceArea = undefined;
    this.hiddenInsuranceDistinguish = undefined;
    this.hiddenJingshebao = undefined;
    this.hiddenWageType = undefined;
    this.eduList.set([]);
    this.workList.set([]);
    this.familyList.set([]);
    this.loadedSubTabs.clear();
    this.activeTabIndex.set(0);
  }

  newEmployee(): void {
    this.selectedPersonId.set(null);
    this.clearForm();
  }

  async selectEmployee(personId: string): Promise<void> {
    this.selectedPersonId.set(personId);
    this.clearForm();
    try {
      const d = await this.service.getEmployeeDetail(personId);
      this.formPersonId.set(d.personId ?? '');
      this.formLocalName.set(d.localName ?? '');
      this.formEmpId.set(d.empId ?? '');
      this.formEnglishName.set(d.englishName ?? '');
      this.formKoreanName.set(d.koreanName ?? '');
      this.formSexcode.set(d.sexcode ?? null);
      this.formDob.set(d.dob ?? '');
      this.formNationalityCode.set(d.nationalityCode ?? null);
      this.formNationCode.set(d.nationCode ?? null);
      this.formMaritalStatusCode.set(d.maritalStatusCode ?? null);
      this.formDeptNo.set(d.deptNo ?? null);
      this.formPostFamily.set(d.postFamily ?? null);
      await this.onPostFamilyChange(d.postFamily ?? null, true);
      this.formPostGradeNo.set(d.postGradeNo ?? null);
      this.formPositionNo.set(d.positionNo ?? null);
      this.formEmpTypeCode.set(d.empTypeCode ?? null);
      this.formJoinType.set(d.joinType ?? null);
      await this.onJoinTypeChange(d.joinType ?? null, true);
      this.formJoinDetailType.set(d.joinDetailType ?? null);
      this.formDateStarted.set(d.dateStarted ?? '');
      this.formIsProbation.set(d.isProbation ?? null);
      this.formEndProbationDate.set(d.endProbationDate ?? '');
      this.formContractStartDate.set(d.contractStartDate ?? '');
      this.formCostCenter.set(d.costCenter ?? null);
      this.formHomePhone.set(d.homePhone ?? '');
      this.formCompanyPhone.set(d.companyPhone ?? '');
      this.formOfficePhone.set(d.officePhone ?? '');
      this.formEmail.set(d.email ?? '');
      this.formIdcardNo.set(d.idcardNo ?? '');
      this.formDocumentType.set(d.documentType ?? '');
      this.formIdcardStartDate.set(d.idcardStartDate ?? '');
      this.formIssuingAuthority.set(d.issuingAuthority ?? '');
      this.formAddressContent.set(d.addressContent ?? '');
      this.formHujiaddressContent.set(d.hujiaddressContent ?? '');
      this.formNationality.set(d.nationality ?? null);
      this.formAccountNo.set(d.accountNo ?? '');
      this.formOldPay.set(d.oldPay ?? '');
      this.formExperience.set(d.experience ?? '');
      this.formRecruitType.set(d.recruitType ?? '');
      this.formRecommend.set(d.recommend ?? '');
      this.formRemark.set(d.remark ?? '');
      this.hiddenStandardPosition = d.standardPosition;
      this.hiddenWorkArea = d.workArea;
      this.hiddenConfirmWorkDate = d.confirmWorkDate;
      this.hiddenContractEndDate = d.contractEndDate;
      this.hiddenTimeStarted = d.timeStarted;
      this.hiddenCoinCode = d.coinCode;
      this.hiddenInsuranceType = d.insuranceType;
      this.hiddenInsuranceArea = d.insuranceArea;
      this.hiddenInsuranceDistinguish = d.insuranceDistinguish;
      this.hiddenJingshebao = d.jingshebao;
      this.hiddenWageType = d.wageType;
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  onDeptNoChange(value: string | null): void {
    this.formDeptNo.set(value);
    this.formCostCenter.set(value);
  }

  async onPostFamilyChange(value: string | null, silent = false): Promise<void> {
    this.formPostFamily.set(value);
    if (!silent) this.formPostGradeNo.set(null);
    this.postGradeOptions.set(value ? await this.codeService.getCodeList(value) : []);
  }

  async onJoinTypeChange(value: string | null, silent = false): Promise<void> {
    this.formJoinType.set(value);
    if (!silent) this.formJoinDetailType.set(null);
    this.joinDetailTypeOptions.set(value ? await this.codeService.getCodeList(value) : []);
  }

  async saveGeneral(): Promise<void> {
    if (!this.formLocalName().trim() || !this.formEmpId().trim()) {
      this.message.warning(this.i18n.t('recruit.list.js.requiredFields', 'Vui lòng nhập Họ tên và Mã nhân viên'));
      return;
    }
    const payload: RecruitEmployeeRow = {
      personId: this.formPersonId() || undefined,
      localName: this.formLocalName().trim(),
      empId: this.formEmpId().trim(),
      englishName: this.formEnglishName().trim() || undefined,
      koreanName: this.formKoreanName().trim() || undefined,
      sexcode: this.formSexcode() ?? undefined,
      dob: this.formDob().trim() || undefined,
      nationalityCode: this.formNationalityCode() ?? undefined,
      nationCode: this.formNationCode() ?? undefined,
      maritalStatusCode: this.formMaritalStatusCode() ?? undefined,
      deptNo: this.formDeptNo() ?? undefined,
      standardPosition: this.hiddenStandardPosition,
      postFamily: this.formPostFamily() ?? undefined,
      postGradeNo: this.formPostGradeNo() ?? undefined,
      positionNo: this.formPositionNo() ?? undefined,
      workArea: this.hiddenWorkArea,
      empTypeCode: this.formEmpTypeCode() ?? undefined,
      joinType: this.formJoinType() ?? undefined,
      joinDetailType: this.formJoinDetailType() ?? undefined,
      dateStarted: this.formDateStarted().trim() || undefined,
      confirmWorkDate: this.hiddenConfirmWorkDate,
      isProbation: this.formIsProbation() ?? undefined,
      endProbationDate: this.formEndProbationDate().trim() || undefined,
      contractStartDate: this.formContractStartDate().trim() || undefined,
      contractEndDate: this.hiddenContractEndDate,
      timeStarted: this.hiddenTimeStarted,
      costCenter: this.formCostCenter() ?? undefined,
      coinCode: this.hiddenCoinCode,
      homePhone: this.formHomePhone().trim() || undefined,
      companyPhone: this.formCompanyPhone().trim() || undefined,
      officePhone: this.formOfficePhone().trim() || undefined,
      email: this.formEmail().trim() || undefined,
      idcardNo: this.formIdcardNo().trim() || undefined,
      documentType: this.formDocumentType().trim() || undefined,
      idcardStartDate: this.formIdcardStartDate().trim() || undefined,
      issuingAuthority: this.formIssuingAuthority().trim() || undefined,
      addressContent: this.formAddressContent().trim() || undefined,
      hujiaddressContent: this.formHujiaddressContent().trim() || undefined,
      nationality: this.formNationality() ?? undefined,
      insuranceType: this.hiddenInsuranceType,
      insuranceArea: this.hiddenInsuranceArea,
      insuranceDistinguish: this.hiddenInsuranceDistinguish,
      jingshebao: this.hiddenJingshebao,
      wageType: this.hiddenWageType,
      accountNo: this.formAccountNo().trim() || undefined,
      oldPay: this.formOldPay().trim() || undefined,
      experience: this.formExperience().trim() || undefined,
      recruitType: this.formRecruitType().trim() || undefined,
      recommend: this.formRecommend().trim() || undefined,
      remark: this.formRemark().trim() || undefined,
    };
    this.savingGeneral.set(true);
    try {
      const res = await this.service.saveEmployee(payload);
      if (res.success) {
        if (!payload.personId && res.personId) {
          this.formPersonId.set(res.personId);
          this.selectedPersonId.set(res.personId);
        }
        this.message.success(res.message || this.i18n.t('common.success', 'Thành công'));
        await this.loadPage();
      } else {
        this.message.error(res.message || this.i18n.t('common.error', 'Lỗi'));
      }
    } catch {
      this.message.error(this.i18n.t('common.error', 'Lỗi'));
    } finally {
      this.savingGeneral.set(false);
    }
  }

  async onTabChange(index: number): Promise<void> {
    this.activeTabIndex.set(index);
    const personId = this.formPersonId();
    if (!personId || this.loadedSubTabs.has(index)) return;
    this.loadedSubTabs.add(index);
    if (index === 2) this.eduList.set(await this.service.getEducationList(personId));
    else if (index === 3) this.workList.set(await this.service.getWorkExpList(personId));
    else if (index === 4) this.familyList.set(await this.service.getFamilyList(personId));
  }

  // ── Giáo dục ──
  openEduAddModal(): void {
    if (!this.formPersonId()) {
      this.message.warning(this.i18n.t('recruit.list.js.selectFirst', 'Vui lòng chọn nhân viên trước'));
      return;
    }
    this.formEduSeq.set(null);
    this.formEduDegreeCode.set(null);
    this.formEduDegreesCode.set('');
    this.formEduInstitutionName.set('');
    this.formEduSubject.set('');
    this.formEduStartDate.set('');
    this.formEduEndDate.set('');
    this.formEduFinalDegree.set(false);
    this.formEduAbroad.set(false);
    this.formEduRemark.set('');
    this.eduModalVisible.set(true);
  }

  openEduEditModal(row: RecruitEducationRow): void {
    this.formEduSeq.set(row.seq ?? null);
    this.formEduDegreeCode.set(row.degreeCode ?? null);
    this.formEduDegreesCode.set(row.degreesCode ?? '');
    this.formEduInstitutionName.set(row.institutionName ?? '');
    this.formEduSubject.set(row.subject ?? '');
    this.formEduStartDate.set(row.startDate ?? '');
    this.formEduEndDate.set(row.endDate ?? '');
    this.formEduFinalDegree.set(row.finalDegreeWhether === 'Y');
    this.formEduAbroad.set(row.experienceStudyAbroad === 'Y');
    this.formEduRemark.set(row.remark ?? '');
    this.eduModalVisible.set(true);
  }

  async saveEduModal(): Promise<void> {
    this.eduSaving.set(true);
    try {
      const res = await this.service.saveEducation({
        seq: this.formEduSeq() ?? undefined,
        personId: this.formPersonId(),
        degreeCode: this.formEduDegreeCode() ?? undefined,
        degreesCode: this.formEduDegreesCode().trim() || undefined,
        institutionName: this.formEduInstitutionName().trim() || undefined,
        subject: this.formEduSubject().trim() || undefined,
        startDate: this.formEduStartDate().trim() || undefined,
        endDate: this.formEduEndDate().trim() || undefined,
        finalDegreeWhether: this.formEduFinalDegree() ? 'Y' : 'N',
        experienceStudyAbroad: this.formEduAbroad() ? 'Y' : 'N',
        remark: this.formEduRemark().trim() || undefined,
      });
      if (res.success) {
        this.eduModalVisible.set(false);
        this.eduList.set(await this.service.getEducationList(this.formPersonId()));
      } else {
        this.message.error(res.message || this.i18n.t('common.error', 'Lỗi'));
      }
    } catch {
      this.message.error(this.i18n.t('common.error', 'Lỗi'));
    } finally {
      this.eduSaving.set(false);
    }
  }

  deleteEdu(row: RecruitEducationRow): void {
    this.modal.confirm({
      nzTitle: this.i18n.t('recruit.list.js.confirmDelete', 'Xác nhận xóa?'),
      nzOkDanger: true,
      nzOnOk: async () => {
        await this.service.deleteEducation(row.seq!);
        this.eduList.set(await this.service.getEducationList(this.formPersonId()));
      },
    });
  }

  // ── Quá trình làm việc ──
  openWorkAddModal(): void {
    if (!this.formPersonId()) {
      this.message.warning(this.i18n.t('recruit.list.js.selectFirst', 'Vui lòng chọn nhân viên trước'));
      return;
    }
    this.formWorkSeq.set(null);
    this.formWorkCpnyName.set('');
    this.formWorkDeptName.set('');
    this.formWorkPosition.set('');
    this.formWorkStartDate.set('');
    this.formWorkEndDate.set('');
    this.formWorkPayroll.set('');
    this.formWorkLeftReason.set('');
    this.formWorkRemark.set('');
    this.workModalVisible.set(true);
  }

  openWorkEditModal(row: RecruitWorkExpRow): void {
    this.formWorkSeq.set(row.seq ?? null);
    this.formWorkCpnyName.set(row.cpnyName ?? '');
    this.formWorkDeptName.set(row.deptName ?? '');
    this.formWorkPosition.set(row.position ?? '');
    this.formWorkStartDate.set(row.startDate ?? '');
    this.formWorkEndDate.set(row.endDate ?? '');
    this.formWorkPayroll.set(row.payroll ?? '');
    this.formWorkLeftReason.set(row.leftReason ?? '');
    this.formWorkRemark.set(row.remark ?? '');
    this.workModalVisible.set(true);
  }

  async saveWorkModal(): Promise<void> {
    this.workSaving.set(true);
    try {
      const res = await this.service.saveWorkExp({
        seq: this.formWorkSeq() ?? undefined,
        personId: this.formPersonId(),
        cpnyName: this.formWorkCpnyName().trim() || undefined,
        deptName: this.formWorkDeptName().trim() || undefined,
        position: this.formWorkPosition().trim() || undefined,
        startDate: this.formWorkStartDate().trim() || undefined,
        endDate: this.formWorkEndDate().trim() || undefined,
        payroll: this.formWorkPayroll().trim() || undefined,
        leftReason: this.formWorkLeftReason().trim() || undefined,
        remark: this.formWorkRemark().trim() || undefined,
      });
      if (res.success) {
        this.workModalVisible.set(false);
        this.workList.set(await this.service.getWorkExpList(this.formPersonId()));
      } else {
        this.message.error(res.message || this.i18n.t('common.error', 'Lỗi'));
      }
    } catch {
      this.message.error(this.i18n.t('common.error', 'Lỗi'));
    } finally {
      this.workSaving.set(false);
    }
  }

  deleteWork(row: RecruitWorkExpRow): void {
    this.modal.confirm({
      nzTitle: this.i18n.t('recruit.list.js.confirmDelete', 'Xác nhận xóa?'),
      nzOkDanger: true,
      nzOnOk: async () => {
        await this.service.deleteWorkExp(row.seq!);
        this.workList.set(await this.service.getWorkExpList(this.formPersonId()));
      },
    });
  }

  // ── Gia đình ──
  openFamilyAddModal(): void {
    if (!this.formPersonId()) {
      this.message.warning(this.i18n.t('recruit.list.js.selectFirst', 'Vui lòng chọn nhân viên trước'));
      return;
    }
    this.formFamSeq.set(null);
    this.formFamName.set('');
    this.formFamTypeCode.set(null);
    this.formFamGender.set(null);
    this.formFamBorndate.set('');
    this.formFamPhone.set('');
    this.formFamEmergency.set(false);
    this.formFamOccupation.set('');
    this.formFamRemark.set('');
    this.familyModalVisible.set(true);
  }

  openFamilyEditModal(row: RecruitFamilyRow): void {
    this.formFamSeq.set(row.seq ?? null);
    this.formFamName.set(row.famName ?? '');
    this.formFamTypeCode.set(row.famTypeCode ?? null);
    this.formFamGender.set(row.gender ?? null);
    this.formFamBorndate.set(row.famBorndate ?? '');
    this.formFamPhone.set(row.famPhone ?? '');
    this.formFamEmergency.set(row.emergencyContactYn === 'Y');
    this.formFamOccupation.set(row.occupation ?? '');
    this.formFamRemark.set(row.remark ?? '');
    this.familyModalVisible.set(true);
  }

  async saveFamilyModal(): Promise<void> {
    this.familySaving.set(true);
    try {
      const res = await this.service.saveFamily({
        seq: this.formFamSeq() ?? undefined,
        personId: this.formPersonId(),
        famName: this.formFamName().trim() || undefined,
        famTypeCode: this.formFamTypeCode() ?? undefined,
        gender: this.formFamGender() ?? undefined,
        famBorndate: this.formFamBorndate().trim() || undefined,
        famPhone: this.formFamPhone().trim() || undefined,
        emergencyContactYn: this.formFamEmergency() ? 'Y' : 'N',
        occupation: this.formFamOccupation().trim() || undefined,
        remark: this.formFamRemark().trim() || undefined,
      });
      if (res.success) {
        this.familyModalVisible.set(false);
        this.familyList.set(await this.service.getFamilyList(this.formPersonId()));
      } else {
        this.message.error(res.message || this.i18n.t('common.error', 'Lỗi'));
      }
    } catch {
      this.message.error(this.i18n.t('common.error', 'Lỗi'));
    } finally {
      this.familySaving.set(false);
    }
  }

  deleteFamily(row: RecruitFamilyRow): void {
    this.modal.confirm({
      nzTitle: this.i18n.t('recruit.list.js.confirmDelete', 'Xác nhận xóa?'),
      nzOkDanger: true,
      nzOnOk: async () => {
        await this.service.deleteFamily(row.seq!);
        this.familyList.set(await this.service.getFamilyList(this.formPersonId()));
      },
    });
  }

  // ── Xác nhận / Hủy xác nhận ──
  execute(type: 'CONFIRM' | 'CANCEL'): void {
    const personIds = Array.from(this.selectedPersonIds());
    if (!personIds.length) return;
    const msg =
      type === 'CONFIRM'
        ? this.i18n.t('recruit.list.js.confirmExecute', 'Xác nhận nhận việc cho các nhân viên đã chọn?')
        : this.i18n.t('recruit.list.js.confirmCancel', 'Hủy xác nhận nhận việc cho các nhân viên đã chọn?');
    this.modal.confirm({
      nzTitle: msg,
      nzOnOk: async () => {
        try {
          const res = await this.service.execute(personIds, type);
          this.message.success(res.message || (res.success ? this.i18n.t('common.success', 'Thành công') : ''));
          if (res.success) {
            this.selectedPersonIds.set(new Set());
            this.selectedPersonId.set(null);
            await this.loadPage();
          }
        } catch {
          this.message.error(this.i18n.t('common.error', 'Lỗi'));
        }
      },
    });
  }
}
