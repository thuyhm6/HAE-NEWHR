import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
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
import { SyCodeOption } from '../../ar/company-calendar/company-calendar.service';
import { EduCourseManagerRow, EduCourseManagerService } from '../edu-course-manager/edu-course-manager.service';
import { EduAttachmentComponent } from '../shared/edu-attachment/edu-attachment.component';
import {
  EDU_CODE_TRAIN_DIFF,
  EDU_CODE_TRAIN_FORM,
  EDU_FILE_TYPE_PLAN,
  EduCommonService,
  EduDeptNode,
  EduEmployee,
  EduFile,
} from '../shared/edu-common.service';
import { EduEmpPickerComponent } from '../shared/edu-emp-picker/edu-emp-picker.component';
import {
  EPM_SYLLABUS_TEMPLATE_URL,
  EduPlanManagerRow,
  EduPlanManagerService,
  EduTeacherOption,
  EduTrainSyllabusRow,
} from './edu-plan-manager.service';

import { TABLE_PAGE_SIZE_OPTIONS, TABLE_DEFAULT_PAGE_SIZE } from '../../../core/config/table-pagination.config';
interface EpmPerson {
  empid: string;
  name: string;
}

/**
 * Kế hoạch đào tạo - port từ /edu/traineducation/planManager (Hanwha_HTSV:
 * planManager.jsp / addPlanManager.jsp / planManagerInfo.jsp / singlePlanManagerInfo.jsp /
 * desEmployee.jsp / teacherSearch.jsp / queryCourseSyllabus*.jsp).
 * - Thêm mới: PLAN_NO sinh trước để có thể import lịch học trước khi lưu (giống bản gốc).
 * - Phòng ban chỉ định: tích phòng ban cha thì tích luôn phòng ban con (chkboxType "s" bản gốc).
 * - NV chỉ định: chọn từ popup (lọc theo phòng ban chỉ định); không chọn ai thì khi thêm mới
 *   hệ thống lấy toàn bộ NV của phòng ban chỉ định.
 * - Giảng viên: chọn từ danh sách giảng viên hoặc nhập tay.
 * Modal đóng khi bấm ra ngoài vùng modal (nzMaskClosable).
 */
