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
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../../i18n/i18n.service';
import { EmpSearchService, EmployeeSearchResult } from '../shared/emp-search.service';
import { EducationRow, EducationSavePayload, EducationService } from './education.service';

/**
 * Quá trình học tập - port lại từ hrm/empinfo/educationSearch.html (đã xoá).
 * Backend GET /hrm/empinfo/api/education trả về mảng phẳng (không phân
 * trang server-side) nên dùng nz-table phân trang phía client, giống các
 * trang CRUD đơn giản khác trong dự án.
 */
@Component({
  selector: 'app-education',
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
  templateUrl: './education.component.html',
  styleUrl: './education.component.scss',
})
export class EducationComponent implements OnInit {
  private readonly service = inject(EducationService);
  private readonly employeeService = inject(EmpSearchService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly searchEmpId = signal('');
  protected readonly searchLocalName = signal('');
  protected readonly searchInstitutionName = signal('');

  protected readonly listLoading = signal(false);
  protected readonly rows = signal<EducationRow[]>([]);

  protected readonly modalVisible = signal(false);
  protected readonly modalIsEdit = signal(false);
  protected readonly saving = signal(false);

  protected readonly employeeOptions = signal<EmployeeSearchResult[]>([]);
  protected readonly employeeSearching = signal(false);

  protected readonly formEducNo = signal<number | null>(null);
  protected readonly formPersonId = signal('');
  protected readonly formEmpLabel = signal<string | null>(null);
  protected readonly formInstitutionName = signal('');
  protected readonly formDegreeCode = signal('');
  protected readonly formSubject = signal('');
  protected readonly formStartDate = signal('');
  protected readonly formEndDate = signal('');
  protected readonly formSchoolLength = signal('');
  protected readonly formSiteCountry = signal('');
  protected readonly formPlace = signal('');
  protected readonly formThesisNameLocal = signal('');
  protected readonly formThesisNameEng = signal('');
  protected readonly formSubjectSecond = signal('');
  protected readonly formEduDegNum = signal('');
  protected readonly formDegreesCode = signal('');
  protected readonly formStudyExperience = signal('N');
  protected readonly formFinalDegreeWhether = signal('N');
  protected readonly formRemark = signal('');

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.search();
  }

  async search(): Promise<void> {
    this.listLoading.set(true);
    try {
      this.rows.set(
        await this.service.search(this.searchEmpId().trim(), this.searchLocalName().trim(), this.searchInstitutionName().trim()),
      );
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.listLoading.set(false);
    }
  }

  clearSearch(): void {
    this.searchEmpId.set('');
    this.searchLocalName.set('');
    this.searchInstitutionName.set('');
    this.search();
  }

  private resetForm(): void {
    this.formEducNo.set(null);
    this.formPersonId.set('');
    this.formEmpLabel.set(null);
    this.formInstitutionName.set('');
    this.formDegreeCode.set('');
    this.formSubject.set('');
    this.formStartDate.set('');
    this.formEndDate.set('');
    this.formSchoolLength.set('');
    this.formSiteCountry.set('');
    this.formPlace.set('');
    this.formThesisNameLocal.set('');
    this.formThesisNameEng.set('');
    this.formSubjectSecond.set('');
    this.formEduDegNum.set('');
    this.formDegreesCode.set('');
    this.formStudyExperience.set('N');
    this.formFinalDegreeWhether.set('N');
    this.formRemark.set('');
    this.employeeOptions.set([]);
  }

  openAddModal(): void {
    this.resetForm();
    this.modalIsEdit.set(false);
    this.modalVisible.set(true);
  }

