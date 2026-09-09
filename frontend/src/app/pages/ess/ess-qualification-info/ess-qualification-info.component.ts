import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
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
  EducationRow,
  EssQualificationInfoService,
  QualificationRow,
  RewardRow,
  SyCodeOption,
} from './ess-qualification-info.service';

interface EducationFormModel {
  updateEducNo: number | null;
  degreeCode: string | null;
  institutionName: string;
  startDate: string;
  endDate: string;
  subject: string;
  degreesCode: string;
  eduDegNum: string;
  remark: string;
  attachFiles: File[];
}

interface QualificationFormModel {
  updateQualNo: number | null;
  qualName: string;
  qualLevel: string;
  dateObtained: Date | null;
  validityDate: Date | null;
  qualCardNo: string;
  qualInstitute: string;
  qualGrade: string;
  qualRemark: string;
  attachFiles: File[];
}

const FINAL_DEGREE_CODE = '13769';

function emptyEducationForm(): EducationFormModel {
  return {
    updateEducNo: null,
    degreeCode: null,
    institutionName: '',
    startDate: '',
    endDate: '',
    subject: '',
    degreesCode: '',
    eduDegNum: '',
    remark: '',
    attachFiles: [],
  };
}

function emptyQualificationForm(): QualificationFormModel {
  return {
    updateQualNo: null,
    qualName: '',
    qualLevel: '',
    dateObtained: null,
    validityDate: null,
    qualCardNo: '',
    qualInstitute: '',
    qualGrade: '',
    qualRemark: '',
    attachFiles: [],
  };
}

/**
 * Trình độ học vấn + Chứng chỉ (CRUD gửi yêu cầu chờ duyệt) và Khen thưởng
 * (chỉ xem) của chính nhân viên đang đăng nhập - port lại từ
 * ess/empinfo/viewQualificationInfo.html (Thymeleaf, đã xoá) sang Angular +
 * NG-ZORRO, dùng nz-table thay cho bảng dựng tay bằng jQuery. Gọi lại nguyên
 * vẹn API JSON sẵn có - mọi thay đổi học vấn/chứng chỉ đều gửi yêu cầu chờ
 * quản lý xét duyệt (không cập nhật trực tiếp), giống hệt hành vi bản gốc.
 * Không kèm khối "Thông tin nhân viên" (essEmpInfoCard) vì chưa có component
 * Angular tương đương, theo tiền lệ đã áp dụng ở YearUseInfoComponent.
 */
@Component({
  selector: 'app-ess-qualification-info',
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
    NzModalModule,
    NzSelectModule,
    NzTableModule,
  ],
  templateUrl: './ess-qualification-info.component.html',
  styleUrl: './ess-qualification-info.component.scss',
})
export class EssQualificationInfoComponent implements OnInit {
  private readonly service = inject(EssQualificationInfoService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly educLoading = signal(false);
  protected readonly educationList = signal<EducationRow[]>([]);

  protected readonly qualLoading = signal(false);
  protected readonly qualificationList = signal<QualificationRow[]>([]);

  protected readonly rewardLoading = signal(false);
  protected readonly rewardList = signal<RewardRow[]>([]);

  protected readonly degreeOptions = signal<SyCodeOption[]>([]);

  protected readonly educModalVisible = signal(false);
  protected readonly educSaving = signal(false);
  protected readonly educFilesLoading = signal(false);
  protected readonly educFiles = signal<{ fileNo?: string; fileName?: string }[]>([]);
  protected educForm: EducationFormModel = emptyEducationForm();

  protected readonly qualModalVisible = signal(false);
  protected readonly qualSaving = signal(false);
  protected readonly qualFilesLoading = signal(false);
  protected readonly qualFiles = signal<{ fileNo?: string; fileName?: string }[]>([]);
  protected qualForm: QualificationFormModel = emptyQualificationForm();

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await Promise.all([
      this.service.getCodeList(FINAL_DEGREE_CODE).then((opts) => this.degreeOptions.set(opts)).catch(() => this.degreeOptions.set([])),
      this.loadEducation(),
      this.loadQualification(),
      this.loadReward(),
    ]);
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

  private async loadEducation(): Promise<void> {
    this.educLoading.set(true);
    try {
      this.educationList.set(await this.service.getEducation());
    } catch {
      this.message.error(this.i18n.t('qi.msg.loadError.educ', 'Lỗi tải dữ liệu học vấn'));
    } finally {
      this.educLoading.set(false);
    }
  }

  private async loadQualification(): Promise<void> {
    this.qualLoading.set(true);
    try {
      this.qualificationList.set(await this.service.getQualification());
    } catch {
      this.message.error(this.i18n.t('qi.msg.loadError.qual', 'Lỗi tải dữ liệu chứng chỉ'));
    } finally {
      this.qualLoading.set(false);
    }
  }

  private async loadReward(): Promise<void> {
    this.rewardLoading.set(true);
    try {
      this.rewardList.set(await this.service.getReward());
    } catch {
      this.message.error(this.i18n.t('qi.msg.loadError.reward', 'Lỗi tải dữ liệu khen thưởng'));
    } finally {
      this.rewardLoading.set(false);
    }
  }

  // ===== Modal: Học vấn =====
  openEducModal(row: EducationRow | null): void {
    this.educForm = row
      ? {
          updateEducNo: row.educNo ?? null,
          degreeCode: row.degreeCode ?? null,
          institutionName: row.institutionName ?? '',
          startDate: row.startDate ?? '',
          endDate: row.endDate ?? '',
          subject: row.subject ?? '',
          degreesCode: row.degreesCode ?? '',
          eduDegNum: row.eduDegNum ?? '',
          remark: row.remark ?? '',
          attachFiles: [],
        }
      : emptyEducationForm();
    this.educFiles.set([]);
    if (row?.educNo) {
      this.loadEducFiles(row.educNo);
    }
    this.educModalVisible.set(true);
  }

  closeEducModal(): void {
    this.educModalVisible.set(false);
  }

  private async loadEducFiles(educNo: number): Promise<void> {
    this.educFilesLoading.set(true);
    try {
      this.educFiles.set(await this.service.getEducationFiles(educNo));
    } catch {
      this.educFiles.set([]);
    } finally {
      this.educFilesLoading.set(false);
    }
  }

  onEducFilesChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.educForm.attachFiles = input.files ? Array.from(input.files) : [];
  }

