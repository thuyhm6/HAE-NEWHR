import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { I18nService } from '../../../i18n/i18n.service';
import { ApplyDetailModalComponent } from '../../../shared/apply-detail-modal/apply-detail-modal.component';
import { NoticeedEmailListService, NoticeedEmailRow } from './noticeed-email-list.service';

const STATUS_COLOR: Record<string, string> = {
  '14014309': 'success',
  '14014310': 'error',
  '14014308': 'warning',
};

/**
 * Danh sách đơn theo trạng thái email/EagleOffice, chỉ xem - dùng chung cho 2
 * trang gần như trùng lặp 100%: ess/infoApply/viewNoticeedEmail.html (đã
 * thông báo) và ess/infoApply/viewApprovaledEmail.html (đã duyệt), cả 2 đã
 * xoá, chỉ khác URL API (chọn qua route data `apiBase` - xem app.routes.ts).
 * Nội dung i18n 2 trang gốc giống hệt nhau (namespace `vne.*`/`vaed.*` cùng
 * giá trị dịch) nên dùng chung `vne.*` cho cả 2 route thay vì tách riêng.
 * Dùng nz-table thay cho bảng dựng tay bằng jQuery. Modal chi tiết tái sử
 * dụng ApplyDetailModalComponent (3 instance, mỗi loại đơn một variant) thay
 * vì viết lại 3 fragment gốc đã port ở Batch A - chọn đúng modal dựa vào
 * chuỗi `affirmUrl` trả về từ API, giống hệt logic `vneOpenDetailModal`/
 * `vaedOpenDetailModal` trong bản gốc. Gọi lại nguyên vẹn API JSON sẵn có.
 */
@Component({
  selector: 'app-noticeed-email-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ApplyDetailModalComponent,
    NzButtonModule,
    NzCardModule,
    NzFormModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzSelectModule,
    NzTableModule,
    NzTagModule,
  ],
  templateUrl: './noticeed-email-list.component.html',
  styleUrl: './noticeed-email-list.component.scss',
})
export class NoticeedEmailListComponent implements OnInit {
  @ViewChild('otModal') otModal!: ApplyDetailModalComponent;
  @ViewChild('leaveModal') leaveModal!: ApplyDetailModalComponent;
  @ViewChild('attendanceExModal') attendanceExModal!: ApplyDetailModalComponent;

  private readonly service = inject(NoticeedEmailListService);
  private readonly message = inject(NzMessageService);
  private readonly route = inject(ActivatedRoute);
  protected readonly i18n = inject(I18nService);

  protected readonly titleSearch = signal('');
  protected readonly applyTypeSearch = signal('');

  protected readonly loading = signal(false);
  protected readonly allRows = signal<NoticeedEmailRow[]>([]);
  protected readonly filteredRows = signal<NoticeedEmailRow[]>([]);

  private apiBase = '';

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    this.apiBase = this.route.snapshot.data['apiBase'];
    const typeCode = this.route.snapshot.queryParamMap.get('applyTypeCode');
    if (typeCode) {
      this.applyTypeSearch.set(typeCode);
    }
    await this.loadList();
  }

  private async loadList(): Promise<void> {
    this.loading.set(true);
    try {
      this.allRows.set(await this.service.getList(this.apiBase));
      this.applyFilter();
    } catch {
      this.message.error(this.i18n.t('vne.msg.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }

  search(): void {
    this.applyFilter();
  }

  private applyFilter(): void {
    const typeFilter = this.applyTypeSearch();
    const titleFilter = this.titleSearch().trim().toLowerCase();
    this.filteredRows.set(
      this.allRows().filter((row) => {
        const matchType = !typeFilter || row.applyTypeCode === typeFilter;
        const matchTitle = !titleFilter || (row.title ?? '').toLowerCase().includes(titleFilter);
        return matchType && matchTitle;
      }),
    );
  }

  statusColor(applyAffirmFlag?: string): string {
    return (applyAffirmFlag && STATUS_COLOR[applyAffirmFlag]) || 'default';
  }

  openDetail(row: NoticeedEmailRow): void {
    const url = row.affirmUrl ?? '';
    if (url.includes('viewApprovaledOt')) {
      this.otModal.open(row.applyNo, row.applyType, null);
    } else if (url.includes('viewApprovaledLeave')) {
      this.leaveModal.open(row.applyNo, row.applyType, null);
    } else if (url.includes('viewAttendanceEx')) {
      this.attendanceExModal.open(row.applyNo, row.applyType, null);
    }
  }
}
