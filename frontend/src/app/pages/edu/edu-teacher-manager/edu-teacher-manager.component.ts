import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import { SyCodeOption } from '../../ar/company-calendar/company-calendar.service';
import {
  EDU_CODE_TEACH_FIELD,
  EDU_CODE_TEACH_LEVEL,
  EDU_CODE_TEACH_STATUS,
  EduCommonService,
  EduEmployee,
} from '../shared/edu-common.service';
import { EduEmpPickerComponent } from '../shared/edu-emp-picker/edu-emp-picker.component';
import { ETM_ERR_NO_PERSON, EduTeacherManagerRow, EduTeacherManagerService } from './edu-teacher-manager.service';

import { TABLE_PAGE_SIZE_OPTIONS } from '../../../core/config/table-pagination.config';
/**
 * Quản lý giảng viên - port từ /edu/traineducation/teacherManager (Hanwha_HTSV:
 * teacherManager.jsp / addTeacherManager.jsp / teacherManagerInfo.jsp / queryTeacher.jsp).
 * - Thêm mới: Nội bộ (tìm NV theo tên, chọn 1 người) hoặc Bên ngoài (nhập tay tên,
 *   mã sinh tự động); kinh nghiệm nhập theo năm + tháng.
 * - Sửa: thông tin nhân viên và kinh nghiệm chỉ hiển thị (giống bản gốc).
 * Modal đóng khi bấm ra ngoài vùng modal (nzMaskClosable).
 */
