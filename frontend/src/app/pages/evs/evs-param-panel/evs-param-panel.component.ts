import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

import { I18nService } from '../../../i18n/i18n.service';
import {
  EvsAffirmRule,
  EvsGrade,
  EvsParamObject,
  EvsParamPanelService,
  EvsParamRow,
  EvsResumeOption,
  SyCodeOption,
} from './evs-param-panel.service';

const GRADE_TYPE_PARENT = '14015137';
const GRADE_PARENT = '14015161';
const START_STEP_PARENT = '14015351';
const AFFIRM_STEP_PARENT = '14015060';
const RULE_ID_PARENT = '14015172';

type ParamType = 'ITEM' | 'LIST' | 'GROUP' | 'FAMILY';

/**
 * Tiêu chuẩn đánh giá (viewEvsParamPanel) - port lại từ
 * evs/manage/viewEvsParamPanel.html (đã xoá). Xem ghi chú quyết định
 * modal-CRUD trong evs-param-panel.service.ts.
 */
@Component({
  selector: 'app-evs-param-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCheckboxModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzModalModule,
    NzSelectModule,
    NzTableModule,
    NzTabsModule,
  ],
  templateUrl: './evs-param-panel.component.html',
  styleUrl: './evs-param-panel.component.scss',
})
export class EvsParamPanelComponent implements OnInit {
  private readonly service = inject(EvsParamPanelService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  private readonly route = inject(ActivatedRoute);
  protected readonly i18n = inject(I18nService);

  private evsType = '';

  protected readonly resumeOptions = signal<EvsResumeOption[]>([]);
  protected readonly searchResumeSeq = signal<string | null>(null);
  protected readonly activeTabIndex = signal(0);

  protected readonly gradeTypeOptions = signal<SyCodeOption[]>([]);
  protected readonly gradeOptions = signal<SyCodeOption[]>([]);
  protected readonly startStepOptions = signal<SyCodeOption[]>([]);
  protected readonly affirmStepOptions = signal<SyCodeOption[]>([]);
  protected readonly ruleIdOptions = signal<SyCodeOption[]>([]);
  protected readonly formulaOptions = signal<SyCodeOption[]>([]);
  protected readonly groupOptions = signal<SyCodeOption[]>([]);

  protected readonly gradeRows = signal<EvsGrade[]>([]);
  protected readonly itemRows = signal<EvsParamRow[]>([]);
  protected readonly objectRows = signal<EvsParamObject[]>([]);
  protected readonly listRows = signal<EvsParamRow[]>([]);
  protected readonly groupRows = signal<EvsParamRow[]>([]);
  protected readonly familyRows = signal<EvsParamRow[]>([]);
  protected readonly affirmRows = signal<EvsAffirmRule[]>([]);
  protected readonly tabLoading = signal(false);

  // ── Modal: Cấp đánh giá ──
  protected readonly gradeModalVisible = signal(false);
  protected readonly gradeSaving = signal(false);
  protected readonly formGradeSeq = signal('');
  protected readonly formEvsType = signal<string | null>(null);
  protected readonly formEvsGrade = signal<string | null>(null);
  protected readonly formIsInclude = signal(false);
  protected readonly formStartScore = signal<number | null>(null);
  protected readonly formEndScore = signal<number | null>(null);
  protected readonly formScore = signal<number | null>(null);
  protected readonly formGradeRemark = signal('');

  // ── Modal: Param dùng chung (item/list/group/family) ──
  protected readonly paramModalVisible = signal(false);
  protected readonly paramSaving = signal(false);
  protected readonly paramCurrentType = signal<ParamType>('ITEM');
  protected readonly formParamSeq = signal('');
  protected readonly formParamCodeNo = signal('');
  protected readonly formParamCodeName = signal('');
  protected readonly formParamFormula = signal<string | null>(null);
  protected readonly formParamStartStep = signal<string | null>(null);
  protected readonly formParamEvsScore = signal<number | null>(null);

  // ── Modal: Đối tượng đánh giá ──
  protected readonly objectModalVisible = signal(false);
  protected readonly objectSaving = signal(false);
  protected readonly formObjectSeq = signal('');
  protected readonly formObjectCodeNo = signal('');
  protected readonly formObjectCodeName = signal('');
  protected readonly formObjectIsInclude = signal(false);
  protected readonly formObjectEvsGrade = signal<string | null>(null);
  protected readonly formObjectFormula = signal<string | null>(null);

  // ── Modal: Người đánh giá ──
  protected readonly affirmModalVisible = signal(false);
  protected readonly affirmSaving = signal(false);
  protected readonly formAffirmSeq = signal('');
  protected readonly formAffirmStep = signal<string | null>(null);
  protected readonly formAffirmGroup = signal<string | null>(null);
  protected readonly formAffirmRuleId = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    this.evsType = this.route.snapshot.queryParamMap.get('evsType') || '';
    try {
      const [gradeTypeList, gradeList, startStepList, affirmStepList, ruleIdList, formulaList] = await Promise.all([
        this.service.getCodeList(GRADE_TYPE_PARENT),
        this.service.getCodeList(GRADE_PARENT),
        this.service.getCodeList(START_STEP_PARENT),
        this.service.getCodeList(AFFIRM_STEP_PARENT),
        this.service.getCodeList(RULE_ID_PARENT),
        this.service.getFormulaOptions(),
      ]);
      this.gradeTypeOptions.set(gradeTypeList);
      this.gradeOptions.set(gradeList);
      this.startStepOptions.set(startStepList);
      this.affirmStepOptions.set(affirmStepList);
      this.ruleIdOptions.set(ruleIdList);
      this.formulaOptions.set(formulaList);

      const resumeList = await this.service.getResumeOptions(this.evsType);
      this.resumeOptions.set(resumeList);
      if (resumeList.length) {
        this.searchResumeSeq.set(resumeList[0].seq ?? null);
        await this.search();
      }
    } catch {
      // im lặng bỏ qua - danh sách tùy chọn trống không chặn chức năng chính
    }
  }

