import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';

import { I18nService } from '../../../i18n/i18n.service';
import { EmployeeOption, EvsAffirmorRow, EvsAffirmorSetupService, EvsResumeOption } from './evs-affirmor-setup.service';

import { TABLE_PAGE_SIZE_OPTIONS } from '../../../core/config/table-pagination.config';
type PickerTarget =
  | { kind: 'row'; seq: string; level: 1 | 2 }
  | { kind: 'bulk' }
  | { kind: 'addObject'; field: 'object' | 'affirm1' | 'affirm2' };

interface PendingChange {
  a1?: EmployeeOption;
  a2?: EmployeeOption;
}

const TEMPLATE_DOWNLOAD_URL = '/sy/excel/api/downloadTemplate?templateName=EvsObject_add_Template';

/**
 * Thiết lập người đánh giá (viewEvsAffirmorSetup) - port lại từ
 * evs/manage/viewEvsAffirmorSetup.html (đã xoá). Xem ghi chú về modal tìm
 * nhân viên dùng chung trong evs-affirmor-setup.service.ts.
 */
@Component({
  selector: 'app-evs-affirmor-setup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCheckboxModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzSelectModule,
    NzTableModule,
    NzTreeSelectModule,
  ],
  templateUrl: './evs-affirmor-setup.component.html',
  styleUrl: './evs-affirmor-setup.component.scss',
})
export class EvsAffirmorSetupComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;

  private readonly service = inject(EvsAffirmorSetupService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  private readonly route = inject(ActivatedRoute);
  protected readonly i18n = inject(I18nService);

  private evsType = '';

  protected readonly resumeOptions = signal<EvsResumeOption[]>([]);
  protected readonly searchResumeSeq = signal<string | null>(null);
  protected readonly deptTreeNodes = signal<NzTreeNodeOptions[]>([]);
  protected readonly searchDeptNos = signal<string[]>([]);
  protected readonly searchAffirmorKeyword = signal('');

  protected readonly rows = signal<EvsAffirmorRow[]>([]);
  protected readonly listLoading = signal(false);
  protected readonly tickedSeqs = signal<Set<string>>(new Set());
  protected readonly pendingChanges = new Map<string, PendingChange>();

  protected readonly bulkStage = signal<'1' | '2' | null>(null);
  protected readonly bulkEmployee = signal<EmployeeOption | null>(null);

  protected readonly creatingTarget = signal(false);
  protected readonly startingEvs = signal(false);

  // ── Modal tìm nhân viên dùng chung ──
  protected readonly pickerVisible = signal(false);
  protected readonly pickerKeyword = signal('');
  protected readonly pickerSearching = signal(false);
  protected readonly pickerResults = signal<EmployeeOption[]>([]);
  private pickerTarget: PickerTarget | null = null;

  // ── Modal thêm mới đối tượng đánh giá ──
  protected readonly addModalVisible = signal(false);
  protected readonly addSaving = signal(false);
  protected readonly formObjectEmp = signal<EmployeeOption | null>(null);
  protected readonly formAffirm1Emp = signal<EmployeeOption | null>(null);
  protected readonly formAffirm2Emp = signal<EmployeeOption | null>(null);

  // ── Modal chèn file (Import Excel) ──
  protected readonly importModalVisible = signal(false);
  protected readonly importFile = signal<File | null>(null);
  protected readonly importing = signal(false);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    this.evsType = this.route.snapshot.queryParamMap.get('evsType') || '';
    try {
      const [deptList, resumeList] = await Promise.all([
        this.service.getAuthorizedDepartments(),
        this.service.getResumeOptions(this.evsType),
      ]);
      this.deptTreeNodes.set(this.service.buildDeptTree(deptList) as NzTreeNodeOptions[]);
      this.resumeOptions.set(resumeList);
      if (resumeList.length) {
        this.searchResumeSeq.set(resumeList[0].seq ?? null);
        await this.search();
      }
    } catch {
      // im lặng bỏ qua - danh sách tùy chọn trống không chặn chức năng chính
    }
  }

  async search(): Promise<void> {
    const resumeSeq = this.searchResumeSeq();
    if (!resumeSeq) return;
    this.listLoading.set(true);
    try {
      this.rows.set(await this.service.getList(resumeSeq, this.searchDeptNos().join(','), this.searchAffirmorKeyword().trim(), this.evsType));
      this.pendingChanges.clear();
      this.tickedSeqs.set(new Set());
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.listLoading.set(false);
    }
  }

  clearSearch(): void {
    this.searchDeptNos.set([]);
    this.searchAffirmorKeyword.set('');
    this.search();
  }

  onResumeChange(value: string | null): void {
    this.searchResumeSeq.set(value);
    this.search();
  }

  toggleRow(seq: string, checked: boolean): void {
    const set = new Set(this.tickedSeqs());
    if (checked) set.add(seq);
    else set.delete(seq);
    this.tickedSeqs.set(set);
  }

  isTicked(seq?: string): boolean {
    return !!seq && this.tickedSeqs().has(seq);
  }

  toggleAll(checked: boolean): void {
    this.tickedSeqs.set(checked ? new Set(this.rows().map((r) => r.seq!).filter(Boolean)) : new Set());
  }

  displayName(row: EvsAffirmorRow, level: 1 | 2): string {
    const chg = this.pendingChanges.get(row.seq!);
    const a = level === 1 ? chg?.a1 : chg?.a2;
    if (a) return a.localName || '';
    return (level === 1 ? row.localName1 : row.localName2) || '';
  }

  displayGrade(row: EvsAffirmorRow, level: 1 | 2): string {
    const chg = this.pendingChanges.get(row.seq!);
    const a = level === 1 ? chg?.a1 : chg?.a2;
    if (a) return a.postGradeName || '';
    return (level === 1 ? row.postGradeName1 : row.postGradeName2) || '';
  }

  // ── Modal tìm nhân viên dùng chung ──
  openPicker(target: PickerTarget): void {
    this.pickerTarget = target;
    this.pickerKeyword.set('');
    this.pickerResults.set([]);
    this.pickerVisible.set(true);
  }

  async searchPicker(): Promise<void> {
    const kw = this.pickerKeyword().trim();
    if (!kw) {
      this.pickerResults.set([]);
      return;
    }
    this.pickerSearching.set(true);
    try {
      this.pickerResults.set(await this.service.searchEmployee(kw, this.searchResumeSeq() ?? ''));
    } catch {
      this.pickerResults.set([]);
    } finally {
      this.pickerSearching.set(false);
    }
  }

  selectPickerEmployee(emp: EmployeeOption): void {
    const target = this.pickerTarget;
    if (!target) return;
    if (target.kind === 'row') {
      const chg = this.pendingChanges.get(target.seq) || {};
      if (target.level === 1) chg.a1 = emp;
      else chg.a2 = emp;
      this.pendingChanges.set(target.seq, chg);
      const set = new Set(this.tickedSeqs());
      set.add(target.seq);
      this.tickedSeqs.set(set);
      this.rows.set([...this.rows()]);
    } else if (target.kind === 'bulk') {
      this.bulkEmployee.set(emp);
    } else if (target.kind === 'addObject') {
      if (target.field === 'object') this.formObjectEmp.set(emp);
      else if (target.field === 'affirm1') this.formAffirm1Emp.set(emp);
      else this.formAffirm2Emp.set(emp);
    }
    this.pickerVisible.set(false);
  }

  // ── Áp dụng hàng loạt ──
  bulkClear(): void {
    this.bulkStage.set(null);
    this.bulkEmployee.set(null);
  }

  bulkApply(): void {
    const stage = this.bulkStage();
    const emp = this.bulkEmployee();
    if (!stage) {
      this.message.warning(this.i18n.t('evs.viewEvsAffirmorSetup.msg.selectStage', 'Vui lòng chọn Giai đoạn (1 hoặc 2).'));
      return;
    }
    if (!emp) {
      this.message.warning(this.i18n.t('evs.viewEvsAffirmorSetup.msg.selectAffirmor', 'Vui lòng chọn Người đánh giá.'));
      return;
    }
    if (!this.tickedSeqs().size) {
      this.message.warning(this.i18n.t('evs.viewEvsAffirmorSetup.msg.noTickedRows', 'Chưa có dòng nào được tick. Vui lòng tick các dòng cần áp dụng.'));
      return;
    }
    this.rows().forEach((row) => {
      if (!row.seq || !this.tickedSeqs().has(row.seq)) return;
      const chg = this.pendingChanges.get(row.seq) || {};
      if (stage === '1') chg.a1 = emp;
      else chg.a2 = emp;
      this.pendingChanges.set(row.seq, chg);
    });
    this.rows.set([...this.rows()]);
  }

  // ── Lưu tất cả ──
  async saveAll(): Promise<void> {
    if (!this.tickedSeqs().size) {
      this.message.warning(this.i18n.t('evs.viewEvsAffirmorSetup.msg.noTickedSave', 'Chưa có dòng nào được chọn để lưu. Hãy chọn người đánh giá hoặc tick vào dòng cần lưu.'));
      return;
    }
    const payload = this.rows()
      .filter((row) => row.seq && this.tickedSeqs().has(row.seq))
      .map((row) => {
        const chg = this.pendingChanges.get(row.seq!) || {};
        return {
          seq: row.seq!,
          personId1: chg.a1?.personId ?? row.personId1 ?? null,
          personId2: chg.a2?.personId ?? row.personId2 ?? null,
        };
      });
    try {
      const res = await this.service.saveAll(payload);
      if (res.success !== false) {
        this.message.success(this.i18n.t('evs.viewEvsAffirmorSetup.msg.saveSuccess', 'Lưu thành công!'));
        this.pendingChanges.clear();
        this.tickedSeqs.set(new Set());
        await this.search();
      } else {
        this.message.error(res.message || this.i18n.t('evs.viewEvsAffirmorSetup.msg.saveFail', 'Lỗi khi lưu dữ liệu. Vui lòng thử lại.'));
      }
    } catch {
      this.message.error(this.i18n.t('evs.viewEvsAffirmorSetup.msg.saveFail', 'Lỗi khi lưu dữ liệu. Vui lòng thử lại.'));
    }
  }

  // ── Xóa các dòng đã tick ──
  deleteSelected(): void {
    if (!this.tickedSeqs().size) {
      this.message.warning(this.i18n.t('evs.viewEvsAffirmorSetup.msg.noTickedRows', 'Chưa có dòng nào được tick. Vui lòng tick các dòng cần áp dụng.'));
      return;
    }
    this.modal.confirm({
      nzTitle: this.i18n.t('evs.viewEvsAffirmorSetup.msg.confirmDelete', 'Bạn có chắc muốn xóa các dòng đã chọn không?'),
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          const res = await this.service.deleteObjects(Array.from(this.tickedSeqs()));
          if (res.success !== false) {
            this.message.success(this.i18n.t('evs.viewEvsAffirmorSetup.msg.deleteSuccess', 'Xóa thành công!'));
            this.pendingChanges.clear();
            this.tickedSeqs.set(new Set());
            await this.search();
          } else {
            this.message.error(res.message || this.i18n.t('evs.viewEvsAffirmorSetup.msg.deleteError', 'Không thể xóa dữ liệu.'));
          }
        } catch {
          this.message.error(this.i18n.t('evs.viewEvsAffirmorSetup.msg.deleteFail', 'Lỗi khi xóa dữ liệu. Vui lòng thử lại.'));
        }
      },
    });
  }

  // ── Tạo mục tiêu ──
  createTarget(): void {
    const resumeSeq = this.searchResumeSeq();
    if (!resumeSeq) {
      this.message.warning(this.i18n.t('evs.viewEvsAffirmorSetup.msg.selectEvalFirst', 'Vui lòng chọn tên đánh giá trước.'));
      return;
    }
    this.modal.confirm({
      nzTitle: this.i18n.t('evs.viewEvsAffirmorSetup.msg.confirmCreateTarget', 'Bạn có chắc muốn tạo mục tiêu cho đợt đánh giá này không?'),
      nzOnOk: async () => {
        this.creatingTarget.set(true);
        try {
          const res = await this.service.createTarget(resumeSeq);
          if (res.success) {
            this.message.success(this.i18n.t('evs.viewEvsAffirmorSetup.msg.createTargetSuccess', 'Tạo mục tiêu thành công!'));
            await this.search();
          } else {
            this.message.error(res.message || this.i18n.t('evs.viewEvsAffirmorSetup.msg.createTargetError', 'Không thể tạo mục tiêu.'));
          }
        } catch {
          this.message.error(this.i18n.t('evs.viewEvsAffirmorSetup.msg.createTargetFail', 'Lỗi khi gọi tạo mục tiêu. Vui lòng thử lại.'));
        } finally {
          this.creatingTarget.set(false);
        }
      },
    });
  }

  // ── Bắt đầu đánh giá ──
  evsStart(): void {
    const resumeSeq = this.searchResumeSeq();
    if (!resumeSeq) {
      this.message.warning(this.i18n.t('evs.viewEvsAffirmorSetup.msg.selectEvalFirst', 'Vui lòng chọn tên đánh giá trước.'));
      return;
    }
    this.modal.confirm({
      nzTitle: this.i18n.t('evs.viewEvsAffirmorSetup.msg.confirmEvsStart', 'Bạn có chắc muốn bắt đầu đánh giá cho đợt này không?'),
      nzOnOk: async () => {
        this.startingEvs.set(true);
        try {
          const res = await this.service.evsStart(resumeSeq);
          if (res.success) {
            this.message.success(this.i18n.t('evs.viewEvsAffirmorSetup.msg.evsStartSuccess', 'Bắt đầu đánh giá thành công!'));
            await this.search();
          } else {
            this.message.error(res.message || this.i18n.t('evs.viewEvsAffirmorSetup.msg.evsStartError', 'Không thể bắt đầu đánh giá.'));
          }
        } catch {
          this.message.error(this.i18n.t('evs.viewEvsAffirmorSetup.msg.evsStartFail', 'Lỗi khi gọi bắt đầu đánh giá. Vui lòng thử lại.'));
        } finally {
          this.startingEvs.set(false);
        }
      },
    });
  }

  // ── Tải file mẫu / Import Excel ──
  downloadTemplate(): void {
    window.location.href = TEMPLATE_DOWNLOAD_URL;
  }

  openImportModal(): void {
    if (!this.searchResumeSeq()) {
      this.message.warning(this.i18n.t('evs.viewEvsAffirmorSetup.msg.selectEvalFirst', 'Vui lòng chọn tên đánh giá trước.'));
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
    const resumeSeq = this.searchResumeSeq();
    if (!file || !resumeSeq) return;
    this.importing.set(true);
    try {
      const res = await this.service.importExcel(file, resumeSeq);
      this.importModalVisible.set(false);
      if (res.success) {
        this.message.success(this.i18n.t('common.importSuccess', 'Import thành công!'));
      } else {
        this.message.warning(res.message || this.i18n.t('common.importPartialError', 'Import hoàn tất nhưng có lỗi.'));
      }
      await this.search();
    } catch {
      this.importModalVisible.set(false);
      this.message.error(this.i18n.t('common.error', 'Lỗi'));
    } finally {
      this.importing.set(false);
    }
  }

  // ── Modal thêm mới đối tượng đánh giá ──
  openAddModal(): void {
    this.formObjectEmp.set(null);
    this.formAffirm1Emp.set(null);
    this.formAffirm2Emp.set(null);
    this.addModalVisible.set(true);
  }

  async saveNewObject(): Promise<void> {
    const resumeSeq = this.searchResumeSeq();
    const objectEmp = this.formObjectEmp();
    if (!resumeSeq) {
      this.message.warning(this.i18n.t('evs.viewEvsAffirmorSetup.msg.selectEvalFirst', 'Vui lòng chọn tên đánh giá trước.'));
      return;
    }
    if (!objectEmp?.personId) {
      this.message.warning(this.i18n.t('evs.viewEvsAffirmorSetup.msg.selectEvalObject', 'Vui lòng chọn đối tượng đánh giá.'));
      return;
    }
    this.addSaving.set(true);
    try {
      const res = await this.service.addObject({
        resumeSeq,
        personId: objectEmp.personId,
        personId1: this.formAffirm1Emp()?.personId ?? null,
        personId2: this.formAffirm2Emp()?.personId ?? null,
      });
      if (res.success) {
        this.addModalVisible.set(false);
        this.message.success(this.i18n.t('evs.viewEvsAffirmorSetup.msg.addSuccess', 'Thêm mới thành công!'));
        await this.search();
      } else {
        this.message.error(res.message || this.i18n.t('evs.viewEvsAffirmorSetup.msg.addError', 'Không thể thêm mới.'));
      }
    } catch {
      this.message.error(this.i18n.t('evs.viewEvsAffirmorSetup.msg.addFail', 'Lỗi khi thêm mới. Vui lòng thử lại.'));
    } finally {
      this.addSaving.set(false);
    }
  }
}
