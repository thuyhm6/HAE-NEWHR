import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import { CwaAbnormalApplyService, CwaAbnormalRow, CwaApplyItem } from './cwa-abnormal-apply.service';

interface CwaRowVm {
  pkNo: string;
  itemNo: string;
  itemName: string;
  arDateStr: string;
  indoorTime: string;
  outdoorTime: string;
  checked: boolean;
  inDateTime: Date | null;
  outDateTime: Date | null;
  remark: string;
}

function firstDayOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function lastDayOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0);
}

function buildDate(dmy: string, hh: string, mi: string): Date | null {
  const p = dmy.split('/');
  if (p.length !== 3) return null;
  const d = new Date(+p[2], +p[1] - 1, +p[0], parseInt(hh, 10) || 0, parseInt(mi, 10) || 0);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Xin phép chấm công bất thường (quên quẹt thẻ) hàng loạt cho chính nhân
 * viên đang đăng nhập - port lại từ ess/infoApply/viewShowCwaAbnormalApply.html
 * (đã xoá) sang Angular + NG-ZORRO, dùng nz-table thay bảng dựng tay + phân
 * trang thủ công bằng jQuery. Thay 2 ô ngày + giờ + phút rời rạc của bản gốc
 * bằng 1 nz-date-picker (nzShowTime) mỗi cột Vào/Ra. Khác với bản gốc (chỉ
 * lưu state chỉnh sửa trong DOM của trang hiện tại, mất khi chuyển trang),
 * component này giữ state từng dòng trong signal `rows` nên chọn/nhập liệu
 * không bị mất khi đổi trang nz-table - cải thiện tự nhiên nhờ kiến trúc
 * mới, không phải yêu cầu riêng. Do đó "Chọn tất cả"/"Thực hiện tất cả" áp
 * dụng trên toàn bộ danh sách đã lọc (quick filter) thay vì chỉ trang hiện
 * tại như bản gốc.
 */
@Component({
  selector: 'app-cwa-abnormal-apply',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCardModule,
    NzCheckboxModule,
    NzDatePickerModule,
    NzFormModule,
    NzIconModule,
    NzInputModule,
    NzTableModule,
  ],
  templateUrl: './cwa-abnormal-apply.component.html',
  styleUrl: './cwa-abnormal-apply.component.scss',
})
export class CwaAbnormalApplyComponent implements OnInit {
  private readonly service = inject(CwaAbnormalApplyService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly startDate = signal<Date | null>(firstDayOfMonth());
  protected readonly endDate = signal<Date | null>(lastDayOfMonth());
  protected readonly quickFilter = signal('');

  protected readonly globalInDateTime = signal<Date | null>(null);
  protected readonly globalOutDateTime = signal<Date | null>(null);

  protected readonly loading = signal(false);
  protected readonly submitting = signal(false);
  protected readonly rows = signal<CwaRowVm[]>([]);
  protected readonly approverStr = signal('');

  protected readonly filteredRows = computed(() => {
    const kw = this.quickFilter().trim().toLowerCase();
    const rows = this.rows();
    if (!kw) return rows;
    return rows.filter((r) =>
      [r.itemName, r.itemNo, r.arDateStr, r.indoorTime, r.outdoorTime].some(
        (v) => v && String(v).toLowerCase().includes(kw),
      ),
    );
  });

  protected readonly allChecked = computed(() => {
    const rows = this.filteredRows();
    return rows.length > 0 && rows.every((r) => r.checked);
  });

  private personId = '';
  private localName = '';

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      const info = await this.service.getMyInfo();
      this.personId = info.personId ?? '';
      this.localName = info.localName ?? '';
    } catch {
      // Không có thông tin nhân viên thì vẫn hiển thị bảng, chỉ không xin phép được.
    }
    await this.search();
  }

  private toApiDate(value: Date | null): string {
    return value ? formatDate(value, 'dd/MM/yyyy', 'en-US') : '';
  }

  private toApiDateTime(value: Date | null): string {
    // Mapper insertCardApply dùng TO_DATE(..., 'YYYY/MM/DD HH24:MI') (năm
    // trước, gạch chéo) - khác định dạng 'yyyy-MM-dd HH:mm' đã dùng ở Batch E/G.
    return value ? formatDate(value, 'yyyy/MM/dd HH:mm', 'en-US') : '';
  }

  private calcWorkHour(from: Date | null, to: Date | null): string {
    if (!from || !to || to.getTime() <= from.getTime()) return '0';
    return ((to.getTime() - from.getTime()) / 3600000).toFixed(2);
  }

  private toArDateStrParam(dmy: string): string {
    // API list trả arDateStr dạng hiển thị dd/MM/yyyy (đã TO_CHAR ngược từ cột
    // gốc), nhưng AR_DATE_STR lưu trong AR_DETAIL_HAE/ESS_CARD_APPLY_TB và hàm
    // AR_GET_ATT_EX_CLASH lại yêu cầu đúng định dạng gốc yyyy/MM/dd (xem
    // EssCwaAbnormalMapper.xml dùng TO_DATE(AR_DATE_STR, 'YYYY/MM/DD')) - phải
    // đổi ngược lại trước khi gửi, nếu không insertCardApply/checkAttExClash
    // sẽ báo ORA-01830.
    const p = dmy.split('/');
    return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : dmy;
  }

  private toRowVm(r: CwaAbnormalRow): CwaRowVm {
    const dateStr = r.arDateStr ?? '';
    const inDateStr = r.shiftStartYyyy || dateStr;
    const inHh = r.shiftStartHh || '08';
    const inMi = r.shiftStartMi || '00';
    const outDateStr = r.shiftEndYyyy || dateStr;
    const outHh = r.shiftEndHh || '17';
    const outMi = r.shiftEndMi || '00';
    return {
      pkNo: r.pkNo ?? '',
      itemNo: r.itemNo ?? '',
      itemName: r.itemName || r.itemNo || '',
      arDateStr: dateStr,
      indoorTime: r.indoorTime || '**:**',
      outdoorTime: r.outdoorTime || '**:**',
      checked: false,
      inDateTime: buildDate(inDateStr, inHh, inMi),
      outDateTime: buildDate(outDateStr, outHh, outMi),
      remark: '',
    };
  }

  async search(): Promise<void> {
    this.loading.set(true);
    try {
      const rows = await this.service.getList(this.toApiDate(this.startDate()), this.toApiDate(this.endDate()));
      this.rows.set(rows.map((r) => this.toRowVm(r)));
      await this.loadApprovers();
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('essCwa.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }

  private async loadApprovers(): Promise<void> {
    if (!this.personId) {
      return;
    }
    try {
      const list = await this.service.getApprovers(this.personId);
      this.approverStr.set(
        (list || [])
          .filter((a) => String(a.affirmLevel) !== '0')
          .map((a) => `${a.affirmLevel}[${a.empId ?? ''}]${a.localName ?? ''}`)
          .join(' '),
      );
    } catch {
      this.approverStr.set('');
    }
  }

  onQuickFilterChange(value: string): void {
    this.quickFilter.set(value);
  }

  updateRow(pkNo: string, patch: Partial<CwaRowVm>): void {
    this.rows.update((rows) => rows.map((r) => (r.pkNo === pkNo ? { ...r, ...patch } : r)));
  }

  toggleAll(checked: boolean): void {
    const keys = new Set(this.filteredRows().map((r) => r.pkNo));
    this.rows.update((rows) => rows.map((r) => (keys.has(r.pkNo) ? { ...r, checked } : r)));
  }

  applyAll(): void {
    const inDt = this.globalInDateTime();
    const outDt = this.globalOutDateTime();
    if (!inDt && !outDt) {
      return;
    }
    const keys = new Set(this.filteredRows().map((r) => r.pkNo));
    this.rows.update((rows) =>
      rows.map((r) =>
        keys.has(r.pkNo)
          ? { ...r, inDateTime: inDt ?? r.inDateTime, outDateTime: outDt ?? r.outDateTime }
          : r,
      ),
    );
  }

  async submit(): Promise<void> {
    const selected = this.filteredRows().filter((r) => r.checked);
    if (!selected.length) {
      this.message.warning(this.i18n.t('essCwa.selectRowAlert', 'Vui lòng chọn ít nhất một dòng để xin phép.'));
      return;
    }
    if (selected.some((r) => !r.inDateTime || !r.outDateTime)) {
      this.message.warning(
        this.i18n.t('essCwa.fillTimeAlert', 'Vui lòng nhập đầy đủ thời gian vào/ra cho tất cả dòng được chọn.'),
      );
      return;
    }

    const items: CwaApplyItem[] = selected.map((row) => ({
      applyNo: row.pkNo,
      personId: this.personId,
      localName: this.localName,
      itemNo: row.itemNo,
      arDateStr: this.toArDateStrParam(row.arDateStr),
      fromDateTime: this.toApiDateTime(row.inDateTime),
      toDateTime: this.toApiDateTime(row.outDateTime),
      workHour: this.calcWorkHour(row.inDateTime, row.outDateTime),
      remark: row.remark,
    }));

    this.submitting.set(true);
    try {
      const res = await this.service.submit(items);
      if (res.success) {
        this.message.success(res.message || this.i18n.t('essCwa.applySuccess', 'Xin phép thành công!'));
        await this.search();
      } else {
        this.message.error(res.error || this.i18n.t('essCwa.applyFail', 'Xin phép thất bại!'));
      }
    } catch {
      this.message.error(this.i18n.t('essCwa.connectError', 'Lỗi kết nối khi xin phép!'));
    } finally {
      this.submitting.set(false);
    }
  }
}
