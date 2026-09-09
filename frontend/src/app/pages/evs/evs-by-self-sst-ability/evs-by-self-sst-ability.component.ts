import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';

import { I18nService } from '../../../i18n/i18n.service';
import { AbilityItem, EvsBySelfSstAbilityService, EvsResumeOption, EvsScoreOption, EvsSelfAbilityInfo } from './evs-by-self-sst-ability.service';

const EDITABLE_ACTIVITY = '14015356';

/**
 * Đánh giá năng lực bản thân (viewEvsBySelfSSTAbility) - self-service, điểm
 * chọn từ dropdown EVS_PARAM. Khác evs-by-self-hae ở chỗ không có phần
 * Thành tích/Hạn chế theo 3 cấp, chỉ có 1 ô nhận xét (SECTION 2).
 */
@Component({
  selector: 'app-evs-by-self-sst-ability',
  standalone: true,
  imports: [CommonModule, FormsModule, NzButtonModule, NzIconModule, NzInputModule, NzModalModule, NzSelectModule],
  templateUrl: './evs-by-self-sst-ability.component.html',
  styleUrl: './evs-by-self-sst-ability.component.scss',
})
export class EvsBySelfSstAbilityComponent implements OnInit {
  private readonly service = inject(EvsBySelfSstAbilityService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  private readonly route = inject(ActivatedRoute);
  protected readonly i18n = inject(I18nService);

  private evsType = '';

  protected readonly hasAnyResume = signal(true);
  protected readonly resumeOptions = signal<EvsResumeOption[]>([]);
  protected readonly searchResumeSeq = signal<string | null>(null);

  protected readonly info = signal<EvsSelfAbilityInfo | null>(null);
  protected readonly items = signal<AbilityItem[]>([]);
  protected readonly scoreOptions = signal<EvsScoreOption[]>([]);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly affirmContent = signal('');

  protected readonly editable = computed(() => this.info()?.activity === EDITABLE_ACTIVITY);
  protected readonly maxScore = computed(() => this.scoreOptions().reduce((m, o) => Math.max(m, Number(o.evsScore) || 0), 0));

  /** itemSeq -> điểm chọn (chưa lưu). */
  protected readonly scores = signal<Map<string, string>>(new Map());

  protected readonly totalItemScore = computed(() =>
    Math.round(this.items().reduce((acc, i) => acc + (Number(i.itemScore) || 0), 0) * 100) / 100,
  );
  protected readonly totalSelfScore = computed(() => {
    const max = this.maxScore();
    if (max <= 0) return 0;
    let total = 0;
    for (const item of this.items()) {
      const score = Number(this.scoreValue(item));
      if (this.scoreValue(item) === '' || isNaN(score)) continue;
      total += (score * (Number(item.itemScore) || 0)) / max;
    }
    return Math.round(total * 100) / 100;
  });

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    this.evsType = this.route.snapshot.queryParamMap.get('evsType') || '';
    try {
      const resumeList = await this.service.getResumeOptions(this.evsType);
      if (!resumeList.length) {
        this.hasAnyResume.set(false);
        return;
      }
      this.resumeOptions.set(resumeList);
      this.searchResumeSeq.set(resumeList[0].seq ?? null);
      await this.search();
    } catch {
      this.hasAnyResume.set(false);
    }
  }

  scoreValue(item: AbilityItem): string {
    const edited = item.itemSeq ? this.scores().get(item.itemSeq) : undefined;
    if (edited != null) return edited;
    return item.evsScore0 ?? '';
  }

  onScoreChange(item: AbilityItem, value: string | null): void {
    if (!item.itemSeq) return;
    const map = new Map(this.scores());
    map.set(item.itemSeq, value == null ? '' : value);
    this.scores.set(map);
  }

  async search(): Promise<void> {
    const resumeSeq = this.searchResumeSeq();
    if (!resumeSeq) {
      this.message.warning(this.i18n.t('evs.viewEvsBySelfSSTAbility.msg.selectEvalFirst', 'Vui lòng chọn tên đánh giá trước.'));
      return;
    }
    this.loading.set(true);
    try {
      const data = await this.service.getObjectInfo(resumeSeq);
      if (!data?.seq) {
        this.info.set(null);
        this.items.set([]);
        this.message.warning(this.i18n.t('evs.viewEvsBySelfSSTAbility.msg.noData', 'Không tìm thấy thông tin đánh giá.'));
        return;
      }
      this.info.set(data);
      this.affirmContent.set(data.affirmContent0 ?? '');
      this.scores.set(new Map());
      const [scoreOptions, items] = await Promise.all([this.service.getScoreOptions(resumeSeq), this.service.getItemList(resumeSeq)]);
      this.scoreOptions.set(scoreOptions);
      this.items.set(items);
    } catch {
      this.info.set(null);
      this.items.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  protected period(): string {
    const d = this.info();
    if (!d) return '';
    return (d.evsStartDate || '') + (d.evsEndDate ? '~' + d.evsEndDate : '');
  }

  save(flag: '0' | '1'): void {
    const evsObjectSeq = this.info()?.seq;
    const resumeSeq = this.searchResumeSeq();
    if (!evsObjectSeq || !resumeSeq) return;
    const title =
      flag === '1'
        ? this.i18n.t('evs.viewEvsBySelfSSTAbility.msg.confirmExecute', 'Bạn có chắc muốn thực hiện đánh giá năng lực bản thân?')
        : this.i18n.t('evs.viewEvsBySelfSSTAbility.msg.confirmSaveDraft', 'Bạn có chắc muốn lưu tạm thời?');
    this.modal.confirm({
      nzTitle: title,
      nzOnOk: async () => {
        this.saving.set(true);
        try {
          const items = this.items()
            .filter((i) => i.itemSeq)
            .map((i) => ({ itemSeq: i.itemSeq!, evsScore0: this.scoreValue(i) || null }));
          const res = await this.service.save({
            evsObjectSeq,
            resumeSeq,
            flag,
            affirmContent: this.affirmContent(),
            items,
          });
          if (res.success) {
            this.message.success(
              flag === '1'
                ? this.i18n.t('evs.viewEvsBySelfSSTAbility.msg.executeSuccess', 'Thực hiện thành công!')
                : this.i18n.t('evs.viewEvsBySelfSSTAbility.msg.saveDraftSuccess', 'Lưu tạm thời thành công!'),
            );
            await this.search();
          } else {
            this.message.error(res.message || this.i18n.t('evs.viewEvsBySelfSSTAbility.msg.actionFail', 'Lỗi khi thực hiện. Vui lòng thử lại.'));
          }
        } catch {
          this.message.error(this.i18n.t('evs.viewEvsBySelfSSTAbility.msg.actionFail', 'Lỗi khi thực hiện. Vui lòng thử lại.'));
        } finally {
          this.saving.set(false);
        }
      },
    });
  }
}
