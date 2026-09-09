import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import { EmployeeSearchResult, SstOtApplyService } from '../../ess/sst-ot-apply/sst-ot-apply.service';
import { DYNAMIC_GROUP_NO, DynamicGroupRow, DynamicGroupService } from './dynamic-group.service';

/**
 * Quản lý danh sách "Nhân viên đặc biệt" - port lại từ
 * ar/attendanceSettings/viewDynamicGroup.html (đã xoá). Chỉ Thêm (qua picker
 * tìm nhân viên) + Xóa, không có Sửa (khớp bản gốc). `groupNo` luôn cố định
 * 80000084, không hiển thị cho người dùng chọn.
 */
@Component({
  selector: 'app-dynamic-group',
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
  ],
  templateUrl: './dynamic-group.component.html',
  styleUrl: './dynamic-group.component.scss',
})
export class DynamicGroupComponent implements OnInit {
  private readonly service = inject(DynamicGroupService);
  private readonly empService = inject(SstOtApplyService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  protected readonly searchEmpId = signal('');

  protected readonly listLoading = signal(false);
  protected readonly rows = signal<DynamicGroupRow[]>([]);

  protected readonly modalVisible = signal(false);
  protected readonly savingRecord = signal(false);
  protected readonly formPersonId = signal('');
  protected readonly formEmpNameDisplay = signal('');

  protected readonly empPickerVisible = signal(false);
  protected readonly empPickerSearchResults = signal<EmployeeSearchResult[]>([]);
  protected readonly empPickerSearching = signal(false);
  private empPickerSearchTimer: ReturnType<typeof setTimeout> | undefined;

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await this.search();
  }

  async search(): Promise<void> {
    this.listLoading.set(true);
    try {
      this.rows.set(await this.service.getList(this.searchEmpId() || undefined));
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.listLoading.set(false);
    }
  }

  clearSearch(): void {
    this.searchEmpId.set('');
    this.search();
  }

  formatUpdateDate(value: string | undefined): string {
    if (!value) return '';
    const d = new Date(value);
    return isNaN(d.getTime()) ? value : formatDate(d, 'dd/MM/yyyy HH:mm', 'en-US');
  }

  openAddModal(): void {
    this.formPersonId.set('');
    this.formEmpNameDisplay.set('');
    this.modalVisible.set(true);
  }

  closeModal(): void {
    this.modalVisible.set(false);
  }

  openEmpPicker(): void {
    this.empPickerSearchResults.set([]);
    this.empPickerVisible.set(true);
  }

  closeEmpPicker(): void {
    this.empPickerVisible.set(false);
  }

  onEmpPickerSearch(keyword: string): void {
    if (this.empPickerSearchTimer) {
      clearTimeout(this.empPickerSearchTimer);
    }
    const kw = keyword.trim();
    if (!kw) {
      this.empPickerSearchResults.set([]);
      return;
    }
    this.empPickerSearchTimer = setTimeout(async () => {
      this.empPickerSearching.set(true);
      try {
        this.empPickerSearchResults.set(await this.empService.searchEmployees(kw));
      } catch {
        this.empPickerSearchResults.set([]);
      } finally {
        this.empPickerSearching.set(false);
      }
    }, 300);
  }

  onEmpPickerSelected(personId: string | null): void {
    if (!personId) return;
    const emp = this.empPickerSearchResults().find((e) => e.personId === personId);
    if (emp) {
      this.formPersonId.set(emp.personId ?? '');
      this.formEmpNameDisplay.set(`${emp.empId ?? ''} - ${emp.localName ?? ''}`);
    }
    this.closeEmpPicker();
  }

  async saveRecord(): Promise<void> {
    const personId = this.formPersonId().trim();
    if (!personId) {
      this.message.warning(this.i18n.t('ar.viewDynamicGroup.msg.selectEmployee', 'Vui lòng chọn nhân viên'));
      return;
    }
    this.savingRecord.set(true);
    try {
      const res = await this.service.save({ personId, groupNo: DYNAMIC_GROUP_NO, orderno: null, activity: 1 });
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

  deleteOne(personId: string | undefined): void {
    if (!personId) return;
    this.modal.confirm({
      nzTitle: this.i18n.t('ar.viewDynamicGroup.confirm.delete', 'Bạn có chắc chắn muốn xóa nhân viên này khỏi nhóm đặc biệt?'),
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          const res = await this.service.delete(personId);
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
