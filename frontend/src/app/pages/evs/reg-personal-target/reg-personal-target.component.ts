import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import { EvsItemSst, EvsPersonalTargetInfo, EvsResumeOption, RegPersonalTargetService } from './reg-personal-target.service';

const EDITABLE_ACTIVITIES = ['14015362', '14015354'];

/**
 * Đăng ký mục tiêu cá nhân (viewRegPersonalTarget) - port lại từ
 * evs/manage/viewRegPersonalTarget.html (đã xoá). Xem ghi chú modal-CRUD
 * và textarea thay Quill trong reg-personal-target.service.ts.
 */
@Component({
  selector: 'app-reg-personal-target',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzModalModule,
    NzSelectModule,
    NzTableModule,
  ],
  templateUrl: './reg-personal-target.component.html',
  styleUrl: './reg-personal-target.component.scss',
})
export class RegPersonalTargetComponent implements OnInit {
  private readonly service = inject(RegPersonalTargetService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  private readonly route = inject(ActivatedRoute);
  protected readonly i18n = inject(I18nService);

  private evsType = '';

  protected readonly hasAnyResume = signal(true);
  protected readonly resumeOptions = signal<EvsResumeOption[]>([]);
  protected readonly searchResumeSeq = signal<string | null>(null);

  protected readonly info = signal<EvsPersonalTargetInfo | null>(null);
  protected readonly items = signal<EvsItemSst[]>([]);
  protected readonly loading = signal(false);
  protected readonly executing = signal(false);

  protected readonly editable = computed(() => {
    const act = this.info()?.activity;
    return !!act && EDITABLE_ACTIVITIES.includes(String(act));
  });

  protected readonly strategicItems = computed(() => this.items().filter((r) => String(r.itemType) === '1'));
  protected readonly operationItems = computed(() => this.items().filter((r) => String(r.itemType) !== '1'));
  protected readonly strategicTotal = computed(() => this.sumScore(this.strategicItems()));
  protected readonly operationTotal = computed(() => this.sumScore(this.operationItems()));
  protected readonly grandTotal = computed(() => Math.round((this.strategicTotal() + this.operationTotal()) * 100) / 100);

  // ── Modal Thêm/Sửa mục tiêu ──
  protected readonly itemModalVisible = signal(false);
  protected readonly itemSaving = signal(false);
  protected readonly formSeq = signal('');
  protected readonly formSection = signal<'strategic' | 'operation'>('operation');
  protected readonly formItemName = signal('');
  protected readonly formItemContent = signal('');
  protected readonly formItemScore = signal<number | null>(null);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    this.evsType = this.route.snapshot.queryParamMap.get('evsType') || '';
    try {
      const resumeList = await this.service.getResumeOptions(this.evsType);
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

  private sumScore(rows: EvsItemSst[]): number {
    const total = rows.reduce((acc, r) => acc + (Number(r.itemScore) || 0), 0);
    return Math.round(total * 100) / 100;
  }

  async search(): Promise<void> {
    const resumeSeq = this.searchResumeSeq();
    if (!resumeSeq) return;
    this.loading.set(true);
    try {
      const data = await this.service.getObjectInfo(resumeSeq, this.evsType);
      if (!data?.seq) {
        this.info.set(null);
        this.items.set([]);
        this.message.warning(this.i18n.t('evs.viewRegPersonalTarget.msg.noData', 'Không tìm thấy thông tin. Vui lòng kiểm tra lại đợt đánh giá.'));
        return;
      }
      this.info.set(data);
      await this.reloadItems();
    } catch {
      this.info.set(null);
      this.items.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  private async reloadItems(): Promise<void> {
    const seq = this.info()?.seq;
    if (!seq) return;
    this.items.set(await this.service.getItemList(seq));
  }

  openAddModal(section: 'strategic' | 'operation'): void {
    this.formSeq.set('');
    this.formSection.set(section);
    this.formItemName.set('');
    this.formItemContent.set('');
    this.formItemScore.set(null);
    this.itemModalVisible.set(true);
  }

  openEditModal(row: EvsItemSst): void {
    this.formSeq.set(row.seq ?? '');
    this.formSection.set(String(row.itemType) === '1' ? 'strategic' : 'operation');
    this.formItemName.set(row.itemName ?? '');
    this.formItemContent.set(row.itemContent ?? '');
    this.formItemScore.set(row.itemScore != null ? Number(row.itemScore) : null);
    this.itemModalVisible.set(true);
  }

  async saveItemModal(): Promise<void> {
    const evsObjectSeq = this.info()?.seq;
    const itemName = this.formItemName().trim();
    if (!evsObjectSeq) return;
    if (!itemName) {
      this.message.warning(this.i18n.t('evs.viewRegPersonalTarget.msg.itemNameRequired', 'Vui lòng nhập Hạng mục đánh giá.'));
      return;
    }
    if (!this.formItemContent().trim()) {
      this.message.warning(this.i18n.t('evs.viewRegPersonalTarget.msg.itemContentRequired', 'Vui lòng nhập Nội dung mục tiêu.'));
      return;
    }
    const score = this.formItemScore() ?? 0;
    if (score <= 0) {
      this.message.warning(this.i18n.t('evs.viewRegPersonalTarget.msg.itemScoreZero', 'Tỷ lệ (%) phải lớn hơn 0.'));
      return;
    }
    this.itemSaving.set(true);
    try {
      const res = await this.service.saveItem({
        seq: this.formSeq() || undefined,
        evsObjectSeq,
        resumeSeq: this.searchResumeSeq() ?? undefined,
        itemName,
        itemContent: this.formItemContent().trim(),
        itemType: this.formSection() === 'strategic' ? '1' : undefined,
        itemScore: String(score),
        flag: '0',
      });
      if (res.success !== false) {
        this.itemModalVisible.set(false);
        await this.reloadItems();
      } else {
        this.message.error(res.message || this.i18n.t('evs.viewRegPersonalTarget.msg.saveFail', 'Lỗi khi lưu dữ liệu. Vui lòng thử lại.'));
      }
    } catch {
      this.message.error(this.i18n.t('evs.viewRegPersonalTarget.msg.saveFail', 'Lỗi khi lưu dữ liệu. Vui lòng thử lại.'));
    } finally {
      this.itemSaving.set(false);
    }
  }

  deleteItem(row: EvsItemSst): void {
    if (!row.seq) return;
    this.modal.confirm({
      nzTitle: this.i18n.t('evs.viewRegPersonalTarget.msg.confirmDelete', 'Bạn có chắc muốn xóa mục tiêu này không?'),
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          const res = await this.service.deleteItem(row.seq!);
          if (res.success !== false) {
            await this.reloadItems();
          } else {
            this.message.error(res.message || this.i18n.t('evs.viewRegPersonalTarget.msg.deleteFail', 'Lỗi khi xóa dữ liệu. Vui lòng thử lại.'));
          }
        } catch {
          this.message.error(this.i18n.t('evs.viewRegPersonalTarget.msg.deleteFail', 'Lỗi khi xóa dữ liệu. Vui lòng thử lại.'));
        }
      },
    });
  }

  execute(): void {
    const seq = this.info()?.seq;
    if (!seq) return;
    if (this.strategicTotal() > 40) {
      this.message.warning(this.i18n.t('evs.viewRegPersonalTarget.msg.strategicOver40', 'Tổng tỷ lệ (%) của Mục tiêu chiến lược không được vượt quá 40.'));
      return;
    }
    if (this.grandTotal() !== 100) {
      this.message.warning(`${this.i18n.t('evs.viewRegPersonalTarget.msg.totalNot100', 'Tổng tỷ lệ (%) phải bằng 100. Hiện tại:')} ${this.grandTotal()}`);
      return;
    }
    if (this.items().some((item) => (Number(item.itemScore) || 0) <= 0)) {
      this.message.warning(this.i18n.t('evs.viewRegPersonalTarget.msg.itemScoreZero', 'Tỷ lệ (%) phải lớn hơn 0.'));
      return;
    }
    this.modal.confirm({
      nzTitle: this.i18n.t('evs.viewRegPersonalTarget.msg.confirmExecute', 'Bạn có chắc muốn thực hiện? Dữ liệu sẽ được gửi đi xác nhận.'),
      nzOnOk: async () => {
        this.executing.set(true);
        try {
          const res = await this.service.execute(seq);
          if (res.success) {
            this.message.success(this.i18n.t('evs.viewRegPersonalTarget.msg.executeSuccess', 'Thực hiện thành công!'));
            await this.search();
          } else {
            this.message.error(res.message || this.i18n.t('evs.viewRegPersonalTarget.msg.saveFail', 'Lỗi khi lưu dữ liệu. Vui lòng thử lại.'));
          }
        } catch {
          this.message.error(this.i18n.t('evs.viewRegPersonalTarget.msg.saveFail', 'Lỗi khi lưu dữ liệu. Vui lòng thử lại.'));
        } finally {
          this.executing.set(false);
        }
      },
    });
  }
}
