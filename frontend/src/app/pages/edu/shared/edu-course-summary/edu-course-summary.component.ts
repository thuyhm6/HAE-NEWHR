import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';

import { I18nService } from '../../../../i18n/i18n.service';
import { eduClassUnitLabel, eduCourseTitle } from '../edu-labels';

/** Thông tin khóa đào tạo (khớp các trường EduBasicInformation / EduEvalCourse). */
export interface EduCourseSummaryData {
  trainTypeCodeName?: string;
  courseNameCode?: string;
  periodTime?: string;
  impleClassHour?: string;
  impleClassUnit?: string;
  impleStartDate?: string;
  impleEndDate?: string;
  trainContent?: string;
}

/**
 * Khối thông tin chung của khóa ở đầu các popup đánh giá (Loại hình, Tên khóa,
 * Thời lượng, Thời gian, Nội dung) - dùng chung cho 3 màn đánh giá.
 */
@Component({
  selector: 'app-edu-course-summary',
  standalone: true,
  imports: [CommonModule, NzDescriptionsModule],
  template: `
    @if (course) {
      <nz-descriptions nzBordered nzSize="small" [nzColumn]="{ xs: 1, md: 2 }" class="ecsum-box">
        <nz-descriptions-item [nzTitle]="i18n.t('edu.systemManager.PEIXUNLEIXING.a', 'Loại hình')">{{ course.trainTypeCodeName }}</nz-descriptions-item>
        <nz-descriptions-item [nzTitle]="i18n.t('empsubject.subjectNm', 'Tên đào tạo')">{{ title() }}</nz-descriptions-item>
        <nz-descriptions-item [nzTitle]="i18n.t('edu.planManager.PEIXUNKESHI.a', 'Thời lượng')">{{ course.impleClassHour }} {{ unit() }}</nz-descriptions-item>
        <nz-descriptions-item [nzTitle]="i18n.t('edu.trainBasicInformation.PEIXUNSHISHIQIJIAN.a', 'Thời gian')">
          {{ course.impleStartDate }} ~ {{ course.impleEndDate }}
        </nz-descriptions-item>
        <nz-descriptions-item [nzTitle]="i18n.t('edu.planManager.PEIXUNNEIRONG.a', 'Nội dung')" [nzSpan]="2">{{ course.trainContent }}</nz-descriptions-item>
      </nz-descriptions>
    }
  `,
  styles: [
    `
      .ecsum-box {
        margin-bottom: 12px;
      }
    `,
  ],
})
export class EduCourseSummaryComponent {
  protected readonly i18n = inject(I18nService);

  @Input() course: EduCourseSummaryData | null = null;

  protected title(): string {
    return eduCourseTitle(this.i18n, this.course?.courseNameCode, this.course?.periodTime);
  }

  protected unit(): string {
    return eduClassUnitLabel(this.i18n, this.course?.impleClassUnit);
  }
}
