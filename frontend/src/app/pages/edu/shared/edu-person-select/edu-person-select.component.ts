import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../../i18n/i18n.service';

import { TABLE_PAGE_SIZE_OPTIONS, TABLE_DEFAULT_PAGE_SIZE } from '../../../../core/config/table-pagination.config';
export interface EduPersonRow {
  empid: string;
  name: string;
  deptName?: string;
}

/**
 * Popup tích chọn nhiều người từ một danh sách cho sẵn - thay cho commonTeacher /
 * planEmployee / finalstudent bản gốc (Thông tin đào tạo cơ bản).
 * Modal đóng khi bấm ra ngoài vùng modal (nzMaskClosable).
 */
@Component({
  selector: 'app-edu-person-select',
  standalone: true,
  imports: [CommonModule, FormsModule, NzButtonModule, NzInputModule, NzModalModule, NzTableModule],
  templateUrl: './edu-person-select.component.html',
  styleUrl: './edu-person-select.component.scss',
})
export class EduPersonSelectComponent implements OnChanges {
  /** Danh sách số dòng/trang dùng chung - core/config/table-pagination.config.ts */
  protected readonly pageSizeOptions = TABLE_PAGE_SIZE_OPTIONS;
  protected readonly defaultPageSize = TABLE_DEFAULT_PAGE_SIZE;

  protected readonly i18n = inject(I18nService);

  @Input() visible = false;
  @Input() title = '';
  @Input() rows: EduPersonRow[] = [];
  @Input() loading = false;
  @Input() selectedEmpids: string[] = [];

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() confirmed = new EventEmitter<EduPersonRow[]>();

  protected readonly keyword = signal('');
  protected readonly checked = signal<Set<string>>(new Set());
  private readonly allRows = signal<EduPersonRow[]>([]);

  protected readonly filteredRows = computed(() => {
    const kw = this.keyword().trim().toLowerCase();
    const rows = this.allRows();
    return kw ? rows.filter((r) => `${r.empid} ${r.name} ${r.deptName ?? ''}`.toLowerCase().includes(kw)) : rows;
  });

  protected readonly allChecked = computed(() => {
    const rows = this.filteredRows();
    return rows.length > 0 && rows.every((r) => this.checked().has(r.empid));
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rows']) {
      this.allRows.set(this.rows ?? []);
    }
    if (changes['visible'] && this.visible) {
      this.keyword.set('');
      this.checked.set(new Set(this.selectedEmpids ?? []));
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
    this.filteredRows().forEach((r) => (value ? next.add(r.empid) : next.delete(r.empid)));
    this.checked.set(next);
  }

  confirm(): void {
    this.confirmed.emit(this.allRows().filter((r) => this.checked().has(r.empid)));
    this.close();
  }

  close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }
}
