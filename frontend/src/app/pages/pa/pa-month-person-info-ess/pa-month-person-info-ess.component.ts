import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';

import { I18nService } from '../../../i18n/i18n.service';
import { PaMonthPersonInfoEssService, PaPayScheduleOption, PaPayStub, PaPayStubItem, PaPayStubOther } from './pa-month-person-info-ess.service';

interface TripleRow {
  attName?: string;
  attValue?: number;
  salName?: string;
  salValue?: number;
  dedName?: string;
  dedValue?: number;
}

/**
 * Phiếu lương cá nhân (viewPaMonthPersonInfoEssList) - xem ghi chú trong
 * pa-month-person-info-ess.service.ts. In phiếu: mở cửa sổ mới với HTML/CSS
 * độc lập (giống bản gốc) vì layout shell (sidebar/topbar) của SPA không
 * phù hợp để in trực tiếp trang hiện tại.
 */
@Component({
  selector: 'app-pa-month-person-info-ess',
  standalone: true,
  imports: [CommonModule, FormsModule, NzButtonModule, NzIconModule, NzSelectModule, NzSpinModule],
  templateUrl: './pa-month-person-info-ess.component.html',
  styleUrl: './pa-month-person-info-ess.component.scss',
})
export class PaMonthPersonInfoEssComponent implements OnInit {
  private readonly service = inject(PaMonthPersonInfoEssService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly scheduleOptions = signal<PaPayScheduleOption[]>([]);
  protected readonly selectedScheduleNo = signal<string | null>(null);

  protected readonly loading = signal(false);
  protected readonly searched = signal(false);
  protected readonly stubs = signal<PaPayStub[]>([]);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      const list = await this.service.getOpenScheduleList();
      this.scheduleOptions.set(list);
      if (list.length) this.selectedScheduleNo.set(list[0].payScheduleNo ?? null);
    } catch {
      this.message.warning(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  scheduleLabel(opt: PaPayScheduleOption): string {
    return opt.payDate + (opt.salaryDistinName ? ' ' + opt.salaryDistinName : '');
  }

  async search(): Promise<void> {
    const payScheduleNo = this.selectedScheduleNo();
    if (!payScheduleNo) {
      this.message.warning(this.i18n.t('pa.monthPersonInfo.msgSelectSchedule', 'Vui lòng chọn kế hoạch trả lương!'));
      return;
    }
    this.loading.set(true);
    this.searched.set(true);
    try {
      this.stubs.set(await this.service.loadSelfPayStub(payScheduleNo, this.i18n.lang() || 'vi'));
    } catch {
      this.stubs.set([]);
      this.message.error(this.i18n.t('common.error', 'Lỗi'));
    } finally {
      this.loading.set(false);
    }
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

  private sum(items?: PaPayStubItem[]): number {
    return (items || []).reduce((acc, i) => acc + (Number(i.itemValue) || 0), 0);
  }

  protected totalSalary(stub: PaPayStub): number {
    return this.sum(stub.salaryItems);
  }

  protected totalDeduction(stub: PaPayStub): number {
    return this.sum(stub.deductionItems);
  }

  protected netSalary(stub: PaPayStub): number {
    return this.totalSalary(stub) - this.totalDeduction(stub);
  }

  protected tripleRows(stub: PaPayStub): TripleRow[] {
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

  protected visibleOtherItems(stub: PaPayStub): PaPayStubOther[] {
    return (stub.otherItems || []).filter((i) => i.returnValue || i.remark);
  }

  protected empOpinion(): string {
    const opt = this.scheduleOptions().find((o) => o.payScheduleNo === this.selectedScheduleNo());
    return opt?.empOpinion || this.i18n.t('pa.monthPersonInfo.note', '※ Mọi thắc mắc về nội dung trên phiếu lương, vui lòng liên hệ phòng Nhân sự!');
  }

  print(): void {
    if (!this.stubs().length) {
      this.message.warning(this.i18n.t('pa.monthPersonInfo.noData', 'Không có dữ liệu'));
      return;
    }
    const printArea = document.getElementById('vpmpi-print-area');
    if (!printArea) return;
    const printCss = `
      @page { size:A4 portrait; margin:8mm; }
      *, *::before, *::after { box-sizing:border-box; -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
      html, body { width:194mm; margin:0 auto; padding:0; background:#fff; font-family:Arial,sans-serif; font-size:10px; color:#111; }
      table { max-width:100% !important; word-break:break-word; border-collapse:collapse; width:100%; }
      .vpmpi-pay-stub { width:100%; max-width:194mm; margin:0 auto; padding:4mm 0; background:#fff; page-break-after:always; }
      .vpmpi-pay-stub:last-child { page-break-after:avoid; }
      .vpmpi-stub-header { display:flex; align-items:center; margin-bottom:8px; border-bottom:2.5px solid #922b21; padding-bottom:6px; }
      .vpmpi-logo img { height:32px; margin-right:6px; vertical-align:middle; }
      .vpmpi-title { font-size:15px; font-weight:bold; text-align:center; flex:1; color:#1a1a2e; }
      .vpmpi-section-title { background:#922b21; color:#fff; font-weight:bold; padding:2px 6px; margin:6px 0 0 0; font-size:10px; }
      th, td { padding:5px 6px; border:1px solid #c8c8c8; font-size:9px; }
      th { background:#f2e0e0; color:#333; text-align:center; }
      .vpmpi-att-header { background:#1a5276 !important; color:#fff; }
      .vpmpi-sal-header { background:#922b21 !important; color:#fff; }
      .vpmpi-ded-header { background:#1a5276 !important; color:#fff; }
      .vpmpi-net-table td { background:#fef9e7; font-size:12px; font-weight:bold; }
      .vpmpi-note { font-size:9px; color:#555; margin-top:8px; font-style:italic; border-top:1px dashed #ccc; padding-top:4px; }
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