  formulaName(codeNo?: string): string {
    if (!codeNo) return '';
    return this.formulaOptions().find((o) => o.codeNo === codeNo)?.codeName || codeNo;
  }

  async search(): Promise<void> {
    const resumeSeq = this.searchResumeSeq();
    if (!resumeSeq) return;
    this.tabLoading.set(true);
    try {
      const [grade, item, object, list, group, family, affirm, groupOpts] = await Promise.all([
        this.service.getGradeList(resumeSeq, this.evsType),
        this.service.getParamList(resumeSeq, 'ITEM', this.evsType),
        this.service.getParamObjectList(resumeSeq, this.evsType),
        this.service.getParamList(resumeSeq, 'LIST', this.evsType),
        this.service.getParamList(resumeSeq, 'GROUP', this.evsType),
        this.service.getParamList(resumeSeq, 'FAMILY', this.evsType),
        this.service.getAffirmRuleList(resumeSeq),
        this.service.getGroupOptions(resumeSeq),
      ]);
      this.gradeRows.set(grade);
      this.itemRows.set(item);
      this.objectRows.set(object);
      this.listRows.set(list);
      this.groupRows.set(group);
      this.familyRows.set(family);
      this.affirmRows.set(affirm);
      this.groupOptions.set(groupOpts);
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.tabLoading.set(false);
    }
  }

  // ── Cấp đánh giá ──
  openGradeAddModal(): void {
    this.formGradeSeq.set('');
    this.formEvsType.set(null);
    this.formEvsGrade.set(null);
    this.formIsInclude.set(false);
    this.formStartScore.set(null);
    this.formEndScore.set(null);
    this.formScore.set(null);
    this.formGradeRemark.set('');
    this.gradeModalVisible.set(true);
  }

  openGradeEditModal(row: EvsGrade): void {
    this.formGradeSeq.set(row.seq ?? '');
    this.formEvsType.set(row.evsType ?? null);
    this.formEvsGrade.set(row.evsGrade ?? null);
    this.formIsInclude.set(row.isInclude === '1' || row.isInclude === 'Y');
    this.formStartScore.set(row.startScore != null ? Number(row.startScore) : null);
    this.formEndScore.set(row.endScore != null ? Number(row.endScore) : null);
    this.formScore.set(row.score != null ? Number(row.score) : null);
    this.formGradeRemark.set(row.remark ?? '');
    this.gradeModalVisible.set(true);
  }

