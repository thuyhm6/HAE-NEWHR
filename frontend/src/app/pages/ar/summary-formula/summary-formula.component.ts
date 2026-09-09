import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzFormatEmitEvent, NzTreeModule } from 'ng-zorro-antd/tree';
import { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';

import { I18nService } from '../../../i18n/i18n.service';
import {
  FormulaRow,
  FormulaSavePayload,
  ItemTreeOption,
  SummaryFormulaService,
  ToolAttItem,
  ToolBasicInfo,
  ToolStaItem,
} from './summary-formula.service';

/**
 * Quản lý Công thức Hạng mục tổng hợp (Tree-Table + Tools) - port lại từ
 * ar/attendanceSettings/viewSummaryFormula.html (đã xoá). Bản gốc gắn
 * `keyup` cho `#arStaFormula_searchTreeInput` nhưng KHÔNG có phần tử đó
 * trong HTML (không có ô tìm kiếm nào ở panel bên trái) - chỉ là code thừa
 * vô hại (jQuery bind vào tập rỗng), không phải lỗi. Đã bổ sung 1 ô tìm
 * kiếm thật cho cây (khớp đúng UX của 2 trang cây tương tự đã làm ở batch
 * trước: ArItemParamList, Shift) thay vì để trống hoàn toàn, vì đây rõ ràng
 * là điều nhà phát triển bản gốc định làm (đã import jsTree 'search' plugin)
 * nhưng quên thêm input - cải thiện nhỏ, không đổi backend/nghiệp vụ.
 */
@Component({
  selector: 'app-summary-formula',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCardModule,
    NzFormModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzInputNumberModule,
    NzModalModule,
    NzSelectModule,
    NzTableModule,
    NzTreeModule,
  ],
  templateUrl: './summary-formula.component.html',
  styleUrl: './summary-formula.component.scss',
})
export class SummaryFormulaComponent implements OnInit {
  private readonly service = inject(SummaryFormulaService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  protected readonly i18n = inject(I18nService);

  @ViewChild('formularTextarea') formularTextareaRef?: ElementRef<HTMLTextAreaElement>;

  protected readonly treeLoading = signal(false);
  protected readonly itemOptions = signal<ItemTreeOption[]>([]);
  protected readonly itemTreeNodes = signal<NzTreeNodeOptions[]>([]);
  protected readonly searchTreeValue = signal('');
  protected readonly selectedItemNo = signal<string | null>(null);
  protected readonly selectedItemLabel = signal<string | null>(null);

  protected readonly listLoading = signal(false);
  protected readonly rows = signal<FormulaRow[]>([]);

  protected readonly modalVisible = signal(false);
  protected readonly modalIsEdit = signal(false);
  protected readonly savingRecord = signal(false);

  protected readonly formFormularNo = signal<number | null>(null);
  protected readonly formCondition = signal('');
  protected readonly formFormular = signal('');
  protected readonly formOrderno = signal<number | null>(0);
  protected readonly formActive = signal(true);

  protected readonly attItems = signal<ToolAttItem[]>([]);
  protected readonly staItems = signal<ToolStaItem[]>([]);
  protected readonly basicInfos = signal<ToolBasicInfo[]>([]);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await Promise.all([this.loadTree(), this.loadTools()]);
  }

  private async loadTools(): Promise<void> {
    try {
      const [att, sta, basic] = await Promise.all([
        this.service.getAttItems(),
        this.service.getStaItems(),
        this.service.getBasicInfos(),
      ]);
      this.attItems.set(att);
      this.staItems.set(sta);
      this.basicInfos.set(basic);
    } catch {
      this.attItems.set([]);
      this.staItems.set([]);
      this.basicInfos.set([]);
    }
  }

  private itemLabel(item: ItemTreeOption): string {
    return item.nameVi || item.itemNo;
  }

  async loadTree(): Promise<void> {
    this.treeLoading.set(true);
    try {
      const list = await this.service.getTreeItems();
      this.itemOptions.set(list);
      this.itemTreeNodes.set(list.map((it) => ({ key: it.itemNo, title: this.itemLabel(it), isLeaf: true })));
    } catch {
      this.itemOptions.set([]);
      this.itemTreeNodes.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.treeLoading.set(false);
      this.selectedItemNo.set(null);
      this.selectedItemLabel.set(null);
      this.rows.set([]);
    }
  }