  async openEditModal(row: EducationRow): Promise<void> {
    this.resetForm();
    this.modalIsEdit.set(true);
    try {
      const d = await this.service.getById(row.educNo!);
      this.formEducNo.set(d.educNo ?? null);
      this.formPersonId.set(d.personId ?? '');
      this.formEmpLabel.set(`${d.empId ?? ''} - ${d.localName ?? ''}`);
      this.formInstitutionName.set(d.institutionName ?? '');
      this.formDegreeCode.set(d.degreeCode ?? '');
      this.formSubject.set(d.subject ?? '');
      this.formStartDate.set(d.startDate ?? '');
      this.formEndDate.set(d.endDate ?? '');
      this.formSchoolLength.set(d.schoolLength ?? '');
      this.formSiteCountry.set(d.siteCountry ?? '');
      this.formPlace.set(d.place ?? '');
      this.formThesisNameLocal.set(d.thesisNameLocal ?? '');
      this.formThesisNameEng.set(d.thesisNameEng ?? '');
      this.formSubjectSecond.set(d.subjectSecond ?? '');
      this.formEduDegNum.set(d.eduDegNum ?? '');
      this.formDegreesCode.set(d.degreesCode ?? '');
      this.formStudyExperience.set(d.studyExperience ?? 'N');
      this.formFinalDegreeWhether.set(d.finalDegreeWhether ?? 'N');
      this.formRemark.set(d.remark ?? '');
      this.modalVisible.set(true);
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  closeModal(): void {
    this.modalVisible.set(false);
  }

  async onEmployeeSearch(keyword: string): Promise<void> {
    const kw = (keyword || '').trim();
    if (!kw) {
      this.employeeOptions.set([]);
      return;
    }
    this.employeeSearching.set(true);
    try {
      this.employeeOptions.set(await this.employeeService.searchEmployees(kw));
    } catch {
      this.employeeOptions.set([]);
    } finally {
      this.employeeSearching.set(false);
    }
  }

  onEmployeeSelected(personId: string | null): void {
    this.formPersonId.set(personId ?? '');
    const found = this.employeeOptions().find((e) => e.personId === personId);
    if (found) {
      this.formEmpLabel.set(`${found.empId} - ${found.localName}`);
    }
  }

  async saveRecord(): Promise<void> {
    const personId = this.formPersonId().trim();
    const institutionName = this.formInstitutionName().trim();
    if (!personId) {
      this.message.warning(this.i18n.t('hrm.educationSearch.msg.selectEmployee', 'Vui lòng chọn nhân viên'));
      return;
    }
    if (!institutionName) {
      this.message.warning(this.i18n.t('hrm.educationSearch.msg.enterInstitution', 'Vui lòng nhập tên trường/cơ sở'));
      return;
    }
    const payload: EducationSavePayload = {
      educNo: this.formEducNo(),
      personId,
      institutionName,
      degreeCode: this.formDegreeCode().trim() || undefined,
      subject: this.formSubject().trim() || undefined,
      startDate: this.formStartDate().trim() || undefined,
      endDate: this.formEndDate().trim() || undefined,
      schoolLength: this.formSchoolLength().trim() || undefined,
      siteCountry: this.formSiteCountry().trim() || undefined,
      place: this.formPlace().trim() || undefined,
      thesisNameLocal: this.formThesisNameLocal().trim() || undefined,
      thesisNameEng: this.formThesisNameEng().trim() || undefined,
      subjectSecond: this.formSubjectSecond().trim() || undefined,
      eduDegNum: this.formEduDegNum().trim() || undefined,
      degreesCode: this.formDegreesCode().trim() || undefined,
      studyExperience: this.formStudyExperience(),
      finalDegreeWhether: this.formFinalDegreeWhether(),
      remark: this.formRemark().trim() || undefined,
    };
    this.saving.set(true);
    try {
      const res = await this.service.save(payload);
      if (res.error) {
        this.message.error(res.error);
        return;
      }
      this.message.success(res.message || this.i18n.t('common.saveSuccess', 'Lưu thành công'));
      this.modalVisible.set(false);
      await this.search();
    } catch {
      this.message.error(this.i18n.t('common.saveFailed', 'Lưu thất bại.'));
    } finally {
      this.saving.set(false);
    }
  }

  deleteOne(row: EducationRow): void {
    this.modal.confirm({
      nzTitle: this.i18n.t('hrm.educationSearch.msg.confirmDelete', 'Bạn có chắc chắn muốn xóa bản ghi này?'),
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          const res = await this.service.delete(row.educNo!);
          if (res.error) {
            this.message.error(res.error);
            return;
          }
          this.message.success(res.message || this.i18n.t('common.deleteSuccess', 'Xóa thành công'));
          await this.search();
        } catch {
          this.message.error(this.i18n.t('common.deleteFailed', 'Xóa thất bại.'));
        }
      },
    });
  }
}
