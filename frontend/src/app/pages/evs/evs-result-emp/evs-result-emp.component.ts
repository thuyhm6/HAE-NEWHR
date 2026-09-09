import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import { EvsResultEmpRow, EvsResultEmpService } from './evs-result-emp.service';

/**
 * Kết quả đánh giá nhân viên (viewEvsResultEmp) - self-service, bảng lịch sử
 * kết quả đánh giá thành tích/năng lực theo năm.
 */
@Component({
  selector: 'app-evs-result-emp',
  standalone: true,
  imports: [CommonModule, NzTableModule],
  templateUrl: './evs-result-emp.component.html',
  styleUrl: './evs-result-emp.component.scss',
})
export class EvsResultEmpComponent implements OnInit {
  private readonly service = inject(EvsResultEmpService);
  protected readonly i18n = inject(I18nService);

  protected readonly rows = signal<EvsResultEmpRow[]>([]);
  protected readonly loading = signal(false);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    this.loading.set(true);
    try {
      this.rows.set(await this.service.getList());
    } catch {
      this.rows.set([]);
    } finally {
      this.loading.set(false);
    }
  }
}
