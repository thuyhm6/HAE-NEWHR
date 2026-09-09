import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import {
  AddressRow,
  EmergencyRow,
  EssPersonalInfo,
  EssPersonalInfoService,
  FamilyRow,
  SyCodeOption,
} from './ess-personal-info.service';

interface PersonalFormModel {
  localName: string;
  engName: string;
  armyOrNot: boolean;
  obstacleOrNot: boolean;
  idcardNo: string;
  idcardStartDate: Date | null;
  issuingAuthority: string;
  dob: Date | null;
  regPlace: string;
  sexCode: string | null;
  finalDegreeCode: string | null;
  nationalityCode: string | null;
  nationCode: string | null;
  religion: string;
  cellphone: string;
  maritalStatusCode: string | null;
  weddingDate: Date | null;
  politicalStatus: string;
  existSingle: string | null;
  homePhone: string;
  companyPhone: string;
  residentialDistinction: string | null;
  singId: string;
  houseTp: string;
  email: string;
  emailSecond: string;
  cvUpdateStatus: string | null;
  attachFiles: File[];
}

interface AddressFormModel {
  updateAddressNo: number | null;
  addressType: string | null;
  effectiveStartDate: Date | null;
  addressContent: string;
}

interface FamilyFormModel {
  updateFamilyNo: number | null;
  famTypeCode: string | null;
  famName: string;
  gender: string | null;
  famBorndate: Date | null;
  famPhone: string;
  attachFiles: File[];
}

interface EmergencyFormModel {
  updateEmergencyNo: number | null;
  emerName: string;
  emerTypeCode: string | null;
  emerPhone: string;
  emerEmail: string;
  emerAddress: string;
  isEmergencyAddress: boolean;
  attachFiles: File[];
}

const CV_UPDATE_STATUS_CODE = '90000302';
const SEX_CODE = '1324';
const FINAL_DEGREE_CODE = '13769';
const NATIONALITY_CODE = '870';
const ETHNICITY_CODE = '210942';
const MARITAL_STATUS_CODE = '1709';
const RESIDENCE_CODE = '14013865';
const ADDRESS_TYPE_CODE = '14013840';
const FAMILY_RELATIONSHIP_CODE = '950';
const EMERGENCY_RELATIONSHIP_CODE = '1693';

function emptyPersonalForm(): PersonalFormModel {
  return {
    localName: '',
    engName: '',
    armyOrNot: false,
    obstacleOrNot: false,
    idcardNo: '',
    idcardStartDate: null,
    issuingAuthority: '',
    dob: null,
    regPlace: '',
    sexCode: null,
    finalDegreeCode: null,
    nationalityCode: null,
    nationCode: null,
    religion: '',
    cellphone: '',
    maritalStatusCode: null,
    weddingDate: null,
    politicalStatus: '',
    existSingle: null,
    homePhone: '',
    companyPhone: '',
    residentialDistinction: null,
    singId: '',
    houseTp: '',
    email: '',
    emailSecond: '',
    cvUpdateStatus: null,
    attachFiles: [],
  };
}

/**
 * Hồ sơ cá nhân của chính nhân viên đang đăng nhập (Cá nhân / Loại địa chỉ /
 * Gia đình / Người liên hệ khẩn cấp) - port lại từ
 * ess/empinfo/viewPersonalInfoForEss.html (Thymeleaf, đã xoá) sang Angular +
 * NG-ZORRO. Mọi thay đổi đều gửi yêu cầu chờ quản lý xét duyệt (không cập
 * nhật trực tiếp), giống hệt hành vi bản gốc - không có nút xoá vì bản gốc
 * cũng không có (dù backend đã có sẵn endpoint xoá). Không kèm khối
 * "Thông tin nhân viên" (essEmpInfoCard) vì chưa có component Angular tương
 * đương, theo tiền lệ đã áp dụng ở YearUseInfoComponent.
 */
