import { Component, OnDestroy, OnInit, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzContextMenuService, NzDropdownMenuComponent, NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzMessageService } from 'ng-zorro-antd/message';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import { CurrentUser } from '../auth/auth.model';
import { I18nService } from '../i18n/i18n.service';
import { MenuNode, MenuService } from '../core/services/menu.service';
import { HrmPendingCounts, NotificationService, PendingCounts } from '../core/services/notification.service';
import { MenuNodeComponent } from './menu-node.component';
import { MenuAccordionService } from './menu-accordion.service';
import { ExternalTabComponent } from './external-tab.component';
import { TabItem, TabService } from './tab.service';
import { LockScreenComponent } from './lock-screen/lock-screen.component';
import { IdleLockService } from '../core/services/idle-lock.service';

const PENDING_COUNTS_POLL_MS = 3 * 60 * 1000;

/** sysType hiện có 2 giá trị: '1' = ESS (dashboard, mặc định), '0' = HR Management System
 *  (hrm-dashboard). Route con nào không khai báo data.sysType thì GIỮ NGUYÊN sysType hiện tại
 *  (sticky) thay vì mặc định về '1' - tránh sidebar tự nhảy về menu ESS chỉ vì bấm sang 1 trang
 *  bất kỳ trong lúc đang ở HR Management System (xem resolveSysType). */
type SysType = '0' | '1';

/**
 * Khung chung (topbar + sidebar + tab-strip) cho mọi trang sau đăng nhập - gộp lại từ
 * DashboardShellComponent (ESS, sysType '1') và HrmShellComponent (HRM, sysType '0') thành 1
 * component dùng chung, đúng theo kiến trúc AppShellComponent của HVV-VHR. Menu đã migrate sang
 * Angular mở tab 'route' (qua Router, giữ state nhờ TabRouteReuseStrategy); menu CHƯA migrate mở
 * tab 'external' (ExternalTabComponent AJAX-fetch trang Thymeleaf, giống innerTab.js).
 */