  async saveGrade(): Promise<void> {
    const resumeSeq = this.searchResumeSeq();
    if (!resumeSeq) return;
    this.gradeSaving.set(true);
    try {
      await this.service.saveGrade({
        seq: this.formGradeSeq() || undefined,
        resumeSeq,
        evsType: this.formEvsType() ?? undefined,
        evsGrade: this.formEvsGrade() ?? undefined,
        isInclude: this.formIsInclude() ? '1' : '0',
        startScore: this.formStartScore() != null ? String(this.formStartScore()) : undefined,
        endScore: this.formEndScore() != null ? String(this.formEndScore()) : undefined,
        score: this.formScore() != null ? String(this.formScore()) : undefined,
        remark: this.formGradeRemark() || undefined,
      });
      this.gradeModalVisible.set(false);
      this.gradeRows.set(await this.service.getGradeList(resumeSeq, this.evsType));
    } catch {
      this.message.error(this.i18n.t('evsParam.js.saveError', 'Lỗi khi lưu dữ liệu. Vui lòng thử lại.'));
    } finally {
      this.gradeSaving.set(false);
    }
  }

  deleteGrade(row: EvsGrade): void {
    const resumeSeq = this.searchResumeSeq();
    if (!resumeSeq || !row.seq) return;
    this.modal.confirm({
      nzTitle: this.i18n.t('evsParam.modal.deleteTitle', 'Xác nhận xóa'),
      nzOkDanger: true,
      nzOnOk: async () => {
        await this.service.deleteGrade(row.seq!);
        this.gradeRows.set(await this.service.getGradeList(resumeSeq, this.evsType));
      },
    });
  }

  // ── Param dùng chung (item/list/group/family) ──
  private paramRowsSignal(type: ParamType) {
    return type === 'ITEM' ? this.itemRows : type === 'LIST' ? this.listRows : type === 'GROUP' ? this.groupRows : this.familyRows;
  }

  private async reloadParamTab(type: ParamType): Promise<void> {
    const resumeSeq = this.searchResumeSeq();
    if (!resumeSeq) return;
    this.paramRowsSignal(type).set(await this.service.getParamList(resumeSeq, type, this.evsType));
  }

  openParamAddModal(type: ParamType): void {
    this.paramCurrentType.set(type);
    this.formParamSeq.set('');
    this.formParamCodeNo.set('');
    this.formParamCodeName.set('');
    this.formParamFormula.set(null);
    this.formParamStartStep.set(null);
    this.formParamEvsScore.set(null);
    this.paramModalVisible.set(true);
  }

  openParamEditModal(type: ParamType, row: EvsParamRow): void {
    this.paramCurrentType.set(type);
    this.formParamSeq.set(row.seq ?? '');
    this.formParamCodeNo.set(row.codeNo ?? '');
    this.formParamCodeName.set(row.codeName ?? '');
    this.formParamFormula.set(row.formula ?? null);
    this.formParamStartStep.set(row.startStep ?? null);
    this.formParamEvsScore.set(row.evsScore != null ? Number(row.evsScore) : null);
    this.paramModalVisible.set(true);
  }

  async saveParam(): Promise<void> {
    const resumeSeq = this.searchResumeSeq();
    const codeNo = this.formParamCodeNo().trim();
    if (!resumeSeq || !codeNo) return;
    this.paramSaving.set(true);
    try {
      await this.service.saveParam({
        seq: this.formParamSeq() || undefined,
        resumeSeq,
        paramType: this.paramCurrentType(),
        evsType: this.evsType,
        codeNo,
        codeName: this.formParamCodeName().trim() || undefined,
        formula: this.formParamFormula() ?? undefined,
        startStep: this.formParamStartStep() ?? undefined,
        evsScore: this.formParamEvsScore() != null ? String(this.formParamEvsScore()) : undefined,
      });
      this.paramModalVisible.set(false);
      await this.reloadParamTab(this.paramCurrentType());
    } catch {
      this.message.error(this.i18n.t('evsParam.js.saveError', 'Lỗi khi lưu dữ liệu. Vui lòng thử lại.'));
    } finally {
      this.paramSaving.set(false);
    }
  }

  deleteParam(type: ParamType, row: EvsParamRow): void {
    if (!row.seq) return;
    this.modal.confirm({
      nzTitle: this.i18n.t('evsParam.modal.deleteTitle', 'Xác nhận xóa'),
      nzOkDanger: true,
      nzOnOk: async () => {
        await this.service.deleteParam(row.seq!);
        await this.reloadParamTab(type);
      },
    });
  }

