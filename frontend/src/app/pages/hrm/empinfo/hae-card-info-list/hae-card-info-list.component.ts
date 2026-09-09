import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTreeNodeOptions } from 'ng-zorro-antd/core/tree';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';

import { I18nService } from '../../../../i18n/i18n.service';
import {
  AuthorizedDeptNode,
  ManageEmpPositionFilter,
  ManageEmpPositionInfoDto,
  ManageEmpPositionInfoService,
  SyCodeOption,
} from '../../../ess/manage-emp-position-info-list/manage-emp-position-info-list.service';
import { HaeCardInfoListService, HrCardDetail, HrCardFamilyRow } from './hae-card-info-list.service';

const POST_FAMILY_PARENT_CODE = '14015812';
const EMP_TYPE_PARENT_CODE = '13864';
const EMP_OFFICE_PARENT_CODE = '15118';
const EMP_OFFICE_DEFAULT_CODE = '15119';

const PRINT_CSS = [
  '* { box-sizing: border-box; margin: 0; padding: 0; }',
  'body { font-family: Arial, sans-serif; font-size: 11px; color: #333; background: #fff; }',
  '.hrcard-container { width: 100%; padding: 10px; page-break-after: always; break-after: page; }',
  '.hrcard-container:last-child { page-break-after: auto; break-after: auto; }',
  '.hrcard-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px dashed #ccc; padding-bottom: 10px; margin-bottom: 10px; }',
  '.hrcard-title { font-size: 18px; font-weight: bold; text-align: center; flex-grow: 1; }',
  '.hrcard-table { width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 10px; }',
  '.hrcard-table th, .hrcard-table td { border: 1px solid #000; padding: 3px 4px; text-align: center; vertical-align: middle; word-break: break-word; }',
  '.hrcard-table th { background: #f0f0f0; font-weight: bold; }',
  '.hrcard-photo-cell { width: 100px; text-align: center; vertical-align: middle; border: 1px solid #000; }',
  '.hrcard-photo { width: 80px; height: 100px; margin: 5px auto; background: #0066cc; display: flex; align-items: center; justify-content: center; }',
  '.hrcard-emp-name { font-weight: bold; font-size: 11px; margin-top: 4px; text-align: center; }',
  '.hrcard-emp-id { font-size: 10px; margin-bottom: 4px; text-align: center; }',
  '.hrcard-label { text-align: left; padding-left: 6px; font-weight: bold; }',
  '.hrcard-value { text-align: left; padding-left: 4px; }',
  '.hrcard-info-section { margin-bottom: 10px; }',
  '.hrcard-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }',
  '.hrcard-grid-2 > div { min-width: 0; overflow: hidden; }',
  '.hrcard-section-title { font-weight: bold; font-size: 11px; margin-bottom: 4px; }',
  '@page { size: A4 portrait; margin: 8mm; }',
].join('\n');

function esc(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function rowsHtml<T extends object>(list: T[] | undefined, fields: (keyof T)[], emptyRows = 3): string {
  if (list && list.length > 0) {
    return list
      .map((item) => `<tr>${fields.map((f) => `<td>${esc(item[f])}</td>`).join('')}</tr>`)
      .join('');
  }
  const emptyRow = `<tr>${fields.map(() => '<td>&nbsp;</td>').join('')}</tr>`;
  return Array(emptyRows).fill(emptyRow).join('');
}

/**
 * HrFamily không có field "trình độ học vấn" của người thân - cột
 * "Education" trên bảng Family Information vì vậy luôn để trống (khoảng
 * trống dữ liệu thật sự, không phải lỗi đặt sai tên field).
 */
function familyRowsHtml(list: HrCardFamilyRow[] | undefined, emptyRows = 2): string {
  if (list && list.length > 0) {
    return list
      .map(
        (item) =>
          `<tr><td>${esc(item.famTypeName || item.famTypeCode)}</td><td>${esc(item.famName)}</td><td>${esc(item.famBorndate)}</td><td></td><td>${esc(item.famPhone)}</td></tr>`,
      )
      .join('');
  }
  const emptyRow = '<tr>' + Array(5).fill('<td>&nbsp;</td>').join('') + '</tr>';
  return Array(emptyRows).fill(emptyRow).join('');
}

/**
 * Thẻ nhân sự (viewHAECardInfoList) - port lại từ
 * hrm/empinfo/viewHAECardInfoList.html (đã xoá). Danh sách tìm kiếm dùng lại
 * nguyên vẹn ManageEmpPositionInfoService (cùng endpoint backend đã có sẵn
 * ở module ess `ManageEmpPositionInfoList` - tái sử dụng import chéo module
 * thay vì viết lại, đúng nguyên tắc CLAUDE.md #7). Xem ghi chú bug field-
 * name-mismatch của phần "Thông tin cá nhân" trong hae-card-info-list.service.ts.
 */
@Component({
  selector: 'app-hae-card-info-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCardModule,
    NzDatePickerModule,
    NzFormModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzSelectModule,
    NzTableModule,
    NzTreeSelectModule,
  ],
  templateUrl: './hae-card-info-list.component.html',
  styleUrl: './hae-card-info-list.component.scss',
})
export class HaeCardInfoListComponent implements OnInit {
  private readonly deptService = inject(ManageEmpPositionInfoService);
  private readonly service = inject(HaeCardInfoListService);
  private readonly message = inject(NzMessageService);
  private readonly sanitizer = inject(DomSanitizer);
  protected readonly i18n = inject(I18nService);

