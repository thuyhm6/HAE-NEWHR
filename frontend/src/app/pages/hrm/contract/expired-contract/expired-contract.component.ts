import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { I18nService } from '../../../../i18n/i18n.service';
import { ContractFormModalComponent } from '../contract-form-modal.component';
import { ContractRow, ContractSearchFilter, ContractSavePayload, ContractService } from '../contract.service';

import { TABLE_PAGE_SIZE_OPTIONS, TABLE_DEFAULT_PAGE_SIZE } from '../../../../core/config/table-pagination.config';
/** CONTRACT_TYPE_CODE tiến trình: Thử việc -> 1 năm -> 2 năm -> Vô thời hạn,
 * giữ nguyên đúng logic `extendContract()` bản gốc. */
const NEXT_CONTRACT_TYPE: Record<string, { nextCode: string; durationMonths: number; indefinite: boolean }> = {
  '14014302': { nextCode: '14014303', durationMonths: 12, indefinite: false },
  '123204': { nextCode: '14014303', durationMonths: 12, indefinite: false },
  '14014303': { nextCode: '123203', durationMonths: 24, indefinite: false },
  '123203': { nextCode: '14014305', durationMonths: 0, indefinite: true },
};
const DEFAULT_NEXT = { nextCode: '14014303', durationMonths: 12, indefinite: false };

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Danh sách hợp đồng SẮP HẾT HẠN (mặc định lọc Ngày kết thúc trong [hôm nay,
 * hôm nay + 7 ngày]) - port lại từ hrm/contract/viewExpiredContract.html
 * (đã xoá). Chỉ có 2 hành động: Xem chi tiết + Gia hạn (tạo hợp đồng MỚI
 * đại diện kỳ tiếp theo, KHÔNG update bản ghi cũ - đúng hành vi
 * `extendContract()` bản gốc gọi `/api/contract/add`). Loại hợp đồng tự
 * động tiến cấp: Thử việc/Probation -> 1 năm -> 2 năm -> Vô thời hạn.
 */
