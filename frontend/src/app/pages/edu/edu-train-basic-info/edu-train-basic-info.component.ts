import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';

import { I18nService } from '../../../i18n/i18n.service';
import { EduCommonService, EduDeptNode, EduEmployee } from '../shared/edu-common.service';
import { EduEmpPickerComponent } from '../shared/edu-emp-picker/edu-emp-picker.component';
import { eduClassUnitLabel, eduCourseTitle, eduPeriodLabel } from '../shared/edu-labels';
import { EduPersonRow, EduPersonSelectComponent } from '../shared/edu-person-select/edu-person-select.component';
import { EduBasicInfoRow, EduBasicPlanOption, EduTrainBasicInfoService } from './edu-train-basic-info.service';

import { TABLE_PAGE_SIZE_OPTIONS } from '../../../core/config/table-pagination.config';
/** Popup chọn người từ danh sách cho sẵn đang mở cho mục nào. */
type EtbPickMode = 'eva' | 'act' | 'final';

/**
 * Thông tin đào tạo cơ bản (lập khóa đào tạo từ kế hoạch) - port từ
 * /edu/traineducation/trainBasicInformation (Hanwha_HTSV: trainBasicInformation.jsp /
 * addTrainBasicInformation.jsp / trainBasicInformationInfo.jsp / queryBasicInformation.jsp /
 * commonTeacher.jsp / planEmployee.jsp / otherPlanEmployee.jsp / finalstudent.jsp).
 * - Chọn kế hoạch -> điền sẵn tên khóa, hình thức, địa điểm, ngày, thời lượng, giảng viên, NV kế hoạch.
 * - Giảng viên đánh giá: chọn trong giảng viên của kế hoạch.
 * - NV chỉ định: chọn trong NV kế hoạch; NV tự chọn: tìm NV ngoài kế hoạch (lọc theo phòng ban).
 * - Nhân viên thực tế: chọn trong NV tự chọn + chỉ định (+ NV kế hoạch khi sửa) như bản gốc.
 * Modal đóng khi bấm ra ngoài vùng modal (nzMaskClosable).
 */