  async saveEducation(): Promise<void> {
    if (!this.educForm.degreeCode) {
      this.message.warning(this.i18n.t('qi.msg.validate.educLevel', 'Vui lòng chọn Trình độ học vấn!'));
      return;
    }
    this.educSaving.set(true);
    try {
      await this.service.saveEducationApply(
        {
          updateEducNo: this.educForm.updateEducNo ?? undefined,
          degreeCode: this.educForm.degreeCode,
          institutionName: this.educForm.institutionName || undefined,
          startDate: this.educForm.startDate || undefined,
          endDate: this.educForm.endDate || undefined,
          subject: this.educForm.subject || undefined,
          degreesCode: this.educForm.degreesCode || undefined,
          eduDegNum: this.educForm.eduDegNum || undefined,
          remark: this.educForm.remark || undefined,
        },
        this.educForm.attachFiles,
      );
      this.message.success(this.i18n.t('epi.msg.applySuccess', 'Gửi yêu cầu thành công! Chờ người quản lý xét duyệt.'));
      this.educModalVisible.set(false);
      await this.loadEducation();
    } catch {
      this.message.error(this.i18n.t('qi.msg.systemError', 'Lỗi hệ thống'));
    } finally {
      this.educSaving.set(false);
    }
  }

  // ===== Modal: Chứng chỉ =====
  openQualModal(row: QualificationRow | null): void {
    this.qualForm = row
      ? {
          updateQualNo: row.qualNo ?? null,
          qualName: row.qualName ?? '',
          qualLevel: row.qualLevel ?? '',
          dateObtained: this.parseDate(row.dateObtained),
          validityDate: this.parseDate(row.validityDate),
          qualCardNo: row.qualCardNo ?? '',
          qualInstitute: row.qualInstitute ?? '',
          qualGrade: row.qualGrade ?? '',
          qualRemark: row.qualRemark ?? '',
          attachFiles: [],
        }
      : emptyQualificationForm();
    this.qualFiles.set([]);
    if (row?.qualNo) {
      this.loadQualFiles(row.qualNo);
    }
    this.qualModalVisible.set(true);
  }

  closeQualModal(): void {
    this.qualModalVisible.set(false);
  }

  private async loadQualFiles(qualNo: number): Promise<void> {
    this.qualFilesLoading.set(true);
    try {
      this.qualFiles.set(await this.service.getQualificationFiles(qualNo));
    } catch {
      this.qualFiles.set([]);
    } finally {
      this.qualFilesLoading.set(false);
    }
  }

  onQualFilesChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.qualForm.attachFiles = input.files ? Array.from(input.files) : [];
  }

  async saveQualification(): Promise<void> {
    if (!this.qualForm.qualName.trim()) {
      this.message.warning(this.i18n.t('qi.msg.validate.qualName', 'Vui lòng nhập Tên chứng chỉ!'));
      return;
    }
    this.qualSaving.set(true);
    try {
      await this.service.saveQualificationApply(
        {
          updateQualNo: this.qualForm.updateQualNo ?? undefined,
          qualName: this.qualForm.qualName,
          qualLevel: this.qualForm.qualLevel || undefined,
          dateObtained: this.toApiDate(this.qualForm.dateObtained),
          validityDate: this.toApiDate(this.qualForm.validityDate),
          qualCardNo: this.qualForm.qualCardNo || undefined,
          qualInstitute: this.qualForm.qualInstitute || undefined,
          qualGrade: this.qualForm.qualGrade || undefined,
          qualRemark: this.qualForm.qualRemark || undefined,
        },
        this.qualForm.attachFiles,
      );
      this.message.success(this.i18n.t('epi.msg.applySuccess', 'Gửi yêu cầu thành công! Chờ người quản lý xét duyệt.'));
      this.qualModalVisible.set(false);
      await this.loadQualification();
    } catch {
      this.message.error(this.i18n.t('qi.msg.systemError', 'Lỗi hệ thống'));
    } finally {
      this.qualSaving.set(false);
    }
  }
}