@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzLayoutModule,
    NzMenuModule,
    NzDropdownModule,
    NzAvatarModule,
    NzIconModule,
    NzButtonModule,
    NzModalModule,
    NzInputModule,
    NzFormModule,
    NzBadgeModule,
    MenuNodeComponent,
    ExternalTabComponent,
    LockScreenComponent,
    RouterOutlet,
  ],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent implements OnInit, OnDestroy {
  /** Map URL menu cũ (SyMenu.menuUrl) -> route Angular đã migrate. HAE-VHR đang giữ nguyên URL cũ
   *  làm route path (khác HVV-VHR đổi sang route kebab-case mới + map riêng) nên hiện là identity
   *  map - các đợt migrate sau có thể thêm entry route kebab-case mới vào đây. */
  private static readonly MIGRATED_ROUTES: Record<string, string> = {
    '/dashboard': '/dashboard',
    '/hrm-dashboard': '/hrm-dashboard',
    // URL menu cũ này chỉ còn là redirect (HomeController#redirectLegacySysTypeZeroPage ->
    // /sys/hrm -> /hrm-dashboard), map thẳng để mở tab Angular ngay, tránh vòng lặp redirect qua iframe.
    '/sys/viewSysTypeZeroMenuList': '/hrm-dashboard',
    '/org/orgManage/viewComposeOrg': '/org/orgManage/viewComposeOrg',
    '/org/orgManage/viewCurrentOrgInfo': '/org/orgManage/viewCurrentOrgInfo',
    '/org/orgManage/viewDeptManagerCheck': '/org/orgManage/viewDeptManagerCheck',
    '/org/orgManage/viewHistoryOrgInfo': '/org/orgManage/viewHistoryOrgInfo',
    '/org/orgManage/viewOrgBusiness': '/org/orgManage/viewOrgBusiness',
    '/org/orgManage/viewOrgCostCenter': '/org/orgManage/viewOrgCostCenter',
    '/org/orgManage/viewOrgInfo': '/org/orgManage/viewOrgInfo',
    '/org/orgManage/viewResumeList': '/org/orgManage/viewResumeList',
    '/org/orgManage/viewResumeProcess': '/org/orgManage/viewResumeProcess',
    '/ess/viewDept/ManageEmpPositionInfoList': '/ess/viewDept/ManageEmpPositionInfoList',
    '/ess/viewDept/viewPersonalInfoEss': '/ess/viewDept/viewPersonalInfoEss',
    '/ess/viewDept/viewArPersonalList': '/ess/viewDept/viewArPersonalList',
    '/ess/viewDept/viewArPersonalSelfList': '/ess/viewDept/viewArPersonalSelfList',
    '/ess/viewDept/viewOtApplyPersonalSelfList': '/ess/viewDept/viewOtApplyPersonalSelfList',
    '/ess/viewDept/yearUseInfo': '/ess/viewDept/yearUseInfo',
    '/ess/viewDept/ManageCountInfoList': '/ess/viewDept/ManageCountInfoList',
    '/ess/viewDept/viewDeptPersonalInfoManageList': '/ess/viewDept/viewDeptPersonalInfoManageList',
    '/ess/viewDept/viewEmpCalendar': '/ess/viewDept/viewEmpCalendar',
    '/ess/viewDept/viewEntryInfoList': '/ess/viewDept/viewEntryInfoList',
    '/ess/viewDept/viewManageEvsResultEmpList': '/ess/viewDept/viewManageEvsResultEmpList',
    '/ess/viewDept/viewOtApplyPersonalList': '/ess/viewDept/viewOtApplyPersonalList',
    '/ess/change/changeUser': '/ess/change/changeUser',
    '/ess/deptEmpAtt/viewArShiftGroupList': '/ess/deptEmpAtt/viewArShiftGroupList',
    '/ess/tempEmp/viewMonthDetailList': '/ess/tempEmp/viewMonthDetailList',
    '/ess/workgroup/viewPersonShiftList': '/ess/workgroup/viewPersonShiftList',
    '/ess/workgroup/viewWorkGroupExperList': '/ess/workgroup/viewWorkGroupExperList',
    '/ess/arConfirm/viewAttendanceExConfirm': '/ess/arConfirm/viewAttendanceExConfirm',
    '/ess/arConfirm/viewLeaveConfirmList': '/ess/arConfirm/viewLeaveConfirmList',
    '/ess/infoApplyLeave/viewApplyLeaveInfoList': '/ess/infoApplyLeave/viewApplyLeaveInfoList',
    '/ess/empinfo/viewEssApplyInfo': '/ess/empinfo/viewEssApplyInfo',
    '/ess/empinfo/viewPersonalInfoForEss': '/ess/empinfo/viewPersonalInfoForEss',
    '/ess/empinfo/viewEssPersonalInfo': '/ess/empinfo/viewEssPersonalInfo',
    '/ess/empinfo/viewQualificationInfo': '/ess/empinfo/viewQualificationInfo',
    '/ess/infoApplyAttendance/viewAttendancePersonalInfoList': '/ess/infoApplyAttendance/viewAttendancePersonalInfoList',
    '/ess/infoApplyAttendance/viewCoordApplyAttendanceInfoList': '/ess/infoApplyAttendance/viewCoordApplyAttendanceInfoList',
    '/ess/infoApplyAttendance/viewCheckAttencetanceExForBatchList':
      '/ess/infoApplyAttendance/viewCheckAttencetanceExForBatchList',
    '/ess/infoApply/viewApplyOTBatchInfoHAEList': '/ess/infoApply/viewApplyOTBatchInfoHAEList',
    '/ess/infoApply/viewCoordApplyOtInfoList': '/ess/infoApply/viewCoordApplyOtInfoList',
    '/ess/infoApply/viewPersonOtApplyInfoList': '/ess/infoApply/viewPersonOtApplyInfoList',
    '/ess/infoApply/viewNoticeedEmail': '/ess/infoApply/viewNoticeedEmail',
    '/ess/infoApply/viewApprovaledEmail': '/ess/infoApply/viewApprovaledEmail',
    '/ess/infoApply/viewApprovalEmail': '/ess/infoApply/viewApprovalEmail',
    '/ess/infoApply/viewShowCwaAbnormalApply': '/ess/infoApply/viewShowCwaAbnormalApply',
    '/ess/infoApplyAttendance/viewAttendanceExForBatchInfoList':
      '/ess/infoApplyAttendance/viewAttendanceExForBatchInfoList',
    '/ess/infoApply/viewApplyOtLBatchByAnyApproverList': '/ess/infoApply/viewApplyOtLBatchByAnyApproverList',
    '/ess/infoApplyAttendance/viewApplyAttBatchByAnyApproverList':
      '/ess/infoApplyAttendance/viewApplyAttBatchByAnyApproverList',
    '/ar/attendanceMintenance/viewApplyAttManagentByAnyApproverList':
      '/ar/attendanceMintenance/viewApplyAttManagentByAnyApproverList',
    '/ar/attendanceMintenance/viewApplyOtManagentByAnyApproverList':
      '/ar/attendanceMintenance/viewApplyOtManagentByAnyApproverList',
    '/ar/attendanceMintenance/viewImportAttendanceTempList': '/ar/attendanceMintenance/viewImportAttendanceTempList',
    '/ar/attendanceMintenance/viewImportOtTempList': '/ar/attendanceMintenance/viewImportOtTempList',
    '/ar/attendanceMintenance/viewArCardRecordForSelf': '/ar/attendanceMintenance/viewArCardRecordForSelf',
    '/ar/attendanceMintenance/viewArCardRecordMeal': '/ar/attendanceMintenance/viewArCardRecordMeal',
    '/ar/attendanceMintenance/viewArCardRecordDay': '/ar/attendanceMintenance/viewArCardRecordDay',
    '/ar/attendanceMintenance/viewArCardRecord': '/ar/attendanceMintenance/viewArCardRecord',
    '/ar/attendanceMintenance/viewImportExcelTempMacRecordsList':
      '/ar/attendanceMintenance/viewImportExcelTempMacRecordsList',
    '/ar/attendanceMintenance/viewArDetailCalculate': '/ar/attendanceMintenance/viewArDetailCalculate',
    '/ar/attendanceMintenance/addEmpShiftView': '/ar/attendanceMintenance/addEmpShiftView',
    '/ar/attendanceMintenance/viewAttendanceManagentForSerchInfoList':
      '/ar/attendanceMintenance/viewAttendanceManagentForSerchInfoList',
    '/ar/attendanceMintenance/viewSearchApplyOtInfoList': '/ar/attendanceMintenance/viewSearchApplyOtInfoList',
    '/ar/attendanceSettings/viewArItem': '/ar/attendanceSettings/viewArItem',
    '/ar/attendanceSettings/viewCycle': '/ar/attendanceSettings/viewCycle',
    '/ar/attendanceSettings/viewCycleParameter': '/ar/attendanceSettings/viewCycleParameter',
    '/ar/attendanceSettings/viewSummaryItem': '/ar/attendanceSettings/viewSummaryItem',
    '/ar/attendanceSettings/viewVacEmpList': '/ar/attendanceSettings/viewVacEmpList',
    '/ar/attendanceSettings/viewDynamicGroup': '/ar/attendanceSettings/viewDynamicGroup',
    '/ar/attendanceSettings/viewDepartManagerList': '/ar/attendanceSettings/viewDepartManagerList',
    '/ar/attendanceSettings/viewAttendanceKeeper': '/ar/attendanceSettings/viewAttendanceKeeper',
    '/ar/attendanceSettings/viewArItemParamList': '/ar/attendanceSettings/viewArItemParamList',
    '/ar/attendanceSettings/viewItemParameter': '/ar/attendanceSettings/viewItemParameter',
    '/ar/attendanceSettings/viewStatutoryHolidays': '/ar/attendanceSettings/viewStatutoryHolidays',
    '/ar/attendanceSettings/viewCompanyCalendar': '/ar/attendanceSettings/viewCompanyCalendar',
    '/ar/attendanceSettings/viewClassCalendar': '/ar/attendanceSettings/viewClassCalendar',
    '/ar/attendanceSettings/viewEmpCalendar': '/ar/attendanceSettings/viewEmpCalendar',
    '/ar/attendanceSettings/viewShift': '/ar/attendanceSettings/viewShift',
    '/ar/attendanceSettings/viewSummaryParamItem': '/ar/attendanceSettings/viewSummaryParamItem',
    '/ar/attendanceSettings/viewSummaryFormula': '/ar/attendanceSettings/viewSummaryFormula',
    '/hrm/approve/viewEssApplyInfo': '/hrm/approve/viewEssApplyInfo',
    '/hrm/contractInfo/viewNOContractInfo': '/hrm/contractInfo/viewNOContractInfo',
    '/hrm/contractInfo/viewExpiredContract': '/hrm/contractInfo/viewExpiredContract',
    '/hrm/contractInfo/viewContractInfoForSearch': '/hrm/contractInfo/viewContractInfoForSearch',
    '/hrm/empinfo/educationSearch': '/hrm/empinfo/educationSearch',
    '/hrm/empinfo/addressSearch': '/hrm/empinfo/addressSearch',
    '/hrm/empinfo/familySearch': '/hrm/empinfo/familySearch',
    '/hrm/empinfo/emergencyAddressSearch': '/hrm/empinfo/emergencyAddressSearch',
    '/hrm/empinfo/recognitionSearch': '/hrm/empinfo/recognitionSearch',
    '/hrm/empinfo/viewQualification': '/hrm/empinfo/viewQualification',
    '/hrm/empinfo/punishmentSearch': '/hrm/empinfo/punishmentSearch',
    '/hrm/empinfo/viewWorkInformation': '/hrm/empinfo/viewWorkInformation',
    '/hrm/empinfo/viewPersonalInfo': '/hrm/empinfo/viewPersonalInfo',
    '/hrm/empinfo/viewTempEmpInfoList': '/hrm/empinfo/viewTempEmpInfoList',
    '/hrm/empinfo/photoImport': '/hrm/empinfo/photoImport',
    '/hrm/empinfo/viewStartPoint': '/hrm/empinfo/viewStartPoint',
    '/hrm/empinfo/viewHAECardInfoList': '/hrm/empinfo/viewHAECardInfoList',
    '/hrm/recruitManage/viewRecruitList': '/hrm/recruitManage/viewRecruitList',
    '/hrm/recruitManage/viewExperienceBatchList': '/hrm/recruitManage/viewExperienceBatchList',
    '/hrm/recruitManage/viewRecruitBatchList': '/hrm/recruitManage/viewRecruitBatchList',
    '/evs/manage/viewResumeList': '/evs/manage/viewResumeList',
    '/evs/manage/viewEvsFormulaList': '/evs/manage/viewEvsFormulaList',
    '/evs/manage/viewEvsDistributionRatePanel': '/evs/manage/viewEvsDistributionRatePanel',
    '/evs/manage/viewEvsParamPanel': '/evs/manage/viewEvsParamPanel',
    '/evs/manage/viewEvsAffirmorSetup': '/evs/manage/viewEvsAffirmorSetup',
    '/evs/manage/viewEvsItemPanel': '/evs/manage/viewEvsItemPanel',
    '/evs/manage/viewRegPersonalTarget': '/evs/manage/viewRegPersonalTarget',
    '/evs/manage/viewConfirmTarget1': '/evs/manage/viewConfirmTarget1',
    '/evs/manage/viewConfirmTarget2': '/evs/manage/viewConfirmTarget2',
    '/evs/manage/viewAffirmTarget1': '/evs/manage/viewAffirmTarget1',
    '/evs/manage/viewAffirmTarget2': '/evs/manage/viewAffirmTarget2',
    '/evs/manage/viewAffirmTarget1Ability': '/evs/manage/viewAffirmTarget1Ability',
    '/evs/manage/viewAffirmTarget2Ability': '/evs/manage/viewAffirmTarget2Ability',
    '/evs/manage/viewEvsBySelfHTSV': '/evs/manage/viewEvsBySelfHTSV',
    '/evs/manage/viewEvsBySelfSSTAbility': '/evs/manage/viewEvsBySelfSSTAbility',
    '/evs/manage/viewEvsSchedulePanel': '/evs/manage/viewEvsSchedulePanel',
    '/evs/manage/viewEvsResultEmp': '/evs/manage/viewEvsResultEmp',
    '/evs/manage/viewEvsResult': '/evs/manage/viewEvsResult',
    '/pa/salarycode/viewSalaryCodeList': '/pa/salarycode/viewSalaryCodeList',
    '/pa/salary/viewPaFormula': '/pa/salary/viewPaFormula',
    '/pa/salary/viewPaComputeItemParamList': '/pa/salary/viewPaComputeItemParamList',
    '/pa/salary/viewPaInputItemParam': '/pa/salary/viewPaInputItemParam',
    '/pa/salary/viewPaMonthPersonInfoEssList': '/pa/salary/viewPaMonthPersonInfoEssList',
    '/pa/workManagement/viewPaPaySchedule': '/pa/workManagement/viewPaPaySchedule',
    '/pa/workManagement/viewPaEmpAccount': '/pa/workManagement/viewPaEmpAccount',
    '/pa/wagebase/viewPaSupervisor': '/pa/wagebase/viewPaSupervisor',
    '/pa/salary/viewPaInputItemData?itemType=1': '/pa/salary/viewPaInputItemData?itemType=1',
    '/pa/salary/viewPaInputItemData?itemType=2': '/pa/salary/viewPaInputItemData?itemType=2',
    '/pa/salary/viewPaInputItemData?itemType=3': '/pa/salary/viewPaInputItemData?itemType=3',
    '/pa/salary/viewPaInputItemData?itemType=4': '/pa/salary/viewPaInputItemData?itemType=4',
    '/pa/salary/viewPaInputItemData?itemType=5': '/pa/salary/viewPaInputItemData?itemType=5',
    '/pa/salary/viewPaInputItemData?itemType=6': '/pa/salary/viewPaInputItemData?itemType=6',
    '/pa/salary/viewPaInputItemData?itemType=7': '/pa/salary/viewPaInputItemData?itemType=7',
    '/pa/salary/viewPaInputItemData?itemType=8': '/pa/salary/viewPaInputItemData?itemType=8',
    '/pa/salary/viewPaInputItemData?itemType=9': '/pa/salary/viewPaInputItemData?itemType=9',
    '/pa/salary/viewPaResult': '/pa/salary/viewPaResult',
    '/pa/workManagement/payStub': '/pa/workManagement/payStub',
    '/pa/workManagement/viewPaWorkFlow': '/pa/workManagement/viewPaWorkFlow',
    '/pa/workManagement/viewPaPayObj': '/pa/workManagement/viewPaPayObj',
    '/sys/basicMaintenance/viewCodeManage': '/sys/basicMaintenance/viewCodeManage',
    '/sys/basicMaintenance/viewCodePamers': '/sys/basicMaintenance/viewCodePamers',
    '/sys/basicMaintenance/viewCompany': '/sys/basicMaintenance/viewCompany',
    '/sys/basicMaintenance/viewMenuList': '/sys/basicMaintenance/viewMenuList',
    '/sys/basicMaintenance/viewMenuParamList': '/sys/basicMaintenance/viewMenuParamList',
    '/sys/syRole/viewLoginUser': '/sys/syRole/viewLoginUser',
    '/sys/syRole/viewSyRolesGroupList': '/sys/syRole/viewSyRolesGroupList',
    '/sys/syRole/viewRolesGroup': '/sys/syRole/viewRolesGroup',
    '/sys/viewFeedback': '/sys/viewFeedback',
    '/ess/infoApplyAttendance/viewApplyAttendanceInfoList': '/ess/infoApplyAttendance/viewApplyAttendanceInfoList',
    '/ess/infoApplyAttendance/viewSSTApplyAttendance': '/ess/infoApplyAttendance/viewSSTApplyAttendance',
    '/ess/infoApply/viewPOtApplyInfoList': '/ess/infoApply/viewPOtApplyInfoList',
    '/ess/infoApply/viewPiciOtAffirmPBatchList': '/ess/infoApply/viewPiciOtAffirmPBatchList',
    '/ess/infoApply/viewSSTOtApplyInfo': '/ess/infoApply/viewSSTOtApplyInfo',
    '/ess/infoApply/viewSSTOtApplyInfoTx': '/ess/infoApply/viewSSTOtApplyInfoTx',
  };

  protected readonly authService = inject(AuthService);
  private readonly menuService = inject(MenuService);
  private readonly notificationService = inject(NotificationService);
  private readonly http = inject(HttpClient);
  private readonly message = inject(NzMessageService);
  private readonly contextMenuService = inject(NzContextMenuService);
  private readonly router = inject(Router);
  protected readonly i18n = inject(I18nService);
  readonly tabs = inject(TabService);
  protected readonly idleLock = inject(IdleLockService);
  private readonly menuAccordion = inject(MenuAccordionService);

  protected readonly user = this.authService.currentUser;
  protected readonly menuTree = signal<MenuNode[]>([]);
  protected readonly siderCollapsed = signal(false);
  /** Đường dẫn menu ông -> cha -> menu đang chọn, cập nhật mỗi khi bấm 1 menu ở sidebar - xem
   *  onMenuSelect. Dùng để xác định menu gốc (root) nào đang active cho activeRootMenuNo(). */
  protected readonly breadcrumbPath = signal<MenuNode[]>([]);
  /** menuNo của menu cấp gốc (root) đang active, dùng để tô sáng mục tương ứng trên menu ngang ở
   *  header - xem hae-dashboard-header-menu trong template. */
  protected readonly activeRootMenuNo = computed(() => this.breadcrumbPath()[0]?.menuNo ?? null);
  /** Toàn bộ menuNo trên đường đi root -> menu lá đang active, truyền cho app-menu-node để highlight
   *  (menu lá nzSelected + menu cha chứa nó tô nền active) - xem MenuNodeComponent. */
  protected readonly activeMenuPath = computed(() => this.breadcrumbPath().map((n) => n.menuNo));

  private currentSysType: SysType | null = null;
  protected readonly sysType = signal<SysType>('1');

  // Modal đổi mật khẩu bắt buộc (mật khẩu chưa mã hoá) - POST /api/change-first-password
  protected readonly showChangePasswordModal = signal(false);
  protected readonly newPassword = signal('');
  protected readonly confirmPassword = signal('');
  protected readonly changePasswordLoading = signal(false);
  protected readonly changePasswordError = signal<string | null>(null);

  // Modal đổi mật khẩu tự nguyện (topbar) - POST /password/api/change-password
  protected readonly showVoluntaryCpwdModal = signal(false);
  protected readonly voluntaryOldPassword = signal('');
  protected readonly voluntaryNewPassword = signal('');
  protected readonly voluntaryConfirmPassword = signal('');
  protected readonly voluntaryCpwdLoading = signal(false);
  protected readonly voluntaryCpwdError = signal<string | null>(null);

  protected readonly pendingCounts = signal<PendingCounts>({ total: 0, leave: 0, ot: 0, anomaly: 0 });
  protected readonly hrmPendingCounts = signal<HrmPendingCounts>({
    total: 0,
    leave: 0,
    anomalous: 0,
    personalChange: 0,
  });
  private pendingCountsTimer?: ReturnType<typeof setInterval>;

  /** Đồng bộ breadcrumbPath (nên đó menu nào ở sidebar được highlight) mỗi khi tab đang active đổi -
   *  không chỉ khi bấm menu ở sidebar (onMenuSelect) mà cả khi bấm thẳng vào 1 tab trên tab-strip,
   *  hoặc khi đóng tab đang active và TabService tự fallback sang tab bên cạnh. Cũng mở lại
   *  (MenuAccordionService) nhánh submenu cha tương ứng để menu lá active thực sự hiển thị được. */
  private readonly syncActiveMenuWithTabEffect = effect(() => {
    const activePath = this.tabs.activePath();
    const tab = this.tabs.tabs().find((t) => t.path === activePath);
    if (!tab?.menuNo) return;
    const trail = this.findMenuPath(tab.menuNo, this.menuTree());
    if (!trail.length) return;
    this.breadcrumbPath.set(trail);
    if (trail.length > 1) {
      const submenuChain = trail.slice(0, -1).map((n) => n.menuNo);
      const deepestSubmenu = submenuChain[submenuChain.length - 1];
      this.menuAccordion.onOpenChange(submenuChain.slice(0, -1), deepestSubmenu, true);
    }
  });

  async ngOnInit(): Promise<void> {
    await this.i18n.load();
    // authGuard đã gọi loadCurrentUser() trước khi route này được kích hoạt
    const user: CurrentUser | null = this.authService.currentUser();
    await this.syncMenuForActiveRoute();
    this.router.events.pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd)).subscribe(() => {
      this.syncMenuForActiveRoute();
    });
    if (user?.requirePasswordChange) {
      this.showChangePasswordModal.set(true);
    }

    this.pendingCountsTimer = setInterval(() => this.loadPendingCounts(), PENDING_COUNTS_POLL_MS);
    this.idleLock.start();
  }

  ngOnDestroy(): void {
    if (this.pendingCountsTimer) {
      clearInterval(this.pendingCountsTimer);
    }
    this.idleLock.stop();
  }

  /** Duyệt từ root xuống route con đang active để lấy data.sysType sâu nhất được khai báo. */
  private resolveSysType(): SysType {
    let route: ActivatedRouteSnapshot | null = this.router.routerState.snapshot.root;
    let sysType: SysType | null = null;
    while (route) {
      const routeSysType = route.data['sysType'] as SysType | undefined;
      if (routeSysType) sysType = routeSysType;
      route = route.firstChild;
    }
    return sysType ?? this.currentSysType ?? '1';
  }

  private async syncMenuForActiveRoute(): Promise<void> {
    const sysType = this.resolveSysType();
    if (sysType === this.currentSysType) return;
    this.currentSysType = sysType;
    this.sysType.set(sysType);
    this.menuTree.set(await this.menuService.getMenuTree(sysType));
    this.loadPendingCounts();
  }

  private async loadPendingCounts(): Promise<void> {
    try {
      if (this.sysType() === '0') {
        this.hrmPendingCounts.set(await this.notificationService.getHrmPendingCounts());
      } else {
        this.pendingCounts.set(await this.notificationService.getPendingCounts());
      }
    } catch {
      // im lặng bỏ qua - không chặn UI nếu API đếm thông báo lỗi tạm thời
    }
  }

  /** Mở menu dưới dạng tab - route Angular nếu đã migrate (MIGRATED_ROUTES), ngược lại tab
   *  'external' (AJAX-fetch trang Thymeleaf, xem ExternalTabComponent). Tra MIGRATED_ROUTES theo
   *  phần path (bỏ query string) vì SyMenu.menuUrl có thể kèm query (vd:
   *  ?seach_EMP_OFFICE=15119) - nếu so khớp nguyên chuỗi kèm query sẽ luôn không khớp key, khiến
   *  menu đã migrate bị mở nhầm sang tab 'external' và hiển thị trống. */
  onMenuSelect(node: MenuNode): void {
    this.breadcrumbPath.set(this.findMenuPath(node.menuNo, this.menuTree()));
    if (!node.menuUrl) return;
    this.openInternalTab(node.menuUrl, node.menuName, node.menuNo);
  }

  /** Tra MIGRATED_ROUTES rồi mở url dưới dạng tab nội bộ (route Angular nếu đã migrate, ngược lại
   *  tab 'external') - dùng chung cho menu sidebar (onMenuSelect) và link thông báo (openLink), tra
   *  theo phần path bỏ query string vì url có thể kèm query (vd: ?applyTypeCode=21). */
  private openInternalTab(url: string, title: string, menuNo?: string): void {
    const queryIndex = url.indexOf('?');
    const basePath = queryIndex === -1 ? url : url.slice(0, queryIndex);
    const query = queryIndex === -1 ? '' : url.slice(queryIndex);
    const ngRoute = AppShellComponent.MIGRATED_ROUTES[basePath];
    const targetPath = ngRoute ? ngRoute + query : url;
    this.tabs.openTab(targetPath, title, ngRoute ? 'route' : 'external', menuNo);
  }

  /** Tìm đường đi từ root tới node có menuNo tương ứng trong cây menu (dùng để xác định menu gốc
   *  đang active cho activeRootMenuNo()). */
  private findMenuPath(menuNo: string, nodes: MenuNode[], trail: MenuNode[] = []): MenuNode[] {
    for (const node of nodes) {
      const nextTrail = [...trail, node];
      if (node.menuNo === menuNo) return nextTrail;
      if (node.children?.length) {
        const found = this.findMenuPath(menuNo, node.children, nextTrail);
        if (found.length) return found;
      }
    }
    return [];
  }

  /** Bấm 1 menu cấp gốc trên menu ngang ở header: nếu có children thì mở nhánh đó trong sidebar
   *  (dùng chung MenuAccordionService với hành vi accordion của app-menu-node) để người dùng thấy
   *  ngay menu con tương ứng, nếu là menu lá thì mở/chuyển tới tab tương ứng như bấm trực tiếp
   *  trong sidebar. */
  onHeaderRootSelect(node: MenuNode): void {
    if (node.children?.length) {
      this.menuAccordion.onOpenChange([], node.menuNo, true);
      this.breadcrumbPath.set([node]);
      return;
    }
    this.onMenuSelect(node);
  }

  /** Bấm 1 menu con trong dropdown (hiện ra khi di chuột vào menu cha trên menu ngang ở header):
   *  mở luôn nhánh cha đó trong sidebar dọc (đồng bộ accordion) rồi mở/chuyển tới tab tương ứng
   *  như bấm trực tiếp trong sidebar; nếu bản thân menu con này lại có children (menu 3 cấp) thì
   *  chỉ mở tiếp nhánh đó trong sidebar (dropdown ở header chỉ hiển thị 1 cấp con). */
  onHeaderChildSelect(node: MenuNode, rootMenuNo: string): void {
    this.menuAccordion.onOpenChange([], rootMenuNo, true);
    if (node.children?.length) {
      this.menuAccordion.onOpenChange([rootMenuNo], node.menuNo, true);
      return;
    }
    this.onMenuSelect(node);
  }

  /** Mở "HR Management System" như 1 tab trong cùng shell (khác trước đây dùng window.open mở cửa
   *  sổ mới) - đúng theo AppShellComponent gốc của HVV-VHR (1 shell dùng chung cho ESS và HRM). */
  openHrmManagementSystem(): void {
    if (!this.user()?.hasSysTypeZeroMenus) {
      this.message.error('Bạn không có quyền truy cập vào HR Management System');
      return;
    }
    const url = this.router.serializeUrl(this.router.createUrlTree(['/hrm-dashboard']));
    window.open(url, '_blank');
  }

  closeTab(event: MouseEvent, path: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.tabs.closeTab(path);
  }

  /** Tab đang được bấm chuột phải - dùng chung 1 dropdown menu (#tabCtxMenu) cho mọi tab, xác định
   *  tab đích qua signal này thay vì tạo 1 dropdown riêng cho từng tab. */
  protected readonly contextMenuTab = signal<TabItem | null>(null);

  /** Mở menu chuột phải (Đóng tab / Đóng bên trái / Đóng bên phải / Đóng toàn bộ) qua
   *  NzContextMenuService - nz-dropdown chỉ hỗ trợ nzTrigger 'click' | 'hover', không có
   *  'contextmenu' nên không dùng trực tiếp nz-dropdown cho tab-strip được. */
  onTabContextMenu(event: MouseEvent, tab: TabItem, menu: NzDropdownMenuComponent): void {
    this.contextMenuTab.set(tab);
    this.contextMenuService.create(event, menu);
  }

  closeContextTab(): void {
    const tab = this.contextMenuTab();
    if (tab) this.tabs.closeTab(tab.path);
  }

  closeContextTabsToLeft(): void {
    const tab = this.contextMenuTab();
    if (tab) this.tabs.closeTabsToLeft(tab.path);
  }

  closeContextTabsToRight(): void {
    const tab = this.contextMenuTab();
    if (tab) this.tabs.closeTabsToRight(tab.path);
  }

  trackByPath(_index: number, tab: { path: string }): string {
    return tab.path;
  }

  /** Mở link thông báo dưới dạng tab nội bộ trong shell, KHÔNG mở tab trình duyệt mới. */
  openLink(url: string, title: string): void {
    this.openInternalTab(url, title);
  }

  logout(): void {
    this.authService.logout();
  }

  changeLanguage(lang: string): void {
    window.location.href = '/change-language?lang=' + lang;
  }

  async submitChangePassword(): Promise<void> {
    this.changePasswordError.set(null);
    if (!this.newPassword() || this.newPassword() !== this.confirmPassword()) {
      this.changePasswordError.set('Mật khẩu xác nhận không khớp.');
      return;
    }

    this.changePasswordLoading.set(true);
    try {
      const body = new URLSearchParams();
      body.set('newPassword', this.newPassword());
      body.set('confirmPassword', this.confirmPassword());

      const resp = await firstValueFrom(
        this.http.post<{ success: boolean; message: string }>(
          '/api/change-first-password',
          body.toString(),
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
        ),
      );

      if (resp.success) {
        this.message.success(resp.message);
        this.showChangePasswordModal.set(false);
      } else {
        this.changePasswordError.set(resp.message);
      }
    } catch (err: any) {
      this.changePasswordError.set(err?.error?.message ?? 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      this.changePasswordLoading.set(false);
    }
  }

  openVoluntaryCpwdModal(): void {
    this.voluntaryOldPassword.set('');
    this.voluntaryNewPassword.set('');
    this.voluntaryConfirmPassword.set('');
    this.voluntaryCpwdError.set(null);
    this.showVoluntaryCpwdModal.set(true);
  }

  async submitVoluntaryChangePassword(): Promise<void> {
    this.voluntaryCpwdError.set(null);
    if (!this.voluntaryOldPassword() || !this.voluntaryNewPassword() || !this.voluntaryConfirmPassword()) {
      this.voluntaryCpwdError.set('Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    if (this.voluntaryNewPassword() !== this.voluntaryConfirmPassword()) {
      this.voluntaryCpwdError.set('Mật khẩu xác nhận không khớp.');
      return;
    }

    this.voluntaryCpwdLoading.set(true);
    try {
      const body = new URLSearchParams();
      body.set('oldPassword', this.voluntaryOldPassword());
      body.set('newPassword', this.voluntaryNewPassword());
      body.set('confirmPassword', this.voluntaryConfirmPassword());

      const resp = await firstValueFrom(
        this.http.post<{ success: boolean; message: string }>(
          '/password/api/change-password',
          body.toString(),
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
        ),
      );

      if (resp.success) {
        this.message.success(resp.message);
        this.showVoluntaryCpwdModal.set(false);
      } else {
        this.voluntaryCpwdError.set(resp.message);
      }
    } catch (err: any) {
      this.voluntaryCpwdError.set(err?.error?.message ?? 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      this.voluntaryCpwdLoading.set(false);
    }
  }
}
