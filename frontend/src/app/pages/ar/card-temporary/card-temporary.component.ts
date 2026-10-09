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
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { TABLE_DEFAULT_PAGE_SIZE, TABLE_PAGE_SIZE_OPTIONS } from '../../../core/config/table-pagination.config';
import { I18nService } from '../../../i18n/i18n.service';
import { EmployeeSearchResult, SstOtApplyService } from '../../ess/sst-ot-apply/sst-ot-apply.service';
import { CardTemporaryRow, CardTemporaryService } from './card-temporary.service';

/**
 * Thẻ chấm công tạm thời - port lại từ
 * ar/attendanceMintenance/viewArCardTemporary.jsp (+ addArCardTemporaryInfoView.jsp,
 * updateArCardTemporaryView.jsp) dự án Hanwha_HAE cũ.
 * - Lọc: mã/tên NV, trạng thái sử dụng.
 * - Thêm: chọn nhân viên + mã thẻ + trạng thái; thẻ đang dùng của NV đó tự chuyển
 *   về "không sử dụng" (giống bản cũ).
 * - Sửa: chỉ đổi trạng thái sử dụng.
 * Tái sử dụng: tìm nhân viên qua SstOtApplyService#searchEmployees.
 */
@Component({
  selector: 'app-card-temporary',
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
  templateUrl: './card-temporary.component.html',
  styleUrl: './card-temporary.component.scss',
})
export class CardTemporaryComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
  protected readonly defaultPageSize = TABLE_DEFAULT_PAGE_SIZE;

  private readonly service = inject(CardTemporaryService);
  private readonly empService = inject(SstOtApplyService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  // ── Bộ lọc ───────────────────────────────────────────────────────────
  protected readonly keyword = signal('');
  protected readonly filterActivity = signal<string>('');

  // ── Lưới dữ liệu ─────────────────────────────────────────────────────
  protected readonly listLoading = signal(false);
  protected readonly rows = signal<CardTemporaryRow[]>([]);

  // ── Modal thêm / sửa ─────────────────────────────────────────────────
  protected readonly formVisible = signal(false);
  protected readonly formSaving = signal(false);
  /** null = thêm mới, có giá trị = đang sửa dòng đó */
  protected readonly editingRow = signal<CardTemporaryRow | null>(null);
  protected readonly formPersonId = signal<string | null>(null);
  protected readonly formCardNo = signal('');
  protected readonly formActivity = signal<string>('1');

  protected readonly empSearchResults = signal<EmployeeSearchResult[]>([]);
  protected readonly empSearching = signal(false);
  private empSearchTimer: ReturnType<typeof setTimeout> | undefined;

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.search();
  }

  async search(): Promise<void> {
    this.listLoading.set(true);
    try {
      const rows = await this.service.getList({
        keyword: this.keyword().trim() || undefined,
        activity: this.filterActivity() || undefined,
      });
      this.rows.set(rows);
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.listLoading.set(false);
    }
  }

  clearSearch(): void {
    this.keyword.set('');
    this.filterActivity.set('');
    this.search();
  }

  activityLabel(value: string | undefined): string {
    return String(value) === '1'
      ? this.i18n.t('common.active', 'Đang hoạt động')
      : this.i18n.t('common.inactive', 'Ngừng hoạt động');
  }

  // ── Thêm / Sửa ───────────────────────────────────────────────────────
  openAdd(): void {
    this.editingRow.set(null);
    this.formPersonId.set(null);
    this.formCardNo.set('');
    this.formActivity.set('1');
    this.empSearchResults.set([]);
    this.formVisible.set(true);
  }

  openEdit(row: CardTemporaryRow): void {
    this.editingRow.set(row);
    this.formPersonId.set(row.personId ?? null);
    this.formCardNo.set(row.cardNo ?? '');
    this.formActivity.set(String(row.activity ?? '1'));
    this.formVisible.set(true);
  }

  closeForm(): void {
    this.formVisible.set(false);
  }

  onEmpSearch(keyword: string): void {
    if (this.empSearchTimer) {
      clearTimeout(this.empSearchTimer);
    }
    const kw = keyword.trim();
    if (!kw) {
      this.empSearchResults.set([]);
      return;
    }
    this.empSearchTimer = setTimeout(async () => {
      this.empSearching.set(true);
      try {
        this.empSearchResults.set(await this.empService.searchEmployees(kw));
      } catch {
        this.empSearchResults.set([]);
      } finally {
        this.empSearching.set(false);
      }
    }, 300);
  }

  async submitForm(): Promise<void> {
    const editing = this.editingRow();
    if (!editing && !this.formPersonId()) {
      this.message.error(this.i18n.t('addShift.msg.selectEmployee', 'Vui lòng chọn nhân viên'));
      return;
    }
    this.formSaving.set(true);
    try {
      const res = editing
        ? await this.service.update({ recordNo: editing.recordNo, activity: this.formActivity() })
        : await this.service.add({
            personId: this.formPersonId() ?? undefined,
            cardNo: this.formCardNo().trim() || undefined,
            activity: this.formActivity(),
          });
      if (res.success) {
        this.message.success(this.i18n.t(res.messageKey ?? 'common.saveSuccess', 'Lưu thành công!'));
        this.formVisible.set(false);
        await this.search();
      } else {
        this.message.error(res.message || this.i18n.t(res.messageKey ?? 'common.saveFail', 'Lưu thất bại!'));
      }
    } catch {
      this.message.error(this.i18n.t('common.saveFail', 'Lưu thất bại!'));
    } finally {
      this.formSaving.set(false);
    }
  }
}