@Component({
  selector: 'app-ess-personal-info',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCardModule,
    NzCheckboxModule,
    NzDatePickerModule,
    NzDescriptionsModule,
    NzFormModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzSelectModule,
    NzTableModule,
  ],
  templateUrl: './ess-personal-info.component.html',
  styleUrl: './ess-personal-info.component.scss',
})
export class EssPersonalInfoComponent implements OnInit {
  private readonly service = inject(EssPersonalInfoService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly infoLoading = signal(false);
  protected readonly info = signal<EssPersonalInfo | null>(null);

  protected readonly addressLoading = signal(false);
  protected readonly addresses = signal<AddressRow[]>([]);

  protected readonly familyLoading = signal(false);
  protected readonly families = signal<FamilyRow[]>([]);

  protected readonly emergencyLoading = signal(false);
  protected readonly emergencies = signal<EmergencyRow[]>([]);

  protected readonly sexOptions = signal<SyCodeOption[]>([]);
  protected readonly maritalOptions = signal<SyCodeOption[]>([]);
  protected readonly ethnicityOptions = signal<SyCodeOption[]>([]);
  protected readonly nationalityOptions = signal<SyCodeOption[]>([]);
  protected readonly educationOptions = signal<SyCodeOption[]>([]);
  protected readonly cvUpdateStatusOptions = signal<SyCodeOption[]>([]);
  protected readonly residenceOptions = signal<SyCodeOption[]>([]);
  protected readonly addressTypeOptions = signal<SyCodeOption[]>([]);
  protected readonly familyRelationOptions = signal<SyCodeOption[]>([]);
  protected readonly emergencyRelationOptions = signal<SyCodeOption[]>([]);

  protected readonly personalModalVisible = signal(false);
  protected readonly personalSaving = signal(false);
  protected personalForm: PersonalFormModel = emptyPersonalForm();

  protected readonly addressModalVisible = signal(false);
  protected readonly addressSaving = signal(false);
  protected addressForm: AddressFormModel = { updateAddressNo: null, addressType: null, effectiveStartDate: null, addressContent: '' };

  protected readonly familyModalVisible = signal(false);
  protected readonly familySaving = signal(false);
  protected familyForm: FamilyFormModel = {
    updateFamilyNo: null,
    famTypeCode: null,
    famName: '',
    gender: null,
    famBorndate: null,
    famPhone: '',
    attachFiles: [],
  };

  protected readonly emergencyModalVisible = signal(false);
  protected readonly emergencySaving = signal(false);
  protected emergencyForm: EmergencyFormModel = {
    updateEmergencyNo: null,
    emerName: '',
    emerTypeCode: null,
    emerPhone: '',
    emerEmail: '',
    emerAddress: '',
    isEmergencyAddress: false,
    attachFiles: [],
  };

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await Promise.all([
      this.loadCodeOptions(),
      this.loadPersonalInfo(),
      this.loadAddresses(),
      this.loadFamilies(),
      this.loadEmergencies(),
    ]);
  }

  private async loadCodeOptions(): Promise<void> {
    const [sex, marital, ethnicity, nationality, education, cvStatus, residence, addressType, famRelation, emerRelation] =
      await Promise.all([
        this.service.getCodeList(SEX_CODE).catch(() => []),
        this.service.getCodeList(MARITAL_STATUS_CODE).catch(() => []),
        this.service.getCodeList(ETHNICITY_CODE).catch(() => []),
        this.service.getCodeList(NATIONALITY_CODE).catch(() => []),
        this.service.getCodeList(FINAL_DEGREE_CODE).catch(() => []),
        this.service.getCodeList(CV_UPDATE_STATUS_CODE).catch(() => []),
        this.service.getCodeList(RESIDENCE_CODE).catch(() => []),
        this.service.getCodeList(ADDRESS_TYPE_CODE).catch(() => []),
        this.service.getCodeList(FAMILY_RELATIONSHIP_CODE).catch(() => []),
        this.service.getCodeList(EMERGENCY_RELATIONSHIP_CODE).catch(() => []),
      ]);
    this.sexOptions.set(sex);
    this.maritalOptions.set(marital);
    this.ethnicityOptions.set(ethnicity);
    this.nationalityOptions.set(nationality);
    this.educationOptions.set(education);
    this.cvUpdateStatusOptions.set(cvStatus);
    this.residenceOptions.set(residence);
    this.addressTypeOptions.set(addressType);
    this.familyRelationOptions.set(famRelation);
    this.emergencyRelationOptions.set(emerRelation);
  }

  codeLabel(opt: SyCodeOption): string {
    return opt.codeName || opt.nameVi || opt.codeNo;
  }