@Component({
  selector: 'app-expired-contract',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ContractFormModalComponent,
    NzButtonModule,
    NzCardModule,
    NzFormModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzSelectModule,
    NzTableModule,
    NzTagModule,
  ],
  templateUrl: './expired-contract.component.html',
  styleUrl: './expired-contract.component.scss',
})
export class ExpiredContractComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;

  private readonly service = inject(ContractService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  @ViewChild(ContractFormModalComponent) formModal!: ContractFormModalComponent;

  protected readonly contractNo = signal('');
  protected readonly empId = signal('');
  protected readonly contractType = signal<string | null>(null);
  protected readonly department = signal('');
  protected readonly startDateFrom = signal('');
  protected readonly startDateTo = signal('');
  protected readonly endDateFrom = signal('');
  protected readonly endDateTo = signal('');
  protected readonly activity = signal<string | null>(null);
  protected readonly workPosition = signal('');
  protected readonly salaryFrom = signal('');
  protected readonly salaryTo = signal('');

  protected readonly listLoading = signal(false);
  protected readonly rows = signal<ContractRow[]>([]);
  protected readonly total = signal(0);
  protected readonly pageIndex = signal(1);
  protected readonly pageSize = signal(TABLE_DEFAULT_PAGE_SIZE);
  private listBootstrapped = false;
  private drawCounter = 0;

  protected readonly viewModalVisible = signal(false);
  protected readonly viewRow = signal<ContractRow | null>(null);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    // Mặc định: Ngày kết thúc trong [hôm nay, hôm nay + 7 ngày] - khớp bản gốc.
    const today = new Date();
    this.endDateFrom.set(formatDate(today, 'yyyy-MM-dd', 'en-US'));
    this.endDateTo.set(formatDate(addDays(today, 7), 'yyyy-MM-dd', 'en-US'));
    await this.search();
  }

  private buildFilter(): ContractSearchFilter {
    return {
      contractNo: this.contractNo().trim() || undefined,
      empId: this.empId().trim() || undefined,
      contractType: this.contractType() || undefined,
      department: this.department().trim() || undefined,
      startDateFrom: this.startDateFrom() || undefined,
      startDateTo: this.startDateTo() || undefined,
      endDateFrom: this.endDateFrom() || undefined,
      endDateTo: this.endDateTo() || undefined,
      activity: this.activity() || undefined,
      workPosition: this.workPosition().trim() || undefined,
      salaryFrom: this.salaryFrom() || undefined,
      salaryTo: this.salaryTo() || undefined,
    };
  }

  async onQueryParamsChange(params: NzTableQueryParams): Promise<void> {
    this.pageIndex.set(params.pageIndex);
    this.pageSize.set(params.pageSize);
    if (!this.listBootstrapped) {
      this.listBootstrapped = true;
      return;
    }
    await this.loadPage();
  }

  async search(): Promise<void> {
    this.pageIndex.set(1);
    await this.loadPage();
  }

  clearSearch(): void {
    this.contractNo.set('');
    this.empId.set('');
    this.contractType.set(null);
    this.department.set('');
    this.startDateFrom.set('');
    this.startDateTo.set('');
    const today = new Date();
    this.endDateFrom.set(formatDate(today, 'yyyy-MM-dd', 'en-US'));
    this.endDateTo.set(formatDate(addDays(today, 7), 'yyyy-MM-dd', 'en-US'));
    this.activity.set(null);
    this.workPosition.set('');
    this.salaryFrom.set('');
    this.salaryTo.set('');
    this.search();
  }

  exportResults(): void {
    window.open(this.service.buildExportUrl(this.buildFilter()), '_blank');
  }

  private async loadPage(): Promise<void> {
    this.listLoading.set(true);
    const draw = ++this.drawCounter;
    try {
      const start = (this.pageIndex() - 1) * this.pageSize();
      const res = await this.service.getContracts(this.buildFilter(), draw, start, this.pageSize());
      if (draw !== this.drawCounter) return;
      this.rows.set(res.data || []);
      this.total.set(res.recordsTotal || 0);
    } catch {
      this.rows.set([]);
      this.total.set(0);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      if (draw === this.drawCounter) this.listLoading.set(false);
    }
  }

  async viewDetail(row: ContractRow): Promise<void> {
    try {
      const d = await this.service.getContractByNo(row.contractNo!);
      this.viewRow.set(d);
      this.viewModalVisible.set(true);
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  closeViewModal(): void {
    this.viewModalVisible.set(false);
  }

  async extendContract(row: ContractRow): Promise<void> {
    try {
      const contract = await this.service.getContractByNo(row.contractNo!);
      const rule = NEXT_CONTRACT_TYPE[contract.contractTypeCode ?? ''] ?? DEFAULT_NEXT;

      let newStartStr: string;
      let newEndStr: string | null;
      if (contract.endContractDate) {
        const oldEnd = new Date(contract.endContractDate);
        const newStart = addDays(oldEnd, 1);
        newStartStr = formatDate(newStart, 'yyyy-MM-dd', 'en-US');
        if (!rule.indefinite) {
          const newEnd = new Date(newStart);
          newEnd.setMonth(newEnd.getMonth() + rule.durationMonths);
          newEnd.setDate(newEnd.getDate() - 1);
          newEndStr = formatDate(newEnd, 'yyyy-MM-dd', 'en-US');
        } else {
          newEndStr = null;
        }
      } else {
        const today = new Date();
        newStartStr = formatDate(today, 'yyyy-MM-dd', 'en-US');
        const nextYear = new Date(today);
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        newEndStr = formatDate(nextYear, 'yyyy-MM-dd', 'en-US');
      }

      const prefill: Partial<ContractSavePayload> & { empId?: string; empLabel?: string } = {
        empId: contract.empId,
        empLabel: contract.empId && contract.localName ? `${contract.empId} - ${contract.localName}` : contract.empId,
        contractName: this.i18n.t('hrm.viewExpiredContract.prefix.renew', 'Gia hạn -') + ' ' + (contract.contractName || ''),
        contractTypeCode: rule.nextCode,
        deptNo: contract.deptNo,
        workPosition: contract.workPosition,
        salary: contract.salary,
        workTime: contract.workTime,
        workHourType: contract.workHourType,
        startContractDate: newStartStr,
        endContractDate: newEndStr ?? undefined,
      };
      this.formModal.openForAdd(prefill);
    } catch {
      this.message.error(this.i18n.t('hrm.viewExpiredContract.msg.loadFailed', 'Lỗi khi tải thông tin hợp đồng'));
    }
  }
}
