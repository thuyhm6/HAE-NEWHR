import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';

import { I18nService } from '../../../../i18n/i18n.service';
import { EduPlanManagerService, EduTrainSyllabusRow } from '../../edu-plan-manager/edu-plan-manager.service';

/**
 * Modal xem lịch học của kế hoạch (queryCourseSyllabus / queryCourseSyllabus2 bản gốc) -
 * dùng chung cho các màn đăng ký / phê duyệt / xác nhận. Đóng khi bấm ra ngoài (nzMaskClosable).
 */
@Component({
  selector: 'app-edu-syllabus-modal',
  standalone: true,
  imports: [CommonModule, NzButtonModule, NzModalModule, NzTableModule],
  template: `
    <nz-modal
      [nzVisible]="!!planNo"
      [nzTitle]="i18n.t('edu.planManager.KECHENGBIAO.a', 'Lịch đào tạo')"
      [nzMaskClosable]="true"
      (nzOnCancel)="closed.emit()"
      nzWidth="760px"
    >
      <ng-container *nzModalContent>
        <nz-table #esylTable id="esyl-syllabus-table" [nzData]="rows()" [nzLoading]="loading()" [nzPageSize]="10" [nzHideOnSinglePage]="true" nzSize="small" nzBordered>
          <thead>
            <tr>
              <th nzWidth="50px" class="esyl-center">{{ i18n.t('common.stt', 'STT') }}</th>
              <th>{{ i18n.t('empsubject.subjectNm', 'Tên đào tạo') }}</th>
              <th class="esyl-center">{{ i18n.t('edu.planManager.KECHENGRIQI.a', 'Ngày học') }}</th>
              <th class="esyl-center">{{ i18n.t('ess.infoApply.title.startTime', 'Thời gian bắt đầu') }}</th>
              <th class="esyl-center">{{ i18n.t('ess.infoApply.title.endTime', 'Thời gian kết thúc') }}</th>
              <th>{{ i18n.t('edu.planManager.XIANGXIDIDIAN.a', 'Địa điểm') }}</th>
            </tr>
          </thead>
          <tbody>
            @for (s of esylTable.data; track s.syllNo; let idx = $index) {
              <tr>
                <td class="esyl-center">{{ (esylTable.nzPageIndex - 1) * esylTable.nzPageSize + idx + 1 }}</td>
                <td>{{ s.courseNameCode }}</td>
                <td class="esyl-center">{{ s.courseDate }}</td>
                <td class="esyl-center">{{ s.courseStartDate }}</td>
                <td class="esyl-center">{{ s.courseEndDate }}</td>
                <td>{{ s.detailAddress }}</td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="esyl-center">{{ i18n.t('common.noData', 'Không có dữ liệu') }}</td>
              </tr>
            }
          </tbody>
        </nz-table>
      </ng-container>
      <div *nzModalFooter>
        <button id="esyl-close-btn" nz-button (click)="closed.emit()">{{ i18n.t('common.close', 'Đóng') }}</button>
      </div>
    </nz-modal>
  `,
  styles: ['.esyl-center { text-align: center; }'],
})
export class EduSyllabusModalComponent implements OnChanges {
  private readonly planService = inject(EduPlanManagerService);
  protected readonly i18n = inject(I18nService);

  /** Kế hoạch cần xem - null/undefined = đóng modal. */
  @Input() planNo: string | null | undefined = null;
  @Output() readonly closed = new EventEmitter<void>();

  protected readonly rows = signal<EduTrainSyllabusRow[]>([]);
  protected readonly loading = signal(false);

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (!changes['planNo'] || !this.planNo) return;
    this.rows.set([]);
    this.loading.set(true);
    try {
      this.rows.set(await this.planService.getSyllabus(this.planNo));
    } catch {
      this.rows.set([]);
    } finally {
      this.loading.set(false);
    }
  }
}
