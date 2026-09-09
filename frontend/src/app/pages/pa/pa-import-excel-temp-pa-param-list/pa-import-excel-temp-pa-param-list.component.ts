import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../i18n/i18n.service';
import { TabService } from '../../../shell/tab.service';
import { PaImportExcelTempPaParamListService, PaParamDataTempRow } from './pa-import-excel-temp-pa-param-list.service';

/**
 * Kết quả nhập Excel dữ liệu tiêu chuẩn (viewImportExcelTempPaParamList) -
 * xem ghi chú trong pa-import-excel-temp-pa-param-list.service.ts.
 */
@Component({
  selector: 'app-pa-import-excel-temp-pa-param-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NzButtonModule, NzIconModule, NzSelectModule, NzTableModule],
  templateUrl: './pa-import-excel-temp-pa-param-list.component.html',
  styleUrl: './pa-import-excel-temp-pa-param-list.component.scss',
})
export class PaImportExcelTempPaParamListComponent implements OnInit {
  private readonly service = inject(PaImportExcelTempPaParamListService);
  private readonly route = inject(ActivatedRoute);
  private readonly tabs = inject(TabService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  private paramNo = '';

  protected readonly rows = signal<PaParamDataTempRow[]>([]);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly errorOnly = signal('');
  protected readonly errorMessage = signal('');

  protected readonly totalRows = computed(() => this.rows().length);
  protected readonly errorRows = computed(() => this.rows().filter((r) => r.uploadErrorMsg && r.uploadErrorMsg.trim() !== '').length);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    this.paramNo = this.route.snapshot.queryParamMap.get('paramNo') ?? '';
    await this.loadList();
  }

  private async loadList(): Promise<void> {
    this.loading.set(true);
    try {
      this.rows.set(await this.service.getList(this.errorOnly()));
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }

  search(): void {
    this.loadList();
  }

  private closeThisTab(): void {
    this.tabs.closeTab(this.tabs.activePath());
  }

  cancel(): void {
    this.closeThisTab();
  }

  async save(): Promise<void> {
    this.saving.set(true);
    this.errorMessage.set('');
    try {
      const res = await this.service.save(this.paramNo);
      if (res.success) {
        this.message.success(res.message || this.i18n.t('impParam.saveOk', 'Lưu thành công'));
        this.closeThisTab();
        return;
      }
      const msg = res.error || res.message || this.i18n.t('impParam.saveFail', 'Lưu thất bại');
      this.errorMessage.set(msg);
      this.message.error(msg);
      await this.loadList();
    } catch {
      this.message.error(this.i18n.t('impParam.saveFail', 'Lưu thất bại'));
    } finally {
      this.saving.set(false);
    }
  }
}
