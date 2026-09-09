import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';

import { I18nService } from '../../../i18n/i18n.service';
import { ArPersonalListService, AuthorizedDeptNode } from '../../ess/ar-personal-list/ar-personal-list.service';
import { EmployeeSearchResult, SstOtApplyService } from '../../ess/sst-ot-apply/sst-ot-apply.service';
import { DetailCalculateService } from './detail-calculate.service';

function firstDayOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function lastDayOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0);
}

/**
 * Form trigger tính lại công chi tiết theo nhân viên hoặc phòng ban - port
 * lại từ ar/attendanceMintenance/viewArDetailCalculate.html (đã xoá). Không
 * có bảng dữ liệu, chỉ có form + 1 nút Tính toán. Tái sử dụng dept-tree
 * (ArPersonalListService) và tìm kiếm nhân viên (SstOtApplyService). Khác
 * bản gốc (DeptTree cho phép tick nhiều rồi validate "chỉ được chọn 1"):
 * dùng nz-tree-select single-select (không nzMultiple/nzCheckable) để đảm
 * bảo đúng 1 phòng ban ngay từ UI, đơn giản hơn mà vẫn cùng kết quả.
 */
@Component({
  selector: 'app-detail-calculate',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCardModule,
    NzCheckboxModule,
    NzDatePickerModule,
    NzFormModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzRadioModule,
    NzSelectModule,
    NzTreeSelectModule,
  ],
  templateUrl: './detail-calculate.component.html',
  styleUrl: './detail-calculate.component.scss',
})
export class DetailCalculateComponent implements OnInit {
  private readonly service = inject(DetailCalculateService);
  private readonly deptService = inject(ArPersonalListService);
  private readonly empService = inject(SstOtApplyService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly caltype = signal<'EMP' | 'DEPT'>('EMP');
  protected readonly fromDate = signal<Date | null>(firstDayOfMonth());
  protected readonly toDate = signal<Date | null>(lastDayOfMonth());

  protected readonly personId = signal('');
  protected readonly personDisplay = signal('');

  protected readonly deptTreeNodes = signal<NzTreeNodeOptions[]>([]);
  protected readonly selectedDeptCode = signal<string | null>(null);
  protected readonly sonDeptFlag = signal(false);

  protected readonly calculating = signal(false);

  protected readonly empPickerVisible = signal(false);
  protected readonly empPickerSearchResults = signal<EmployeeSearchResult[]>([]);
  protected readonly empPickerSearching = signal(false);
  private empPickerSearchTimer: ReturnType<typeof setTimeout> | undefined;

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      this.deptTreeNodes.set(this.buildDeptTree(await this.deptService.getAuthorizedDepartments()));
    } catch {
      this.deptTreeNodes.set([]);
    }
  }

  private buildDeptTree(flatList: AuthorizedDeptNode[]): NzTreeNodeOptions[] {
    const nodeMap = new Map<string, NzTreeNodeOptions>();
    const childKeys = new Map<string, string[]>();
    flatList.forEach((item) => {
      nodeMap.set(item.id, { key: item.id, title: item.text, isLeaf: true });
    });
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
        node.children = children.map((childId) => nodeMap.get(childId)!).filter(Boolean);
      }
    });
    return roots;
  }

  onCaltypeChange(value: 'EMP' | 'DEPT'): void {
    this.caltype.set(value);
    if (value === 'EMP') {
      this.selectedDeptCode.set(null);
      this.sonDeptFlag.set(false);
    } else {
      this.personId.set('');
      this.personDisplay.set('');
    }
  }

  openEmpPicker(): void {
    this.empPickerSearchResults.set([]);
    this.empPickerVisible.set(true);
  }

  closeEmpPicker(): void {
    this.empPickerVisible.set(false);
  }

  onEmpPickerSearch(keyword: string): void {
    if (this.empPickerSearchTimer) {
      clearTimeout(this.empPickerSearchTimer);
    }
    const kw = keyword.trim();
    if (!kw) {
      this.empPickerSearchResults.set([]);
      return;
    }
    this.empPickerSearchTimer = setTimeout(async () => {
      this.empPickerSearching.set(true);
      try {
        this.empPickerSearchResults.set(await this.empService.searchEmployees(kw));
      } catch {
        this.empPickerSearchResults.set([]);
      } finally {
        this.empPickerSearching.set(false);
      }
    }, 300);
  }

  onEmpPickerSelected(personId: string | null): void {
    if (!personId) return;
    const emp = this.empPickerSearchResults().find((e) => e.personId === personId);
    if (emp) {
      this.personId.set(emp.personId ?? '');
      this.personDisplay.set(`${emp.empId ?? ''} - ${emp.localName ?? ''}`);
    }
    this.closeEmpPicker();
  }

  private toApiDate(value: Date | null): string {
    return value ? formatDate(value, 'yyyy/MM/dd', 'en-US') : '';
  }

  async runCalculate(): Promise<void> {
    const fromDate = this.toApiDate(this.fromDate());
    const toDate = this.toApiDate(this.toDate());
    if (!fromDate || !toDate) {
      this.message.warning(this.i18n.t('arCalc.msg.selectDateRange', 'Vui lòng chọn khoảng thời gian tính toán'));
      return;
    }

    let deptId = '';
    if (this.caltype() === 'EMP') {
      if (!this.personId()) {
        this.message.warning(this.i18n.t('arCalc.msg.selectEmployee', 'Vui lòng chọn nhân viên'));
        return;
      }
    } else {
      deptId = this.selectedDeptCode() ?? '';
      if (!deptId) {
        this.message.warning(this.i18n.t('arCalc.msg.selectDept', 'Vui lòng chọn phòng ban'));
        return;
      }
    }

    this.calculating.set(true);
    try {
      const res = await this.service.run({
        caltype: this.caltype(),
        fromDate,
        toDate,
        deptId,
        sonDeptFlag: this.sonDeptFlag() ? 'YES' : 'NO',
        personId: this.caltype() === 'EMP' ? this.personId() : '',
      });
      if (res.success) {
        this.message.success(res.message || this.i18n.t('arCalc.btnCalculate', 'Tính toán'));
      } else {
        this.message.error(res.error || this.i18n.t('arCalc.msg.calcFail', 'Tính toán thất bại'));
      }
    } catch {
      this.message.error(this.i18n.t('arCalc.msg.calcError', 'Không thể thực hiện tính toán'));
    } finally {
      this.calculating.set(false);
    }
  }
}
