import { CommonModule } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../../i18n/i18n.service';
import { PaSalaryDetailItem } from '../pa-salary-result.service';

/** Loại hạng mục procedure PA_FOR_MY_SALARY_DETAIL_PAGE_P sinh ra - mỗi loại 1 bảng giống bản gốc */
const PSDP_ITEM_TYPES = ['1', '2', '3'];

/**
 * Chi tiết hạng mục lương của 1 nhân viên - port từ pa/workManagement/detailYearCountInfoRight.jsp
 * (dự án cũ Hanwha_HAE), dùng chung cho Lương tháng chi tiết và Lương năm chi tiết: 3 bảng theo
 * ITEM_TYPE 1 / 2 / 3, mỗi bảng gồm STT, hạng mục, số tiền, tổng khoản tiền trong năm.
 */
@Component({
  selector: 'app-pa-salary-detail-panel',
  standalone: true,
  imports: [CommonModule, NzTableModule],
  templateUrl: './pa-salary-detail-panel.component.html',
  styleUrl: './pa-salary-detail-panel.component.scss',
})
export class PaSalaryDetailPanelComponent {
  protected readonly i18n = inject(I18nService);

  readonly items = input<PaSalaryDetailItem[]>([]);
  readonly loading = input(false);

  protected readonly groups = computed(() =>
    PSDP_ITEM_TYPES.map((type) => ({ type, items: this.items().filter((i) => String(i.itemType) === type) })),
  );

  protected formatNumber(val: number | string | null | undefined): string {
    if (val === null || val === undefined || val === '') return '';
    const num = Number(val);
    return isNaN(num) ? String(val) : Math.round(num).toLocaleString('en-US');
  }
}
