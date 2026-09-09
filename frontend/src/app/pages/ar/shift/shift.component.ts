import { CommonModule, formatDate } from '@angular/common';
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
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzFormatEmitEvent, NzTreeModule } from 'ng-zorro-antd/tree';
import { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';

import { I18nService } from '../../../i18n/i18n.service';
import {
  ArItemOption,
  ShiftDetailRow,
  ShiftDetailSavePayload,
  ShiftRow,
  ShiftSavePayload,
  ShiftService,
} from './shift.service';

function parseHHmm(value: string | undefined | null): Date | null {
  if (!value) return null;
  const parts = value.split(':');
  if (parts.length < 2) return null;
  const d = new Date();
  d.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
  return d;
}

function formatHHmm(value: Date | null): string | null {
  return value ? formatDate(value, 'HH:mm', 'en-US') : null;
}

/**
 * Quản lý Ca làm việc + Chi tiết tham số ca (master-detail) - port lại từ
 * ar/attendanceSettings/viewShift.html (đã xoá). Cây phẳng bên trái (mỗi ca
 * là 1 node gốc, khớp jsTree `parent: '#'` bản gốc) + toolbar 3 nút
 * Thêm/Sửa/Xóa (thao tác trên node đang chọn, không phải nút trên từng
 * dòng - khớp đúng UX bản gốc). Bảng chi tiết bên phải lọc theo ca đã chọn.
 *
 * Bug có thật đã sửa ở backend (xem ghi chú trong ShiftService): giờ bắt
 * đầu/kết thúc chi tiết ca trước đây không bao giờ lưu được do
 * `LocalDateTime.parse()` áp cho chuỗi "HH:mm".
 */
@Component({
  selector: 'app-shift',
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
    NzTimePickerModule,
    NzTreeModule,
  ],
  templateUrl: './shift.component.html',
  styleUrl: './shift.component.scss',
})
export class ShiftComponent implements OnInit {
  private readonly service = inject(ShiftService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly treeLoading = signal(false);
  protected readonly shiftList = signal<ShiftRow[]>([]);
  protected readonly shiftTreeNodes = signal<NzTreeNodeOptions[]>([]);
  protected readonly searchTreeValue = signal('');
  protected readonly selectedShiftNo = signal<string | null>(null);
  protected readonly selectedShiftLabel = signal<string | null>(null);

  protected readonly itemOptions = signal<ArItemOption[]>([]);

  protected readonly listLoading = signal(false);
  protected readonly rows = signal<ShiftDetailRow[]>([]);

  // --- Modal Ca làm việc (AR_SHIFT010) ---
  protected readonly modalVisible = signal(false);
  protected readonly modalIsEdit = signal(false);
  protected readonly savingRecord = signal(false);
  protected readonly formShiftNo = signal<string | null>(null);
  protected readonly formShiftId = signal('');
  protected readonly formNameVi = signal('');
  protected readonly formNameEn = signal('');
  protected readonly formNameZh = signal('');
  protected readonly formNameKo = signal('');
  protected readonly formShiftShortname = signal('');
  protected readonly formDatatype = signal<number | null>(null);
  protected readonly formDeptDistinguishNo = signal('');
  protected readonly formDeductTime = signal<number | null>(null);
  protected readonly formOtTimeStart = signal('');
  protected readonly formOtAllowance = signal<number | null>(null);
  protected readonly formShiftLength = signal<number | null>(null);
  protected readonly formOrderno = signal<number | null>(0);
  protected readonly formActive = signal(true);

  // --- Modal Chi tiết (AR_SHIFT020) ---
  protected readonly detailModalVisible = signal(false);
  protected readonly detailModalIsEdit = signal(false);
  protected readonly savingDetail = signal(false);
  protected readonly formDetailPkNo = signal<number | null>(null);
  protected readonly formDetailItemNo = signal<string | null>(null);
  protected readonly formDetailBeginDayOffset = signal<number | null>(0);
  protected readonly formDetailFromTime = signal<Date | null>(null);
  protected readonly formDetailEndDayOffset = signal<number | null>(0);
  protected readonly formDetailToTime = signal<Date | null>(null);
  protected readonly formDetailOrderno = signal<number | null>(0);
  protected readonly formDetailActive = signal(true);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    try {
      this.itemOptions.set(await this.service.getItemList());
    } catch {
      this.itemOptions.set([]);
    }
    await this.loadShiftTree();
  }

  itemLabel(item: ArItemOption): string {
    return item.nameVi || item.shortName || item.itemNo;
  }

