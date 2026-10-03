import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

import { I18nService } from '../../../i18n/i18n.service';
import { EvsItem, EvsItemPanelService, EvsItemParam, EvsResumeOption, SyCodeOption } from './evs-item-panel.service';

import { TABLE_PAGE_SIZE_OPTIONS } from '../../../core/config/table-pagination.config';
const GROUP_NO_PARENT = '14015376';

/**
 * Chỉ tiêu đánh giá (viewEvsItemPanel) - port lại từ
 * evs/manage/viewEvsItemPanel.html (đã xoá). Xem ghi chú modal-CRUD và nút
 * tìm nhóm chưa triển khai trong evs-item-panel.service.ts.
 */
@Component({
  selector: 'app-evs-item-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzModalModule,
    NzSelectModule,
    NzTableModule,
    NzTabsModule,
  ],
  templateUrl: './evs-item-panel.component.html',
  styleUrl: './evs-item-panel.component.scss',
})
export class EvsItemPanelComponent implements OnInit {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;

  private readonly service = inject(EvsItemPanelService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  private readonly route = inject(ActivatedRoute);
  protected readonly i18n = inject(I18nService);

  private evsType = '';

  protected readonly resumeOptions = signal<EvsResumeOption[]>([]);
  protected readonly searchResumeSeq = signal<string | null>(null);
  protected readonly searchGroupNo = signal<string | null>(null);
  protected readonly activeTabIndex = signal(0);

  protected readonly groupNoOptions = signal<SyCodeOption[]>([]);
  protected readonly evsGroupOptions = signal<SyCodeOption[]>([]);
  protected readonly evsOccGroupOptions = signal<SyCodeOption[]>([]);

  protected readonly itemRows = signal<EvsItem[]>([]);
  protected readonly paramRows = signal<EvsItemParam[]>([]);
  protected readonly tabLoading = signal(false);

  protected readonly criteriaGroupOptions = computed(() => {
    const seen = new Map<string, string>();
    this.itemRows().forEach((r) => {
      if (r.groupNo && !seen.has(r.groupNo)) seen.set(r.groupNo, r.groupName || r.groupNo);
    });
    return Array.from(seen.entries()).map(([codeNo, codeName]) => ({ codeNo, codeName }));
  });

  protected readonly itemCodeOptions = computed(() => this.itemRows().map((r) => ({ codeNo: r.itemCode!, codeName: `${r.itemCode} - ${r.itemName || ''}` })));

  // ── Modal Chỉ tiêu đánh giá ──
  protected readonly itemModalVisible = signal(false);
  protected readonly itemSaving = signal(false);
  protected readonly formItemSeq = signal('');
  protected readonly formItemGroupNo = signal<string | null>(null);
  protected readonly formItemCode = signal('');
  protected readonly formItemName = signal('');
  protected readonly formItemNameKo = signal('');
  protected readonly formItemRemark = signal('');
  protected readonly formItemRemarkKo = signal('');

  // ── Modal Hạng mục chỉ tiêu chỉ định ──
  protected readonly paramModalVisible = signal(false);
  protected readonly paramSaving = signal(false);
  protected readonly formParamSeq = signal('');
  protected readonly formParamItemCode = signal<string | null>(null);
  protected readonly formParamEvsGroup = signal<string | null>(null);
  protected readonly formParamEvsOccGroup = signal<string | null>(null);
  protected readonly formParamItemScore = signal<number | null>(null);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    this.evsType = this.route.snapshot.queryParamMap.get('evsType') || '';
    try {
      this.groupNoOptions.set(await this.service.getCodeList(GROUP_NO_PARENT));
      const resumeList = await this.service.getResumeOptions(this.evsType);
      this.resumeOptions.set(resumeList);
      if (resumeList.length) {
        this.searchResumeSeq.set(resumeList[0].seq ?? null);
        await this.search();
      }
    } catch {
      // im lặng bỏ qua - danh sách tùy chọn trống không chặn chức năng chính
    }
  }

  notImplemented(): void {
    this.message.info(this.i18n.t('evs.manage.viewEvsItemPanel.msg.notImplemented', 'Chức năng tìm kiếm chưa được triển khai.'));
  }

  async search(): Promise<void> {
    const resumeSeq = this.searchResumeSeq();
    if (!resumeSeq) return;
    this.tabLoading.set(true);
    try {
      const [items, params, groupOpts, occGroupOpts] = await Promise.all([
        this.service.getItemList(resumeSeq, this.searchGroupNo() ?? undefined),
        this.service.getItemParamList(resumeSeq, this.searchGroupNo() ?? undefined),
        this.service.getEvsParamOptions(resumeSeq, 'GROUP'),
        this.service.getEvsParamOptions(resumeSeq, 'FAMILY'),
      ]);
      this.itemRows.set(items);
      this.paramRows.set(params);
      this.evsGroupOptions.set(groupOpts);
      this.evsOccGroupOptions.set(occGroupOpts);
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.tabLoading.set(false);
    }
  }

