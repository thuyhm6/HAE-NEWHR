import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import { ConfirmTargetDetail, ConfirmTargetItem, ConfirmTargetRow, ConfirmTargetService } from './confirm-target.service';

import { TABLE_PAGE_SIZE_OPTIONS } from '../../../core/config/table-pagination.config';
export interface ConfirmTargetConfig {
  apiBase: 'confirmTarget1' | 'confirmTarget2';
  i18nPrefix: string;
  confirmActivity: string;
  evsLevel: string;
  /** Nếu có: cấp xác nhận cố định (viewConfirmTarget2 luôn = '2'). Không có: lấy từ query param AFFIRM_LEVEL (viewConfirmTarget1, mặc định '1'). */
  fixedAffirmLevel?: '1' | '2';
}

/**
 * Component dùng chung cho viewConfirmTarget1 và viewConfirmTarget2. Xem ghi
 * chú lý do gộp trong confirm-target.service.ts. Cấu hình truyền qua route
 * `data: { confirmTargetConfig }`.
 */
@Component({
  selector: 'app-confirm-target',
  standalone: true,
  imports: [CommonModule, FormsModule, NzButtonModule, NzIconModule, NzInputModule, NzModalModule, NzSelectModule, NzTableModule],
  templateUrl: './confirm-target.component.html',
  styleUrl: './confirm-target.component.scss',
})
export class ConfirmTargetComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;

  private readonly service = inject(ConfirmTargetService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  private readonly route = inject(ActivatedRoute);
  protected readonly i18n = inject(I18nService);

  private config!: ConfirmTargetConfig;
  private evsType = '';
  protected affirmLevel = '1';

  protected readonly hasAnyResume = signal(true);
  protected readonly resumeOptions = signal<{ seq?: string; resumeName?: string }[]>([]);
  protected readonly searchResumeSeq = signal<string | null>(null);

  protected readonly rows = signal<ConfirmTargetRow[]>([]);
  protected readonly listLoading = signal(false);
  protected readonly recordsTotal = signal(0);
  protected readonly recordsFiltered = signal(0);
  protected readonly pageIndex = signal(1);
  protected readonly pageSize = signal(50);
  protected readonly activeSeq = signal<string | null>(null);

  protected readonly detailVisible = signal(false);
  protected readonly detail = signal<ConfirmTargetDetail | null>(null);
  protected readonly items = signal<ConfirmTargetItem[]>([]);
  protected readonly confirming = signal(false);
  protected readonly affirmComment1 = signal('');
  protected readonly affirmComment2 = signal('');

  protected readonly strategicItems = computed(() => this.items().filter((r) => String(r.itemType) === '1'));
  protected readonly operationItems = computed(() => this.items().filter((r) => String(r.itemType) !== '1'));
  protected readonly strategicTotal = computed(() => this.sumScore(this.strategicItems()));
  protected readonly operationTotal = computed(() => this.sumScore(this.operationItems()));
  protected readonly grandTotal = computed(() => Math.round((this.strategicTotal() + this.operationTotal()) * 100) / 100);

  protected readonly comment1Editable = computed(() => this.affirmLevel === '1');
  protected readonly comment2Editable = computed(() => this.affirmLevel === '2');

  private currentEvsObjectSeq: string | null = null;

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    this.config = this.route.snapshot.data['confirmTargetConfig'] as ConfirmTargetConfig;
    this.evsType = this.route.snapshot.queryParamMap.get('evsType') || '';
    this.affirmLevel = this.config.fixedAffirmLevel ?? this.route.snapshot.queryParamMap.get('AFFIRM_LEVEL') ?? '1';

    try {
      const resumeList = await this.service.getResumeOptions(this.evsType, this.config.evsLevel);
      if (!resumeList.length) {
        this.hasAnyResume.set(false);
        return;
      }
      this.resumeOptions.set(resumeList);
      this.searchResumeSeq.set(resumeList[0].seq ?? null);
      await this.search();
    } catch {
      this.hasAnyResume.set(false);
    }
  }

  private sumScore(rows: ConfirmTargetItem[]): number {
    const total = rows.reduce((acc, r) => acc + (Number(r.itemScore) || 0), 0);
    return Math.round(total * 100) / 100;
  }

  protected t(key: string, fallback: string): string {
    return this.i18n.t(`${this.config.i18nPrefix}.${key}`, fallback);
  }

  protected tc(key: string, fallback: string): string {
    return this.i18n.t(key, fallback);
  }

  async search(): Promise<void> {
    const resumeSeq = this.searchResumeSeq();
    if (!resumeSeq) {
      this.message.warning(this.t('msg.selectEvalFirst', 'Vui lòng chọn tên đánh giá trước.'));
      return;
    }
    this.pageIndex.set(1);
    this.activeSeq.set(null);
    await this.loadList();
  }

  async loadList(): Promise<void> {
    const resumeSeq = this.searchResumeSeq();
    if (!resumeSeq) return;
    this.listLoading.set(true);
    try {
      const start = (this.pageIndex() - 1) * this.pageSize();
      const resp = await this.service.getObjectList(
        this.config.apiBase,
        resumeSeq,
        this.evsType,
        this.affirmLevel,
        this.pageIndex(),
        start,
        this.pageSize(),
      );
      this.recordsTotal.set(resp.recordsTotal || 0);
      this.recordsFiltered.set(resp.data?.length || 0);
      this.rows.set(resp.data || []);
    } catch {
      this.rows.set([]);
      this.recordsTotal.set(0);
      this.recordsFiltered.set(0);
    } finally {
      this.listLoading.set(false);
    }
  }

  onPageIndexChange(index: number): void {
    this.pageIndex.set(index);
    this.loadList();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.pageIndex.set(1);
    this.loadList();
  }

  isConfirmable(row: ConfirmTargetRow): boolean {
    return String(row.activity || '') === this.config.confirmActivity;
  }

  async openDetail(row: ConfirmTargetRow): Promise<void> {
    if (!row.seq || !this.isConfirmable(row)) return;
    this.activeSeq.set(row.seq);
    this.currentEvsObjectSeq = row.seq;
    try {
      const d = await this.service.getObjectInfo(this.config.apiBase, row.seq);
      if (!d?.seq) {
        this.activeSeq.set(null);
        return;
      }
      this.detail.set(d);
      this.affirmComment1.set(d.affirmComment1 || '');
      this.affirmComment2.set(d.affirmComment2 || '');
      this.items.set(await this.service.getItemList(row.seq));
      this.detailVisible.set(true);
    } catch {
      this.activeSeq.set(null);
    }
  }

  closeDetail(): void {
    this.detailVisible.set(false);
    this.activeSeq.set(null);
    this.currentEvsObjectSeq = null;
  }

  protected period(): string {
    const d = this.detail();
    if (!d) return '';
    return (d.evsStartDate || '') + (d.evsEndDate ? '~' + d.evsEndDate : '');
  }

  confirmOrReject(flag: '1' | '0'): void {
    const evsObjectSeq = this.currentEvsObjectSeq;
    if (!evsObjectSeq) {
      this.message.warning(this.t('msg.selectEmployee', 'Vui lòng chọn nhân viên trước.'));
      return;
    }
    const title =
      flag === '1'
        ? this.t('msg.confirmAction', 'Bạn có chắc muốn xác nhận mục tiêu của nhân viên này?')
        : this.t('msg.rejectAction', 'Bạn có chắc muốn từ chối mục tiêu của nhân viên này?');
    this.modal.confirm({
      nzTitle: title,
      nzOnOk: async () => {
        this.confirming.set(true);
        try {
          const affirmComment = this.affirmLevel === '2' ? this.affirmComment2() : this.affirmComment1();
          const res = await this.service.confirm(this.config.apiBase, {
            evsObjectSeq,
            affirmComment,
            affirmLevel: this.affirmLevel,
            flag,
          });
          if (res.success) {
            this.message.success(
              flag === '1' ? this.t('msg.confirmSuccess', 'Xác nhận thành công!') : this.t('msg.rejectSuccess', 'Từ chối thành công!'),
            );
            this.closeDetail();
            await this.loadList();
          } else {
            this.message.error(res.message || this.t('msg.actionFail', 'Lỗi khi thực hiện. Vui lòng thử lại.'));
          }
        } catch {
          this.message.error(this.t('msg.actionFail', 'Lỗi khi thực hiện. Vui lòng thử lại.'));
        } finally {
          this.confirming.set(false);
        }
      },
    });
  }
}