  protected readonly loading = signal(false);
  protected readonly list = signal<ManageEmpPositionInfoDto[]>([]);

  protected readonly keyword = signal('');
  protected readonly selectedDeptCodes = signal<string[]>([]);
  protected readonly fromDate = signal<Date | null>(null);
  protected readonly toDate = signal<Date | null>(null);
  protected readonly postFamily = signal<string | null>(null);
  protected readonly empTypeCode = signal<string | null>(null);
  protected readonly empOffice = signal<string | null>(EMP_OFFICE_DEFAULT_CODE);

  protected readonly deptTreeNodes = signal<NzTreeNodeOptions[]>([]);
  protected readonly postFamilyOptions = signal<SyCodeOption[]>([]);
  protected readonly empTypeOptions = signal<SyCodeOption[]>([]);
  protected readonly empOfficeOptions = signal<SyCodeOption[]>([]);

  protected readonly selectedEmpIds = signal<Set<string>>(new Set());

  protected readonly previewVisible = signal(false);
  protected readonly previewCardsHtml = signal<SafeHtml>('');
  private previewCardsRawHtml = '';

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await Promise.all([this.loadFilterOptions(), this.search()]);
  }

  private async loadFilterOptions(): Promise<void> {
    try {
      const [deptList, postFamilyList, empTypeList, empOfficeList] = await Promise.all([
        this.deptService.getAuthorizedDepartments(),
        this.deptService.getCodeList(POST_FAMILY_PARENT_CODE),
        this.deptService.getCodeList(EMP_TYPE_PARENT_CODE),
        this.deptService.getCodeList(EMP_OFFICE_PARENT_CODE),
      ]);
      this.deptTreeNodes.set(this.buildDeptTree(deptList));
      this.postFamilyOptions.set(postFamilyList);
      this.empTypeOptions.set(empTypeList);
      this.empOfficeOptions.set(empOfficeList);
    } catch {
      // im lặng bỏ qua - danh sách bộ lọc trống không chặn tính năng chính
    }
  }

  private buildDeptTree(flatList: AuthorizedDeptNode[]): NzTreeNodeOptions[] {
    const nodeMap = new Map<string, NzTreeNodeOptions>();
    const childKeys = new Map<string, string[]>();
    flatList.forEach((item) => nodeMap.set(item.id, { key: item.id, title: item.text, isLeaf: true }));
    const roots: NzTreeNodeOptions[] = [];
    flatList.forEach((item) => {
      if (item.parent && item.parent !== '0' && nodeMap.has(item.parent)) {
        const siblings = childKeys.get(item.parent) ?? [];
        siblings.push(item.id);
        childKeys.set(item.parent, siblings);
      } else {
        const node = nodeMap.get(item.id);
        if (node) roots.push(node);
      }
    });
    nodeMap.forEach((node, id) => {
      const children = childKeys.get(id);
      if (children && children.length) {
        node.isLeaf = false;
        node.children = children.map((cid) => nodeMap.get(cid)!).filter(Boolean);
      }
    });
    return roots;
  }

  private buildFilter(): ManageEmpPositionFilter {
    return {
      keyword: this.keyword() || undefined,
      deptNos: this.selectedDeptCodes().join(',') || undefined,
      fromDate: this.toApiDate(this.fromDate()),
      toDate: this.toApiDate(this.toDate()),
      postFamily: this.postFamily() ?? undefined,
      empTypeCode: this.empTypeCode() ?? undefined,
      empOffice: this.empOffice() ?? undefined,
    };
  }

  private toApiDate(value: Date | null): string | undefined {
    if (!value) return undefined;
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  async search(): Promise<void> {
    this.loading.set(true);
    try {
      this.list.set(await this.deptService.getList(this.buildFilter()));
    } catch {
      this.list.set([]);
      this.message.error(this.i18n.t('common.loadError', 'Lỗi tải dữ liệu'));
    } finally {
      this.loading.set(false);
    }
  }

  clearSearch(): void {
    this.keyword.set('');
    this.selectedDeptCodes.set([]);
    this.fromDate.set(null);
    this.toDate.set(null);
    this.postFamily.set(null);
    this.empTypeCode.set(null);
    this.empOffice.set(EMP_OFFICE_DEFAULT_CODE);
    this.search();
  }

  toggleRowSelected(empId: string, checked: boolean): void {
    const set = new Set(this.selectedEmpIds());
    if (checked) set.add(empId);
    else set.delete(empId);
    this.selectedEmpIds.set(set);
  }

  isRowSelected(empId?: string): boolean {
    return !!empId && this.selectedEmpIds().has(empId);
  }

  toggleSelectAll(checked: boolean): void {
    this.selectedEmpIds.set(checked ? new Set(this.list().map((r) => r.empId!).filter(Boolean)) : new Set());
  }

  async printSelected(): Promise<void> {
    const empIds = Array.from(this.selectedEmpIds());
    if (!empIds.length) {
      this.message.warning(this.i18n.t('hrm.viewHAECardInfoList.msg.selectAtLeastOne', 'Vui lòng chọn ít nhất một nhân viên để in thẻ.'));
      return;
    }
    await this.openCardPreview(empIds);
  }

  async openCardForEmployee(empId: string): Promise<void> {
    await this.openCardPreview([empId]);
  }

  private async openCardPreview(empIds: string[]): Promise<void> {
    try {
      const details = await Promise.all(empIds.map((id) => this.service.getCardDetail(id)));
      this.previewCardsRawHtml = details.map((d) => this.buildCardHtml(d)).join('');
      this.previewCardsHtml.set(this.sanitizer.bypassSecurityTrustHtml(this.previewCardsRawHtml));
      this.previewVisible.set(true);
    } catch {
      this.message.error(this.i18n.t('hrm.viewHAECardInfoList.msg.loadCardError', 'Lỗi tải dữ liệu thẻ nhân sự'));
    }
  }

  closePreview(): void {
    this.previewVisible.set(false);
  }

  private buildCardHtml(res: HrCardDetail): string {
    const e = res.employee || {};
    const p = res.personalInfo || {};

    return `<div class="hrcard-container">
      <div class="hrcard-header">
        <div><div style="font-size:22px;font-weight:bold;color:#ff6a00;">Hanwha Aero Engines</div></div>
        <div class="hrcard-title">HR CARD</div>
      </div>
      <div class="hrcard-info-section">
        <table class="hrcard-table">
          <tbody>
            <tr>
              <td rowspan="8" class="hrcard-photo-cell">
                <div class="hrcard-photo"></div>
                <div class="hrcard-emp-name">${esc(e.localName)}</div>
                <div class="hrcard-emp-id">${esc(e.empId)}</div>
              </td>
              <th class="hrcard-label">Department</th><td class="hrcard-value">${esc(e.deptNo)}</td>
              <th class="hrcard-label">Contract start</th><td class="hrcard-value">${esc(e.dateStarted)}</td>
              <th class="hrcard-label">REG place</th><td class="hrcard-value">${esc(p.regPlace)}</td>
            </tr>
            <tr>
              <th class="hrcard-label">Rank</th><td class="hrcard-value">${esc(e.postGradeNo)}</td>
              <th class="hrcard-label">Contract end</th><td class="hrcard-value">${esc(e.dateLeft)}</td>
              <th class="hrcard-label">Political</th><td class="hrcard-value">${esc(p.politicalStatus)}</td>
            </tr>
            <tr>
              <th class="hrcard-label">Mainbusiness</th><td class="hrcard-value">${esc(e.mainBusiness)}</td>
              <th class="hrcard-label">Final edu</th><td class="hrcard-value">${esc(p.finalDegreeName)}</td>
              <th class="hrcard-label">Birthday</th><td class="hrcard-value">${esc(p.dob)}</td>
            </tr>
            <tr>
              <th class="hrcard-label">Cost center</th><td class="hrcard-value">${esc(e.costCenter)}</td>
              <th class="hrcard-label">Grad school</th><td class="hrcard-value"></td>
              <th class="hrcard-label">Gender</th><td class="hrcard-value">${esc(p.sexName)}</td>
            </tr>
            <tr>
              <th class="hrcard-label">State service</th><td class="hrcard-value">${esc(e.empOffice)}</td>
              <th class="hrcard-label">Major</th><td class="hrcard-value"></td>
              <th class="hrcard-label">Home phone</th><td class="hrcard-value">${esc(p.homePhone)}</td>
            </tr>
            <tr>
              <th class="hrcard-label">Division entry</th><td class="hrcard-value"></td>
              <th class="hrcard-label">Grad date</th><td class="hrcard-value"></td>
              <th class="hrcard-label">Tel</th><td class="hrcard-value">${esc(p.cellphone)}</td>
            </tr>
            <tr>
              <th class="hrcard-label">Date entry</th><td class="hrcard-value">${esc(e.dateStarted)}</td>
              <th class="hrcard-label">National</th><td class="hrcard-value">${esc(p.nationalityName)}</td>
              <th class="hrcard-label">Married</th><td class="hrcard-value">${esc(p.maritalStatusName)}</td>
            </tr>
            <tr>
              <th class="hrcard-label">Person email</th><td class="hrcard-value">${esc(p.email)}</td>
              <th class="hrcard-label">C.email</th><td class="hrcard-value">${esc(p.emailSecond)}</td>
              <th class="hrcard-label">Marry date</th><td class="hrcard-value">${esc(p.weddingDate)}</td>
            </tr>
            <tr>
              <th class="hrcard-label" style="border-top:none;"></th>
              <th class="hrcard-label">Present add</th><td class="hrcard-value" colspan="3">${esc(p.homeAddress)}</td>
              <th class="hrcard-label">EagleM ID</th><td class="hrcard-value">${esc(p.singId)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="hrcard-grid-2">
        <div>
          <div class="hrcard-section-title">Education Information</div>
          <table class="hrcard-table">
            <thead><tr><th>Admissions</th><th>Graduation</th><th>Education</th><th>Graduate school</th><th>Major</th></tr></thead>
            <tbody>${rowsHtml(res.educations, ['startDate', 'endDate', 'degreeCode', 'institutionName', 'subject'], 2)}</tbody>
          </table>
        </div>
        <div>
          <div class="hrcard-section-title">Family Information</div>
          <table class="hrcard-table">
            <thead><tr><th>Relation</th><th>Name</th><th>Birthday</th><th>Education</th><th>Tel</th></tr></thead>
            <tbody>${familyRowsHtml(res.families, 2)}</tbody>
          </table>
        </div>
      </div>
      <div class="hrcard-section-title">Experience Information</div>
      <table class="hrcard-table">
        <thead><tr><th>Start date</th><th>End date</th><th>Corporate name</th><th>Department</th><th>Remarks</th></tr></thead>
        <tbody>${rowsHtml(res.experiences, ['startDate', 'endDate', 'cpnyName', 'deptName', 'remark'], 2)}</tbody>
      </table>
      <div class="hrcard-grid-2">
        <div>
          <div class="hrcard-section-title">Qualification Information</div>
          <table class="hrcard-table">
            <thead><tr><th>Qualification</th><th>Grade</th><th>Issuing</th><th>Evidence</th><th>Effective</th></tr></thead>
            <tbody>${rowsHtml(res.qualifications, ['qualName', 'qualGrade', 'qualInstitute', 'qualCardNo', 'validityDate'], 2)}</tbody>
          </table>
        </div>
        <div></div>
      </div>
    </div>`;
  }

  executePrint(): void {
    const html = this.previewCardsRawHtml;
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;width:0;height:0;border:none;visibility:hidden;';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${PRINT_CSS}</style></head><body>${html}</body></html>`);
    doc.close();
    const win = iframe.contentWindow!;
    win.onafterprint = () => document.body.removeChild(iframe);
    setTimeout(() => {
      win.focus();
      win.print();
    }, 600);
  }
}