@Component({
  selector: 'app-edu-plan-manager',
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
    NzInputNumberModule,
    NzModalModule,
    NzSelectModule,
    NzTableModule,
    NzTagModule,
    NzTreeSelectModule,
    EduAttachmentComponent,
    EduEmpPickerComponent,
  ],
  templateUrl: './edu-plan-manager.component.html',
  styleUrl: './edu-plan-manager.component.scss',
})
export class EduPlanManagerComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
  protected readonly defaultPageSize = TABLE_DEFAULT_PAGE_SIZE;

  private readonly service = inject(EduPlanManagerService);
  private readonly courseService = inject(EduCourseManagerService);
  protected readonly common = inject(EduCommonService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly templateUrl = EPM_SYLLABUS_TEMPLATE_URL;

  // ===== Danh mục =====
  protected readonly diffOptions = signal<SyCodeOption[]>([]);
  protected readonly typeOptions = signal<SyCodeOption[]>([]);
  protected readonly formOptions = signal<SyCodeOption[]>([]);
  protected readonly deptList = signal<EduDeptNode[]>([]);
  protected readonly deptNodes = signal<NzTreeNodeOptions[]>([]);
  protected readonly deptCheckNodes = signal<NzTreeNodeOptions[]>([]);
  private readonly deptNameMap = computed(() => new Map(this.deptList().map((d) => [d.deptNo, d.deptName ?? d.deptNo])));
  private readonly deptChildren = computed(() => this.common.buildDeptChildren(this.deptList()));

  // ===== Bộ lọc & danh sách =====
  protected readonly searchDiffCode = signal<string | null>(null);
  protected readonly searchTypeCode = signal<string | null>(null);
  protected readonly searchCourseName = signal('');
  protected readonly keyword = signal('');
  protected readonly listLoading = signal(false);
  protected readonly rows = signal<EduPlanManagerRow[]>([]);
  protected readonly selectedNo = signal<string | null>(null);

  protected readonly filteredRows = computed(() => {
    const kw = this.keyword().trim().toLowerCase();
    if (!kw) return this.rows();
    return this.rows().filter((r) =>
      [r.trainDiffCode, r.courseNumber, r.courseNameCode, r.trainTypeCodeName, r.departManaCodeName, r.trainFormCodeName, r.planStartdate]
        .some((v) => (v ?? '').toLowerCase().includes(kw)),
    );
  });

  // ===== Modal Thêm/Sửa =====
  protected readonly modalVisible = signal(false);
  protected readonly modalIsEdit = signal(false);
  protected readonly saving = signal(false);
  protected readonly courseOptions = signal<EduCourseManagerRow[]>([]);
  protected readonly formPlanNo = signal<string | null>(null);
  protected readonly formCourseNo = signal<string | null>(null);
  protected readonly formCourseLabel = signal('');
  protected readonly formStartDate = signal<Date | null>(null);
  protected readonly formEndDate = signal<Date | null>(null);
  protected readonly formClassHour = signal<number | null>(null);
  protected readonly formClassUnit = signal('2');
  protected readonly formTrainForm = signal<string | null>(null);
  protected readonly formIsApply = signal('Y');
  protected readonly formDesDepts = signal<string[]>([]);
  protected readonly formDesEmployees = signal<EpmPerson[]>([]);
  protected readonly formBudget = signal('');
  protected readonly formBudgetShow = signal(false);
  protected readonly formDepartMana = signal<string | null>(null);
  protected readonly formTeacherDisplay = signal('');
  protected readonly formTeacherEmpid = signal('');
  protected readonly formTrainAddress = signal('');
  protected readonly formPersonCount = signal<number | null>(null);
  protected readonly formPersonRemark = signal('');
  protected readonly formEvaluate = signal<string[]>([]);
  protected readonly formFiles = signal<EduFile[]>([]);
  protected readonly formPendingFiles = signal<File[]>([]);
  protected readonly formSyllabusCount = signal(0);
  protected readonly importingSyllabus = signal(false);

  // ===== Popup chọn NV chỉ định =====
  protected readonly empPickerVisible = signal(false);
  protected readonly desDeptCsv = computed(() => this.formDesDepts().join(',') || null);
  protected readonly desEmpids = computed(() => this.formDesEmployees().map((p) => p.empid));

  // ===== Popup chọn giảng viên =====
  protected readonly teacherPickerVisible = signal(false);
  protected readonly teacherKeyword = signal('');
  protected readonly teacherLoading = signal(false);
  protected readonly teacherRows = signal<EduTeacherOption[]>([]);
  protected readonly teacherChecked = signal<Set<string>>(new Set());

  // ===== Modal Xem chi tiết =====
  protected readonly detailVisible = signal(false);
  protected readonly detail = signal<EduPlanManagerRow | null>(null);
  protected readonly detailFiles = signal<EduFile[]>([]);

  // ===== Modal Lịch học =====
  protected readonly syllabusVisible = signal(false);
  protected readonly syllabusEditable = signal(false);
  protected readonly syllabusPlanNo = signal<string | null>(null);
  protected readonly syllabusLoading = signal(false);
  protected readonly syllabusRows = signal<EduTrainSyllabusRow[]>([]);

  protected readonly evaluateOptions = [
    { value: '1', key: 'edu.planManager.XUEYUANPINGJIA.a', fallback: 'Đánh giá học viên' },
    { value: '2', key: 'edu.planManager.JIANGSHIPINGJIA.a', fallback: 'Đánh giá giảng viên' },
    { value: '3', key: 'edu.planManager.PEIXUNPINGJIA.a', fallback: 'Đánh giá khóa học' },
  ];

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    const [diff, forms] = await Promise.all([
      this.common.getCodeListSafe(EDU_CODE_TRAIN_DIFF),
      this.common.getCodeListSafe(EDU_CODE_TRAIN_FORM),
    ]);
    this.diffOptions.set(diff);
    this.formOptions.set(forms);
    this.loadDeptTree();
    await this.search();
  }

  private async loadDeptTree(): Promise<void> {
    try {
      const list = await this.common.getDeptTree();
      this.deptList.set(list);
      this.deptNodes.set(this.common.buildDeptTree(list));
      this.deptCheckNodes.set(this.common.buildDeptTree(list, true));
    } catch {
      this.deptList.set([]);
    }
  }

  protected codeLabel(opt: SyCodeOption): string {
    return opt.codeName || opt.nameVi || opt.codeNo;
  }

  protected courseLabel(c: EduCourseManagerRow): string {
    return `${c.trainTypeCodeName ?? ''}  ${c.courseNumber ?? ''}  ${c.courseNameCode ?? ''}`;
  }

  protected classUnitLabel(unit?: string): string {
    switch (unit) {
      case '0':
        return this.i18n.t('display.mutual.month', 'Tháng');
      case '1':
        return this.i18n.t('ar.viewsummaryparameteritem.title.day', 'Ngày');
      case '2':
        return this.i18n.t('ar.viewsummaryparameteritem.title.hour', 'Tiếng');
      default:
        return '';
    }
  }

  protected periodLabel(period?: string): string {
    return period ? this.i18n.t('edu.planManager.periodLabel', 'Kỳ thứ {0}').replace('{0}', period) : '';
  }

  protected yesNo(value?: string): string {
    return value === 'Y'
      ? this.i18n.t('ar.viewcycle.content.yes', 'Có')
      : this.i18n.t('ar.viewcycle.content.no', 'Không');
  }

  protected evaluateLabel(value?: string): string {
    const values = this.common.splitCsv(value);
    return this.evaluateOptions
      .filter((o) => values.includes(o.value))
      .map((o) => this.i18n.t(o.key, o.fallback))
      .join(', ');
  }

  protected deptNames(csv?: string): string {
    return this.common
      .splitCsv(csv)
      .map((no) => this.deptNameMap().get(no) ?? no)
      .join(', ');
  }

  // ===== Bộ lọc =====
  async onSearchDiffChange(value: string | null): Promise<void> {
    this.searchDiffCode.set(value);
    this.searchTypeCode.set(null);
    this.typeOptions.set(await this.common.getCodeListSafe(value));
  }

  async search(): Promise<void> {
    this.listLoading.set(true);
    try {
      this.rows.set(
        await this.service.getList({
          trainDiffCode: this.searchDiffCode(),
          trainTypeCode: this.searchTypeCode(),
          courseName: this.searchCourseName().trim(),
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
    this.searchDiffCode.set(null);
    this.searchTypeCode.set(null);
    this.typeOptions.set([]);
    this.searchCourseName.set('');
    this.keyword.set('');
    this.search();
  }

  selectRow(row: EduPlanManagerRow): void {
    this.selectedNo.set(row.planNo ?? null);
  }

  // ===== Thêm / Sửa =====
  private resetForm(): void {
    this.formPlanNo.set(null);
    this.formCourseNo.set(null);
    this.formCourseLabel.set('');
    this.formStartDate.set(null);
    this.formEndDate.set(null);
    this.formClassHour.set(null);
    this.formClassUnit.set('2');
    this.formTrainForm.set(null);
    this.formIsApply.set('Y');
    this.formDesDepts.set([]);
    this.formDesEmployees.set([]);
    this.formBudget.set('');
    this.formBudgetShow.set(false);
    this.formDepartMana.set(null);
    this.formTeacherDisplay.set('');
    this.formTeacherEmpid.set('');
    this.formTrainAddress.set('');
    this.formPersonCount.set(null);
    this.formPersonRemark.set('');
    this.formEvaluate.set([]);
    this.formFiles.set([]);
    this.formPendingFiles.set([]);
    this.formSyllabusCount.set(0);
  }

  async openAddModal(): Promise<void> {
    try {
      // Bản gốc: danh sách khóa học lọc theo Loại hình đang chọn ở bộ lọc
      const [courses, next] = await Promise.all([
        this.courseService.getList({ trainDiffCode: this.searchDiffCode(), trainTypeCode: this.searchTypeCode() }),
        this.service.nextPlanNo(),
      ]);
      this.resetForm();
      this.courseOptions.set(courses);
      this.formPlanNo.set(next.planNo);
      this.modalIsEdit.set(false);
      this.modalVisible.set(true);
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  async openEditModal(planNo?: string | null): Promise<void> {
    const no = planNo ?? this.selectedNo();
    if (!no) {
      this.message.warning(this.i18n.t('edu.systemManager.QINGXUANZEQIZHONGYIXIANG.a', 'Xin chọn 1 hạng mục!'));
      return;
    }
    try {
      const [d, files] = await Promise.all([this.service.getDetail(no), this.common.getFiles(EDU_FILE_TYPE_PLAN, no)]);
      if (!d) {
        this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
        return;
      }
      this.resetForm();
      this.formPlanNo.set(d.planNo ?? no);
      this.formCourseNo.set(d.courseNo ?? null);
      this.formCourseLabel.set(`${d.trainTypeCodeName ?? ''}  ${d.courseNumber ?? ''}  ${d.courseNameCode ?? ''}`);
      this.formStartDate.set(this.common.parseDate(d.planStartdate));
      this.formEndDate.set(this.common.parseDate(d.planEnddate));
      this.formClassHour.set(d.classHour ? Number(d.classHour) : null);
      this.formClassUnit.set(d.classUnit || '2');
      this.formTrainForm.set(d.trainFormCode ?? null);
      this.formIsApply.set(d.isnotApply === 'N' ? 'N' : 'Y');
      this.formDesDepts.set(this.common.splitCsv(d.desDepartment));
      const empids = this.common.splitCsv(d.desEmployee);
      const names = (d.desEmployeeName ?? '').split(',');
      this.formDesEmployees.set(empids.map((empid, i) => ({ empid, name: names[i] ?? empid })));
      this.formBudget.set(d.budget ?? '');
      this.formBudgetShow.set(d.budgetShow === 'Y');
      this.formDepartMana.set(d.departManaCode ?? null);
      this.formTeacherDisplay.set(d.teacherDisplay ?? '');
      this.formTeacherEmpid.set(d.teacherEmpid ?? '');
      this.formTrainAddress.set(d.trainAddress ?? '');
      this.formPersonCount.set(d.trainPersonCount ? Number(d.trainPersonCount) : null);
      this.formPersonRemark.set(d.trainPersonRemark ?? '');
      this.formEvaluate.set(this.common.splitCsv(d.isnotEvaluate).filter((v) => v !== '0'));
      this.formFiles.set(files);
      this.formSyllabusCount.set(d.syllabusCount ?? 0);
      this.modalIsEdit.set(true);
      this.modalVisible.set(true);
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  closeModal(): void {
    this.modalVisible.set(false);
  }

  /** Tích phòng ban cha -> tích luôn phòng ban con; bỏ tích cha -> bỏ luôn con (chkboxType "s" bản gốc). */
  onDesDeptsChange(value: string[] | null): void {
    this.formDesDepts.set(this.common.cascadeDeptSelection(this.formDesDepts(), value, this.deptChildren()));
  }

  toggleEvaluate(value: string, checked: boolean): void {
    const set = new Set(this.formEvaluate());
    if (checked) set.add(value);
    else set.delete(value);
    this.formEvaluate.set(this.evaluateOptions.map((o) => o.value).filter((v) => set.has(v)));
  }

  onEmployeesPicked(list: EduEmployee[]): void {
    const current = [...this.formDesEmployees()];
    const exists = new Set(current.map((p) => p.empid));
    list.forEach((e) => {
      if (!exists.has(e.empid)) current.push({ empid: e.empid, name: e.localName });
    });
    this.formDesEmployees.set(current);
  }

  removeEmployee(empid: string): void {
    this.formDesEmployees.set(this.formDesEmployees().filter((p) => p.empid !== empid));
  }

  onTeacherTextChange(value: string): void {
    // Nhập tay tên giảng viên -> bỏ liên kết mã NV đã chọn trước đó
    this.formTeacherDisplay.set(value);
    this.formTeacherEmpid.set('');
  }

  async reloadFiles(): Promise<void> {
    const no = this.formPlanNo();
    if (no && this.modalIsEdit()) {
      this.formFiles.set(await this.common.getFiles(EDU_FILE_TYPE_PLAN, no));
    }
  }

  async save(): Promise<void> {
    const isEdit = this.modalIsEdit();
    if (!isEdit && !this.formCourseNo()) {
      this.message.warning(this.i18n.t('edu.planManager.msg.selectCourse', 'Vui lòng chọn Khóa học!'));
      return;
    }
    if (!this.formStartDate() || !this.formEndDate()) {
      this.message.warning(this.i18n.t('edu.planManager.msg.dateRequired', 'Vui lòng nhập Ngày bắt đầu / Ngày kết thúc!'));
      return;
    }
    if (this.formEndDate()! < this.formStartDate()!) {
      this.message.warning(this.i18n.t('edu.planManager.msg.dateInvalid', 'Ngày kết thúc không được sớm hơn ngày bắt đầu!'));
      return;
    }
    if (this.formClassHour() == null || this.formPersonCount() == null) {
      this.message.warning(this.i18n.t('edu.planManager.msg.requiredFields', 'Vui lòng nhập Thời lượng và Số lượng!'));
      return;
    }
    const payload: EduPlanManagerRow = {
      planNo: this.formPlanNo() ?? undefined,
      courseNo: this.formCourseNo() ?? undefined,
      planStartdate: this.common.formatDate(this.formStartDate()),
      planEnddate: this.common.formatDate(this.formEndDate()),
      classHour: String(this.formClassHour()),
      classUnit: this.formClassUnit(),
      trainFormCode: this.formTrainForm() ?? undefined,
      isnotApply: this.formIsApply(),
      desDepartment: this.formDesDepts().join(',') || undefined,
      desEmployee: this.formDesEmployees().map((p) => p.empid).join(',') || undefined,
      desEmployeeName: this.formDesEmployees().map((p) => p.name).join(',') || undefined,
      budget: this.formBudget().trim() || undefined,
      budgetShow: this.formBudgetShow() ? 'Y' : 'N',
      departManaCode: this.formDepartMana() ?? undefined,
      teacherDisplay: this.formTeacherDisplay().trim() || undefined,
      teacherEmpid: this.formTeacherEmpid() || undefined,
      trainAddress: this.formTrainAddress().trim() || undefined,
      trainPersonCount: String(this.formPersonCount()),
      trainPersonRemark: this.formPersonRemark().trim() || undefined,
      isnotEvaluate: this.formEvaluate().join(',') || '0',
    };
    this.saving.set(true);
    try {
      const res = isEdit ? await this.service.update(payload) : await this.service.add(payload);
      if (!res.success) {
        this.message.error(this.i18n.t('common.saveFailed', 'Lưu thất bại.'));
        return;
      }
      const pending = this.formPendingFiles();
      if (pending.length && payload.planNo) {
        const up = await this.common.uploadFiles(EDU_FILE_TYPE_PLAN, payload.planNo, pending);
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

  // ===== Xóa =====
  deleteSelected(): void {
    const no = this.selectedNo();
    if (!no) {
      this.message.warning(this.i18n.t('edu.systemManager.QINGXUANZEQIZHONGYIXIANG.a', 'Xin chọn 1 hạng mục!'));
      return;
    }
    this.modal.confirm({
      nzTitle: this.i18n.t('edu.systemManager.QUEDINGSHIFOUSHANCHU.a', 'Đồng ý xóa không?'),
      nzContent: this.i18n.t('edu.planManager.msg.deleteNote', 'Toàn bộ lịch học và dữ liệu đào tạo phát sinh từ kế hoạch này cũng sẽ bị xóa.'),
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

  // ===== Chọn giảng viên (teacherSearch bản gốc) =====
  async openTeacherPicker(): Promise<void> {
    this.teacherKeyword.set(this.formTeacherEmpid() ? '' : this.formTeacherDisplay());
    this.teacherChecked.set(new Set(this.common.splitCsv(this.formTeacherEmpid())));
    this.teacherPickerVisible.set(true);
    await this.searchTeachers();
  }

  async searchTeachers(): Promise<void> {
    this.teacherLoading.set(true);
    try {
      this.teacherRows.set(await this.service.searchTeachers(this.teacherKeyword().trim()));
    } catch {
      this.teacherRows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.teacherLoading.set(false);
    }
  }

  toggleTeacher(empid: string | undefined, checked: boolean): void {
    if (!empid) return;
    const set = new Set(this.teacherChecked());
    if (checked) set.add(empid);
    else set.delete(empid);
    this.teacherChecked.set(set);
  }

  confirmTeachers(): void {
    const picked = this.teacherRows().filter((t) => t.empid && this.teacherChecked().has(t.empid));
    this.formTeacherDisplay.set(picked.map((t) => t.teacherName ?? '').join(','));
    this.formTeacherEmpid.set(picked.map((t) => t.empid).join(','));
    this.teacherPickerVisible.set(false);
  }

  // ===== Xem chi tiết (singlePlanManagerInfo bản gốc) =====
  async openDetail(planNo?: string): Promise<void> {
    if (!planNo) return;
    try {
      const [d, files] = await Promise.all([this.service.getDetail(planNo), this.common.getFiles(EDU_FILE_TYPE_PLAN, planNo)]);
      this.detail.set(d);
      this.detailFiles.set(files);
      this.detailVisible.set(true);
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  // ===== Lịch học =====
  async openSyllabus(planNo: string | null | undefined, editable: boolean): Promise<void> {
    if (!planNo) return;
    this.syllabusPlanNo.set(planNo);
    this.syllabusEditable.set(editable);
    this.syllabusVisible.set(true);
    await this.loadSyllabus();
  }

  private async loadSyllabus(): Promise<void> {
    const planNo = this.syllabusPlanNo();
    if (!planNo) return;
    this.syllabusLoading.set(true);
    try {
      const rows = await this.service.getSyllabus(planNo);
      this.syllabusRows.set(rows);
      if (planNo === this.formPlanNo()) this.formSyllabusCount.set(rows.length);
    } catch {
      this.syllabusRows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.syllabusLoading.set(false);
    }
  }

  deleteSyllabusRow(row: EduTrainSyllabusRow): void {
    this.modal.confirm({
      nzTitle: this.i18n.t('edu.systemManager.QUEDINGSHIFOUSHANCHU.a', 'Đồng ý xóa không?'),
      nzOkDanger: true,
      nzMaskClosable: true,
      nzOnOk: async () => {
        try {
          const res = await this.service.deleteSyllabus(row.syllNo);
          if (res.success) {
            await this.loadSyllabus();
          } else {
            this.message.error(this.i18n.t('common.deleteFailed', 'Xóa thất bại.'));
          }
        } catch {
          this.message.error(this.i18n.t('common.deleteFailed', 'Xóa thất bại.'));
        }
      },
    });
  }

  async onSyllabusFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    const planNo = this.formPlanNo();
    if (!file || !planNo) return;
    this.importingSyllabus.set(true);
    try {
      const res = await this.service.importSyllabus(planNo, file);
      if (res.success) {
        this.message.success(this.i18n.t('edu.common.importSuccess', 'Import thành công!'));
        const rows = await this.service.getSyllabus(planNo);
        this.formSyllabusCount.set(rows.length);
      } else if (res.errors?.length) {
        this.showImportErrors(res.errors);
      } else {
        this.message.error(this.i18n.t('edu.common.importFailed', 'Import thất bại.'));
      }
    } catch {
      this.message.error(this.i18n.t('edu.common.importFailed', 'Import thất bại.'));
    } finally {
      this.importingSyllabus.set(false);
    }
  }

  private showImportErrors(errors: string[]): void {
    this.modal.error({
      nzTitle: this.i18n.t('edu.common.importFailed', 'Import thất bại.'),
      nzContent: errors.slice(0, 30).join('<br/>') + (errors.length > 30 ? '<br/>...' : ''),
      nzMaskClosable: true,
    });
  }

  downloadTemplate(): void {
    window.location.href = this.templateUrl;
  }
}