  async loadShiftTree(): Promise<void> {
    this.treeLoading.set(true);
    try {
      const list = await this.service.getShiftList();
      this.shiftList.set(list);
      this.shiftTreeNodes.set(
        list
          .filter((s) => (s.activity ?? 1) === 1)
          .map((s) => ({ key: s.shiftNo!, title: s.nameVi || s.shiftShortname || s.shiftNo!, isLeaf: true })),
      );
    } catch {
      this.shiftList.set([]);
      this.shiftTreeNodes.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.treeLoading.set(false);
      this.selectedShiftNo.set(null);
      this.selectedShiftLabel.set(null);
      this.rows.set([]);
    }
  }

  onTreeClick(event: NzFormatEmitEvent): void {
    const key = event.node?.key;
    if (!key) return;
    this.selectedShiftNo.set(key);
    const found = this.shiftList().find((s) => s.shiftNo === key);
    this.selectedShiftLabel.set(found ? found.nameVi || found.shiftShortname || found.shiftNo! : key);
    this.loadDetails();
  }

  async loadDetails(): Promise<void> {
    const shiftNo = this.selectedShiftNo();
    if (!shiftNo) {
      this.rows.set([]);
      return;
    }
    this.listLoading.set(true);
    try {
      this.rows.set(await this.service.getShiftDetailList(shiftNo));
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.listLoading.set(false);
    }
  }

  // ==================== AR_SHIFT010 CRUD ====================

  openAddModal(): void {
    this.modalIsEdit.set(false);
    this.formShiftNo.set(null);
    this.formShiftId.set('');
    this.formNameVi.set('');
    this.formNameEn.set('');
    this.formNameZh.set('');
    this.formNameKo.set('');
    this.formShiftShortname.set('');
    this.formDatatype.set(null);
    this.formDeptDistinguishNo.set('');
    this.formDeductTime.set(null);
    this.formOtTimeStart.set('');
    this.formOtAllowance.set(null);
    this.formShiftLength.set(null);
    this.formOrderno.set(0);
    this.formActive.set(true);
    this.modalVisible.set(true);
  }

  async editSelectedShift(): Promise<void> {
    const shiftNo = this.selectedShiftNo();
    if (!shiftNo) {
      this.message.warning(this.i18n.t('ar.viewshift.msg.selectShiftToEdit', 'Vui lòng chọn 1 ca trên cây để sửa.'));
      return;
    }
    try {
      const d = await this.service.getShiftById(shiftNo);
      this.modalIsEdit.set(true);
      this.formShiftNo.set(d.shiftNo ?? shiftNo);
      this.formShiftId.set(d.shiftId ?? '');
      this.formNameVi.set(d.nameVi ?? '');
      this.formNameEn.set(d.nameEn ?? '');
      this.formNameZh.set(d.nameZh ?? '');
      this.formNameKo.set(d.nameKo ?? '');
      this.formShiftShortname.set(d.shiftShortname ?? '');
      this.formDatatype.set(d.datatype ?? null);
      this.formDeptDistinguishNo.set(d.deptDistinguishNo ?? '');
      this.formDeductTime.set(d.deductTime ?? null);
      this.formOtTimeStart.set(d.otTimeStart ?? '');
      this.formOtAllowance.set(d.otAllowance ?? null);
      this.formShiftLength.set(d.shiftLength ?? null);
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

  async saveShift(): Promise<void> {
    if (!this.formNameVi().trim() || !this.formNameEn().trim() || !this.formNameZh().trim() || !this.formNameKo().trim()) {
      this.message.warning(this.i18n.t('ar.viewshift.msg.requiredNames', 'Vui lòng nhập đầy đủ các thông tin bắt buộc (4 Tên)'));
      return;
    }
    const payload: ShiftSavePayload = {
      shiftNo: this.formShiftNo(),
      shiftId: this.formShiftId().trim() || null,
      nameVi: this.formNameVi().trim(),
      nameEn: this.formNameEn().trim(),
      nameZh: this.formNameZh().trim(),
      nameKo: this.formNameKo().trim(),
      shiftShortname: this.formShiftShortname().trim() || null,
      datatype: this.formDatatype(),
      deptDistinguishNo: this.formDeptDistinguishNo().trim() || null,
      deductTime: this.formDeductTime(),
      otTimeStart: this.formOtTimeStart().trim() || null,
      otAllowance: this.formOtAllowance(),
      shiftLength: this.formShiftLength(),
      orderno: this.formOrderno() ?? 0,
      activity: this.formActive() ? 1 : 0,
    };
    this.savingRecord.set(true);
    try {
      const res = await this.service.saveShift(payload);
      if (res.success) {
        this.message.success(res.message || this.i18n.t('common.saveSuccess', 'Lưu thành công'));
        this.modalVisible.set(false);
        await this.loadShiftTree();
      } else {
        this.message.error(res.error || this.i18n.t('common.saveFailed', 'Lưu thất bại.'));
      }
    } catch {
      this.message.error(this.i18n.t('common.saveFailed', 'Lưu thất bại.'));
    } finally {
      this.savingRecord.set(false);
    }
  }

  deleteSelectedShift(): void {
    const shiftNo = this.selectedShiftNo();
    if (!shiftNo) {
      this.message.warning(this.i18n.t('ar.viewshift.msg.selectShiftToDelete', 'Vui lòng chọn 1 ca trên cây để xóa.'));
      return;
    }
    this.modal.confirm({
      nzTitle: this.i18n.t('ar.viewshift.confirm.deleteShift', 'Chắc chắn muốn xóa ca này và toàn bộ dữ liệu chi tiết của nó?'),
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          const res = await this.service.deleteShift(shiftNo);
          if (res.success) {
            await this.loadShiftTree();
          } else {
            this.message.error(res.error || this.i18n.t('common.deleteFailed', 'Xóa thất bại.'));
          }
        } catch {
          this.message.error(this.i18n.t('common.deleteFailed', 'Xóa thất bại.'));
        }
      },
    });
  }

