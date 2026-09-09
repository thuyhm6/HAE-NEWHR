import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { I18nService } from '../../../i18n/i18n.service';
import {
  ArItemOption,
  ArItemParamListService,
  ArItemParamRow,
  ArItemParamSavePayload,
  CompanyOption,
} from './ar-item-param-list.service';

/**
 * CRUD phẳng "Thông số Hạng mục chấm công" - port lại từ
 * ar/attendanceSettings/viewArItemParamList.html (đã xoá). Danh sách nhỏ
 * (cấu hình hệ thống) nên dùng nz-table phân trang phía client. Các cờ 1/0
 * (cardFlag, cardFromFlag, cardToFlag, applyFlag, applyCardPriority) dùng
 * `nz-switch` thay select 2 lựa chọn của bản gốc, cùng ý nghĩa nghiệp vụ.
 */
@Component({
  selector: 'app-ar-item-param-list',
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
    NzInputNumberModule,
    NzModalModule,
    NzSelectModule,
    NzSwitchModule,
    NzTableModule,
    NzTagModule,
  ],
  templateUrl: './ar-item-param-list.component.html',
  styleUrl: './ar-item-param-list.component.scss',
})
export class ArItemParamListComponent implements OnInit {
  protected readonly service = inject(ArItemParamListService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly searchCpnyId = signal<string | null>(null);
  protected readonly searchItemNo = signal('');

  protected readonly companyOptions = signal<CompanyOption[]>([]);
  protected readonly itemOptions = signal<ArItemOption[]>([]);

  protected readonly listLoading = signal(false);
  protected readonly rows = signal<ArItemParamRow[]>([]);

  protected readonly modalVisible = signal(false);
  protected readonly modalIsEdit = signal(false);
  protected readonly savingRecord = signal(false);

  protected readonly formArParamNo = signal<string | null>(null);
  protected readonly formCpnyId = signal<string | null>(null);
  protected readonly formItemNo = signal<string | null>(null);
  protected readonly formGroupNo = signal('');
  protected readonly formUnit = signal('');
  protected readonly formUnitValue = signal<number | null>(null);
  protected readonly formMinValue = signal<number | null>(null);
  protected readonly formMaxValue = signal<number | null>(null);
  protected readonly formDependItem = signal('');
  protected readonly formReplaceItem = signal('');
  protected readonly formCardFlag = signal(true);
  protected readonly formCardFromFlag = signal(true);
  protected readonly formCardToFlag = signal(true);
  protected readonly formCardFromOffset = signal<number | null>(0);
  protected readonly formCardFromRelation = signal('');
  protected readonly formCardToOffset = signal<number | null>(0);
  protected readonly formCardToRelation = signal('');
  protected readonly formApplyFlag = signal(true);
  protected readonly formApplyType = signal('');
  protected readonly formApplyFulldayValue = signal<number | null>(null);
  protected readonly formApplyCardPriority = signal(true);
  protected readonly formDateType = signal('');
  protected readonly formDetailContent = signal('');
  protected readonly formOrderno = signal<number | null>(0);
  protected readonly formActive = signal(true);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      const [companies, items] = await Promise.all([this.service.getCompanyList(), this.service.getArItemList()]);
      this.companyOptions.set(companies);
      this.itemOptions.set(items);
    } catch {
      this.companyOptions.set([]);
      this.itemOptions.set([]);
    }
    await this.search();
  }

  itemLabel(item: ArItemOption): string {
    return item.nameVi || item.shortName || item.itemNo;
  }

  async search(): Promise<void> {
    this.listLoading.set(true);
    try {
      this.rows.set(await this.service.getList(this.searchCpnyId() ?? undefined, this.searchItemNo() || undefined));
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.listLoading.set(false);
    }
  }

  clearSearch(): void {
    this.searchCpnyId.set(null);
    this.searchItemNo.set('');
    this.search();
  }

  openAddModal(): void {
    this.modalIsEdit.set(false);
    this.formArParamNo.set(null);
    this.formCpnyId.set(null);
    this.formItemNo.set(null);
    this.formGroupNo.set('');
    this.formUnit.set('');
    this.formUnitValue.set(null);
    this.formMinValue.set(null);
    this.formMaxValue.set(null);
    this.formDependItem.set('');
    this.formReplaceItem.set('');
    this.formCardFlag.set(true);
    this.formCardFromFlag.set(true);
    this.formCardToFlag.set(true);
    this.formCardFromOffset.set(0);
    this.formCardFromRelation.set('');
    this.formCardToOffset.set(0);
    this.formCardToRelation.set('');
    this.formApplyFlag.set(true);
    this.formApplyType.set('');
    this.formApplyFulldayValue.set(null);
    this.formApplyCardPriority.set(true);
    this.formDateType.set('');
    this.formDetailContent.set('');
    this.formOrderno.set(0);
    this.formActive.set(true);
    this.modalVisible.set(true);
  }

  async openEditModal(arParamNo: string | undefined): Promise<void> {
    if (!arParamNo) return;
    try {
      const d = await this.service.getById(arParamNo);
      this.modalIsEdit.set(true);
      this.formArParamNo.set(d.arParamNo ?? arParamNo);
      this.formCpnyId.set(d.cpnyId ?? null);
      this.formItemNo.set(d.itemNo ?? null);
      this.formGroupNo.set(d.groupNo ?? '');
      this.formUnit.set(d.unit ?? '');
      this.formUnitValue.set(d.unitValue ?? null);
      this.formMinValue.set(d.minValue ?? null);
      this.formMaxValue.set(d.maxValue ?? null);
      this.formDependItem.set(d.dependItem ?? '');
      this.formReplaceItem.set(d.replaceItem ?? '');
      this.formCardFlag.set((d.cardFlag ?? 1) === 1);
      this.formCardFromFlag.set((d.cardFromFlag ?? 1) === 1);
      this.formCardToFlag.set((d.cardToFlag ?? 1) === 1);
      this.formCardFromOffset.set(d.cardFromOffset ?? 0);
      this.formCardFromRelation.set(d.cardFromRelation ?? '');
      this.formCardToOffset.set(d.cardToOffset ?? 0);
      this.formCardToRelation.set(d.cardToRelation ?? '');
      this.formApplyFlag.set((d.applyFlag ?? 1) === 1);
      this.formApplyType.set(d.applyType ?? '');
      this.formApplyFulldayValue.set(d.applyFulldayValue ?? null);
      this.formApplyCardPriority.set((d.applyCardPriority ?? 1) === 1);
      this.formDateType.set(d.dateType ?? '');
      this.formDetailContent.set(d.detailContent ?? '');
      this.formOrderno.set(d.orderno ?? 0);
      this.formActive.set((d.activity ?? 1) === 1);
      this.modalVisible.set(true);
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  closeModal(): void {
    this.modalVisible.set(false);
  }

  async saveRecord(): Promise<void> {
    const cpnyId = this.formCpnyId();
    const itemNo = this.formItemNo();
    if (!cpnyId) {
      this.message.warning(this.i18n.t('ar.viewArItemParam.msg.selectCompany', 'Vui lòng chọn Công ty'));
      return;
    }
    if (!itemNo) {
      this.message.warning(this.i18n.t('ar.viewArItemParam.msg.selectItem', 'Vui lòng chọn Hạng mục'));
      return;
    }
    const payload: ArItemParamSavePayload = {
      arParamNo: this.formArParamNo(),
      cpnyId,
      itemNo,
      groupNo: this.formGroupNo().trim() || null,
      unit: this.formUnit().trim() || null,
      unitValue: this.formUnitValue(),
      minValue: this.formMinValue(),
      maxValue: this.formMaxValue(),
      dependItem: this.formDependItem().trim() || null,
      replaceItem: this.formReplaceItem().trim() || null,
      cardFlag: this.formCardFlag() ? 1 : 0,
      cardFromFlag: this.formCardFromFlag() ? 1 : 0,
      cardFromOffset: this.formCardFromOffset(),
      cardFromRelation: this.formCardFromRelation().trim() || null,
      cardToFlag: this.formCardToFlag() ? 1 : 0,
      cardToOffset: this.formCardToOffset(),
      cardToRelation: this.formCardToRelation().trim() || null,
      applyFlag: this.formApplyFlag() ? 1 : 0,
      applyType: this.formApplyType().trim() || null,
      applyFulldayValue: this.formApplyFulldayValue(),
      applyCardPriority: this.formApplyCardPriority() ? 1 : 0,
      dateType: this.formDateType().trim() || null,
      detailContent: this.formDetailContent().trim() || null,
      orderno: this.formOrderno() ?? 0,
      activity: this.formActive() ? 1 : 0,
    };
    this.savingRecord.set(true);
    try {
      const res = await this.service.save(payload);
      if (res.success) {
        this.message.success(res.message || this.i18n.t('common.saveSuccess', 'Lưu thành công'));
        this.modalVisible.set(false);
        await this.search();
      } else {
        this.message.error(res.error || this.i18n.t('common.saveFailed', 'Lưu thất bại.'));
      }
    } catch {
      this.message.error(this.i18n.t('common.saveFailed', 'Lưu thất bại.'));
    } finally {
      this.savingRecord.set(false);
    }
  }

  deleteOne(arParamNo: string | undefined): void {
    if (!arParamNo) return;
    this.modal.confirm({
      nzTitle: this.i18n.t('ar.viewArItemParam.confirm.delete', 'Bạn có chắc chắn muốn xóa bản ghi này?'),
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          const res = await this.service.delete(arParamNo);
          if (res.success) {
            await this.search();
          } else {
            this.message.error(res.error || this.i18n.t('common.deleteFailed', 'Xóa thất bại.'));
          }
        } catch {
          this.message.error(this.i18n.t('common.deleteFailed', 'Xóa thất bại.'));
        }
      },
    });
  }
}
