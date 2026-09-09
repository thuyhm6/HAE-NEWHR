import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
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

import { I18nService } from '../../../i18n/i18n.service';
import {
  AuthorizedDeptNode,
  ManageEmpPositionFilter,
  ManageEmpPositionInfoDto,
  ManageEmpPositionInfoService,
  ManageEmpPositionInsideDto,
  SyCodeOption,
} from '../manage-emp-position-info-list/manage-emp-position-info-list.service';

const POST_FAMILY_PARENT_CODE = '14015812';
const EMP_TYPE_PARENT_CODE = '13864';
const EMP_OFFICE_PARENT_CODE = '15118';
const EMP_OFFICE_ACTIVE_CODE = '15119';
const NATIONALITY_PARENT_CODE = '870';

/**
 * Danh sách nhân sự theo phòng ban (dạng bảng) - port lại từ
 * ess/viewDept/viewDeptPersonalInfoManageList.html (Thymeleaf + DataTables,
 * đã xoá) sang Angular + NG-ZORRO. Trang này gọi lại NGUYÊN VẸN cùng API/DTO
 * với ManageEmpPositionInfoList (chỉ khác cách hiển thị: bản Thymeleaf cũ
 * render mỗi dòng thành 1 "thẻ" HTML dựng tay, ở đây theo quy tắc dự án dùng
 * nz-table cho dữ liệu dạng bảng) nên tái sử dụng thẳng
 * ManageEmpPositionInfoService, không tạo service trùng lặp.
 */
@Component({
  selector: 'app-dept-personal-info-manage-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzCardModule,
    NzDatePickerModule,
    NzDescriptionsModule,
    NzFormModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
    NzSelectModule,
    NzTableModule,
    NzTreeSelectModule,
  ],
  templateUrl: './dept-personal-info-manage-list.component.html',
  styleUrl: './dept-personal-info-manage-list.component.scss',
})
export class DeptPersonalInfoManageListComponent implements OnInit {
  private readonly service = inject(ManageEmpPositionInfoService);
  private readonly message = inject(NzMessageService);
  protected readonly i18n = inject(I18nService);

  protected readonly loading = signal(false);
  protected readonly list = signal<ManageEmpPositionInfoDto[]>([]);

  protected readonly keyword = signal('');
  protected readonly selectedDeptCodes = signal<string[]>([]);
  protected readonly fromDate = signal<Date | null>(null);
  protected readonly toDate = signal<Date | null>(null);
  protected readonly postFamily = signal<string | null>(null);
  protected readonly empTypeCode = signal<string | null>(null);
  protected readonly empOffice = signal<string | null>(EMP_OFFICE_ACTIVE_CODE);
  protected readonly nationalityCode = signal<string | null>(null);

  protected readonly deptTreeNodes = signal<NzTreeNodeOptions[]>([]);
  protected readonly postFamilyOptions = signal<SyCodeOption[]>([]);
  protected readonly empTypeOptions = signal<SyCodeOption[]>([]);
  protected readonly empOfficeOptions = signal<SyCodeOption[]>([]);
  protected readonly nationalityOptions = signal<SyCodeOption[]>([]);

  protected readonly showDetailModal = signal(false);
  protected readonly selectedRow = signal<ManageEmpPositionInfoDto | null>(null);
  protected readonly insideExperienceList = signal<ManageEmpPositionInsideDto[]>([]);
  protected readonly insideExperienceLoading = signal(false);

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    await Promise.all([this.loadFilterOptions(), this.search()]);
  }

  private async loadFilterOptions(): Promise<void> {
    try {
      const [deptList, postFamilyList, empTypeList, empOfficeList, nationalityList] = await Promise.all([
        this.service.getAuthorizedDepartments(),
        this.service.getCodeList(POST_FAMILY_PARENT_CODE),
        this.service.getCodeList(EMP_TYPE_PARENT_CODE),
        this.service.getCodeList(EMP_OFFICE_PARENT_CODE),
        this.service.getCodeList(NATIONALITY_PARENT_CODE),
      ]);
      this.deptTreeNodes.set(this.buildDeptTree(deptList));
      this.postFamilyOptions.set(postFamilyList);
      this.empTypeOptions.set(empTypeList);
      this.empOfficeOptions.set(empOfficeList);
      this.nationalityOptions.set(nationalityList);
    } catch {
      // im lặng bỏ qua - danh sách bộ lọc trống không chặn việc tra cứu chính
    }
  }

  private buildDeptTree(flatList: AuthorizedDeptNode[]): NzTreeNodeOptions[] {
    const nodeMap = new Map<string, NzTreeNodeOptions>();
    const childKeys = new Map<string, string[]>();

    flatList.forEach((item) => {
      nodeMap.set(item.id, { key: item.id, title: item.text, isLeaf: true });
    });

    const roots: NzTreeNodeOptions[] = [];
    flatList.forEach((item) => {
      if (item.parent && item.parent !== '0' && nodeMap.has(item.parent)) {
        const siblings = childKeys.get(item.parent) ?? [];
        siblings.push(item.id);
        childKeys.set(item.parent, siblings);
      } else {
        const node = nodeMap.get(item.id);
        if (node) {
          roots.push(node);
        }
      }
    });

    nodeMap.forEach((node, id) => {
      const children = childKeys.get(id);
      if (children && children.length) {
        node.isLeaf = false;
        node.children = children.map((childId) => nodeMap.get(childId)!).filter(Boolean);
      }
    });

    return roots;
  }

  async search(): Promise<void> {
    this.loading.set(true);
    try {
      this.list.set(await this.service.getList(this.buildFilter()));
    } catch {
      this.message.error(this.i18n.t('vdp.msg.loadInsideFailed', 'Tải dữ liệu quá trình nội bộ thất bại.'));
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
    this.empOffice.set(EMP_OFFICE_ACTIVE_CODE);
    this.nationalityCode.set(null);
    this.search();
  }

  get exportUrl(): string {
    return this.service.buildExportUrl(this.buildFilter());
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
      nationalityCode: this.nationalityCode() ?? undefined,
    };
  }

  private toApiDate(value: Date | null): string | undefined {
    return value ? formatDate(value, 'yyyy-MM-dd', 'en-US') : undefined;
  }

  async openDetail(row: ManageEmpPositionInfoDto): Promise<void> {
    this.selectedRow.set(row);
    this.showDetailModal.set(true);
    this.insideExperienceList.set([]);

    if (!row.personId) {
      return;
    }

    this.insideExperienceLoading.set(true);
    try {
      this.insideExperienceList.set(await this.service.getInsideExperienceList(row.personId));
    } catch {
      this.message.error(this.i18n.t('vdp.msg.loadInsideEmpFailed', 'Không tải được quá trình nội bộ của nhân viên.'));
    } finally {
      this.insideExperienceLoading.set(false);
    }
  }

  closeDetail(): void {
    this.showDetailModal.set(false);
    this.selectedRow.set(null);
    this.insideExperienceList.set([]);
  }
}