  // ==================== AR_SHIFT020 CRUD ====================

  openAddDetailModal(): void {
    if (!this.selectedShiftNo()) {
      this.message.warning(this.i18n.t('ar.viewshift.msg.selectShiftFirst', 'Vui lòng chọn 1 ca trên danh sách bên trái trước.'));
      return;
    }
    this.detailModalIsEdit.set(false);
    this.formDetailPkNo.set(null);
    this.formDetailItemNo.set(null);
    this.formDetailBeginDayOffset.set(0);
    this.formDetailFromTime.set(null);
    this.formDetailEndDayOffset.set(0);
    this.formDetailToTime.set(null);
    this.formDetailOrderno.set(0);
    this.formDetailActive.set(true);
    this.detailModalVisible.set(true);
  }

  async editDetail(pkNo: number | undefined): Promise<void> {
    if (!pkNo) return;
    try {
      const d = await this.service.getShiftDetailById(pkNo);
      this.detailModalIsEdit.set(true);
      this.formDetailPkNo.set(d.pkNo ?? pkNo);
      this.formDetailItemNo.set(d.itemNo ?? null);
      this.formDetailBeginDayOffset.set(d.beginDayOffset ?? 0);
      this.formDetailFromTime.set(parseHHmm(d.fromTimeStr));
      this.formDetailEndDayOffset.set(d.endDayOffset ?? 0);
      this.formDetailToTime.set(parseHHmm(d.toTimeStr));
      this.formDetailOrderno.set(d.orderno ?? 0);
      this.formDetailActive.set((d.activity ?? 1) === 1);
      this.detailModalVisible.set(true);
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  closeDetailModal(): void {
    this.detailModalVisible.set(false);
  }

  async saveDetail(): Promise<void> {
    const shiftNo = this.selectedShiftNo();
    const itemNo = this.formDetailItemNo();
    if (!itemNo || !shiftNo) {
      this.message.warning(this.i18n.t('ar.viewshift.msg.selectItem', 'Vui lòng chọn Hạng mục (Item).'));
      return;
    }
    const payload: ShiftDetailSavePayload = {
      pkNo: this.formDetailPkNo(),
      shiftNo,
      itemNo,
      beginDayOffset: this.formDetailBeginDayOffset() ?? 0,
      fromTimeStr: formatHHmm(this.formDetailFromTime()),
      endDayOffset: this.formDetailEndDayOffset() ?? 0,
      toTimeStr: formatHHmm(this.formDetailToTime()),
      orderno: this.formDetailOrderno() ?? 0,
      activity: this.formDetailActive() ? 1 : 0,
    };
    this.savingDetail.set(true);
    try {
      const res = await this.service.saveShiftDetail(payload);
      if (res.success) {
        this.message.success(res.message || this.i18n.t('common.saveSuccess', 'Lưu thành công'));
        this.detailModalVisible.set(false);
        await this.loadDetails();
      } else {
        this.message.error(res.error || this.i18n.t('common.saveFailed', 'Lưu thất bại.'));
      }
    } catch {
      this.message.error(this.i18n.t('common.saveFailed', 'Lưu thất bại.'));
    } finally {
      this.savingDetail.set(false);
    }
  }

  deleteDetail(pkNo: number | undefined): void {
    if (!pkNo) return;
    this.modal.confirm({
      nzTitle: this.i18n.t('ar.viewshift.confirm.deleteDetail', 'Chắc chắn muốn xóa tham số này?'),
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          const res = await this.service.deleteShiftDetail(pkNo);
          if (res.success) {
            await this.loadDetails();
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