  onTreeClick(event: NzFormatEmitEvent): void {
    const key = event.node?.key;
    if (!key) return;
    this.selectedItemNo.set(key);
    const found = this.itemOptions().find((it) => it.itemNo === key);
    this.selectedItemLabel.set(found ? this.itemLabel(found) : key);
    this.loadFormulas();
  }

  async loadFormulas(): Promise<void> {
    const itemNo = this.selectedItemNo();
    if (!itemNo) {
      this.rows.set([]);
      return;
    }
    this.listLoading.set(true);
    try {
      this.rows.set(await this.service.getFormulasByItem(itemNo));
    } catch {
      this.rows.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.listLoading.set(false);
    }
  }

  openAddModal(): void {
    if (!this.selectedItemNo()) {
      this.message.warning(this.i18n.t('ar.viewSummaryFormula.msg.selectItemFirst', 'Vui lòng chọn Hạng mục ở cây bên trái trước khi thêm công thức!'));
      return;
    }
    this.modalIsEdit.set(false);
    this.formFormularNo.set(null);
    this.formCondition.set('');
    this.formFormular.set('');
    this.formOrderno.set(0);
    this.formActive.set(true);
    this.modalVisible.set(true);
  }

  async editFormula(formularNo: number | undefined): Promise<void> {
    if (!formularNo) return;
    try {
      const d = await this.service.getFormulaById(formularNo);
      this.modalIsEdit.set(true);
      this.formFormularNo.set(d.formularNo ?? formularNo);
      this.formCondition.set(d.condition ?? '');
      this.formFormular.set(d.formular ?? '');
      this.formOrderno.set(d.orderno ?? 0);
      this.formActive.set((d.activity ?? 1) === 1);
      this.modalVisible.set(true);
    } catch {
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    }
  }

  closeModal(): void {
    this.modalVisible.set(false);
  }

  insertToFormular(text: string): void {
    const current = this.formFormular();
    this.formFormular.set(current ? `${current} ${text}` : text);
    this.formularTextareaRef?.nativeElement.focus();
  }

  async saveRecord(): Promise<void> {
    const itemNo = this.selectedItemNo();
    if (!itemNo) {
      this.message.warning(this.i18n.t('ar.viewSummaryFormula.msg.noItemSelected', 'Lỗi: Chưa chọn Hạng mục'));
      return;
    }
    const formular = this.formFormular().trim();
    if (!formular) {
      this.message.warning(this.i18n.t('ar.viewSummaryFormula.msg.enterFormula', 'Vui lòng nhập nội dung công thức!'));
      return;
    }
    const payload: FormulaSavePayload = {
      formularNo: this.formFormularNo(),
      itemNo,
      condition: this.formCondition().trim() || null,
      formular,
      orderno: this.formOrderno(),
      activity: this.formActive() ? 1 : 0,
    };
    this.savingRecord.set(true);
    try {
      const res = await this.service.save(payload);
      if (res.success) {
        this.message.success(res.message || this.i18n.t('common.saveSuccess', 'Lưu thành công'));
        this.modalVisible.set(false);
        await this.loadFormulas();
      } else {
        this.message.error(res.error || this.i18n.t('common.saveFailed', 'Lưu thất bại.'));
      }
    } catch {
      this.message.error(this.i18n.t('common.saveFailed', 'Lưu thất bại.'));
    } finally {
      this.savingRecord.set(false);
    }
  }

  deleteFormula(formularNo: number | undefined): void {
    if (!formularNo) return;
    this.modal.confirm({
      nzTitle: this.i18n.t('ar.viewSummaryFormula.confirm.delete', 'Bạn có chắc chắn muốn xóa công thức này?'),
      nzOkDanger: true,
      nzOnOk: async () => {
        try {
          const res = await this.service.delete(formularNo);
          if (res.success) {
            await this.loadFormulas();
          } else {
            this.message.error(res.error || this.i18n.t('common.deleteFailed', 'Xóa thất bại.'));
          }
        } catch {
          this.message.error(this.i18n.t('common.deleteFailed', 'Xóa thất bại.'));
        }
      },
    });
  }
}
