import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import { SyCompanyRow, SyCompanyService } from './sy-company.service';

/**
 * Quản lý Công ty (viewCompany) - xem ghi chú trong sy-company.service.ts.
 */
@Component({
  selector: 'app-sy-company',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzModalModule,
    NzSwitchModule,
    NzTableModule,
  ],
  templateUrl: './sy-company.component.html',
  styleUrl: './sy-company.component.scss',
})
export class SyCompanyComponent implements OnInit {
  private readonly service = inject(SyCompanyService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly searchKeyword = signal('');
  protected readonly rows = signal<SyCompanyRow[]>([]);
  protected readonly loading = signal(false);

  protected readonly formVisible = signal(false);
  protected readonly formSaving = signal(false);
  protected readonly formIsAdd = signal(true);
  protected readonly formCpnyNo = signal('');
  protected readonly formCpnyId = signal('');
  protected readonly formOperationId = signal('');
  protected readonly formNameVi = signal('');
  protected readonly formNameEn = signal('');
  protected readonly formNameZh = signal('');
  protected readonly formNameKo = signal('');
  protected readonly formCpnyAddr = signal('');
  protected readonly formCpnyPostalcode = signal('');
  protected readonly formCpnyLocation = signal('');
  protected readonly formCpnyTelNo = signal('');
  protected readonly formCpnyFaxNo = signal('');
  protected readonly formCpnyWebAddr = signal('');
  protected readonly formCpnyIntro = signal('');
  protected readonly formCpnyHistory = signal('');
  protected readonly formOrderNo = signal<number | null>(0);
  protected readonly formGgsYn = signal(false);
  protected readonly formActivity = signal(true);

  readonly exportUrl = this.service.exportUrl;

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.search();
  }

  async search(): Promise<void> {
    this.loading.set(true);
    try {
      this.rows.set(await this.service.getList(this.searchKeyword()));
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }

  clearSearch(): void {
    this.searchKeyword.set('');
    this.search();
  }

  openAddModal(): void {
    this.formIsAdd.set(true);
    this.formCpnyNo.set('');
    this.formCpnyId.set('');
    this.formOperationId.set('');
    this.formNameVi.set('');
    this.formNameEn.set('');
    this.formNameZh.set('');
    this.formNameKo.set('');
    this.formCpnyAddr.set('');
    this.formCpnyPostalcode.set('');
    this.formCpnyLocation.set('');
    this.formCpnyTelNo.set('');
    this.formCpnyFaxNo.set('');
    this.formCpnyWebAddr.set('');
    this.formCpnyIntro.set('');
    this.formCpnyHistory.set('');
    this.formOrderNo.set(0);
    this.formGgsYn.set(false);
    this.formActivity.set(true);
    this.formVisible.set(true);
  }

  openEditModal(row: SyCompanyRow): void {
    this.formIsAdd.set(false);
    this.formCpnyNo.set(row.cpnyNo ?? '');
    this.formCpnyId.set(row.cpnyId ?? '');
    this.formOperationId.set(row.operationId ?? '');
    this.formNameVi.set(row.nameVi ?? '');
    this.formNameEn.set(row.nameEn ?? '');
    this.formNameZh.set(row.nameZh ?? '');
    this.formNameKo.set(row.nameKo ?? '');
    this.formCpnyAddr.set(row.cpnyAddr ?? '');
    this.formCpnyPostalcode.set(row.cpnyPostalcode ?? '');
    this.formCpnyLocation.set(row.cpnyLocation ?? '');
    this.formCpnyTelNo.set(row.cpnyTelNo ?? '');
    this.formCpnyFaxNo.set(row.cpnyFaxNo ?? '');
    this.formCpnyWebAddr.set(row.cpnyWebAddr ?? '');
    this.formCpnyIntro.set(row.cpnyIntro ?? '');
    this.formCpnyHistory.set(row.cpnyHistory ?? '');
    this.formOrderNo.set(row.orderNo ?? 0);
    this.formGgsYn.set(row.ggsYn === 'Y');
    this.formActivity.set(row.activity !== '0');
    this.formVisible.set(true);
  }

  async saveForm(): Promise<void> {
    if (!this.formCpnyId().trim() || !this.formNameVi().trim()) {
      this.message.warning(this.i18n.t('sys.codeManage.validateNameViRequired', 'Vui lòng nhập Tên Tiếng Việt!'));
      return;
    }
    this.formSaving.set(true);
    try {
      const res = await this.service.save({
        cpnyNo: this.formCpnyNo() || undefined,
        cpnyId: this.formCpnyId().trim(),
        operationId: this.formOperationId(),
        nameVi: this.formNameVi().trim(),
        nameEn: this.formNameEn(),
        nameZh: this.formNameZh(),
        nameKo: this.formNameKo(),
        cpnyAddr: this.formCpnyAddr(),
        cpnyPostalcode: this.formCpnyPostalcode(),
        cpnyLocation: this.formCpnyLocation(),
        cpnyTelNo: this.formCpnyTelNo(),
        cpnyFaxNo: this.formCpnyFaxNo(),
        cpnyWebAddr: this.formCpnyWebAddr(),
        cpnyIntro: this.formCpnyIntro(),
        cpnyHistory: this.formCpnyHistory(),
        orderNo: this.formOrderNo() ?? 0,
        ggsYn: this.formGgsYn() ? 'Y' : 'N',
        activity: this.formActivity() ? '1' : '0',
      });
      if (res.success !== false) {
        this.message.success(res.message || this.i18n.t('common.saveSuccess', 'Lưu thành công'));
        this.formVisible.set(false);
        await this.search();
      } else {
        this.message.error(res.message || this.i18n.t('common.error', 'Lỗi'));
      }
    } catch {
      this.message.error(this.i18n.t('common.error', 'Lỗi'));
    } finally {
      this.formSaving.set(false);
    }
  }

  deleteRow(row: SyCompanyRow): void {
    if (!row.cpnyNo) return;
    const cpnyNo = row.cpnyNo;
    this.modal.confirm({
      nzTitle: this.i18n.t('sys.company.confirmDelete', 'Bạn có chắc muốn xóa công ty này?'),
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          const res = await this.service.delete(cpnyNo);
          if (res.success !== false) {
            this.message.success(res.message || this.i18n.t('common.deleteSuccess', 'Xóa thành công'));
            await this.search();
          } else {
            this.message.error(res.message || this.i18n.t('common.error', 'Lỗi'));
          }
        } catch {
          this.message.error(this.i18n.t('common.error', 'Lỗi'));
        }
      },
    });
  }
}