@Component({
  selector: 'app-edu-teacher-manager',
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
    NzRadioModule,
    NzSelectModule,
    NzTableModule,
    EduEmpPickerComponent,
  ],
  templateUrl: './edu-teacher-manager.component.html',
  styleUrl: './edu-teacher-manager.component.scss',
})
export class EduTeacherManagerComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;

  private readonly service = inject(EduTeacherManagerService);
  private readonly common = inject(EduCommonService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  // ===== Danh mục =====
  protected readonly fieldOptions = signal<SyCodeOption[]>([]);
  protected readonly levelOptions = signal<SyCodeOption[]>([]);
  protected readonly statusOptions = signal<SyCodeOption[]>([]);

  // ===== Bộ lọc & danh sách =====
  protected readonly searchKeyword = signal('');
  protected readonly searchField = signal<string | null>(null);
  protected readonly searchLevel = signal<string | null>(null);
  protected readonly searchStatus = signal<string | null>(null);
  protected readonly keyword = signal('');
  protected readonly listLoading = signal(false);
  protected readonly rows = signal<EduTeacherManagerRow[]>([]);
  protected readonly selectedNo = signal<string | null>(null);

  protected readonly filteredRows = computed(() => {
    const kw = this.keyword().trim().toLowerCase();
    if (!kw) return this.rows();
    return this.rows().filter((r) =>
      [r.empid, r.teacherName, r.orgNameLocal, r.teachFieldCodeName, r.teachLevelCodeName, r.teachStatusCodeName]
        .some((v) => (v ?? '').toLowerCase().includes(kw)),
    );
  });

  // ===== Modal Thêm/Sửa =====
  protected readonly modalVisible = signal(false);
  protected readonly modalIsEdit = signal(false);
  protected readonly saving = signal(false);
  protected readonly formTeacherNo = signal<string | null>(null);
  protected readonly formExternal = signal(false);
  protected readonly formSearchName = signal('');
  protected readonly formExternalName = signal('');
  protected readonly formPicked = signal<EduEmployee | null>(null);
  protected readonly formInfo = signal<EduTeacherManagerRow | null>(null);
  protected readonly formLevel = signal<string | null>(null);
  protected readonly formField = signal<string | null>(null);
  protected readonly formYear = signal<number | null>(null);
  protected readonly formMonth = signal<number | null>(null);
  protected readonly formHire = signal<Date | null>(null);
  protected readonly formFiring = signal<Date | null>(null);
  protected readonly formStatus = signal<string | null>(null);
  protected readonly formRemark = signal('');
  protected readonly empPickerVisible = signal(false);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    const [fields, levels, statuses] = await Promise.all([
      this.common.getCodeListSafe(EDU_CODE_TEACH_FIELD),
      this.common.getCodeListSafe(EDU_CODE_TEACH_LEVEL),
      this.common.getCodeListSafe(EDU_CODE_TEACH_STATUS),
    ]);
    this.fieldOptions.set(fields);
    this.levelOptions.set(levels);
    this.statusOptions.set(statuses);
    await this.search();
  }

  protected codeLabel(opt: SyCodeOption): string {
    return opt.codeName || opt.nameVi || opt.codeNo;
  }

  /** Tổng kinh nghiệm (tháng) -> "X năm Y tháng" (giống teacherManagerInfo bản gốc). */
  protected experienceLabel(months?: string): string {
    const total = Number(months);
    if (!months || isNaN(total)) return '';
    const year = Math.floor(total / 12);
    const month = total % 12;
    const monthText = `${month} ${this.i18n.t('liang.hr.viewWorkInfo.title.MONTH', 'Tháng')}`;
    return year > 0 ? `${year} ${this.i18n.t('inct.salesman.year', 'Năm')} ${monthText}` : monthText;
  }

  async search(): Promise<void> {
    this.listLoading.set(true);
    try {
      this.rows.set(
        await this.service.getList({
          keyword: this.searchKeyword().trim(),
          teachFieldCode: this.searchField(),
          teachLevelCode: this.searchLevel(),
          teachStatusCode: this.searchStatus(),
        }),
      );
      this.selectedNo.set(null);
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.listLoading.set(false);
    }
  }

  clearSearch(): void {
    this.searchKeyword.set('');
    this.searchField.set(null);
    this.searchLevel.set(null);
    this.searchStatus.set(null);
    this.keyword.set('');
    this.search();
  }

  selectRow(row: EduTeacherManagerRow): void {
    this.selectedNo.set(row.teacherNo ?? null);
  }

  openAddModal(): void {
    this.modalIsEdit.set(false);
    this.formTeacherNo.set(null);
    this.formExternal.set(false);
    this.formSearchName.set('');
    this.formExternalName.set('');
    this.formPicked.set(null);
    this.formInfo.set(null);
    this.formLevel.set(null);
    this.formField.set(null);
    this.formYear.set(null);
    this.formMonth.set(null);
    this.formHire.set(null);
    this.formFiring.set(null);
    this.formStatus.set(null);
    this.formRemark.set('');
    this.modalVisible.set(true);
  }

  async openEditModal(teacherNo?: string | null): Promise<void> {
    const no = teacherNo ?? this.selectedNo();
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
      this.formTeacherNo.set(d.teacherNo ?? no);
      this.formInfo.set(d);
      this.formLevel.set(d.teachLevelCode ?? null);
      this.formField.set(d.teachFieldCode ?? null);
      this.formHire.set(this.common.parseDate(d.hireTime));
      this.formFiring.set(this.common.parseDate(d.firingTime));
      this.formStatus.set(d.teachStatusCode ?? null);
      this.formRemark.set(d.remark ?? '');
      this.modalVisible.set(true);
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  closeModal(): void {
    this.modalVisible.set(false);
  }

  onTypeChange(external: boolean): void {
    this.formExternal.set(external);
    this.formPicked.set(null);
  }

  onEmployeePicked(list: EduEmployee[]): void {
    this.formPicked.set(list[0] ?? null);
  }

  async save(): Promise<void> {
    const isEdit = this.modalIsEdit();
    if (!isEdit) {
      const noPerson = this.formExternal() ? !this.formExternalName().trim() : !this.formPicked();
      if (noPerson) {
        this.message.warning(this.i18n.t('edu.teacherManager.msg.selectPerson', 'Vui lòng chọn nhân viên trước khi thêm!'));
        return;
      }
    }
    if (this.formHire() && this.formFiring() && this.formFiring()! < this.formHire()!) {
      this.message.warning(this.i18n.t('edu.planManager.msg.dateInvalid', 'Ngày kết thúc không được sớm hơn ngày bắt đầu!'));
      return;
    }
    const payload: EduTeacherManagerRow = {
      teacherNo: this.formTeacherNo() ?? undefined,
      teachLevelCode: this.formLevel() ?? undefined,
      teachFieldCode: this.formField() ?? undefined,
      hireTime: this.common.formatDate(this.formHire()),
      firingTime: this.common.formatDate(this.formFiring()),
      teachStatusCode: this.formStatus() ?? undefined,
      remark: this.formRemark().trim() || undefined,
    };
    if (!isEdit) {
      payload.external = this.formExternal();
      payload.teacherName = this.formExternal() ? this.formExternalName().trim() : this.formPicked()?.localName;
      payload.empid = this.formExternal() ? undefined : this.formPicked()?.empid;
      payload.businessYear = this.formYear();
      payload.businessMonth = this.formMonth();
    }
    this.saving.set(true);
    try {
      const res = isEdit ? await this.service.update(payload) : await this.service.add(payload);
      if (res.success) {
        this.message.success(this.i18n.t('common.saveSuccess', 'Lưu thành công'));
        this.modalVisible.set(false);
        await this.search();
      } else if (res.errorCode === ETM_ERR_NO_PERSON) {
        this.message.error(this.i18n.t('edu.teacherManager.msg.selectPerson', 'Vui lòng chọn nhân viên trước khi thêm!'));
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
