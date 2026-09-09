import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { I18nService } from '../../../../i18n/i18n.service';
import { ContractFormModalComponent } from '../contract-form-modal.component';
import { ContractRow, ContractSearchFilter, ContractService } from '../contract.service';

/**
 * Danh sách + CRUD Hợp đồng lao động (đầy đủ Thêm/Sửa/Xóa/Xem) - port lại
 * từ hrm/contract/viewNOContractInfo.html (đã xoá). Dùng chung
 * ContractService + ContractFormModalComponent với ExpiredContractComponent
 * (cùng backend /hrm/contractInfo/contracts, không phân biệt "chưa có hợp
 * đồng" ở tầng server - xem ghi chú trong ContractService).
 */
@Component({
  selector: 'app-no-contract-info',
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
    NzInputNumberModule,
    NzModalModule,
    NzSelectModule,
    NzTableModule,
    NzTagModule,
  ],
  templateUrl: './no-contract-info.component.html',
  styleUrl: './no-contract-info.component.scss',
})
export class NoContractInfoComponent implements OnInit {
  private readonly service = inject(ContractService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
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

  openAddModal(): void {
    this.formModal.openForAdd();
  }

  openEditModal(row: ContractRow): void {
    this.formModal.openForEdit(row);
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

  deleteOne(row: ContractRow): void {
    if (!row.contractNo) return;
    this.modal.confirm({
      nzTitle: this.i18n.t('hrm.viewNOContract.confirm.delete', 'Bạn có chắc chắn muốn xóa hợp đồng này? Hành động này không thể hoàn tác!'),
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          const res = await this.service.deleteContract(row.contractNo!);
          if (res.error) {
            this.message.error(res.error);
          } else {
            this.message.success(res.message || this.i18n.t('common.deleteSuccess', 'Xóa thành công'));
            await this.loadPage();
          }
        } catch {
          this.message.error(this.i18n.t('common.deleteFailed', 'Xóa thất bại.'));
        }
      },
    });
  }
}