@Component({
  selector: 'app-edu-train-basic-info',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCardModule,
    NzDatePickerModule,
    NzDescriptionsModule,
    NzDividerModule,
    NzFormModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzModalModule,
    NzSelectModule,
    NzTableModule,
    NzTagModule,
    NzTreeSelectModule,
    EduEmpPickerComponent,
    EduPersonSelectComponent,
  ],
  templateUrl: './edu-train-basic-info.component.html',
  styleUrl: './edu-train-basic-info.component.scss',
})
export class EduTrainBasicInfoComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;

  private readonly service = inject(EduTrainBasicInfoService);
  protected readonly common = inject(EduCommonService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  // ===== Cây phòng ban =====
  private readonly deptList = signal<EduDeptNode[]>([]);
  protected readonly deptCheckNodes = signal<NzTreeNodeOptions[]>([]);
  private readonly deptChildren = computed(() => this.common.buildDeptChildren(this.deptList()));

  // ===== Bộ lọc & danh sách =====
  protected readonly searchName = signal('');
  protected readonly searchStart = signal<Date | null>(null);
  protected readonly searchEnd = signal<Date | null>(null);
  protected readonly keyword = signal('');
  protected readonly listLoading = signal(false);
  protected readonly rows = signal<EduBasicInfoRow[]>([]);
  protected readonly selectedNo = signal<string | null>(null);

  protected readonly filteredRows = computed(() => {
    const kw = this.keyword().trim().toLowerCase();
    if (!kw) return this.rows();
    return this.rows().filter((r) =>
      [r.trainTypeCodeName, r.courseNameCode, r.trainFormCodeName, r.impleStartDate].some((v) => (v ?? '').toLowerCase().includes(kw)),
    );
  });

  // ===== Modal Thêm/Sửa =====
  protected readonly modalVisible = signal(false);
  protected readonly modalIsEdit = signal(false);
  protected readonly saving = signal(false);
  protected readonly planOptions = signal<EduBasicPlanOption[]>([]);
  protected readonly form = signal<EduBasicInfoRow>({});
  protected readonly formStart = signal<Date | null>(null);
  protected readonly formEnd = signal<Date | null>(null);
  protected readonly formApplyEnd = signal<Date | null>(null);
  protected readonly formHour = signal<number | null>(null);
  protected readonly formUnit = signal<string | null>(null);
  protected readonly formContent = signal('');
  protected readonly formDepts = signal<string[]>([]);
  protected readonly evaTeachers = signal<EduPersonRow[]>([]);
  protected readonly actEmployees = signal<EduPersonRow[]>([]);
  protected readonly freeEmployees = signal<EduPersonRow[]>([]);
  protected readonly finalStudents = signal<EduPersonRow[]>([]);

  protected readonly planEmpids = computed(() => this.common.splitCsv(this.form().planEmployeeEmpid));
  protected readonly comTeacherEmpids = computed(() => this.common.splitCsv(this.form().comTeacherEmpid));
  protected readonly planObjectCount = computed(() => this.actEmployees().length + this.freeEmployees().length);

  // ===== Popup chọn người =====
  protected readonly pickMode = signal<EtbPickMode | null>(null);
  protected readonly pickRows = signal<EduPersonRow[]>([]);
  protected readonly pickLoading = signal(false);
  protected readonly pickTitle = computed(() => {
    switch (this.pickMode()) {
      case 'eva':
        return this.i18n.t('edu.trainBasicInformation.PINGJIAJIANGSHI.a', 'Giáo viên đánh giá');
      case 'act':
        return this.i18n.t('edu.planManager.ZHIDINGRENYUAN.a', 'NV chỉ định');
      case 'final':
        return this.i18n.t('edu.trainBasicInformation.SHIJIRENYUAN.a', 'Nhân viên thực tế');
      default:
        return '';
    }
  });
  protected readonly pickSelected = computed(() => {
    switch (this.pickMode()) {
      case 'eva':
        return this.evaTeachers().map((p) => p.empid);
      case 'act':
        return this.actEmployees().map((p) => p.empid);
      case 'final':
        return this.finalStudents().map((p) => p.empid);
      default:
        return [];
    }
  });
  protected readonly freePickerVisible = signal(false);
  protected readonly freeEmpids = computed(() => this.freeEmployees().map((p) => p.empid));
  protected readonly desDeptCsv = computed(() => this.formDepts().join(',') || null);

  // ===== Modal Xem =====
  protected readonly detailVisible = signal(false);
  protected readonly detail = signal<EduBasicInfoRow | null>(null);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    this.loadDeptTree();
    await this.search();
  }

  private async loadDeptTree(): Promise<void> {
    try {
      const list = await this.common.getDeptTree();
      this.deptList.set(list);
      this.deptCheckNodes.set(this.common.buildDeptTree(list, true));
    } catch {
      this.deptList.set([]);
    }
  }

  protected unitLabel(unit?: string | null): string {
    return eduClassUnitLabel(this.i18n, unit);
  }

  protected courseTitle(name?: string | null, period?: string | null): string {
    return eduCourseTitle(this.i18n, name, period);
  }

  protected planLabel(p: EduBasicPlanOption): string {
    return `${p.trainTypeCodeName ?? ''}  ${p.courseNumber ?? ''}  ${p.courseNameCode ?? ''}  (${eduPeriodLabel(this.i18n, p.periodTime)})`;
  }

  protected names(list: EduPersonRow[]): string {
    return list.map((p) => p.name).join(', ');
  }

  // ===== Danh sách =====
  async search(): Promise<void> {
    this.listLoading.set(true);
    try {
      this.rows.set(
        await this.service.getList({
          courseName: this.searchName().trim(),
          startDate: this.common.formatDate(this.searchStart()),
          endDate: this.common.formatDate(this.searchEnd()),
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
    this.searchName.set('');
    this.searchStart.set(null);
    this.searchEnd.set(null);
    this.keyword.set('');
    this.search();
  }

  selectRow(row: EduBasicInfoRow): void {
    this.selectedNo.set(row.basicNo ?? null);
  }

  // ===== Form =====
  private applyToForm(d: EduBasicInfoRow): void {
    this.form.set(d);
    this.formStart.set(this.common.parseDate(d.impleStartDate));
    this.formEnd.set(this.common.parseDate(d.impleEndDate));
    this.formApplyEnd.set(this.common.parseDate(d.applyEndDate));
    this.formHour.set(d.impleClassHour ? Number(d.impleClassHour) : null);
    this.formUnit.set(d.impleClassUnit || null);
    this.formContent.set(d.trainContent ?? '');
    this.formDepts.set(this.common.splitCsv(d.desDepartment));
    this.evaTeachers.set(this.pairPeople(d.evaTeacherEmpid, d.evaTeacherName));
  }

  private pairPeople(empids?: string, names?: string): EduPersonRow[] {
    const ids = this.common.splitCsv(empids);
    const ns = (names ?? '').split(',');
    return ids.map((empid, i) => ({ empid, name: (ns[i] ?? empid).trim() }));
  }

  private resetForm(): void {
    this.applyToForm({});
    this.actEmployees.set([]);
    this.freeEmployees.set([]);
    this.finalStudents.set([]);
  }

  async openAddModal(): Promise<void> {
    try {
      this.planOptions.set(await this.service.getPlans());
    } catch {
      this.planOptions.set([]);
    }
    this.resetForm();
    this.modalIsEdit.set(false);
    this.modalVisible.set(true);
  }

  async onPlanChange(planNo: string | null): Promise<void> {
    this.resetForm();
    if (!planNo) return;
    try {
      const res = await this.service.getPlanPrefill(planNo);
      if (res.success && res.data) {
        this.applyToForm(res.data);
      } else {
        this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
      }
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  async openEditModal(basicNo?: string | null): Promise<void> {
    const no = basicNo ?? this.selectedNo();
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
      this.applyToForm(d);
      this.actEmployees.set(d.actEmployees ?? []);
      this.freeEmployees.set(d.freeEmployees ?? []);
      this.finalStudents.set(d.finalStudents ?? []);
      this.modalIsEdit.set(true);
      this.modalVisible.set(true);
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  closeModal(): void {
    this.modalVisible.set(false);
  }

  onDeptsChange(value: string[] | null): void {
    this.formDepts.set(this.common.cascadeDeptSelection(this.formDepts(), value, this.deptChildren()));
  }

  // ===== Chọn người =====
  async openPick(mode: EtbPickMode): Promise<void> {
    let empids: string[] = [];
    if (mode === 'eva') {
      empids = this.comTeacherEmpids();
      if (!empids.length) {
        this.message.warning(this.i18n.t('edu.trainBasicInformation.MEIYOUYIBANJIANGSHI.a', 'Không có giảng viên!'));
        return;
      }
    } else if (mode === 'act') {
      empids = this.planEmpids();
      if (!empids.length) {
        this.message.warning(this.i18n.t('edu.trainBasicInformation.MEIYOUJIHUAZHIDINGRENYUAN.a', 'Không có nhân viên chỉ định theo kế hoạch!'));
        return;
      }
    } else {
      // Bản gốc: thêm mới = tự chọn + chỉ định; sửa = tự chọn + chỉ định + NV kế hoạch
      const set = new Set([...this.freeEmpids(), ...this.actEmployees().map((p) => p.empid)]);
      if (this.modalIsEdit()) this.planEmpids().forEach((e) => set.add(e));
      empids = [...set];
    }
    this.pickMode.set(mode);
    this.pickRows.set([]);
    if (!empids.length) return;
    this.pickLoading.set(true);
    try {
      this.pickRows.set(mode === 'eva' ? await this.service.getTeachers(empids) : await this.service.getEmployees(empids));
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.pickLoading.set(false);
    }
  }

  onPicked(rows: EduPersonRow[]): void {
    const picked = rows.map((r) => ({ empid: r.empid, name: r.name, deptName: r.deptName }));
    switch (this.pickMode()) {
      case 'eva':
        this.evaTeachers.set(picked);
        break;
      case 'act':
        this.actEmployees.set(picked);
        break;
      case 'final':
        this.finalStudents.set(picked);
        break;
    }
  }

  onPickVisibleChange(visible: boolean): void {
    if (!visible) this.pickMode.set(null);
  }

  onFreePicked(list: EduEmployee[]): void {
    this.freeEmployees.set(list.map((e) => ({ empid: e.empid, name: e.localName, deptName: e.deptName })));
  }

  removePerson(kind: 'act' | 'free' | 'final', empid: string): void {
    const target = kind === 'act' ? this.actEmployees : kind === 'free' ? this.freeEmployees : this.finalStudents;
    target.set(target().filter((p) => p.empid !== empid));
  }

  // ===== Lưu =====
  async save(): Promise<void> {
    const f = this.form();
    if (!this.modalIsEdit() && !f.planNo) {
      this.message.warning(this.i18n.t('edu.trainBasicInformation.XINGWEIBUTIANXIANG.a', '* không được để trống!'));
      return;
    }
    if (this.formStart() && this.formEnd() && this.formEnd()! < this.formStart()!) {
      this.message.warning(this.i18n.t('edu.planManager.msg.dateInvalid', 'Ngày kết thúc không được sớm hơn ngày bắt đầu!'));
      return;
    }
    const people = (list: EduPersonRow[]) => list.map((p) => ({ empid: p.empid, name: p.name }));
    const payload: EduBasicInfoRow = {
      basicNo: f.basicNo,
      planNo: f.planNo,
      impleStartDate: this.common.formatDate(this.formStart()),
      impleEndDate: this.common.formatDate(this.formEnd()),
      applyEndDate: this.common.formatDate(this.formApplyEnd()),
      impleClassHour: this.formHour() == null ? undefined : String(this.formHour()),
      impleClassUnit: this.formUnit() ?? undefined,
      trainContent: this.formContent().trim() || undefined,
      desDepartment: this.formDepts().join(',') || undefined,
      comTeacherEmpid: f.comTeacherEmpid,
      comTeacherName: f.comTeacherName,
      evaTeacherEmpid: this.evaTeachers().map((p) => p.empid).join(',') || undefined,
      evaTeacherName: this.evaTeachers().map((p) => p.name).join(',') || undefined,
      planEmployeeEmpid: f.planEmployeeEmpid,
      planEmployeeName: f.planEmployeeName,
      actEmployees: people(this.actEmployees()),
      freeEmployees: people(this.freeEmployees()),
      finalStudents: people(this.finalStudents()),
    };
    this.saving.set(true);
    try {
      const res = this.modalIsEdit() ? await this.service.update(payload) : await this.service.add(payload);
      if (res.success) {
        this.message.success(this.i18n.t('common.saveSuccess', 'Lưu thành công'));
        this.modalVisible.set(false);
        await this.search();
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
      nzContent: this.i18n.t(
        'edu.trainBasicInformation.SHANCHUJIBENXINXI.a',
        'Nếu xóa chương trình đào tạo, đánh giá học viên, đánh giá giảng viên, kết quả đào tạo, chi phí đều bị xóa theo!',
      ),
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

  // ===== Xem (queryBasicInformation bản gốc) =====
  async openDetail(basicNo?: string): Promise<void> {
    if (!basicNo) return;
    try {
      this.detail.set(await this.service.getDetail(basicNo));
      this.detailVisible.set(true);
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }
}
