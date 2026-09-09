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
import { EvsBySelfHaeService, EvsSelfHaeInfo, EvsSelfHaeItem, EvsResumeOption } from './evs-by-self-hae.service';

const EDITABLE_ACTIVITY = '14015356';

/**
 * Đánh giá bản thân HAE (viewEvsBySelfHTSV) - self-service, nhân viên tự
 * chấm điểm (%) cho từng mục tiêu đã đăng ký + nhập Thành tích/Hạn chế.
 */
@Component({
  selector: 'app-evs-by-self-hae',
  standalone: true,
  imports: [CommonModule, FormsModule, NzButtonModule, NzIconModule, NzInputModule, NzModalModule, NzSelectModule],
  templateUrl: './evs-by-self-hae.component.html',
  styleUrl: './evs-by-self-hae.component.scss',
})
export class EvsBySelfHaeComponent implements OnInit {
  private readonly service = inject(EvsBySelfHaeService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  private readonly route = inject(ActivatedRoute);
  protected readonly i18n = inject(I18nService);

  private evsType = '';

  protected readonly hasAnyResume = signal(true);
  protected readonly resumeOptions = signal<EvsResumeOption[]>([]);
  protected readonly searchResumeSeq = signal<string | null>(null);

  protected readonly info = signal<EvsSelfHaeInfo | null>(null);
  protected readonly items = signal<EvsSelfHaeItem[]>([]);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);

  protected readonly editable = computed(() => this.info()?.activity === EDITABLE_ACTIVITY);

  /** seq -> điểm đang nhập (chưa lưu). */
  protected readonly scores = signal<Map<string, string>>(new Map());
  protected readonly achiev0 = signal('');
  protected readonly limit0 = signal('');

  protected readonly strategicItems = computed(() => this.items().filter((r) => String(r.itemType) === '1'));
  protected readonly operationItems = computed(() => this.items().filter((r) => String(r.itemType) !== '1'));
  protected readonly strategicTotal = computed(() => this.sectionTotal(this.strategicItems()));
  protected readonly operationTotal = computed(() => this.sectionTotal(this.operationItems()));
  protected readonly grandTotal = computed(() => Math.round((this.strategicTotal() + this.operationTotal()) * 100) / 100);

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

  scoreValue(item: EvsSelfHaeItem): string {
    const edited = item.seq ? this.scores().get(item.seq) : undefined;
    if (edited != null) return edited;
    return item.evsScore ?? '';
  }

  rowTotal(item: EvsSelfHaeItem): number {
    const score = Number(this.scoreValue(item));
    const ratio = Number(item.itemScore) || 0;
    if (this.scoreValue(item) === '' || isNaN(score)) return 0;
    return Math.round(((score * ratio) / 100) * 100) / 100;
  }

  private sectionTotal(rows: EvsSelfHaeItem[]): number {
    const total = rows.reduce((acc, r) => acc + this.rowTotal(r), 0);
    return Math.round(total * 100) / 100;
  }

  onScoreInput(item: EvsSelfHaeItem, value: string | number | null): void {
    if (!item.seq) return;
    let v = value == null ? '' : String(value);
    const max = Number(item.itemScore) || 100;
    if (v !== '' && Number(v) > max) v = String(max);
    const map = new Map(this.scores());
    map.set(item.seq, v);
    this.scores.set(map);
  }

  async search(): Promise<void> {
    const resumeSeq = this.searchResumeSeq();
    if (!resumeSeq) {
      this.message.warning(this.i18n.t('evs.viewEvsBySelfHAE.msg.selectEvalFirst', 'Vui lòng chọn tên đánh giá trước.'));
      return;
    }
    this.loading.set(true);
    try {
      const data = await this.service.getObjectInfo(resumeSeq, this.evsType);
      if (!data?.seq) {
        this.info.set(null);
        this.items.set([]);
        this.message.warning(this.i18n.t('evs.viewEvsBySelfHAE.msg.noData', 'Không tìm thấy thông tin đánh giá.'));
        return;
      }
      this.info.set(data);
      this.achiev0.set(data.affirmC1L0 ?? '');
      this.limit0.set(data.affirmC2L0 ?? '');
      this.scores.set(new Map());
      this.items.set(await this.service.getItemList(data.seq));
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
    if (!evsObjectSeq) return;
    const title =
      flag === '1'
        ? this.i18n.t('evs.viewEvsBySelfHAE.msg.confirmExecute', 'Bạn có chắc muốn thực hiện đánh giá bản thân?')
        : this.i18n.t('evs.viewEvsBySelfHAE.msg.confirmSaveDraft', 'Bạn có chắc muốn lưu tạm thời?');
    this.modal.confirm({
      nzTitle: title,
      nzOnOk: async () => {
        this.saving.set(true);
        try {
          const items = this.items()
            .filter((i) => i.seq)
            .map((i) => ({ seq: i.seq!, evsScore: this.scoreValue(i) }));
          const res = await this.service.save({
            evsObjectSeq,
            flag,
            affirmContent1: this.achiev0(),
            affirmContent2: this.limit0(),
            items,
          });
          if (res.success) {
            this.message.success(
              flag === '1'
                ? this.i18n.t('evs.viewEvsBySelfHAE.msg.executeSuccess', 'Thực hiện thành công!')
                : this.i18n.t('evs.viewEvsBySelfHAE.msg.saveDraftSuccess', 'Lưu tạm thời thành công!'),
            );
            await this.search();
          } else {
            this.message.error(res.message || this.i18n.t('evs.viewEvsBySelfHAE.msg.actionFail', 'Lỗi khi thực hiện. Vui lòng thử lại.'));
          }
        } catch {
          this.message.error(this.i18n.t('evs.viewEvsBySelfHAE.msg.actionFail', 'Lỗi khi thực hiện. Vui lòng thử lại.'));
        } finally {
          this.saving.set(false);
        }
      },
    });
  }
}