  formatDisplayDate(value?: string): string {
    if (!value) {
      return '';
    }
    const date = new Date(value);
    return isNaN(date.getTime()) ? value : formatDate(date, 'dd/MM/yyyy', 'en-US');
  }

  private parseDate(value?: string): Date | null {
    if (!value) {
      return null;
    }
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }

  private toApiDate(value: Date | null): string | undefined {
    return value ? formatDate(value, 'yyyy-MM-dd', 'en-US') : undefined;
  }

  private async loadPersonalInfo(): Promise<void> {
    this.infoLoading.set(true);
    try {
      this.info.set(await this.service.getMyInfo());
    } catch {
      this.message.error(this.i18n.t('epi.msg.loadError.personal', 'Lỗi tải dữ liệu cá nhân'));
    } finally {
      this.infoLoading.set(false);
    }
  }

  private async loadAddresses(): Promise<void> {
    this.addressLoading.set(true);
    try {
      this.addresses.set(await this.service.getAddresses());
    } catch {
      this.message.error(this.i18n.t('epi.msg.loadError.address', 'Lỗi tải dữ liệu địa chỉ'));
    } finally {
      this.addressLoading.set(false);
    }
  }

  private async loadFamilies(): Promise<void> {
    this.familyLoading.set(true);
    try {
      this.families.set(await this.service.getFamilies());
    } catch {
      this.message.error(this.i18n.t('epi.msg.loadError.family', 'Lỗi tải dữ liệu gia đình'));
    } finally {
      this.familyLoading.set(false);
    }
  }

  private async loadEmergencies(): Promise<void> {
    this.emergencyLoading.set(true);
    try {
      this.emergencies.set(await this.service.getEmergencies());
    } catch {
      this.message.error(this.i18n.t('epi.msg.loadError.emergency', 'Lỗi tải dữ liệu khẩn cấp'));
    } finally {
      this.emergencyLoading.set(false);
    }
  }

  isChecked(value?: string): boolean {
    return value === '1' || value === 'Y';
  }

  computeAge(dob: Date | null): string {
    if (!dob) {
      return '';
    }
    const now = new Date();
    let years = now.getFullYear() - dob.getFullYear();
    let months = now.getMonth() - dob.getMonth();
    if (months < 0 || (months === 0 && now.getDate() < dob.getDate())) {
      years--;
      months += 12;
    }
    return `${years} ${this.i18n.t('common.years', 'Tuổi')} ${months} ${this.i18n.t('common.months', 'Tháng')}`;
  }

  // ===== Modal: Cá nhân =====
  openPersonalModal(): void {
    const d = this.info() ?? {};
    this.personalForm = {
      localName: d.localName ?? '',
      engName: d.englishName ?? '',
      armyOrNot: this.isChecked(d.armyOrNot),
      obstacleOrNot: this.isChecked(d.obstacleOrNot),
      idcardNo: d.idcardNo ?? '',
      idcardStartDate: this.parseDate(d.idcardStartDate),
      issuingAuthority: d.issuingAuthority ?? '',
      dob: this.parseDate(d.dob),
      regPlace: '',
      sexCode: d.sexCode ?? null,
      finalDegreeCode: d.finalDegreeCode ?? null,
      nationalityCode: d.nationalityCode ?? null,
      nationCode: d.nationCode ?? null,
      religion: d.religion ?? '',
      cellphone: d.cellphone ?? '',
      maritalStatusCode: d.maritalStatusCode ?? null,
      weddingDate: this.parseDate(d.weddingDate),
      politicalStatus: d.politicalStatus ?? '',
      existSingle: d.existSingle ?? null,
      homePhone: d.homePhone ?? '',
      companyPhone: d.companyPhone ?? '',
      residentialDistinction: d.residentialDistinction ?? null,
      singId: d.singId ?? '',
      houseTp: d.houseTp ?? '',
      email: d.email ?? '',
      emailSecond: d.emailSecond ?? '',
      cvUpdateStatus: d.cvUpdateStatus ?? null,
      attachFiles: [],
    };
    this.personalModalVisible.set(true);
  }

  closePersonalModal(): void {
    this.personalModalVisible.set(false);
  }

  onPersonalFilesChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.personalForm.attachFiles = input.files ? Array.from(input.files) : [];
  }

  async savePersonal(): Promise<void> {
    this.personalSaving.set(true);
    try {
      await this.service.savePersonal(
        {
          dob: this.toApiDate(this.personalForm.dob),
          sexCode: this.personalForm.sexCode ?? undefined,
          maritalStatusCode: this.personalForm.maritalStatusCode ?? undefined,
          weddingDate: this.toApiDate(this.personalForm.weddingDate),
          nationCode: this.personalForm.nationCode ?? undefined,
          nationalityCode: this.personalForm.nationalityCode ?? undefined,
          finalDegreeCode: this.personalForm.finalDegreeCode ?? undefined,
          religion: this.personalForm.religion || undefined,
          politicalOutlook: this.personalForm.politicalStatus || undefined,
          armyOrNot: this.personalForm.armyOrNot ? '1' : '0',
          obstacleOrNot: this.personalForm.obstacleOrNot ? '1' : '0',
          idcardNo: this.personalForm.idcardNo || undefined,
          idcardStartDate: this.toApiDate(this.personalForm.idcardStartDate),
          issuingAuthority: this.personalForm.issuingAuthority || undefined,
          cvUpdateStatus: this.personalForm.cvUpdateStatus ?? undefined,
          regPlace: this.personalForm.regPlace || undefined,
          houseTp: this.personalForm.houseTp || undefined,
          homePhone: this.personalForm.homePhone || undefined,
          companyPhone: this.personalForm.companyPhone || undefined,
          cellphone: this.personalForm.cellphone || undefined,
          email: this.personalForm.email || undefined,
          emailSecond: this.personalForm.emailSecond || undefined,
          residentialDistinction: this.personalForm.residentialDistinction ?? undefined,
          existSingle: this.personalForm.existSingle ?? undefined,
          singId: this.personalForm.singId || undefined,
        },
        this.personalForm.attachFiles,
      );
      this.message.success(this.i18n.t('epi.msg.applySuccess', 'Gửi yêu cầu thành công! Chờ người quản lý xét duyệt.'));
      this.personalModalVisible.set(false);
      await this.loadPersonalInfo();
    } catch {
      this.message.error(this.i18n.t('epi.msg.saveError.personal', 'Lỗi khi lưu thông tin cá nhân!'));
    } finally {
      this.personalSaving.set(false);
    }
  }

  // ===== Modal: Địa chỉ =====
  openAddressModal(row: AddressRow | null): void {
    this.addressForm = row
      ? {
          updateAddressNo: row.addressNo ?? null,
          addressType: row.addressType ?? null,
          effectiveStartDate: this.parseDate(row.effectiveStartDate),
          addressContent: row.addressContent ?? '',
        }
      : { updateAddressNo: null, addressType: null, effectiveStartDate: null, addressContent: '' };
    this.addressModalVisible.set(true);
  }

  closeAddressModal(): void {
    this.addressModalVisible.set(false);
  }

  async saveAddress(): Promise<void> {
    if (!this.addressForm.addressType) {
      this.message.warning(this.i18n.t('epi.msg.validate.addressType', 'Vui lòng chọn Loại địa chỉ!'));
      return;
    }
    this.addressSaving.set(true);
    try {
      await this.service.saveAddress({
        updateAddressNo: this.addressForm.updateAddressNo,
        addressType: this.addressForm.addressType,
        effectiveStartDate: this.toApiDate(this.addressForm.effectiveStartDate) ?? null,
        addressContent: this.addressForm.addressContent || null,
      });
      this.message.success(
        this.addressForm.updateAddressNo
          ? this.i18n.t('epi.msg.saveSuccess', 'Cập nhật thành công!')
          : this.i18n.t('epi.msg.addSuccess', 'Thêm mới thành công!'),
      );
      this.addressModalVisible.set(false);
      await this.loadAddresses();
    } catch {
      this.message.error(this.i18n.t('epi.msg.saveError.address', 'Lỗi khi lưu địa chỉ!'));
    } finally {
      this.addressSaving.set(false);
    }
  }

  // ===== Modal: Gia đình =====
  openFamilyModal(row: FamilyRow | null): void {
    this.familyForm = row
      ? {
          updateFamilyNo: row.familyNo ?? null,
          famTypeCode: row.famTypeCode ?? null,
          famName: row.famName ?? '',
          gender: row.gender ?? null,
          famBorndate: this.parseDate(row.famBorndate),
          famPhone: row.famPhone ?? '',
          attachFiles: [],
        }
      : {
          updateFamilyNo: null,
          famTypeCode: null,
          famName: '',
          gender: null,
          famBorndate: null,
          famPhone: '',
          attachFiles: [],
        };
    this.familyModalVisible.set(true);
  }

  closeFamilyModal(): void {
    this.familyModalVisible.set(false);
  }

  onFamilyFilesChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.familyForm.attachFiles = input.files ? Array.from(input.files) : [];
  }

  async saveFamily(): Promise<void> {
    if (!this.familyForm.famTypeCode || !this.familyForm.famName.trim()) {
      this.message.warning(this.i18n.t('epi.msg.validate.familyRequired', 'Vui lòng chọn Quan hệ và nhập Họ tên!'));
      return;
    }
    this.familySaving.set(true);
    try {
      await this.service.saveFamily(
        {
          updateFamilyNo: this.familyForm.updateFamilyNo ?? undefined,
          famTypeCode: this.familyForm.famTypeCode,
          famName: this.familyForm.famName,
          gender: this.familyForm.gender ?? undefined,
          famBorndate: this.toApiDate(this.familyForm.famBorndate),
          famPhone: this.familyForm.famPhone || undefined,
        },
        this.familyForm.attachFiles,
      );
      this.message.success(this.i18n.t('epi.msg.applySuccess', 'Gửi yêu cầu thành công! Chờ người quản lý xét duyệt.'));
      this.familyModalVisible.set(false);
      await this.loadFamilies();
    } catch {
      this.message.error(this.i18n.t('epi.msg.saveError.family', 'Lỗi khi lưu thông tin gia đình!'));
    } finally {
      this.familySaving.set(false);
    }
  }

  // ===== Modal: Khẩn cấp =====
  openEmergencyModal(row: EmergencyRow | null): void {
    this.emergencyForm = row
      ? {
          updateEmergencyNo: row.emergencyNo ?? null,
          emerName: row.emerName ?? '',
          emerTypeCode: row.emerTypeCode ?? null,
          emerPhone: row.emerPhone ?? '',
          emerEmail: row.emerEmail ?? '',
          emerAddress: row.emerAddress ?? '',
          isEmergencyAddress: this.isChecked(row.isEmergencyAddress),
          attachFiles: [],
        }
      : {
          updateEmergencyNo: null,
          emerName: '',
          emerTypeCode: null,
          emerPhone: '',
          emerEmail: '',
          emerAddress: '',
          isEmergencyAddress: false,
          attachFiles: [],
        };
    this.emergencyModalVisible.set(true);
  }

  closeEmergencyModal(): void {
    this.emergencyModalVisible.set(false);
  }

  onEmergencyFilesChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.emergencyForm.attachFiles = input.files ? Array.from(input.files) : [];
  }

  async saveEmergency(): Promise<void> {
    if (!this.emergencyForm.emerName.trim()) {
      this.message.warning(this.i18n.t('epi.msg.validate.emergencyName', 'Vui lòng nhập Họ tên!'));
      return;
    }
    this.emergencySaving.set(true);
    try {
      await this.service.saveEmergency(
        {
          updateEmergencyNo: this.emergencyForm.updateEmergencyNo ?? undefined,
          emerName: this.emergencyForm.emerName,
          emerTypeCode: this.emergencyForm.emerTypeCode ?? undefined,
          emerPhone: this.emergencyForm.emerPhone || undefined,
          emerEmail: this.emergencyForm.emerEmail || undefined,
          emerAddress: this.emergencyForm.emerAddress || undefined,
          isEmergencyAddress: this.emergencyForm.isEmergencyAddress ? '1' : '0',
        },
        this.emergencyForm.attachFiles,
      );
      this.message.success(this.i18n.t('epi.msg.applySuccess', 'Gửi yêu cầu thành công! Chờ người quản lý xét duyệt.'));
      this.emergencyModalVisible.set(false);
      await this.loadEmergencies();
    } catch {
      this.message.error(this.i18n.t('epi.msg.saveError.emergency', 'Lỗi khi lưu thông tin khẩn cấp!'));
    } finally {
      this.emergencySaving.set(false);
    }
  }
}
