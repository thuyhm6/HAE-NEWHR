import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import { PaPayScheduleRow, PaPayScheduleService, SyCodeOption } from './pa-pay-schedule.service';

function parseYyyyMmDd(s?: string | null): Date | null {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function toYyyyMmDd(d: Date | null): string {
  if (!d) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Kế hoạch trả lương (viewPaPaySchedule) - xem ghi chú định dạng ngày trong
 * pa-pay-schedule.service.ts. Bản gốc dùng click chọn dòng + nút Sửa/Xóa
 * riêng - bản Angular đổi sang click dòng mở thẳng modal Sửa (nhất quán quy
 * ước modal-CRUD của dự án), nút Xóa chuyển vào trong modal.
 */
@Component({
  selector: 'app-pa-pay-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule, NzButtonModule, NzDatePickerModule, NzIconModule, NzInputModule, NzModalModule, NzSelectModule, NzTableModule],
  templateUrl: './pa-pay-schedule.component.html',
  styleUrl: './pa-pay-schedule.component.scss',
})
export class PaPayScheduleComponent implements OnInit {
  private readonly service = inject(PaPayScheduleService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly searchFromDate = signal<Date | null>(null);
  protected readonly searchToDate = signal<Date | null>(null);
  protected readonly searchSalaryDistinNo = signal<string | null>(null);
  protected readonly salaryDistinOptions = signal<SyCodeOption[]>([]);

  protected readonly rows = signal<PaPayScheduleRow[]>([]);
  protected readonly loading = signal(false);

  protected readonly formVisible = signal(false);
  protected readonly formSaving = signal(false);
  protected readonly formIsAdd = signal(true);
  protected readonly formPayScheduleNo = signal('');
  protected readonly formPayDate = signal<Date | null>(null);
  protected readonly formSalaryDistinNo = signal<string | null>(null);
  protected readonly formHrStartDate = signal<Date | null>(null);
  protected readonly formHrEndDate = signal<Date | null>(null);
  protected readonly formArStartDate = signal<Date | null>(null);
  protected readonly formArEndDate = signal<Date | null>(null);
  protected readonly formPaOpenDate = signal<Date | null>(null);
  protected readonly formPaTransDate = signal<Date | null>(null);
  protected readonly formEmpOpinion = signal('');

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      this.salaryDistinOptions.set(await this.service.getSalaryDistinOptions());
    } catch {
      // im lặng bỏ qua - danh sách tùy chọn trống không chặn chức năng chính
    }
    await this.search();
  }

  async search(): Promise<void> {
    this.loading.set(true);
    try {
      this.rows.set(
        await this.service.getList(toYyyyMmDd(this.searchFromDate()), toYyyyMmDd(this.searchToDate()), this.searchSalaryDistinNo()),
      );
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }

  openAddModal(): void {
    this.formIsAdd.set(true);
    this.formPayScheduleNo.set('');
    this.formPayDate.set(null);
    this.formSalaryDistinNo.set(null);
    this.formHrStartDate.set(null);
    this.formHrEndDate.set(null);
    this.formArStartDate.set(null);
    this.formArEndDate.set(null);
    this.formPaOpenDate.set(null);
    this.formPaTransDate.set(null);
    this.formEmpOpinion.set('');
    this.formVisible.set(true);
  }

  async openEditModal(row: PaPayScheduleRow): Promise<void> {
    if (!row.payScheduleNo) return;
    try {
      const dto = await this.service.getOne(row.payScheduleNo);
      this.formIsAdd.set(false);
      this.formPayScheduleNo.set(dto.payScheduleNo ?? '');
      this.formPayDate.set(parseYyyyMmDd(dto.payDate));
      this.formSalaryDistinNo.set(dto.salaryDistinNo || null);
      this.formHrStartDate.set(parseYyyyMmDd(dto.hrStartDate));
      this.formHrEndDate.set(parseYyyyMmDd(dto.hrEndDate));
      this.formArStartDate.set(parseYyyyMmDd(dto.arStartDate));
      this.formArEndDate.set(parseYyyyMmDd(dto.arEndDate));
      this.formPaOpenDate.set(parseYyyyMmDd(dto.paOpenDate));
      this.formPaTransDate.set(parseYyyyMmDd(dto.paTransDate));
      this.formEmpOpinion.set(dto.empOpinion ?? '');
      this.formVisible.set(true);
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  async saveForm(): Promise<void> {
    if (!this.formPayDate() || !this.formSalaryDistinNo()) {
      this.message.warning(this.i18n.t('pa.paySchedule.validateRequired', 'Vui lòng nhập đầy đủ thông tin bắt buộc!'));
      return;
    }
    this.formSaving.set(true);
    try {
      const res = await this.service.save({
        payScheduleNo: this.formPayScheduleNo() || undefined,
        payDate: toYyyyMmDd(this.formPayDate()),
        salaryDistinNo: this.formSalaryDistinNo() ?? undefined,
        hrStartDate: toYyyyMmDd(this.formHrStartDate()) || undefined,
        hrEndDate: toYyyyMmDd(this.formHrEndDate()) || undefined,
        arStartDate: toYyyyMmDd(this.formArStartDate()) || undefined,
        arEndDate: toYyyyMmDd(this.formArEndDate()) || undefined,
        paOpenDate: toYyyyMmDd(this.formPaOpenDate()) || undefined,
        paTransDate: toYyyyMmDd(this.formPaTransDate()) || undefined,
        empOpinion: this.formEmpOpinion() || undefined,
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

  deleteCurrent(): void {
    const payScheduleNo = this.formPayScheduleNo();
    if (!payScheduleNo) return;
    this.modal.confirm({
      nzTitle: this.i18n.t('pa.paySchedule.confirmDelete', 'Bạn có chắc chắn muốn xóa bản ghi này?'),
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          const res = await this.service.delete(payScheduleNo);
          this.message.success(res.message || this.i18n.t('common.deleteSuccess', 'Xóa thành công'));
          this.formVisible.set(false);
          await this.search();
        } catch {
          this.message.error(this.i18n.t('common.error', 'Lỗi'));
        }
      },
    });
  }
}
