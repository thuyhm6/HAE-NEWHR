import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';

import { I18nService } from '../../../../i18n/i18n.service';
import { EduCommonService, EduEmployee } from '../edu-common.service';

import { TABLE_PAGE_SIZE_OPTIONS, TABLE_DEFAULT_PAGE_SIZE } from '../../../../core/config/table-pagination.config';
/**
 * Popup chọn nhân viên dùng chung cho các màn đào tạo - thay cho desEmployee /
 * queryTeacher / queryPeixun bản gốc (chỉ NV đang làm việc).
 * - multiple = true: chọn nhiều (checkbox), dùng cho "NV chỉ định" ở Kế hoạch đào tạo.
 * - multiple = false: chọn 1 dòng, dùng cho Giảng viên nội bộ / Người ký hợp đồng.
 * Modal đóng khi bấm ra ngoài vùng modal (nzMaskClosable).
 */
@Component({
  selector: 'app-edu-emp-picker',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCheckboxModule,
    NzFormModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzSelectModule,
    NzTableModule,
    NzTreeSelectModule,
  ],
  templateUrl: './edu-emp-picker.component.html',
  styleUrl: './edu-emp-picker.component.scss',
})
export class EduEmpPickerComponent implements OnChanges {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
  protected readonly defaultPageSize = TABLE_DEFAULT_PAGE_SIZE;

  private readonly common = inject(EduCommonService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  @Input() visible = false;
  @Input() multiple = false;
  /** Giới hạn theo danh sách phòng ban (CSV, khớp chính xác) - desEmployee bản gốc. */
  @Input() deptNos: string | null = null;
  /** Hiện bộ lọc phòng ban (lấy cả phòng ban con) - queryPeixun bản gốc. */
  @Input() showDeptFilter = false;
  /** Hiện lựa chọn sắp xếp theo họ tên / mã NV - desEmployee bản gốc. */
  @Input() showSort = false;
  /** Từ khóa khởi tạo (bản gốc truyền tên đã nhập ở form). */
  @Input() initialKeyword: string | null = null;
  /** Mã NV đã chọn trước đó (tích sẵn khi chọn nhiều). */
  @Input() selectedEmpids: string[] = [];
  /** Mã NV không được hiển thị (vd: NV đã thuộc kế hoạch - otherPlanEmployee bản gốc). */
  @Input() excludeEmpids: string[] = [];
  /** Tiêu đề popup (mặc định "Chọn nhân viên"). */
  @Input() title: string | null = null;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() confirmed = new EventEmitter<EduEmployee[]>();

  protected readonly keyword = signal('');
  protected readonly orderBy = signal<string>('L');
  protected readonly deptRoot = signal<string | null>(null);
  protected readonly deptNodes = signal<NzTreeNodeOptions[]>([]);
  protected readonly loading = signal(false);
  protected readonly rows = signal<EduEmployee[]>([]);
  protected readonly checked = signal<Set<string>>(new Set());
  protected readonly selectedSingle = signal<string | null>(null);

  protected readonly allChecked = computed(() => {
    const rows = this.rows();
    return rows.length > 0 && rows.every((r) => this.checked().has(r.empid));
  });

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['visible'] && this.visible) {
      this.keyword.set(this.initialKeyword ?? '');
      this.checked.set(new Set(this.selectedEmpids ?? []));
      this.selectedSingle.set(null);
      if (this.showDeptFilter && this.deptNodes().length === 0) {
        try {
          this.deptNodes.set(this.common.buildDeptTree(await this.common.getDeptTree()));
        } catch {
          this.deptNodes.set([]);
        }
      }
      await this.search();
    }
  }

  async search(): Promise<void> {
    this.loading.set(true);
    try {
      const exclude = new Set(this.excludeEmpids ?? []);
      const list = await this.common.findEmployees({
        keyword: this.keyword().trim(),
        deptNos: this.deptNos,
        deptRoot: this.showDeptFilter ? this.deptRoot() : null,
        orderBy: this.orderBy(),
      });
      this.rows.set(exclude.size ? list.filter((e) => !exclude.has(e.empid)) : list);
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }

  toggle(empid: string, value: boolean): void {
    const next = new Set(this.checked());
    if (value) next.add(empid);
    else next.delete(empid);
    this.checked.set(next);
  }

  toggleAll(value: boolean): void {
    const next = new Set(this.checked());
    this.rows().forEach((r) => (value ? next.add(r.empid) : next.delete(r.empid)));
    this.checked.set(next);
  }

  onRowClick(row: EduEmployee): void {
    if (this.multiple) {
      this.toggle(row.empid, !this.checked().has(row.empid));
    } else {
      this.selectedSingle.set(row.empid);
    }
  }

  confirm(): void {
    if (this.multiple) {
      const picked = this.rows().filter((r) => this.checked().has(r.empid));
      this.confirmed.emit(picked);
    } else {
      const picked = this.rows().find((r) => r.empid === this.selectedSingle());
      if (!picked) {
        this.message.warning(this.i18n.t('edu.teacherManager.QINGXIANXUANZEYIGEREN.a', 'Xin chọn 1 người!'));
        return;
      }
      this.confirmed.emit([picked]);
    }
    this.close();
  }

  close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }
}
