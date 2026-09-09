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
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { I18nService } from '../../../../i18n/i18n.service';
import { ContractRow, ContractSearchFilter, ContractService } from '../contract.service';

/**
 * Tra cứu Hợp đồng (chỉ xem, không CRUD) - port lại từ
 * hrm/contract/viewContractInfoForSearch.html (đã xoá). Dùng chung
 * ContractService với 2 trang còn lại nhưng KHÔNG include
 * ContractFormModalComponent (bản gốc không có nút Thêm/Sửa/Xóa, chỉ có
 * "Xem chi tiết").
 */
@Component({
  selector: 'app-contract-search',
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
    NzTagModule,
  ],
  templateUrl: './contract-search.component.html',
  styleUrl: './contract-search.component.scss',
})
export class ContractSearchComponent implements OnInit {
  private readonly service = inject(ContractService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

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
  protected readonly pageSize = signal(10);
  private listBootstrapped = false;
  private drawCounter = 0;

  protected readonly viewModalVisible = signal(false);
  protected readonly viewRow = signal<ContractRow | null>(null);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
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
    this.endDateFrom.set('');
    this.endDateTo.set('');
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
}
