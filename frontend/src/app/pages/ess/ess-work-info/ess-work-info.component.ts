import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import {
  EssWorkInfoService,
  InsideExperienceRow,
  WorkExperienceRow,
} from './ess-work-info.service';

interface WorkExperienceFormModel {
  updateWorkExperNo: number | null;
  cpnyName: string;
  deptName: string;
  startMonth: string;
  endMonth: string;
  position: string;
  resignReason: string;
  witness: string;
  remark: string;
  attachFiles: File[];
}

function emptyWorkExperienceForm(): WorkExperienceFormModel {
  return {
    updateWorkExperNo: null,
    cpnyName: '',
    deptName: '',
    startMonth: '',
    endMonth: '',
    position: '',
    resignReason: '',
    witness: '',
    remark: '',
    attachFiles: [],
  };
}

/**
 * Quyết định nhân sự (chỉ xem) + Kinh nghiệm làm việc của chính nhân viên
 * đang đăng nhập - port lại từ ess/empinfo/viewEssPersonalInfo.html
 * (Thymeleaf, đã xoá) sang Angular + NG-ZORRO, dùng nz-table thay cho bảng
 * dựng tay bằng jQuery. Gọi lại nguyên vẹn API JSON sẵn có - mọi thay đổi
 * kinh nghiệm đều gửi yêu cầu chờ quản lý xét duyệt (không cập nhật trực
 * tiếp), giống hệt hành vi bản gốc. Không kèm khối "Thông tin nhân viên"
 * (essEmpInfoCard) vì chưa có component Angular tương đương, theo tiền lệ đã
 * áp dụng ở YearUseInfoComponent.
 */
@Component({
  selector: 'app-ess-work-info',
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
    NzTableModule,
  ],
  templateUrl: './ess-work-info.component.html',
  styleUrl: './ess-work-info.component.scss',
})
export class EssWorkInfoComponent implements OnInit {
  private readonly service = inject(EssWorkInfoService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly insideLoading = signal(false);
  protected readonly insideExperience = signal<InsideExperienceRow[]>([]);

  protected readonly workExpLoading = signal(false);
  protected readonly workExperience = signal<WorkExperienceRow[]>([]);

  protected readonly workExpModalVisible = signal(false);
  protected readonly workExpSaving = signal(false);
  protected readonly workExpFilesLoading = signal(false);
  protected readonly workExpFiles = signal<{ fileNo?: string; fileName?: string }[]>([]);
  protected workExpForm: WorkExperienceFormModel = emptyWorkExperienceForm();

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await Promise.all([this.loadInsideExperience(), this.loadWorkExperience()]);
  }

  private async loadInsideExperience(): Promise<void> {
    this.insideLoading.set(true);
    try {
      this.insideExperience.set(await this.service.getInsideExperience());
    } catch {
      this.message.error(this.i18n.t('epi.msg.loadError.workInfo', 'Lỗi tải dữ liệu công việc'));
    } finally {
      this.insideLoading.set(false);
    }
  }

  private async loadWorkExperience(): Promise<void> {
    this.workExpLoading.set(true);
    try {
      this.workExperience.set(await this.service.getWorkExperience());
    } catch {
      this.message.error(this.i18n.t('epi.msg.loadError.workExp', 'Lỗi tải dữ liệu kinh nghiệm'));
    } finally {
      this.workExpLoading.set(false);
    }
  }

  openWorkExpModal(row: WorkExperienceRow | null): void {
    this.workExpForm = row
      ? {
          updateWorkExperNo: row.workExpNo ?? null,
          cpnyName: row.cpnyName ?? '',
          deptName: row.deptName ?? '',
          startMonth: row.startMonth ?? row.startDate ?? '',
          endMonth: row.endMonth ?? row.endDate ?? '',
          position: row.position ?? '',
          resignReason: row.resignReason ?? '',
          witness: '',
          remark: '',
          attachFiles: [],
        }
      : emptyWorkExperienceForm();
    this.workExpFiles.set([]);
    if (row?.workExpNo) {
      this.loadWorkExpFiles(row.workExpNo);
    }
    this.workExpModalVisible.set(true);
  }

  closeWorkExpModal(): void {
    this.workExpModalVisible.set(false);
  }

  private async loadWorkExpFiles(workExpNo: number): Promise<void> {
    this.workExpFilesLoading.set(true);
    try {
      this.workExpFiles.set(await this.service.getWorkExperienceFiles(workExpNo));
    } catch {
      this.workExpFiles.set([]);
    } finally {
      this.workExpFilesLoading.set(false);
    }
  }

  onWorkExpFilesChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.workExpForm.attachFiles = input.files ? Array.from(input.files) : [];
  }

  async saveWorkExperience(): Promise<void> {
    if (!this.workExpForm.cpnyName.trim()) {
      this.message.warning(this.i18n.t('epi.msg.validate.cpnyName', 'Vui lòng nhập Tên công ty!'));
      return;
    }
    this.workExpSaving.set(true);
    try {
      await this.service.saveWorkExperienceApply(
        {
          updateWorkExperNo: this.workExpForm.updateWorkExperNo ?? undefined,
          cpnyName: this.workExpForm.cpnyName,
          deptName: this.workExpForm.deptName || undefined,
          startMonth: this.workExpForm.startMonth || undefined,
          endMonth: this.workExpForm.endMonth || undefined,
          position: this.workExpForm.position || undefined,
          resignReason: this.workExpForm.resignReason || undefined,
          witness: this.workExpForm.witness || undefined,
          remark: this.workExpForm.remark || undefined,
        },
        this.workExpForm.attachFiles,
      );
      this.message.success(this.i18n.t('epi.msg.applySuccess', 'Gửi yêu cầu thành công! Chờ người quản lý xét duyệt.'));
      this.workExpModalVisible.set(false);
      await this.loadWorkExperience();
    } catch {
      this.message.error(this.i18n.t('epi.msg.saveError.workExp', 'Lỗi khi gửi yêu cầu kinh nghiệm làm việc!'));
    } finally {
      this.workExpSaving.set(false);
    }
  }
}
