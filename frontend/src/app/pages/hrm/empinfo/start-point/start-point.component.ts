import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';

import { I18nService } from '../../../../i18n/i18n.service';
import {
  AuthorizedDeptNode,
  DecisionRow,
  DecisionSavePayload,
  StartPointService,
  SyCodeOption,
} from './start-point.service';

const TRANS_CODE_PARENT = '14013956';
const EMP_TYPE_PARENT = '13864';
const POST_FAMILY_PARENT = '14015812';
const DEFAULT_POST_GRADE_PARENT = '400001';
const POSITION_NO_PARENT = '14014036';
const POSITION_PARENT = '14014049';
const MAIN_BUSINESS_PARENT = '400098';

function toDateOrNull(value: string): Date | null {
  if (!value) return null;
  const [d, m, y] = value.includes('/') ? value.split('/') : [];
  if (d && m && y) return new Date(Number(y), Number(m) - 1, Number(d));
  const dd = new Date(value);
  return isNaN(dd.getTime()) ? null : dd;
}

function toDdMmYyyy(value: Date | null): string {
  if (!value) return '';
  const d = String(value.getDate()).padStart(2, '0');
  const m = String(value.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}/${value.getFullYear()}`;
}

/**
 * Quyết định nhân sự (viewStartPoint) - port lại từ
 * hrm/empinfo/viewStartPoint.html (đã xoá).
 *
 * Bug dữ liệu nghiêm trọng đã sửa (có thật ở bản gốc, không phải do
 * migrate): form chi tiết JS tham chiếu tới các phần tử
 * #vsp_employeeBelong/#vsp_empOffice/#vsp_endProbationDate/#vsp_jobType/
 * #vsp_dutyNo/#vsp_workHourType/#vsp_wageType/#vsp_payStepNo nhưng các
 * phần tử này KHÔNG tồn tại trong HTML (đã bị xoá khỏi giao diện ở một
 * lần sửa trước nhưng JS không được dọn theo) - `.val()` trên tập rỗng
 * jQuery trả về `undefined`, nghĩa là MỌI lần Sửa+Lưu quyết định đều gửi
 * `undefined` cho 8 trường này. Mapper `updateDecision` là UPDATE không
 * điều kiện (không có `<if test="!= null">`) nên 8 cột này bị XÓA TRẮNG
 * (SET NULL) sau mỗi lần sửa, kể cả khi trước đó có dữ liệu thật (từ import
 * hàng loạt hoặc quy trình khác). Bản Angular đọc và giữ nguyên 8 giá trị
 * này ở state ẩn (không thêm UI mới ngoài phạm vi bản gốc), gửi lại nguyên
 * vẹn khi lưu để không còn làm mất dữ liệu.
 */
@Component({
  selector: 'app-start-point',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzDatePickerModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzSelectModule,
    NzTreeSelectModule,
  ],
  templateUrl: './start-point.component.html',
  styleUrl: './start-point.component.scss',
})
export class StartPointComponent implements OnInit {
  private readonly service = inject(StartPointService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly searchKeyword = signal('');
  protected readonly currentPersonId = signal<string | null>(null);
  protected readonly currentEmpId = signal<string | null>(null);
  protected readonly currentLocalName = signal<string | null>(null);
  protected readonly currentDeptName = signal<string | null>(null);

  protected readonly listLoading = signal(false);
  protected readonly rows = signal<DecisionRow[]>([]);
  protected readonly total = signal(0);
  protected readonly pageIndex = signal(1);
  protected readonly pageSize = 20;
  protected readonly selectedSeqs = signal<Set<number>>(new Set());
  protected readonly selectedSeq = signal<number | null>(null);
  private latestSeq: number | null = null;

  protected readonly deptTreeNodes = signal<NzTreeNodeOptions[]>([]);
  protected readonly transCodeOptions = signal<SyCodeOption[]>([]);
  protected readonly transResourceOptions = signal<SyCodeOption[]>([]);
  protected readonly empTypeOptions = signal<SyCodeOption[]>([]);
  protected readonly postFamilyOptions = signal<SyCodeOption[]>([]);
  protected readonly postGradeOptions = signal<SyCodeOption[]>([]);
  protected readonly positionNoOptions = signal<SyCodeOption[]>([]);
  protected readonly positionOptions = signal<SyCodeOption[]>([]);
  protected readonly mainBusinessOptions = signal<SyCodeOption[]>([]);

  protected readonly saving = signal(false);
  protected readonly detailTitle = signal<string | null>(null);
  protected readonly formSeq = signal<number | null>(null);
  protected readonly formPersonId = signal('');
  protected readonly formStartDate = signal<Date | null>(null);
  protected readonly formTransCode = signal<string | null>(null);
  protected readonly formTransResource = signal<string | null>(null);
  protected readonly formDeptno = signal<string | null>(null);
  protected readonly formEmpTypeCode = signal<string | null>(null);
  protected readonly formPostFamily = signal<string | null>(null);
  protected readonly formPostGradeNo = signal<string | null>(null);
  protected readonly formPositionNo = signal<string | null>(null);
  protected readonly formCostCenter = signal<string | null>(null);
  protected readonly formPosition = signal<string | null>(null);
  protected readonly formMainBusiness = signal<string | null>(null);
  protected readonly formRemark = signal('');

  // Các trường không còn hiển thị trên UI của bản gốc nhưng vẫn tồn tại ở
  // backend - giữ nguyên giá trị khi Sửa để không bị xóa mất (xem ghi chú ở đầu file).
  private hiddenEmployeeBelong: string | undefined;
  private hiddenEmpOffice: string | undefined;
  private hiddenEndProbationDate: string | undefined;
  private hiddenJobType: string | undefined;
  private hiddenDutyNo: string | undefined;
  private hiddenWorkHourType: string | undefined;
  private hiddenWageType: string | undefined;
  private hiddenPayStepNo: string | undefined;

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      const [deptList, transCodeList, empTypeList, postFamilyList, positionNoList, positionList, mainBusinessList, postGradeList] =
        await Promise.all([
          this.service.getAuthorizedDepartments(),
          this.service.getCodeList(TRANS_CODE_PARENT),
          this.service.getCodeList(EMP_TYPE_PARENT),
          this.service.getCodeList(POST_FAMILY_PARENT),
          this.service.getCodeList(POSITION_NO_PARENT),
          this.service.getCodeList(POSITION_PARENT),
          this.service.getCodeList(MAIN_BUSINESS_PARENT),
          this.service.getCodeList(DEFAULT_POST_GRADE_PARENT),
        ]);
      this.deptTreeNodes.set(this.buildDeptTree(deptList));
      this.transCodeOptions.set(transCodeList);
      this.empTypeOptions.set(empTypeList);
      this.postFamilyOptions.set(postFamilyList);
      this.positionNoOptions.set(positionNoList);
      this.positionOptions.set(positionList);
      this.mainBusinessOptions.set(mainBusinessList);
      this.postGradeOptions.set(postGradeList);
    } catch {
      // im lặng bỏ qua - danh sách bộ lọc trống không chặn tính năng chính
    }
  }

  private buildDeptTree(flatList: AuthorizedDeptNode[]): NzTreeNodeOptions[] {
    const nodeMap = new Map<string, NzTreeNodeOptions>();
    const childKeys = new Map<string, string[]>();
    flatList.forEach((item) => nodeMap.set(item.id, { key: item.id, title: item.text, isLeaf: true }));
    const roots: NzTreeNodeOptions[] = [];
    flatList.forEach((item) => {
      if (item.parent && item.parent !== '0' && nodeMap.has(item.parent)) {
        const siblings = childKeys.get(item.parent) ?? [];
        siblings.push(item.id);
        childKeys.set(item.parent, siblings);
      } else {
        const node = nodeMap.get(item.id);
        if (node) roots.push(node);
      }
    });
    nodeMap.forEach((node, id) => {
      const children = childKeys.get(id);
      if (children && children.length) {
        node.isLeaf = false;
        node.children = children.map((cid) => nodeMap.get(cid)!).filter(Boolean);
      }
    });
    return roots;
  }

  async searchEmployee(): Promise<void> {
    const keyword = this.searchKeyword().trim();
    if (!keyword) return;
    try {
      const emp = await this.service.searchEmployee(keyword);
      this.currentPersonId.set(emp.personId ?? null);
      this.currentEmpId.set(emp.empId ?? null);
      this.currentLocalName.set(emp.localName ?? null);
      this.currentDeptName.set(emp.deptName ?? null);
      this.pageIndex.set(1);
      this.selectedSeqs.set(new Set());
      await this.loadDecisionList();
    } catch (err: any) {
      if (err?.status === 404) {
        this.message.error(this.i18n.t('vsp.js.notFound', 'Không tìm thấy nhân viên'));
      } else {
        this.message.error(this.i18n.t('common.error', 'Lỗi'));
      }
    }
  }

  private async loadDecisionList(): Promise<void> {
    const personId = this.currentPersonId();
    if (!personId) return;
    this.listLoading.set(true);
    try {
      const start = (this.pageIndex() - 1) * this.pageSize;
      const res = await this.service.getDecisionList(personId, this.pageIndex(), start, this.pageSize);
      this.total.set(res.recordsTotal || 0);
      const data = res.data || [];
      this.latestSeq = data.length > 0 ? (data[0].seq ?? null) : null;
      this.rows.set(data);
    } catch {
      this.rows.set([]);
      this.total.set(0);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.listLoading.set(false);
    }
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total() / this.pageSize));
  }

  async pageChange(dir: number): Promise<void> {
    const next = Math.min(this.totalPages, Math.max(1, this.pageIndex() + dir));
    if (next === this.pageIndex()) return;
    this.pageIndex.set(next);
    await this.loadDecisionList();
  }

  toggleRowSelected(seq: number, checked: boolean): void {
    const set = new Set(this.selectedSeqs());
    if (checked) set.add(seq);
    else set.delete(seq);
    this.selectedSeqs.set(set);
  }

  isRowSelected(seq?: number): boolean {
    return seq != null && this.selectedSeqs().has(seq);
  }

  private clearFormFields(): void {
    this.formDeptno.set(null);
    this.formEmpTypeCode.set(null);
    this.formPostFamily.set(null);
    this.formPostGradeNo.set(null);
    this.formPositionNo.set(null);
    this.formCostCenter.set(null);
    this.formPosition.set(null);
    this.formMainBusiness.set(null);
    this.formTransResource.set(null);
    this.formRemark.set('');
    this.hiddenEmployeeBelong = undefined;
    this.hiddenEmpOffice = undefined;
    this.hiddenEndProbationDate = undefined;
    this.hiddenJobType = undefined;
    this.hiddenDutyNo = undefined;
    this.hiddenWorkHourType = undefined;
    this.hiddenWageType = undefined;
    this.hiddenPayStepNo = undefined;
  }

  private applyDecisionToForm(d: DecisionRow): void {
    this.formSeq.set(d.seq ?? null);
    this.formPersonId.set(d.personId ?? this.currentPersonId() ?? '');
    this.formStartDate.set(toDateOrNull(d.startDate ?? ''));
    this.formTransCode.set(d.transCode ?? null);
    this.formTransResource.set(d.transResource ?? null);
    this.formDeptno.set(d.deptno ?? null);
    this.formEmpTypeCode.set(d.empTypeCode ?? null);
    this.formPostFamily.set(d.postFamily ?? null);
    this.formPostGradeNo.set(d.postGradeNo ?? null);
    this.formPositionNo.set(d.positionNo ?? null);
    this.formCostCenter.set(d.costCenter ?? null);
    this.formPosition.set(d.position ?? null);
    this.formMainBusiness.set(d.mainBusiness ?? null);
    this.formRemark.set(d.remark ?? '');
    this.hiddenEmployeeBelong = d.employeeBelong;
    this.hiddenEmpOffice = d.empOffice;
    this.hiddenEndProbationDate = d.endProbationDate;
    this.hiddenJobType = d.jobType;
    this.hiddenDutyNo = d.dutyNo;
    this.hiddenWorkHourType = d.workHourType;
    this.hiddenWageType = d.wageType;
    this.hiddenPayStepNo = d.payStepNo;
    if (d.postFamily) this.onPostFamilyChange(d.postFamily, true);
    if (d.transCode) this.onTransCodeChange(d.transCode, true);
  }

  async selectDecision(seq: number): Promise<void> {
    this.selectedSeq.set(seq);
    try {
      const d = await this.service.getDecisionDetail(seq);
      this.applyDecisionToForm(d);
      this.detailTitle.set(d.transCodeName || d.transCode || '');
    } catch {
      this.message.error(this.i18n.t('common.error', 'Lỗi'));
    }
  }

  async newDecision(): Promise<void> {
    const personId = this.currentPersonId();
    if (!personId) {
      this.message.warning(this.i18n.t('vsp.js.selectFirst', 'Vui lòng tìm kiếm nhân viên trước'));
      return;
    }
    this.selectedSeq.set(null);
    this.formSeq.set(null);
    this.formPersonId.set(personId);
    this.detailTitle.set(this.i18n.t('vsp.label.newDecision', 'Quyết định mới'));

    if (this.latestSeq) {
      try {
        const d = await this.service.getDecisionDetail(this.latestSeq);
        this.clearFormFields();
        this.formDeptno.set(d.deptno ?? null);
        this.formCostCenter.set(d.costCenter ?? null);
        this.formRemark.set(d.remark ?? '');
        this.hiddenEmployeeBelong = d.employeeBelong;
        this.hiddenEmpOffice = d.empOffice;
        this.hiddenEndProbationDate = d.endProbationDate;
        this.hiddenJobType = d.jobType;
        this.hiddenDutyNo = d.dutyNo;
        this.hiddenWorkHourType = d.workHourType;
        this.hiddenWageType = d.wageType;
        this.hiddenPayStepNo = d.payStepNo;
        if (d.postFamily) {
          this.formPostFamily.set(d.postFamily);
          this.onPostFamilyChange(d.postFamily, true);
          this.formPostGradeNo.set(d.postGradeNo ?? null);
        }
        this.formEmpTypeCode.set(d.empTypeCode ?? null);
        this.formPositionNo.set(d.positionNo ?? null);
        this.formPosition.set(d.position ?? null);
        this.formMainBusiness.set(d.mainBusiness ?? null);
      } catch {
        this.clearFormFields();
      }
    } else {
      this.clearFormFields();
    }
    this.formStartDate.set(new Date());
    this.formTransCode.set(null);
    this.formTransResource.set(null);
  }

  async onPostFamilyChange(value: string | null, silent = false): Promise<void> {
    this.formPostFamily.set(value);
    if (!silent) {
      this.formPostGradeNo.set(null);
    }
    this.postGradeOptions.set(await this.service.getCodeList(value || DEFAULT_POST_GRADE_PARENT));
  }

  async onTransCodeChange(value: string | null, silent = false): Promise<void> {
    this.formTransCode.set(value);
    if (!silent) {
      this.formTransResource.set(null);
    }
    this.transResourceOptions.set(value ? await this.service.getCodeList(value) : []);
  }

  onDeptnoChange(value: string | null): void {
    this.formDeptno.set(value);
    // Bản gốc: chọn cây Phòng ban tự đồng bộ luôn Mã chi phí về cùng mã.
    this.formCostCenter.set(value);
  }

  async saveDecision(): Promise<void> {
    const transCode = this.formTransCode();
    const startDate = toDdMmYyyy(this.formStartDate());
    const personId = this.formPersonId() || this.currentPersonId();
    if (!transCode || !startDate) {
      this.message.warning(this.i18n.t('vsp.js.required', 'Vui lòng nhập đầy đủ thông tin bắt buộc'));
      return;
    }
    if (!personId) {
      this.message.warning(this.i18n.t('vsp.js.selectFirst', 'Vui lòng tìm kiếm nhân viên trước'));
      return;
    }
    const payload: DecisionSavePayload = {
      seq: this.formSeq(),
      personId,
      transCode,
      startDate,
      deptno: this.formDeptno() || undefined,
      empTypeCode: this.formEmpTypeCode() || undefined,
      postFamily: this.formPostFamily() || undefined,
      postGradeNo: this.formPostGradeNo() || undefined,
      positionNo: this.formPositionNo() || undefined,
      employeeBelong: this.hiddenEmployeeBelong,
      empOffice: this.hiddenEmpOffice,
      endProbationDate: this.hiddenEndProbationDate,
      jobType: this.hiddenJobType,
      dutyNo: this.hiddenDutyNo,
      workHourType: this.hiddenWorkHourType,
      wageType: this.hiddenWageType,
      mainBusiness: this.formMainBusiness() || undefined,
      transResource: this.formTransResource() || undefined,
      costCenter: this.formCostCenter() || undefined,
      payStepNo: this.hiddenPayStepNo,
      position: this.formPosition() || undefined,
      remark: this.formRemark().trim() || undefined,
    };
    this.saving.set(true);
    try {
      const res = await this.service.saveDecision(payload);
      if (res.success) {
        if (!this.formSeq() && res.seq) {
          this.formSeq.set(res.seq);
          this.selectedSeq.set(res.seq);
        }
        this.message.success(res.message || this.i18n.t('common.success', 'Thành công'));
        await this.loadDecisionList();
      } else {
        this.message.error(res.message || this.i18n.t('common.error', 'Lỗi'));
      }
    } catch {
      this.message.error(this.i18n.t('common.error', 'Lỗi'));
    } finally {
      this.saving.set(false);
    }
  }

  deleteSelected(): void {
    const seqs = Array.from(this.selectedSeqs());
    if (!seqs.length) {
      this.message.warning(this.i18n.t('vsp.js.selectRow', 'Vui lòng chọn ít nhất một quyết định'));
      return;
    }
    this.modal.confirm({
      nzTitle: this.i18n.t('vsp.js.confirmDelete', 'Xác nhận xóa quyết định đã chọn?'),
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          await Promise.all(seqs.map((seq) => this.service.deleteDecision(seq)));
          if (this.selectedSeq() && seqs.includes(this.selectedSeq()!)) {
            this.selectedSeq.set(null);
            this.formSeq.set(null);
            this.detailTitle.set(null);
          }
          this.selectedSeqs.set(new Set());
          await this.loadDecisionList();
        } catch {
          this.message.error(this.i18n.t('common.error', 'Lỗi'));
        }
      },
    });
  }

  exportExcel(): void {
    const personId = this.currentPersonId();
    if (!personId) {
      this.message.warning(this.i18n.t('vsp.js.selectFirst', 'Vui lòng tìm kiếm nhân viên trước'));
      return;
    }
    window.location.href = this.service.buildExportUrl(personId, this.currentLocalName() ?? '');
  }
}
