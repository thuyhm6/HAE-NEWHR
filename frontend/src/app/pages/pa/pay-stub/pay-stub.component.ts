import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';

import { I18nService } from '../../../i18n/i18n.service';
import { EvsAffirmorSetupService } from '../../evs/evs-affirmor-setup/evs-affirmor-setup.service';
import { PaPayScheduleRow, PaPayScheduleService } from '../pa-pay-schedule/pa-pay-schedule.service';
import { PayStubItem, PayStubRow, PayStubService, SyCodeOption } from './pay-stub.service';

interface TripleRow {
  attName?: string;
  attValue?: number;
  salName?: string;
  salValue?: number;
  dedName?: string;
  dedValue?: number;
}

/**
 * Phiếu lương (payStub) - xem ghi chú trong pay-stub.service.ts. Render
 * phiếu lương và in giống hệt cách làm của pa-month-person-info-ess (mở cửa
 * sổ mới với HTML/CSS độc lập vì layout SPA không phù hợp in trực tiếp), chỉ
 * khác ở việc trang này tìm/hiển thị NHIỀU nhân viên cùng lúc theo bộ lọc.
 */
@Component({
  selector: 'app-pay-stub',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzSelectModule,
    NzSpinModule,
    NzTreeSelectModule,
  ],
  templateUrl: './pay-stub.component.html',
  styleUrl: './pay-stub.component.scss',
})
export class PayStubComponent implements OnInit {
  private readonly service = inject(PayStubService);
  private readonly payScheduleService = inject(PaPayScheduleService);
  private readonly deptService = inject(EvsAffirmorSetupService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly scheduleOptions = signal<PaPayScheduleRow[]>([]);
  protected readonly searchPayScheduleNo = signal<string | null>(null);
  protected readonly deptTreeNodes = signal<NzTreeNodeOptions[]>([]);
  protected readonly searchDeptNos = signal<string[]>([]);
  protected readonly searchEmpSearch = signal('');
  protected readonly empOfficeOptions = signal<SyCodeOption[]>([]);
  protected readonly searchEmpOffice = signal<string | null>(null);

  protected readonly loading = signal(false);
  protected readonly searched = signal(false);
  protected readonly recalcing = signal(false);
  protected readonly stubs = signal<PayStubRow[]>([]);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      const [schedules, empOfficeOptions, deptFlat] = await Promise.all([
        this.payScheduleService.getList('', '', null),
        this.service.getEmpOfficeOptions(),
        this.deptService.getAuthorizedDepartments(),
      ]);
      this.scheduleOptions.set(schedules);
      if (schedules.length) this.searchPayScheduleNo.set(schedules[0].payScheduleNo ?? null);
      this.empOfficeOptions.set(empOfficeOptions);
      this.deptTreeNodes.set(this.deptService.buildDeptTree(deptFlat) as NzTreeNodeOptions[]);
    } catch {
      this.message.warning(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  scheduleLabel(opt: PaPayScheduleRow): string {
    return opt.payDate + (opt.salaryDistinName ? ' ' + opt.salaryDistinName : '');
  }

  async search(): Promise<void> {
    const payScheduleNo = this.searchPayScheduleNo();
    if (!payScheduleNo) {
      this.message.warning(this.i18n.t('pa.payStub.msgSelectSchedule', 'Vui lòng chọn kế hoạch trả lương!'));
      return;
    }
    this.loading.set(true);
    this.searched.set(true);
    try {
      this.stubs.set(
        await this.service.load({
          payScheduleNo,
          deptNos: this.searchDeptNos().join(','),
          empSearch: this.searchEmpSearch(),
          empOffice: this.searchEmpOffice(),
          lang: this.i18n.lang() || 'vi',
        }),
      );
    } catch {
      this.stubs.set([]);
      this.message.error(this.i18n.t('common.error', 'Lỗi'));
    } finally {
      this.loading.set(false);
    }
  }

  recalcSalary(): void {
    const payScheduleNo = this.searchPayScheduleNo();
    if (!payScheduleNo) {
      this.message.warning(this.i18n.t('pa.payStub.msgSelectSchedule', 'Vui lòng chọn kế hoạch trả lương!'));
      return;
    }
    this.modal.confirm({
      nzTitle: this.i18n.t('pa.payStub.msgConfirmRecalc', 'Bạn có chắc muốn tính lại lương cho tất cả nhân viên trong kết quả tìm kiếm?'),
      nzOkDanger: true,
      nzOnOk: async () => {
        this.recalcing.set(true);
        try {
          const res = await this.service.recalc(payScheduleNo, this.searchDeptNos().join(','), this.searchEmpSearch(), this.searchEmpOffice());
          if (res.success !== false) {
            this.message.success(res.message || this.i18n.t('common.saveSuccess', 'Lưu thành công'));
            await this.search();
          } else {
            this.message.error(res.error || res.message || this.i18n.t('common.error', 'Lỗi'));
          }
        } catch {
          this.message.error(this.i18n.t('common.error', 'Lỗi'));
        } finally {
          this.recalcing.set(false);
        }
      },
    });
  }

  protected formatNumber(val: number | string | undefined | null): string {
    if (val === null || val === undefined || val === '') return '';
    const num = Number(String(val).replace(/,/g, ''));
    if (isNaN(num)) return '';
    return num.toLocaleString('vi-VN');
  }

  protected monthYear(hrEndDate?: string): string {
    if (!hrEndDate) return '';
    const parts = String(hrEndDate).split(/[-/]/);
    if (parts.length >= 2) return `${parts[1]}-${parts[0]}`;
    return hrEndDate;
  }

  private sum(items?: PayStubItem[]): number {
    return (items || []).reduce((acc, i) => acc + (Number(i.itemValue) || 0), 0);
  }

  protected totalSalary(stub: PayStubRow): number {
    return this.sum(stub.salaryItems);
  }

  protected totalDeduction(stub: PayStubRow): number {
    return this.sum(stub.deductionItems);
  }

  protected netSalary(stub: PayStubRow): number {
    return this.totalSalary(stub) - this.totalDeduction(stub);
  }

  protected tripleRows(stub: PayStubRow): TripleRow[] {
    const att = stub.attendanceItems || [];
    const sal = stub.salaryItems || [];
    const ded = stub.deductionItems || [];
    const maxRows = Math.max(att.length, sal.length, ded.length);
    const rows: TripleRow[] = [];
    for (let i = 0; i < maxRows; i++) {
      rows.push({
        attName: att[i]?.itemName,
        attValue: att[i]?.itemValue,
        salName: sal[i]?.itemName,
        salValue: sal[i]?.itemValue,
        dedName: ded[i]?.itemName,
        dedValue: ded[i]?.itemValue,
      });
    }
    return rows;
  }

  protected visibleOtherItems(stub: PayStubRow) {
    return (stub.otherItems || []).filter((i) => i.returnValue || i.remark);
  }

  print(): void {
    if (!this.stubs().length) {
      this.message.warning(this.i18n.t('pa.payStub.noData', 'Không có dữ liệu'));
      return;
    }
    const printArea = document.getElementById('vps-print-area');
    if (!printArea) return;
    const printCss = `
      @page { size:A4 portrait; margin:8mm; }
      *, *::before, *::after { box-sizing:border-box; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
      html, body { width:194mm; margin:0 auto; padding:0; background:#fff; font-family:Arial,sans-serif; font-size:10px; color:#111; }
      table { max-width:100% !important; word-break:break-word; border-collapse:collapse; width:100%; }
      .vps-pay-stub { width:100%; max-width:194mm; margin:0 auto; padding:4mm 0; background:#fff; page-break-after:always; }
      .vps-pay-stub:last-child { page-break-after:avoid; }
      .vps-block, table, tr { page-break-inside:avoid; break-inside:avoid-page; }
      .vps-section-title { break-after:avoid-page; page-break-after:avoid; }
      .vps-stub-header { display:flex; align-items:center; margin-bottom:8px; border-bottom:2.5px solid #922b21; padding-bottom:6px; }
      .vps-logo img { height:32px; margin-right:6px; vertical-align:middle; }
      .vps-title { font-size:15px; font-weight:bold; text-align:center; flex:1; color:#1a1a2e; }
      .vps-section-title { background:#922b21; color:#fff; font-weight:bold; padding:2px 6px; margin:6px 0 0 0; font-size:10px; }
      th, td { padding:5px 6px; border:1px solid #c8c8c8; font-size:9px; }
      th { background:#f2e0e0; color:#333; text-align:center; }
      td { background:#fff; }
      .vps-detail-table tbody tr:nth-child(even) td, .vps-triple-table tbody tr:nth-child(even) td { background:#fafafa; }
      .vps-triple-table tfoot td { background:#ececec; }
      .vps-att-header { background:#1a5276 !important; color:#fff; }
      .vps-sal-header { background:#922b21 !important; color:#fff; }
      .vps-ded-header { background:#1a5276 !important; color:#fff; }
      .vps-net-table td { background:#fef9e7; font-size:12px; font-weight:bold; }
      .vps-note { font-size:9px; color:#555; margin-top:8px; font-style:italic; border-top:1px dashed #ccc; padding-top:4px; }
      .text-end { text-align:right; }
      .text-center { text-align:center; }
      .fw-bold { font-weight:bold; }
    `;
    const printWin = window.open('', '_blank');
    if (!printWin) return;
    printWin.document.write(
      `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${printCss}</style></head><body>${printArea.innerHTML}</body></html>`,
    );
    printWin.document.close();
    printWin.onload = () => {
      printWin.focus();
      printWin.print();
      printWin.close();
    };
  }
}