  // ── Đối tượng đánh giá ──
  openObjectAddModal(): void {
    this.formObjectSeq.set('');
    this.formObjectCodeNo.set('');
    this.formObjectCodeName.set('');
    this.formObjectIsInclude.set(false);
    this.formObjectEvsGrade.set(null);
    this.formObjectFormula.set(null);
    this.objectModalVisible.set(true);
  }

  openObjectEditModal(row: EvsParamObject): void {
    this.formObjectSeq.set(row.seq ?? '');
    this.formObjectCodeNo.set(row.codeNo ?? '');
    this.formObjectCodeName.set(row.codeName ?? '');
    this.formObjectIsInclude.set(row.isInclude === '1' || row.isInclude === 'Y');
    this.formObjectEvsGrade.set(row.evsGrade ?? null);
    this.formObjectFormula.set(row.formula ?? null);
    this.objectModalVisible.set(true);
  }

  async saveObject(): Promise<void> {
    const resumeSeq = this.searchResumeSeq();
    const codeNo = this.formObjectCodeNo().trim();
    if (!resumeSeq || !codeNo) return;
    this.objectSaving.set(true);
    try {
      await this.service.saveParamObject({
        seq: this.formObjectSeq() || undefined,
        resumeSeq,
        codeNo,
        codeName: this.formObjectCodeName().trim() || undefined,
        isInclude: this.formObjectIsInclude() ? '1' : '0',
        evsGrade: this.formObjectEvsGrade() ?? undefined,
        formula: this.formObjectFormula() ?? undefined,
      });
      this.objectModalVisible.set(false);
      this.objectRows.set(await this.service.getParamObjectList(resumeSeq, this.evsType));
    } catch {
      this.message.error(this.i18n.t('evsParam.js.saveError', 'Lỗi khi lưu dữ liệu. Vui lòng thử lại.'));
    } finally {
      this.objectSaving.set(false);
    }
  }

  deleteObject(row: EvsParamObject): void {
    const resumeSeq = this.searchResumeSeq();
    if (!resumeSeq || !row.seq) return;
    this.modal.confirm({
      nzTitle: this.i18n.t('evsParam.modal.deleteTitle', 'Xác nhận xóa'),
      nzOkDanger: true,
      nzOnOk: async () => {
        await this.service.deleteParamObject(row.seq!);
        this.objectRows.set(await this.service.getParamObjectList(resumeSeq, this.evsType));
      },
    });
  }

  // ── Người đánh giá ──
  openAffirmAddModal(): void {
    this.formAffirmSeq.set('');
    this.formAffirmStep.set(null);
    this.formAffirmGroup.set(null);
    this.formAffirmRuleId.set(null);
    this.affirmModalVisible.set(true);
  }

  openAffirmEditModal(row: EvsAffirmRule): void {
    this.formAffirmSeq.set(row.seq ?? '');
    this.formAffirmStep.set(row.evsStep ?? null);
    this.formAffirmGroup.set(row.evsGroup ?? null);
    this.formAffirmRuleId.set(row.ruleId ?? null);
    this.affirmModalVisible.set(true);
  }

  async saveAffirm(): Promise<void> {
    const resumeSeq = this.searchResumeSeq();
    if (!resumeSeq) return;
    this.affirmSaving.set(true);
    try {
      await this.service.saveAffirmRule({
        seq: this.formAffirmSeq() || undefined,
        resumeSeq,
        evsStep: this.formAffirmStep() ?? undefined,
        evsGroup: this.formAffirmGroup() ?? undefined,
        ruleId: this.formAffirmRuleId() ?? undefined,
      });
      this.affirmModalVisible.set(false);
      this.affirmRows.set(await this.service.getAffirmRuleList(resumeSeq));
    } catch {
      this.message.error(this.i18n.t('evsParam.js.saveError', 'Lỗi khi lưu dữ liệu. Vui lòng thử lại.'));
    } finally {
      this.affirmSaving.set(false);
    }
  }

  deleteAffirm(row: EvsAffirmRule): void {
    const resumeSeq = this.searchResumeSeq();
    if (!resumeSeq || !row.seq) return;
    this.modal.confirm({
      nzTitle: this.i18n.t('evsParam.modal.deleteTitle', 'Xác nhận xóa'),
      nzOkDanger: true,
      nzOnOk: async () => {
        await this.service.deleteAffirmRule(row.seq!);
        this.affirmRows.set(await this.service.getAffirmRuleList(resumeSeq));
      },
    });
  }
}