  private async reloadItems(): Promise<void> {
    const resumeSeq = this.searchResumeSeq();
    if (!resumeSeq) return;
    this.itemRows.set(await this.service.getItemList(resumeSeq, this.searchGroupNo() ?? undefined));
  }

  private async reloadParams(): Promise<void> {
    const resumeSeq = this.searchResumeSeq();
    if (!resumeSeq) return;
    this.paramRows.set(await this.service.getItemParamList(resumeSeq, this.searchGroupNo() ?? undefined));
  }

  // ── Chỉ tiêu đánh giá ──
  openItemAddModal(): void {
    this.formItemSeq.set('');
    this.formItemGroupNo.set(null);
    this.formItemCode.set('');
    this.formItemName.set('');
    this.formItemNameKo.set('');
    this.formItemRemark.set('');
    this.formItemRemarkKo.set('');
    this.itemModalVisible.set(true);
  }

  openItemEditModal(row: EvsItem): void {
    this.formItemSeq.set(row.seq ?? '');
    this.formItemGroupNo.set(row.groupNo ?? null);
    this.formItemCode.set(row.itemCode ?? '');
    this.formItemName.set(row.itemName ?? '');
    this.formItemNameKo.set(row.itemNameKo ?? '');
    this.formItemRemark.set(row.remark ?? '');
    this.formItemRemarkKo.set(row.remarkKo ?? '');
    this.itemModalVisible.set(true);
  }

  async saveItem(): Promise<void> {
    const resumeSeq = this.searchResumeSeq();
    const itemCode = this.formItemCode().trim();
    if (!resumeSeq || !itemCode) return;
    this.itemSaving.set(true);
    try {
      await this.service.saveItem({
        seq: this.formItemSeq() || undefined,
        resumeSeq,
        groupNo: this.formItemGroupNo() ?? undefined,
        itemCode,
        itemName: this.formItemName().trim() || undefined,
        itemNameKo: this.formItemNameKo().trim() || undefined,
        remark: this.formItemRemark() || undefined,
        remarkKo: this.formItemRemarkKo() || undefined,
      });
      this.itemModalVisible.set(false);
      await this.reloadItems();
    } catch {
      this.message.error(this.i18n.t('evsParam.js.saveError', 'Lỗi khi lưu dữ liệu. Vui lòng thử lại.'));
    } finally {
      this.itemSaving.set(false);
    }
  }

  deleteItem(row: EvsItem): void {
    if (!row.seq) return;
    this.modal.confirm({
      nzTitle: this.i18n.t('evsParam.modal.deleteTitle', 'Xác nhận xóa'),
      nzOkDanger: true,
      nzOnOk: async () => {
        await this.service.deleteItem(row.seq!);
        await this.reloadItems();
      },
    });
  }

  // ── Hạng mục chỉ tiêu chỉ định ──
  openParamAddModal(): void {
    this.formParamSeq.set('');
    this.formParamItemCode.set(null);
    this.formParamEvsGroup.set(null);
    this.formParamEvsOccGroup.set(null);
    this.formParamItemScore.set(null);
    this.paramModalVisible.set(true);
  }

  openParamEditModal(row: EvsItemParam): void {
    this.formParamSeq.set(row.seq ?? '');
    this.formParamItemCode.set(row.itemCode ?? null);
    this.formParamEvsGroup.set(row.evsGroup ?? null);
    this.formParamEvsOccGroup.set(row.evsOccGroup ?? null);
    this.formParamItemScore.set(row.itemScore != null ? Number(row.itemScore) : null);
    this.paramModalVisible.set(true);
  }

  async saveParam(): Promise<void> {
    const resumeSeq = this.searchResumeSeq();
    if (!resumeSeq || !this.formParamItemCode()) return;
    this.paramSaving.set(true);
    try {
      await this.service.saveItemParam({
        seq: this.formParamSeq() || undefined,
        resumeSeq,
        itemCode: this.formParamItemCode() ?? undefined,
        evsGroup: this.formParamEvsGroup() ?? undefined,
        evsOccGroup: this.formParamEvsOccGroup() ?? undefined,
        itemScore: this.formParamItemScore() != null ? String(this.formParamItemScore()) : undefined,
      });
      this.paramModalVisible.set(false);
      await this.reloadParams();
    } catch {
      this.message.error(this.i18n.t('evsParam.js.saveError', 'Lỗi khi lưu dữ liệu. Vui lòng thử lại.'));
    } finally {
      this.paramSaving.set(false);
    }
  }

  deleteParam(row: EvsItemParam): void {
    if (!row.seq) return;
    this.modal.confirm({
      nzTitle: this.i18n.t('evsParam.modal.deleteTitle', 'Xác nhận xóa'),
      nzOkDanger: true,
      nzOnOk: async () => {
        await this.service.deleteItemParam(row.seq!);
        await this.reloadParams();
      },
    });
  }
}
