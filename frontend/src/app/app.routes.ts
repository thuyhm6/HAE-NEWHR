import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    // AppShellComponent chứa <router-outlet> + tab-strip ở khu vực nội dung (xem
    // shell/app-shell.component.html) - gộp chung từ DashboardShellComponent (ESS) và
    // HrmShellComponent (HRM), phân biệt qua route data.sysType (xem AppShellComponent.resolveSysType).
    // Children dùng path tuyệt đối, không có tiền tố, để khớp chính xác với SyMenu.menuUrl cũ.
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shell/app-shell.component').then((m) => m.AppShellComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard-home.component').then(
            (m) => m.DashboardHomeComponent,
          ),
      },
      {
        path: 'hrm-dashboard',
        data: { sysType: '0' },
        loadComponent: () =>
          import('./pages/hrm/hrm-home.component').then((m) => m.HrmHomeComponent),
      },
      {
        // Path phải khớp chính xác (kể cả hoa/thường) với URL cũ
        // /ess/viewDept/ManageEmpPositionInfoList (SyMenu.menuUrl trong DB) -
        // xem EssViewDeptController#viewManageEmpPositionInfoList, giờ trả về
        // Angular index.html thay vì Thymeleaf.
        path: 'ess/viewDept/ManageEmpPositionInfoList',
        loadComponent: () =>
          import('./pages/ess/manage-emp-position-info-list/manage-emp-position-info-list.component').then(
            (m) => m.ManageEmpPositionInfoListComponent,
          ),
      },
      {
        // Path phải khớp chính xác (kể cả hoa/thường) với URL cũ
        // /ess/viewDept/viewPersonalInfoEss (SyMenu.menuUrl trong DB) -
        // xem EssViewDeptController#viewPersonalInfoEss, giờ trả về Angular
        // index.html thay vì Thymeleaf.
        path: 'ess/viewDept/viewPersonalInfoEss',
        loadComponent: () =>
          import('./pages/ess/personal-info-ess/personal-info-ess.component').then(
            (m) => m.PersonalInfoEssComponent,
          ),
      },
      {
        // /ess/viewDept/viewArPersonalList - xem EssViewDeptController#viewArPersonalList.
        path: 'ess/viewDept/viewArPersonalList',
        loadComponent: () =>
          import('./pages/ess/ar-personal-list/ar-personal-list.component').then(
            (m) => m.ArPersonalListComponent,
          ),
      },
      {
        // /ess/viewDept/viewArPersonalSelfList - xem EssViewDeptController#viewArPersonalSelfList.
        path: 'ess/viewDept/viewArPersonalSelfList',
        loadComponent: () =>
          import('./pages/ess/ar-personal-self-list/ar-personal-self-list.component').then(
            (m) => m.ArPersonalSelfListComponent,
          ),
      },
      {
        // /ess/viewDept/viewOtApplyPersonalSelfList - xem EssViewDeptController#viewOtApplyPersonalSelfList.
        path: 'ess/viewDept/viewOtApplyPersonalSelfList',
        loadComponent: () =>
          import('./pages/ess/ot-apply-personal-self-list/ot-apply-personal-self-list.component').then(
            (m) => m.OtApplyPersonalSelfListComponent,
          ),
      },
      {
        // /ess/viewDept/yearUseInfo - xem EssViewDeptController#viewYearUseInfo.
        path: 'ess/viewDept/yearUseInfo',
        loadComponent: () =>
          import('./pages/ess/year-use-info/year-use-info.component').then(
            (m) => m.YearUseInfoComponent,
          ),
      },
      {
        // /ess/viewDept/ManageCountInfoList - xem EssViewDeptController#viewManageCountInfoList.
        path: 'ess/viewDept/ManageCountInfoList',
        loadComponent: () =>
          import('./pages/ess/manage-count-info-list/manage-count-info-list.component').then(
            (m) => m.ManageCountInfoListComponent,
          ),
      },
      {
        // /ess/viewDept/viewDeptPersonalInfoManageList - xem EssViewDeptController#viewDeptPersonalInfoManageList.
        path: 'ess/viewDept/viewDeptPersonalInfoManageList',
        loadComponent: () =>
          import('./pages/ess/dept-personal-info-manage-list/dept-personal-info-manage-list.component').then(
            (m) => m.DeptPersonalInfoManageListComponent,
          ),
      },
      {
        // /ess/viewDept/viewEmpCalendar - xem EssViewDeptController#viewEmpCalendar.
        path: 'ess/viewDept/viewEmpCalendar',
        loadComponent: () =>
          import('./pages/ess/emp-calendar/emp-calendar.component').then(
            (m) => m.EmpCalendarComponent,
          ),
      },
      {
        // /ess/viewDept/viewEntryInfoList - xem EssViewDeptController#viewEntryInfoList.
        path: 'ess/viewDept/viewEntryInfoList',
        loadComponent: () =>
          import('./pages/ess/entry-info-list/entry-info-list.component').then(
            (m) => m.EntryInfoListComponent,
          ),
      },
      {
        // /ess/viewDept/viewManageEvsResultEmpList - xem EssViewDeptController#viewManageEvsResultEmpList.
        path: 'ess/viewDept/viewManageEvsResultEmpList',
        loadComponent: () =>
          import('./pages/ess/manage-evs-result-emp-list/manage-evs-result-emp-list.component').then(
            (m) => m.ManageEvsResultEmpListComponent,
          ),
      },
      {
        // /ess/viewDept/viewOtApplyPersonalList - xem EssViewDeptController#viewOtApplyPersonalList.
        path: 'ess/viewDept/viewOtApplyPersonalList',
        loadComponent: () =>
          import('./pages/ess/ot-apply-personal-list/ot-apply-personal-list.component').then(
            (m) => m.OtApplyPersonalListComponent,
          ),
      },
      {
        // /ess/change/changeUser - xem EssChangeUserController#changeUserPage.
        path: 'ess/change/changeUser',
        loadComponent: () =>
          import('./pages/ess/change-user/change-user.component').then(
            (m) => m.ChangeUserComponent,
          ),
      },
      {
        // /ess/deptEmpAtt/viewArShiftGroupList - xem EssDeptEmpAttController#viewArShiftGroupList.
        path: 'ess/deptEmpAtt/viewArShiftGroupList',
        loadComponent: () =>
          import('./pages/ess/ar-shift-group-list/ar-shift-group-list.component').then(
            (m) => m.ArShiftGroupListComponent,
          ),
      },
      {
        // /ess/tempEmp/viewMonthDetailList - xem EssTempEmpController#viewMonthDetailList.
        path: 'ess/tempEmp/viewMonthDetailList',
        loadComponent: () =>
          import('./pages/ess/month-detail-list/month-detail-list.component').then(
            (m) => m.MonthDetailListComponent,
          ),
      },
      {
        // /ess/workgroup/viewPersonShiftList - xem EssWorkGroupController#viewPersonShiftList.
        path: 'ess/workgroup/viewPersonShiftList',
        loadComponent: () =>
          import('./pages/ess/person-shift-list/person-shift-list.component').then(
            (m) => m.PersonShiftListComponent,
          ),
      },
      {
        // /ess/workgroup/viewWorkGroupExperList - xem EssWorkGroupController#viewWorkGroupExperList.
        path: 'ess/workgroup/viewWorkGroupExperList',
        loadComponent: () =>
          import('./pages/ess/work-group-exper-list/work-group-exper-list.component').then(
            (m) => m.WorkGroupExperListComponent,
          ),
      },
      {
        // /ess/arConfirm/viewAttendanceExConfirm - xem EssLeaveConfirmController#viewAttendanceExConfirm.
        path: 'ess/arConfirm/viewAttendanceExConfirm',
        loadComponent: () =>
          import('./pages/ess/attendance-ex-confirm/attendance-ex-confirm.component').then(
            (m) => m.AttendanceExConfirmComponent,
          ),
      },
      {
        // /ess/arConfirm/viewLeaveConfirmList - xem EssLeaveConfirmController#viewLeaveConfirmList.
        path: 'ess/arConfirm/viewLeaveConfirmList',
        loadComponent: () =>
          import('./pages/ess/leave-confirm/leave-confirm.component').then(
            (m) => m.LeaveConfirmComponent,
          ),
      },
      {
        // /ess/arConfirm/viewPOtApplyInfoConfirmList - xem EssOtConfirmController#viewPOtApplyInfoConfirmList.
        path: 'ess/arConfirm/viewPOtApplyInfoConfirmList',
        loadComponent: () =>
          import('./pages/ess/ot-confirm/ot-confirm.component').then((m) => m.OtConfirmComponent),
      },
      {
        // /ess/infoApplyLeave/viewApplyLeaveInfoList - xem EssInfoApplyLeaveController#viewApplyLeaveInfoList.
        path: 'ess/infoApplyLeave/viewApplyLeaveInfoList',
        loadComponent: () =>
          import('./pages/ess/apply-leave-info-list/apply-leave-info-list.component').then(
            (m) => m.ApplyLeaveInfoListComponent,
          ),
      },
      {
        // /ess/empinfo/viewEssApplyInfo - xem EssEmpInfoController#viewEssApplyInfo.
        path: 'ess/empinfo/viewEssApplyInfo',
        loadComponent: () =>
          import('./pages/ess/apply-info/apply-info.component').then((m) => m.ApplyInfoComponent),
      },
      {
        // /ess/empinfo/viewPersonalInfoForEss - xem EssEmpInfoController#viewPersonalInfoForEss.
        path: 'ess/empinfo/viewPersonalInfoForEss',
        loadComponent: () =>
          import('./pages/ess/ess-personal-info/ess-personal-info.component').then(
            (m) => m.EssPersonalInfoComponent,
          ),
      },
      {
        // /ess/empinfo/viewEssPersonalInfo - xem EssEmpInfoController#viewEssPersonalInfo.
        path: 'ess/empinfo/viewEssPersonalInfo',
        loadComponent: () =>
          import('./pages/ess/ess-work-info/ess-work-info.component').then(
            (m) => m.EssWorkInfoComponent,
          ),
      },
      {
        // /ess/empinfo/viewQualificationInfo - xem EssEmpInfoController#viewQualificationInfo.
        path: 'ess/empinfo/viewQualificationInfo',
        loadComponent: () =>
          import('./pages/ess/ess-qualification-info/ess-qualification-info.component').then(
            (m) => m.EssQualificationInfoComponent,
          ),
      },
      {
        // /ess/infoApplyAttendance/viewAttendancePersonalInfoList - xem
        // EssInfoApplyAttendanceController#viewAttendancePersonalInfoList.
        path: 'ess/infoApplyAttendance/viewAttendancePersonalInfoList',
        loadComponent: () =>
          import('./pages/ess/attendance-personal-info-list/attendance-personal-info-list.component').then(
            (m) => m.AttendancePersonalInfoListComponent,
          ),
      },
      {
        // /ess/infoApplyAttendance/viewCoordApplyAttendanceInfoList - xem
        // EssInfoApplyAttendanceController#viewCoordApplyAttendanceInfoList.
        path: 'ess/infoApplyAttendance/viewCoordApplyAttendanceInfoList',
        loadComponent: () =>
          import('./pages/ess/coord-apply-attendance-list/coord-apply-attendance-list.component').then(
            (m) => m.CoordApplyAttendanceListComponent,
          ),
      },
      {
        // /ess/infoApplyLeave/viewCheckAttencetanceExForBatchList - xem
        // EssInfoApplyLeaveController#viewCheckAttencetanceExForBatchList.
        path: 'ess/infoApplyLeave/viewCheckAttencetanceExForBatchList',
        loadComponent: () =>
          import('./pages/ess/check-attendance-ex-list/check-attendance-ex-list.component').then(
            (m) => m.CheckAttendanceExListComponent,
          ),
      },
      {
        // /ess/infoApply/viewApplyOTBatchInfoHAEList - xem
        // EssInfoApplyController#viewApplyOTBatchInfoHAEList. Dùng chung
        // OtAttendanceReportListComponent với viewCoordApplyOtInfoList (2
        // trang trùng lặp 100% cấu trúc backend) - chọn API qua route data.
        path: 'ess/infoApply/viewApplyOTBatchInfoHAEList',
        loadComponent: () =>
          import('./pages/ess/ot-attendance-report-list/ot-attendance-report-list.component').then(
            (m) => m.OtAttendanceReportListComponent,
          ),
        data: {
          apiBase: '/ess/infoApply/api/otBatchHAE',
          exportFileName: 'apply_ot_batch_hae_export',
        },
      },
      {
        // /ess/infoApply/viewCoordApplyOtInfoList - xem
        // EssInfoApplyController#viewCoordApplyOtInfoList.
        path: 'ess/infoApply/viewCoordApplyOtInfoList',
        loadComponent: () =>
          import('./pages/ess/ot-attendance-report-list/ot-attendance-report-list.component').then(
            (m) => m.OtAttendanceReportListComponent,
          ),
        data: { apiBase: '/ess/infoApply/api/coordOt', exportFileName: 'coord_apply_ot_export' },
      },
      {
        // /ess/infoApply/viewPersonOtApplyInfoList - xem
        // EssInfoApplyController#viewPersonOtApplyInfoList.
        path: 'ess/infoApply/viewPersonOtApplyInfoList',
        loadComponent: () =>
          import('./pages/ess/person-ot-apply-info-list/person-ot-apply-info-list.component').then(
            (m) => m.PersonOtApplyInfoListComponent,
          ),
      },
      {
        // /ess/infoApply/viewNoticeedEmail - xem EssInfoApplyController#viewNoticeedEmail.
        // Dùng chung NoticeedEmailListComponent với viewApprovaledEmail (2
        // trang trùng lặp 100% cấu trúc backend) - chọn API qua route data.
        path: 'ess/infoApply/viewNoticeedEmail',
        loadComponent: () =>
          import('./pages/ess/noticeed-email-list/noticeed-email-list.component').then(
            (m) => m.NoticeedEmailListComponent,
          ),
        data: { apiBase: '/ess/infoApply/api/noticeedEmail' },
      },
      {
        // /ess/infoApply/viewApprovaledEmail - xem EssInfoApplyController#viewApprovaledEmail.
        path: 'ess/infoApply/viewApprovaledEmail',
        loadComponent: () =>
          import('./pages/ess/noticeed-email-list/noticeed-email-list.component').then(
            (m) => m.NoticeedEmailListComponent,
          ),
        data: { apiBase: '/ess/infoApply/api/approvaledEmail' },
      },
      {
        // /ess/infoApply/viewApprovalEmail - xem EssInfoApplyController#viewApprovalEmail.
        // Hàng đợi đơn chờ duyệt, duyệt/từ chối hàng loạt + đồng bộ Clever.
        path: 'ess/infoApply/viewApprovalEmail',
        loadComponent: () =>
          import('./pages/ess/approval-email-list/approval-email-list.component').then(
            (m) => m.ApprovalEmailListComponent,
          ),
      },
      {
        // /ess/infoApplyAttendance/viewApplyAttendanceInfoList - xem
        // EssInfoApplyAttendanceController#viewApplyAttendanceInfoList.
        path: 'ess/infoApplyAttendance/viewApplyAttendanceInfoList',
        loadComponent: () =>
          import('./pages/ess/my-leave-apply-list/my-leave-apply-list.component').then(
            (m) => m.MyLeaveApplyListComponent,
          ),
      },
      {
        // /ess/infoApplyAttendance/viewSSTApplyAttendance - xem
        // EssInfoApplyAttendanceController#viewSSTApplyAttendance.
        path: 'ess/infoApplyAttendance/viewSSTApplyAttendance',
        loadComponent: () =>
          import('./pages/ess/sst-leave-apply/sst-leave-apply.component').then(
            (m) => m.SstLeaveApplyComponent,
          ),
      },
      {
        // /ess/infoApply/viewPOtApplyInfoList - xem
        // EssInfoApplyController#viewPOtApplyInfoList. Dùng chung
        // MyOtApplyListComponent với viewPiciOtAffirmPBatchList (2 trang
        // trùng lặp 100% cấu trúc backend) - chọn API/route/variant qua route
        // data.
        path: 'ess/infoApply/viewPOtApplyInfoList',
        loadComponent: () =>
          import('./pages/ess/my-ot-apply-list/my-ot-apply-list.component').then(
            (m) => m.MyOtApplyListComponent,
          ),
        data: {
          apiBase: '/ess/infoApply/api/myOtApply',
          detailVariant: 'ot',
          applyRoute: '/ess/infoApply/viewSSTOtApplyInfo',
        },
      },
      {
        // /ess/infoApply/viewPiciOtAffirmPBatchList - xem
        // EssInfoApplyController#viewPiciOtAffirmPBatchList.
        path: 'ess/infoApply/viewPiciOtAffirmPBatchList',
        loadComponent: () =>
          import('./pages/ess/my-ot-apply-list/my-ot-apply-list.component').then(
            (m) => m.MyOtApplyListComponent,
          ),
        data: {
          apiBase: '/ess/infoApply/api/myOtApplyOver',
          detailVariant: 'otOver',
          applyRoute: '/ess/infoApply/viewSSTOtApplyInfoTx',
        },
      },
      {
        // /ess/infoApply/viewSSTOtApplyInfo - xem
        // EssInfoApplyController#viewSSTOtApplyInfo. Tăng ca THƯỜNG - giới
        // hạn 40h/tháng, 300h/năm, lưu vào ESS_APPLY_OT. Component riêng
        // (không dùng chung với viewSSTOtApplyInfoTx nữa) vì rule nghiệp vụ
        // khác nhau - xem docblock SstOtApplyComponent.
        path: 'ess/infoApply/viewSSTOtApplyInfo',
        loadComponent: () =>
          import('./pages/ess/sst-ot-apply/sst-ot-apply.component').then(
            (m) => m.SstOtApplyComponent,
          ),
      },
      {
        // /ess/infoApply/viewSSTOtApplyInfoTx - xem
        // EssInfoApplyController#viewSSTOtApplyInfoTx. Tăng ca VƯỢT - không
        // giới hạn giờ/tháng/năm, lưu vào ESS_APPLY_OT_OVER. Component riêng
        // - xem docblock SstOtApplyOverComponent.
        path: 'ess/infoApply/viewSSTOtApplyInfoTx',
        loadComponent: () =>
          import('./pages/ess/sst-ot-apply-over/sst-ot-apply-over.component').then(
            (m) => m.SstOtApplyOverComponent,
          ),
      },
      {
        // /ess/infoApply/viewShowCwaAbnormalApply - xem
        // EssInfoApplyController#viewShowCwaAbnormalApply. Xin phép chấm công
        // bất thường hàng loạt cho chính nhân viên đang đăng nhập.
        path: 'ess/infoApply/viewShowCwaAbnormalApply',
        loadComponent: () =>
          import('./pages/ess/cwa-abnormal-apply/cwa-abnormal-apply.component').then(
            (m) => m.CwaAbnormalApplyComponent,
          ),
      },
      {
        // /ess/infoApplyAttendance/viewAttendanceExForBatchInfoList - xem
        // EssInfoApplyAttendanceController#viewAttendanceExForBatchInfoList.
        // HR/quản lý tra cứu chấm công bất thường theo phòng ban và xin phép
        // hàng loạt thay nhân viên.
        path: 'ess/infoApplyAttendance/viewAttendanceExForBatchInfoList',
        loadComponent: () =>
          import('./pages/ess/attendance-ex-for-batch/attendance-ex-for-batch.component').then(
            (m) => m.AttendanceExForBatchComponent,
          ),
      },
      {
        // /ess/infoApply/viewApplyOtLBatchByAnyApproverList - xem
        // EssInfoApplyController#viewApplyOtLBatchByAnyApproverList.
        // HR/quản lý xem+xin tăng ca hàng loạt thay bất kỳ nhân viên nào.
        path: 'ess/infoApply/viewApplyOtLBatchByAnyApproverList',
        loadComponent: () =>
          import('./pages/ess/apply-ot-batch/apply-ot-batch.component').then(
            (m) => m.ApplyOtBatchComponent,
          ),
      },
      {
        // /ess/infoApplyAttendance/viewApplyAttBatchByAnyApproverList - xem
        // EssInfoApplyAttendanceController#viewApplyAttBatchByAnyApproverList.
        // HR/quản lý xem+xin nghỉ phép hàng loạt thay bất kỳ nhân viên nào.
        path: 'ess/infoApplyAttendance/viewApplyAttBatchByAnyApproverList',
        loadComponent: () =>
          import('./pages/ess/apply-att-batch/apply-att-batch.component').then(
            (m) => m.ApplyAttBatchComponent,
          ),
      },
      // ===== Module `ar` (attendance/chấm công) - Batch M =====
      {
        // /ar/attendanceMintenance/viewApplyAttManagentByAnyApproverList - xem
        // EssLeaveApplyController#view(). Trùng lặp 100% cấu trúc backend với
        // ess/infoApplyAttendance/viewApplyAttBatchByAnyApproverList (đã xoá) -
        // dùng chung nguyên vẹn ApplyAttBatchComponent, chỉ thêm route mới.
        path: 'ar/attendanceMintenance/viewApplyAttManagentByAnyApproverList',
        loadComponent: () =>
          import('./pages/ess/apply-att-batch/apply-att-batch.component').then(
            (m) => m.ApplyAttBatchComponent,
          ),
      },
      {
        // /ar/attendanceMintenance/viewApplyOtManagentByAnyApproverList - xem
        // ArOvertimeManagentController#view(). Trùng lặp 100% cấu trúc backend
        // với ess/infoApply/viewApplyOtLBatchByAnyApproverList (đã xoá) - dùng
        // chung nguyên vẹn ApplyOtBatchComponent, chỉ thêm route mới.
        path: 'ar/attendanceMintenance/viewApplyOtManagentByAnyApproverList',
        loadComponent: () =>
          import('./pages/ess/apply-ot-batch/apply-ot-batch.component').then(
            (m) => m.ApplyOtBatchComponent,
          ),
      },
      {
        // /ar/attendanceMintenance/viewImportAttendanceTempList - xem
        // EssLeaveApplyController#viewImportAttendanceTempList(). Trang kết quả
        // import Excel, mở trong tab mới từ ApplyAttBatchComponent.
        path: 'ar/attendanceMintenance/viewImportAttendanceTempList',
        loadComponent: () =>
          import('./pages/ar/import-attendance-temp-list/import-attendance-temp-list.component').then(
            (m) => m.ImportAttendanceTempListComponent,
          ),
      },
      {
        // /ar/attendanceMintenance/viewImportOtTempList - xem
        // ArOvertimeManagentController#viewImportOtTempList(). Trang kết quả
        // import Excel, mở trong tab mới từ ApplyOtBatchComponent.
        path: 'ar/attendanceMintenance/viewImportOtTempList',
        loadComponent: () =>
          import('./pages/ar/import-ot-temp-list/import-ot-temp-list.component').then(
            (m) => m.ImportOtTempListComponent,
          ),
      },
      // ===== Module `ar` (attendance/chấm công) - Batch N =====
      {
        // /ar/attendanceMintenance/viewArCardRecordForSelf - xem
        // ArAttendanceSearchController#viewArCardRecordForSelf(). Tra cứu lịch
        // sử ra vào (quẹt thẻ) của chính nhân viên, đọc trực tiếp từ máy chủ.
        path: 'ar/attendanceMintenance/viewArCardRecordForSelf',
        loadComponent: () =>
          import('./pages/ar/card-record-for-self/card-record-for-self.component').then(
            (m) => m.CardRecordForSelfComponent,
          ),
      },
      {
        // /ar/attendanceMintenance/viewArCardRecordMeal - xem
        // ArAttendanceSearchController#viewArCardRecordMeal(). Tra cứu dữ liệu
        // quẹt thẻ suất ăn.
        path: 'ar/attendanceMintenance/viewArCardRecordMeal',
        loadComponent: () =>
          import('./pages/ar/card-record-meal/card-record-meal.component').then(
            (m) => m.CardRecordMealComponent,
          ),
      },
      {
        // /ar/attendanceMintenance/viewArCardRecordDay - xem
        // ArAttendanceSearchController#viewArCardRecordDay(). Tra cứu tổng hợp
        // quẹt thẻ theo ca làm (giờ vào/ra, thiếu thẻ, đổi ca).
        path: 'ar/attendanceMintenance/viewArCardRecordDay',
        loadComponent: () =>
          import('./pages/ar/card-record-day/card-record-day.component').then(
            (m) => m.CardRecordDayComponent,
          ),
      },
      // ===== Module `ar` (attendance/chấm công) - Batch O =====
      {
        // /ar/attendanceMintenance/viewArCardRecord - xem
        // ArAttendanceSearchController#viewArCardRecord(). CRUD đầy đủ bản ghi
        // quẹt thẻ ra vào (thêm/sửa/xóa, đọc dữ liệu từ máy chủ, import/xuất Excel).
        path: 'ar/attendanceMintenance/viewArCardRecord',
        loadComponent: () =>
          import('./pages/ar/card-record/card-record.component').then((m) => m.CardRecordComponent),
      },
      {
        // /ar/attendanceMintenance/viewImportExcelTempMacRecordsList - xem
        // ArAttendanceSearchController#viewImportExcelTempMacRecordsList().
        // Xem/xác nhận kết quả import Excel dữ liệu quẹt thẻ.
        path: 'ar/attendanceMintenance/viewImportExcelTempMacRecordsList',
        loadComponent: () =>
          import('./pages/ar/import-excel-temp-mac-records-list/import-excel-temp-mac-records-list.component').then(
            (m) => m.ImportExcelTempMacRecordsListComponent,
          ),
      },
      // ===== Module `ar` (attendance/chấm công) - Batch P =====
      {
        // /ar/attendanceMintenance/viewArDetailCalculate - xem
        // ArDetailCalculateController#viewArDetailCalculate(). Form trigger
        // tính lại công chi tiết theo nhân viên hoặc phòng ban.
        path: 'ar/attendanceMintenance/viewArDetailCalculate',
        loadComponent: () =>
          import('./pages/ar/detail-calculate/detail-calculate.component').then(
            (m) => m.DetailCalculateComponent,
          ),
      },
      {
        // /ar/attendanceMintenance/addEmpShiftView - xem
        // ArScheduleHaeController#addEmpShiftView(). CRUD xếp ca làm việc cho
        // nhân viên theo tháng, import Excel hàng loạt.
        path: 'ar/attendanceMintenance/addEmpShiftView',
        loadComponent: () =>
          import('./pages/ar/add-emp-shift/add-emp-shift.component').then(
            (m) => m.AddEmpShiftComponent,
          ),
      },
      // ===== Module `ar` (attendance/chấm công) - Batch Q =====
      {
        // /ar/attendanceMintenance/viewAttendanceManagentForSerchInfoList -
        // xem ArAttendanceSearchController#viewAttendanceManagentForSerchInfoList().
        // Tra cứu chi tiết công (nghỉ phép/chấm công bất thường), có modal
        // test đồng bộ Cleverse (DEV).
        path: 'ar/attendanceMintenance/viewAttendanceManagentForSerchInfoList',
        loadComponent: () =>
          import('./pages/ar/attendance-search/attendance-search.component').then(
            (m) => m.AttendanceSearchComponent,
          ),
      },
      {
        // /ar/attendanceMintenance/viewSearchApplyOtInfoList - xem
        // ArAttendanceSearchController#viewSearchApplyOtInfoList(). Tra cứu
        // đơn tăng ca theo phòng ban được phân quyền.
        path: 'ar/attendanceMintenance/viewSearchApplyOtInfoList',
        loadComponent: () =>
          import('./pages/ar/attendance-ot-search/attendance-ot-search.component').then(
            (m) => m.AttendanceOtSearchComponent,
          ),
      },
      // ===== Module `ar` (attendance/chấm công) - Batch R =====
      {
        // /ar/attendanceSettings/viewArItem - xem ArItemController#viewArItem().
        // CRUD phẳng danh mục Hạng mục chấm công.
        path: 'ar/attendanceSettings/viewArItem',
        loadComponent: () =>
          import('./pages/ar/ar-item/ar-item.component').then((m) => m.ArItemComponent),
      },
      {
        // /ar/attendanceSettings/viewCycle - xem
        // ArStatisticDateController#viewCycle(). CRUD phẳng Chi nhánh / chu
        // kỳ chấm công.
        path: 'ar/attendanceSettings/viewCycle',
        loadComponent: () =>
          import('./pages/ar/cycle/cycle.component').then((m) => m.CycleComponent),
      },
      {
        // /ar/attendanceSettings/viewCycleParameter - xem
        // ArStatisticDateParamController#viewCycleParameter(). CRUD phẳng
        // Thông số chu kỳ chấm công.
        path: 'ar/attendanceSettings/viewCycleParameter',
        loadComponent: () =>
          import('./pages/ar/cycle-parameter/cycle-parameter.component').then(
            (m) => m.CycleParameterComponent,
          ),
      },
      // ===== Module `ar` (attendance/chấm công) - Batch S =====
      {
        // /ar/attendanceSettings/viewSummaryItem - xem
        // ArStaItemController#viewSummaryItem(). CRUD phẳng danh mục Hạng
        // mục tổng hợp.
        path: 'ar/attendanceSettings/viewSummaryItem',
        loadComponent: () =>
          import('./pages/ar/summary-item/summary-item.component').then(
            (m) => m.SummaryItemComponent,
          ),
      },
      {
        // /ar/attendanceSettings/viewVacEmpList - xem
        // ArVacEmpController#viewVacEmpList(). Tra cứu tổng hợp phép năm
        // của nhân viên (chỉ xem + xuất Excel).
        path: 'ar/attendanceSettings/viewVacEmpList',
        loadComponent: () =>
          import('./pages/ar/vac-emp-list/vac-emp-list.component').then(
            (m) => m.VacEmpListComponent,
          ),
      },
      {
        // /ar/attendanceSettings/viewDynamicGroup - xem
        // ArEmpGroupController#viewDynamicGroup(). Quản lý danh sách Nhân
        // viên đặc biệt (nhóm cố định 80000084).
        path: 'ar/attendanceSettings/viewDynamicGroup',
        loadComponent: () =>
          import('./pages/ar/dynamic-group/dynamic-group.component').then(
            (m) => m.DynamicGroupComponent,
          ),
      },
      // ===== Module `ar` (attendance/chấm công) - Batch T =====
      {
        // /ar/attendanceSettings/viewDepartManagerList - xem
        // ArDepartmentManageController#viewContent(). Quản lý chốt công
        // phòng ban theo ngày (cây phòng ban 8 cột khóa/mở xin phép).
        path: 'ar/attendanceSettings/viewDepartManagerList',
        loadComponent: () =>
          import('./pages/ar/depart-manager-list/depart-manager-list.component').then(
            (m) => m.DepartManagerListComponent,
          ),
      },
      {
        // /ar/attendanceSettings/viewAttendanceKeeper - xem
        // ArSupervisorController#viewAttendanceKeeper(). Quản lý Người chấm
        // công (nhân viên phân quyền quản lý phòng ban).
        path: 'ar/attendanceSettings/viewAttendanceKeeper',
        loadComponent: () =>
          import('./pages/ar/attendance-keeper/attendance-keeper.component').then(
            (m) => m.AttendanceKeeperComponent,
          ),
      },
      // ===== Module `ar` (attendance/chấm công) - Batch U =====
      {
        // /ar/attendanceSettings/viewArItemParamList - xem
        // ArItemParamController#viewArItemParamList(). CRUD phẳng Thông số
        // Hạng mục chấm công.
        path: 'ar/attendanceSettings/viewArItemParamList',
        loadComponent: () =>
          import('./pages/ar/ar-item-param-list/ar-item-param-list.component').then(
            (m) => m.ArItemParamListComponent,
          ),
      },
      {
        // /ar/attendanceSettings/viewItemParameter - xem
        // ArItemParamController#viewItemParameter(). Quản lý Thông số Hạng
        // mục dạng Cây-Bảng (Tree-Table).
        path: 'ar/attendanceSettings/viewItemParameter',
        loadComponent: () =>
          import('./pages/ar/item-parameter/item-parameter.component').then(
            (m) => m.ItemParameterComponent,
          ),
      },
      // ===== Module `ar` (attendance/chấm công) - Batch V =====
      {
        // /ar/attendanceSettings/viewStatutoryHolidays - xem
        // ArCalenderController#viewStatutoryHolidays(). CRUD phẳng Ngày lễ
        // pháp định.
        path: 'ar/attendanceSettings/viewStatutoryHolidays',
        loadComponent: () =>
          import('./pages/ar/statutory-holidays/statutory-holidays.component').then(
            (m) => m.StatutoryHolidaysComponent,
          ),
      },
      {
        // /ar/attendanceSettings/viewCompanyCalendar - xem
        // ArCalenderController#viewCompanyCalendar(). Lịch công ty dạng
        // calendar-grid theo tháng.
        path: 'ar/attendanceSettings/viewCompanyCalendar',
        loadComponent: () =>
          import('./pages/ar/company-calendar/company-calendar.component').then(
            (m) => m.CompanyCalendarComponent,
          ),
      },
      // ===== Module `ar` (attendance/chấm công) - Batch W =====
      {
        // /ar/attendanceSettings/viewClassCalendar - xem
        // ArCalenderController#viewClassCalendar(). Lịch Nhóm Ca dạng
        // calendar-grid, lọc theo nhóm ca + thêm hàng loạt theo khoảng ngày.
        path: 'ar/attendanceSettings/viewClassCalendar',
        loadComponent: () =>
          import('./pages/ar/class-calendar/class-calendar.component').then(
            (m) => m.ClassCalendarComponent,
          ),
      },
      {
        // /ar/attendanceSettings/viewEmpCalendar - xem
        // ArCalenderController#viewEmpCalendar(). Lịch cá nhân (chỉ xem).
        path: 'ar/attendanceSettings/viewEmpCalendar',
        loadComponent: () =>
          import('./pages/ar/emp-calendar/emp-calendar.component').then(
            (m) => m.EmpCalendarComponent,
          ),
      },
      // ===== Module `ar` (attendance/chấm công) - Batch X =====
      {
        // /ar/attendanceSettings/viewShift - xem ArShiftController#viewShift().
        // Master-detail: Ca làm việc (AR_SHIFT010) + Chi tiết tham số ca
        // (AR_SHIFT020).
        path: 'ar/attendanceSettings/viewShift',
        loadComponent: () =>
          import('./pages/ar/shift/shift.component').then((m) => m.ShiftComponent),
      },
      // ===== Module `ar` (attendance/chấm công) - Batch Y =====
      {
        // /ar/attendanceSettings/viewSummaryParamItem - xem
        // ArStaItemParamController#viewSummaryParamItem(). CRUD phẳng Thông
        // số Hạng mục tổng hợp (AR_STA_ITEM_PARAM).
        path: 'ar/attendanceSettings/viewSummaryParamItem',
        loadComponent: () =>
          import('./pages/ar/summary-param-item/summary-param-item.component').then(
            (m) => m.SummaryParamItemComponent,
          ),
      },
      {
        // /ar/attendanceSettings/viewSummaryFormula - xem
        // ArStaFormulaController#viewSummaryFormula(). Master-detail: cây
        // Hạng mục + Công thức tổng hợp (AR_STA_FORMULA), kèm 3 bảng công cụ
        // tra cứu để chèn mã tham chiếu vào công thức.
        path: 'ar/attendanceSettings/viewSummaryFormula',
        loadComponent: () =>
          import('./pages/ar/summary-formula/summary-formula.component').then(
            (m) => m.SummaryFormulaComponent,
          ),
      },
      // ===== Module `ar` (attendance/chấm công) - Batch Z =====
      {
        // /ar/countAttendance/arCountInfoList - xem ArCountInfoListController#viewArCountInfoList().
        // Hiện trạng chấm công của nhân viên: tab "Nghỉ phép" (tái sử dụng
        // ArPersonalListService) + tab "Tăng ca" (tổng hợp theo tháng, hàm
        // GET_AR_OT_TOTAIL).
        path: 'ar/countAttendance/arCountInfoList',
        loadComponent: () =>
          import('./pages/ar/ar-count-info-list/ar-count-info-list.component').then(
            (m) => m.ArCountInfoListComponent,
          ),
      },
      // ===== Module `hrm` - Batch 1 (approve) =====
      {
        // /hrm/approve/viewEssApplyInfo - xem
        // HrmApproveController#viewEssApplyInfo(). Phê duyệt thay đổi thông
        // tin cá nhân nhân viên (ESS self-service apply), split-panel danh
        // sách (server-side paging) + chi tiết so sánh dữ liệu mới/gốc.
        path: 'hrm/approve/viewEssApplyInfo',
        loadComponent: () =>
          import('./pages/hrm/ess-apply-info/ess-apply-info.component').then(
            (m) => m.EssApplyInfoComponent,
          ),
      },
      // ===== Module `hrm` - Batch 2 (contract) =====
      {
        // /hrm/contractInfo/viewNOContractInfo - xem
        // HrContractController#viewNOContractInfo(). CRUD đầy đủ
        // (Thêm/Sửa/Xóa/Xem) danh sách hợp đồng lao động.
        path: 'hrm/contractInfo/viewNOContractInfo',
        loadComponent: () =>
          import('./pages/hrm/contract/no-contract-info/no-contract-info.component').then(
            (m) => m.NoContractInfoComponent,
          ),
      },
      {
        // /hrm/contractInfo/viewExpiredContract - xem
        // HrContractController#viewExpiredContract(). Danh sách hợp đồng sắp
        // hết hạn (mặc định lọc 7 ngày tới) + chức năng Gia hạn.
        path: 'hrm/contractInfo/viewExpiredContract',
        loadComponent: () =>
          import('./pages/hrm/contract/expired-contract/expired-contract.component').then(
            (m) => m.ExpiredContractComponent,
          ),
      },
      {
        // /hrm/contractInfo/viewContractInfoForSearch - xem
        // HrContractController#viewContractInfoForSearch(). Tra cứu hợp đồng
        // (chỉ xem, không CRUD).
        path: 'hrm/contractInfo/viewContractInfoForSearch',
        loadComponent: () =>
          import('./pages/hrm/contract/contract-search/contract-search.component').then(
            (m) => m.ContractSearchComponent,
          ),
      },
      // ===== Module `hrm` - Batch 3 (empinfo, phần 1/nhiều) =====
      {
        // /hrm/empinfo/educationSearch - xem
        // HrEmpinfoController#viewEducationSearch(). CRUD quá trình học tập.
        path: 'hrm/empinfo/educationSearch',
        loadComponent: () =>
          import('./pages/hrm/empinfo/education/education.component').then(
            (m) => m.EducationComponent,
          ),
      },
      {
        // /hrm/empinfo/addressSearch - xem
        // HrEmpinfoController#viewAddressSearch(). CRUD tra cứu địa chỉ.
        path: 'hrm/empinfo/addressSearch',
        loadComponent: () =>
          import('./pages/hrm/empinfo/address/address.component').then((m) => m.AddressComponent),
      },
      {
        // /hrm/empinfo/familySearch - xem
        // HrEmpinfoController#viewFamilySearch(). CRUD thông tin người thân.
        path: 'hrm/empinfo/familySearch',
        loadComponent: () =>
          import('./pages/hrm/empinfo/family/family.component').then((m) => m.FamilyComponent),
      },
      {
        // /hrm/empinfo/emergencyAddressSearch - xem
        // HrEmpinfoController#viewEmergencyAddressSearch(). CRUD địa chỉ khẩn cấp.
        path: 'hrm/empinfo/emergencyAddressSearch',
        loadComponent: () =>
          import('./pages/hrm/empinfo/emergency-address/emergency-address.component').then(
            (m) => m.EmergencyAddressComponent,
          ),
      },
      {
        // /hrm/empinfo/recognitionSearch - xem
        // HrEmpinfoController#recognitionSearch(). CRUD khen thưởng.
        path: 'hrm/empinfo/recognitionSearch',
        loadComponent: () =>
          import('./pages/hrm/empinfo/recognition/recognition.component').then(
            (m) => m.RecognitionComponent,
          ),
      },
      {
        // /hrm/empinfo/viewQualification - xem
        // HrEmpinfoController#viewQualification(). CRUD chứng chỉ. Bug thật đã
        // sửa: dateObtained/validityDate là LocalDate ở backend nhưng form gốc
        // dùng text "YYYYMMDD" (không dấu gạch) khiến lưu luôn lỗi 400.
        path: 'hrm/empinfo/viewQualification',
        loadComponent: () =>
          import('./pages/hrm/empinfo/qualification/qualification.component').then(
            (m) => m.QualificationComponent,
          ),
      },
      {
        // /hrm/empinfo/punishmentSearch - xem
        // HrEmpinfoController#punishmentSearch(). CRUD kỷ luật.
        path: 'hrm/empinfo/punishmentSearch',
        loadComponent: () =>
          import('./pages/hrm/empinfo/punishment/punishment.component').then(
            (m) => m.PunishmentComponent,
          ),
      },
      {
        // /hrm/empinfo/viewWorkInformation - xem
        // HrEmpinfoController#viewWorkInformation(). CRUD kinh nghiệm làm việc.
        path: 'hrm/empinfo/viewWorkInformation',
        loadComponent: () =>
          import('./pages/hrm/empinfo/work-experience/work-experience.component').then(
            (m) => m.WorkExperienceComponent,
          ),
      },
      {
        // /hrm/empinfo/viewPersonalInfo - xem
        // HrEmpinfoController#viewPersonalInfo(). Hồ sơ nhân viên (chỉ xem,
        // không CRUD) - tìm kiếm nhân viên + các tab thông tin cơ bản/công
        // việc/học tập/khen thưởng-kỷ luật (2 tab đánh giá/đặc biệt luôn
        // trống ở bản gốc do không có API cấp dữ liệu).
        path: 'hrm/empinfo/viewPersonalInfo',
        loadComponent: () =>
          import('./pages/hrm/empinfo/personal-info/personal-info.component').then(
            (m) => m.PersonalInfoComponent,
          ),
      },
      {
        // /hrm/empinfo/viewTempEmpInfoList - xem
        // HrEmpinfoController#viewTempEmpInfoList(). Quản lý nhân viên nữ
        // (CRUD đầy đủ qua bảng HR_SPECIAL_MATTER, DataTables server-side).
        // Bug thật đã sửa: bộ lọc Hoạt động/Trạng thái OT gửi
        // 'ACTIVE'/'INACTIVE' và 'Y'/'N' trong khi cột là NUMBER, luôn ném
        // ORA-01722 - dùng đúng '1'/'0' khớp kiểu cột.
        path: 'hrm/empinfo/viewTempEmpInfoList',
        loadComponent: () =>
          import('./pages/hrm/empinfo/temp-emp-info-list/temp-emp-info-list.component').then(
            (m) => m.TempEmpInfoListComponent,
          ),
      },
      {
        // /hrm/empinfo/photoImport - xem
        // HrEmpinfoController#photoImport(). Import ảnh đại diện hàng loạt.
        path: 'hrm/empinfo/photoImport',
        loadComponent: () =>
          import('./pages/hrm/empinfo/photo-import/photo-import.component').then(
            (m) => m.PhotoImportComponent,
          ),
      },
      {
        // /hrm/empinfo/viewStartPoint - xem
        // HrEmpinfoController#viewStartPoint(). Quyết định nhân sự
        // (master-detail). Bug dữ liệu nghiêm trọng đã sửa - xem ghi chú
        // trong start-point.component.ts (8 trường bị xóa trắng mỗi lần sửa
        // do JS gốc tham chiếu tới phần tử DOM không tồn tại).
        path: 'hrm/empinfo/viewStartPoint',
        loadComponent: () =>
          import('./pages/hrm/empinfo/start-point/start-point.component').then(
            (m) => m.StartPointComponent,
          ),
      },
      {
        // /hrm/empinfo/viewHAECardInfoList - xem
        // HrEmpinfoController#viewHAECardInfoList(). Thẻ nhân sự (in). Tái sử
        // dụng ManageEmpPositionInfoService (module ess) cho danh sách tìm
        // kiếm. Bug thật đã sửa: field-name-mismatch khiến gần hết phần
        // "Thông tin cá nhân" trên thẻ in luôn trống - xem ghi chú trong
        // hae-card-info-list.service.ts.
        path: 'hrm/empinfo/viewHAECardInfoList',
        loadComponent: () =>
          import('./pages/hrm/empinfo/hae-card-info-list/hae-card-info-list.component').then(
            (m) => m.HaeCardInfoListComponent,
          ),
      },
      {
        // /hrm/recruitManage/viewRecruitList - xem
        // HrRecruitManageController#viewRecruitList(). Quản lý quyết định
        // nhận việc nhân viên mới (master-detail, 5 tab). Bug dữ liệu
        // nghiêm trọng đã sửa - xem ghi chú trong recruit-list.service.ts
        // (11 trường bị xóa trắng mỗi lần lưu do JS gốc tham chiếu tới phần
        // tử DOM không tồn tại).
        path: 'hrm/recruitManage/viewRecruitList',
        loadComponent: () =>
          import('./pages/hrm/recruit-manage/recruit-list/recruit-list.component').then(
            (m) => m.RecruitListComponent,
          ),
      },
      {
        // /hrm/recruitManage/viewExperienceBatchList - xem
        // HrRecruitManageController#viewExperienceBatchList(). Quyết định
        // hàng loạt (đăng ký theo ngày, sửa từng dòng, import Excel). Nút
        // "Xuất Excel" đổi sang xuất phía client (SheetJS) - xem ghi chú
        // trong experience-batch-list.service.ts (endpoint export không
        // tồn tại ở bản gốc).
        path: 'hrm/recruitManage/viewExperienceBatchList',
        loadComponent: () =>
          import('./pages/hrm/recruit-manage/experience-batch-list/experience-batch-list.component').then(
            (m) => m.ExperienceBatchListComponent,
          ),
      },
      {
        // /hrm/recruitManage/viewRecruitBatchList - xem
        // HrRecruitManageController#viewRecruitBatchList(). Nhận việc hàng
        // loạt (đăng ký theo ngày, sửa từng dòng qua modal 5 mục, import
        // Excel). Nút "Xuất Excel" đổi sang xuất phía client (SheetJS) -
        // xem ghi chú trong recruit-batch-list.service.ts.
        path: 'hrm/recruitManage/viewRecruitBatchList',
        loadComponent: () =>
          import('./pages/hrm/recruit-manage/recruit-batch-list/recruit-batch-list.component').then(
            (m) => m.RecruitBatchListComponent,
          ),
      },
      {
        // /evs/manage/viewResumeList - xem EvsManageController#viewResumeList().
        // Danh sách đánh giá (master cho toàn bộ module evs/manage) - đọc
        // evsType từ query param (?evsType=performance/ability).
        path: 'evs/manage/viewResumeList',
        loadComponent: () =>
          import('./pages/evs/resume-list/resume-list.component').then(
            (m) => m.ResumeListComponent,
          ),
      },
      {
        // /evs/manage/viewEvsFormulaList - xem EvsManageController#viewEvsFormulaList().
        // Công thức đánh giá - CRUD đơn giản.
        path: 'evs/manage/viewEvsFormulaList',
        loadComponent: () =>
          import('./pages/evs/evs-formula-list/evs-formula-list.component').then(
            (m) => m.EvsFormulaListComponent,
          ),
      },
      {
        // /evs/manage/viewEvsDistributionRatePanel - xem
        // EvsManageController#viewEvsDistributionRatePanel(). Tỷ lệ phân bổ
        // điểm (EX/VG/GD/NI/UN) theo Loại (CPNY/DEPT/EMP), ràng buộc tổng = 100.
        path: 'evs/manage/viewEvsDistributionRatePanel',
        loadComponent: () =>
          import('./pages/evs/evs-distribution-rate-panel/evs-distribution-rate-panel.component').then(
            (m) => m.EvsDistributionRatePanelComponent,
          ),
      },
      {
        // /evs/manage/viewEvsParamPanel - xem EvsManageController#viewEvsParamPanel().
        // Tiêu chuẩn đánh giá - 7 tab con (Cấp ĐG, 4 loại EVS_PARAM, Đối
        // tượng đánh giá, Người đánh giá). Đổi UX inline-edit-trong-bảng
        // sang modal Thêm/Sửa - xem ghi chú trong evs-param-panel.service.ts.
        path: 'evs/manage/viewEvsParamPanel',
        loadComponent: () =>
          import('./pages/evs/evs-param-panel/evs-param-panel.component').then(
            (m) => m.EvsParamPanelComponent,
          ),
      },
      {
        // /evs/manage/viewEvsAffirmorSetup - xem
        // EvsManageController#viewEvsAffirmorSetup(). Thiết lập đối tượng
        // + người đánh giá. Thay jQuery EmployeeSearchModal dùng chung bằng
        // 1 modal NG-ZORRO tìm nhân viên tái sử dụng - xem ghi chú trong
        // evs-affirmor-setup.service.ts.
        path: 'evs/manage/viewEvsAffirmorSetup',
        loadComponent: () =>
          import('./pages/evs/evs-affirmor-setup/evs-affirmor-setup.component').then(
            (m) => m.EvsAffirmorSetupComponent,
          ),
      },
      {
        // /evs/manage/viewEvsItemPanel - xem EvsManageController#viewEvsItemPanel().
        // Chỉ tiêu đánh giá (EVS_ITEM) + Hạng mục chỉ tiêu chỉ định
        // (EVS_ITEM_PARAM) - đổi UX inline-edit sang modal Thêm/Sửa.
        path: 'evs/manage/viewEvsItemPanel',
        loadComponent: () =>
          import('./pages/evs/evs-item-panel/evs-item-panel.component').then(
            (m) => m.EvsItemPanelComponent,
          ),
      },
      {
        // /evs/manage/viewRegPersonalTarget - xem
        // EvsManageController#viewRegPersonalTarget(). Đăng ký mục tiêu cá
        // nhân (Objective Confirm). Đổi UX inline-edit + Quill rich-text
        // sang modal Thêm/Sửa + textarea - xem ghi chú trong
        // reg-personal-target.service.ts.
        path: 'evs/manage/viewRegPersonalTarget',
        loadComponent: () =>
          import('./pages/evs/reg-personal-target/reg-personal-target.component').then(
            (m) => m.RegPersonalTargetComponent,
          ),
      },
      {
        // /evs/manage/viewConfirmTarget1 - xem EvsManageController#viewConfirmTarget1().
        // Xác nhận mục tiêu (cấp 1 mặc định, có thể đổi qua query AFFIRM_LEVEL).
        // Dùng chung ConfirmTargetComponent với viewConfirmTarget2 - xem ghi
        // chú trong confirm-target.service.ts.
        path: 'evs/manage/viewConfirmTarget1',
        loadComponent: () =>
          import('./pages/evs/confirm-target/confirm-target.component').then(
            (m) => m.ConfirmTargetComponent,
          ),
        data: {
          confirmTargetConfig: {
            apiBase: 'confirmTarget1',
            i18nPrefix: 'evs.viewConfirmTarget1',
            confirmActivity: '14015364',
            evsLevel: '14015084',
          },
        },
      },
      {
        // /evs/manage/viewConfirmTarget2 - xem EvsManageController#viewConfirmTarget2().
        // Xác nhận mục tiêu cấp 2 (cố định affirmLevel='2').
        path: 'evs/manage/viewConfirmTarget2',
        loadComponent: () =>
          import('./pages/evs/confirm-target/confirm-target.component').then(
            (m) => m.ConfirmTargetComponent,
          ),
        data: {
          confirmTargetConfig: {
            apiBase: 'confirmTarget2',
            i18nPrefix: 'evs.viewConfirmTarget2',
            confirmActivity: '14015365',
            evsLevel: '14015085',
            fixedAffirmLevel: '2',
          },
        },
      },
      {
        // /evs/manage/viewAffirmTarget1 - xem EvsManageController#viewAffirmTarget1().
        // Đánh giá lần 1 phía người đánh giá (danh sách + phân bổ cấp ĐG +
        // modal chi tiết nhập điểm từng mục tiêu). Dùng chung
        // AffirmTargetComponent với viewAffirmTarget2 - xem ghi chú trong
        // affirm-target.service.ts.
        path: 'evs/manage/viewAffirmTarget1',
        loadComponent: () =>
          import('./pages/evs/affirm-target/affirm-target.component').then(
            (m) => m.AffirmTargetComponent,
          ),
        data: {
          affirmTargetConfig: {
            apiBase: 'affirmTarget1',
            i18nPrefix: 'evs.viewAffirmTarget1',
            level: '1',
            evsLevel: '14015070',
            editableActivity: '14015357',
          },
        },
      },
      {
        // /evs/manage/viewAffirmTarget2 - xem EvsManageController#viewAffirmTarget2().
        // Đánh giá lần 2 - có thêm khối readonly "Lần 1" trước khối nhập "Lần 2".
        path: 'evs/manage/viewAffirmTarget2',
        loadComponent: () =>
          import('./pages/evs/affirm-target/affirm-target.component').then(
            (m) => m.AffirmTargetComponent,
          ),
        data: {
          affirmTargetConfig: {
            apiBase: 'affirmTarget2',
            i18nPrefix: 'evs.viewAffirmTarget2',
            level: '2',
            evsLevel: '14015071',
            editableActivity: '14015358',
          },
        },
      },
      {
        // /evs/manage/viewAffirmTarget1Ability - xem
        // EvsManageController#viewAffirmTarget1Ability(). Đánh giá năng lực
        // lần 1 (điểm chọn từ dropdown EVS_PARAM thay vì nhập tỷ lệ %).
        // Dùng chung AffirmTargetAbilityComponent với viewAffirmTarget2Ability.
        path: 'evs/manage/viewAffirmTarget1Ability',
        loadComponent: () =>
          import('./pages/evs/affirm-target-ability/affirm-target-ability.component').then(
            (m) => m.AffirmTargetAbilityComponent,
          ),
        data: {
          affirmTargetAbilityConfig: {
            apiBase: 'affirmTarget1',
            abilityApiBase: 'affirmTarget1Ability',
            i18nPrefix: 'evs.viewAffirmTarget1Ability',
            level: '1',
            evsLevel: '14015070',
            editableActivity: '14015357',
          },
        },
      },
      {
        // /evs/manage/viewAffirmTarget2Ability - xem
        // EvsManageController#viewAffirmTarget2Ability(). Đánh giá năng lực lần 2.
        path: 'evs/manage/viewAffirmTarget2Ability',
        loadComponent: () =>
          import('./pages/evs/affirm-target-ability/affirm-target-ability.component').then(
            (m) => m.AffirmTargetAbilityComponent,
          ),
        data: {
          affirmTargetAbilityConfig: {
            apiBase: 'affirmTarget2',
            abilityApiBase: 'affirmTarget2Ability',
            i18nPrefix: 'evs.viewAffirmTarget2Ability',
            level: '2',
            evsLevel: '14015071',
            editableActivity: '14015358',
          },
        },
      },
      {
        // /evs/manage/viewEvsBySelfHTSV - xem EvsManageController#viewEvsBySelfHTSV().
        // Đánh giá bản thân (self-service) - nhân viên tự chấm điểm (%) cho
        // từng mục tiêu đã đăng ký + nhập Thành tích/Hạn chế.
        path: 'evs/manage/viewEvsBySelfHTSV',
        loadComponent: () =>
          import('./pages/evs/evs-by-self-hae/evs-by-self-hae.component').then(
            (m) => m.EvsBySelfHaeComponent,
          ),
      },
      {
        // /evs/manage/viewEvsBySelfSSTAbility - xem
        // EvsManageController#viewEvsBySelfSSTAbility(). Đánh giá năng lực
        // bản thân (self-service) - điểm chọn từ dropdown EVS_PARAM.
        path: 'evs/manage/viewEvsBySelfSSTAbility',
        loadComponent: () =>
          import('./pages/evs/evs-by-self-sst-ability/evs-by-self-sst-ability.component').then(
            (m) => m.EvsBySelfSstAbilityComponent,
          ),
      },
      {
        // /evs/manage/viewEvsSchedulePanel - xem EvsManageController#viewEvsSchedulePanel().
        // Lịch đánh giá - 3 tab CPNY/DEPT/EMP. Đổi UX inline-edit-trong-bảng
        // + nút Lưu hàng loạt sang modal Thêm/Sửa lưu ngay từng dòng.
        path: 'evs/manage/viewEvsSchedulePanel',
        loadComponent: () =>
          import('./pages/evs/evs-schedule-panel/evs-schedule-panel.component').then(
            (m) => m.EvsSchedulePanelComponent,
          ),
      },
      {
        // /evs/manage/viewEvsResultEmp - xem EvsManageController#viewEvsResultEmp().
        // Kết quả đánh giá nhân viên (self-service) - lịch sử theo năm.
        path: 'evs/manage/viewEvsResultEmp',
        loadComponent: () =>
          import('./pages/evs/evs-result-emp/evs-result-emp.component').then(
            (m) => m.EvsResultEmpComponent,
          ),
      },
      {
        // /evs/manage/viewEvsResult - xem EvsManageController#viewEvsResult().
        // Kết quả đánh giá - trang tổng hợp lớn nhất module evs. 2 modal xem
        // chi tiết (performance/ability, chỉ đọc) dùng lại AffirmTargetService
        // và AffirmTargetAbilityService đã xây ở các trang Affirm - xem ghi
        // chú trong evs-result.component.ts.
        path: 'evs/manage/viewEvsResult',
        loadComponent: () =>
          import('./pages/evs/evs-result/evs-result.component').then((m) => m.EvsResultComponent),
      },
      {
        // /pa/salarycode/viewSalaryCodeList - xem PaSalaryCodeController#viewSalaryCodeList().
        // Danh sách hạng mục lương - CRUD modal + phân trang server-side.
        path: 'pa/salarycode/viewSalaryCodeList',
        loadComponent: () =>
          import('./pages/pa/salary-code-list/salary-code-list.component').then(
            (m) => m.SalaryCodeListComponent,
          ),
      },
      {
        // /pa/salary/viewPaFormula - xem PaFormulaController#viewPaFormula().
        // Cấu hình công thức tính toán - layout master-detail (hạng mục /
        // công thức) + panel công cụ chèn token vào ô Condition/Formular.
        path: 'pa/salary/viewPaFormula',
        loadComponent: () =>
          import('./pages/pa/pa-formula/pa-formula.component').then((m) => m.PaFormulaComponent),
      },
      {
        // /pa/salary/viewPaComputeItemParamList - xem
        // PaComputeItemParamController#viewPaComputeItemParamList().
        // Thông số mục tính toán - CRUD modal + swap thứ tự tính.
        path: 'pa/salary/viewPaComputeItemParamList',
        loadComponent: () =>
          import('./pages/pa/pa-compute-item-param/pa-compute-item-param.component').then(
            (m) => m.PaComputeItemParamComponent,
          ),
      },
      {
        // /pa/salary/viewPaInputItemParam - xem
        // PaInputItemParamController#viewPaInputItemParam(). Thông số mục
        // nhập - chỉ Sửa/Xóa (không có Thêm mới, đúng backend gốc).
        path: 'pa/salary/viewPaInputItemParam',
        loadComponent: () =>
          import('./pages/pa/pa-input-item-param/pa-input-item-param.component').then(
            (m) => m.PaInputItemParamComponent,
          ),
      },
      {
        // /pa/salary/viewPaMonthPersonInfoEssList - xem
        // PaMonthPersonInfoController#viewPaMonthPersonInfoEssList().
        // Phiếu lương cá nhân (self-service).
        path: 'pa/salary/viewPaMonthPersonInfoEssList',
        loadComponent: () =>
          import('./pages/pa/pa-month-person-info-ess/pa-month-person-info-ess.component').then(
            (m) => m.PaMonthPersonInfoEssComponent,
          ),
      },
      {
        // /pa/workManagement/viewPaPaySchedule - xem
        // PaWorkManagementController#viewPaPaySchedule(). Kế hoạch trả lương.
        path: 'pa/workManagement/viewPaPaySchedule',
        loadComponent: () =>
          import('./pages/pa/pa-pay-schedule/pa-pay-schedule.component').then(
            (m) => m.PaPayScheduleComponent,
          ),
      },
      {
        // /pa/workManagement/viewPaEmpAccount - xem
        // PaWorkManagementController#viewPaEmpAccount(). Tài khoản lương nhân viên.
        path: 'pa/workManagement/viewPaEmpAccount',
        loadComponent: () =>
          import('./pages/pa/pa-emp-account/pa-emp-account.component').then(
            (m) => m.PaEmpAccountComponent,
          ),
      },
      {
        // /pa/wagebase/viewPaSupervisor - xem
        // PaSupervisorController#viewPaSupervisor(). Người phụ trách lương.
        path: 'pa/wagebase/viewPaSupervisor',
        loadComponent: () =>
          import('./pages/pa/pa-supervisor/pa-supervisor.component').then(
            (m) => m.PaSupervisorComponent,
          ),
      },
      {
        // /pa/salary/viewPaInputItemData - xem
        // PaInputItemDataController#viewPaInputItemData(). Nhập dữ liệu tiêu chuẩn.
        path: 'pa/salary/viewPaInputItemData',
        loadComponent: () =>
          import('./pages/pa/pa-input-item-data/pa-input-item-data.component').then(
            (m) => m.PaInputItemDataComponent,
          ),
      },
      {
        // /pa/salary/viewImportExcelTempPaParamList - xem
        // PaInputItemDataController#viewImportExcelTempPaParamList(). Kết quả nhập Excel dữ liệu tiêu chuẩn.
        path: 'pa/salary/viewImportExcelTempPaParamList',
        loadComponent: () =>
          import('./pages/pa/pa-import-excel-temp-pa-param-list/pa-import-excel-temp-pa-param-list.component').then(
            (m) => m.PaImportExcelTempPaParamListComponent,
          ),
      },
      {
        // /pa/salary/viewPaResult - xem PaItemInputController#viewPaResult().
        // Cấu hình hạng mục kết quả tính lương.
        path: 'pa/salary/viewPaResult',
        loadComponent: () =>
          import('./pages/pa/pa-result/pa-result.component').then((m) => m.PaResultComponent),
      },
      {
        // /pa/workManagement/payStub - xem PaWorkManagementController#payStub().
        // Phiếu lương (phía quản lý).
        path: 'pa/workManagement/payStub',
        loadComponent: () =>
          import('./pages/pa/pay-stub/pay-stub.component').then((m) => m.PayStubComponent),
      },
      {
        // /pa/workManagement/viewPaWorkFlow - xem
        // PaWorkManagementController#viewPaWorkFlow(). Quy trình tính lương.
        path: 'pa/workManagement/viewPaWorkFlow',
        loadComponent: () =>
          import('./pages/pa/pa-work-flow/pa-work-flow.component').then(
            (m) => m.PaWorkFlowComponent,
          ),
      },
      {
        // /pa/workManagement/viewPaPayObj - xem
        // PaWorkManagementController#viewPaPayObj(). Đối tượng nhận lương.
        path: 'pa/workManagement/viewPaPayObj',
        loadComponent: () =>
          import('./pages/pa/pa-pay-obj/pa-pay-obj.component').then((m) => m.PaPayObjComponent),
      },
      {
        // /pa/workManagement/viewPaArSummaryForManageList - xem
        // PaArSummaryManageController#viewPaArSummaryForManageList(). Quản lý tổng hợp chấm công.
        path: 'pa/workManagement/viewPaArSummaryForManageList',
        loadComponent: () =>
          import('./pages/pa/pa-ar-summary-manage/pa-ar-summary-manage.component').then(
            (m) => m.PaArSummaryManageComponent,
          ),
      },
      {
        // /pa/workManagement/detailmonthCountInfoLeft - xem
        // PaSalaryResultController#detailmonthCountInfoLeft(). Lương tháng chi tiết.
        path: 'pa/workManagement/detailmonthCountInfoLeft',
        loadComponent: () =>
          import('./pages/pa/pa-detail-month-count/pa-detail-month-count.component').then(
            (m) => m.PaDetailMonthCountComponent,
          ),
      },
      {
        // /pa/workManagement/detailYearCountInfoLeft - xem
        // PaSalaryResultController#detailYearCountInfoLeft(). Lương năm chi tiết.
        path: 'pa/workManagement/detailYearCountInfoLeft',
        loadComponent: () =>
          import('./pages/pa/pa-detail-year-count/pa-detail-year-count.component').then(
            (m) => m.PaDetailYearCountComponent,
          ),
      },
      {
        // /pa/workManagement/monthPersonCountInfoList - xem
        // PaSalaryCheckController#page(). NV tham gia tính lương.
        path: 'pa/workManagement/monthPersonCountInfoList',
        loadComponent: () =>
          import('./pages/pa/pa-month-person-count/pa-month-person-count.component').then(
            (m) => m.PaMonthPersonCountComponent,
          ),
      },
      {
        // /pa/paView/viewPaMonthChain - xem PaSalaryCheckController#page(). Các khoản chi trả.
        path: 'pa/paView/viewPaMonthChain',
        loadComponent: () =>
          import('./pages/pa/pa-month-chain/pa-month-chain.component').then((m) => m.PaMonthChainComponent),
      },
      {
        // /pa/workManagement/viewVerificationList - xem PaSalaryCheckController#page().
        // Quyết định thực hiện.
        path: 'pa/workManagement/viewVerificationList',
        loadComponent: () =>
          import('./pages/pa/pa-verification-list/pa-verification-list.component').then(
            (m) => m.PaVerificationListComponent,
          ),
      },
      {
        // /pa/workManagement/detailPersonCountInfo - xem PaSalaryCheckController#page().
        // Chi tiết lương (nhận ?personId=&payScheduleNo= từ Quyết định thực hiện).
        path: 'pa/workManagement/detailPersonCountInfo',
        loadComponent: () =>
          import('./pages/pa/pa-detail-person-count/pa-detail-person-count.component').then(
            (m) => m.PaDetailPersonCountComponent,
          ),
      },
      {
        // /pa/workManagement/detailPersonCountInfoLeft - xem PaSalaryCheckController#page().
        // Kiểm tra cá nhân.
        path: 'pa/workManagement/detailPersonCountInfoLeft',
        loadComponent: () =>
          import('./pages/pa/pa-detail-person-check/pa-detail-person-check.component').then(
            (m) => m.PaDetailPersonCheckComponent,
          ),
      },
      {
        // /pa/workManagement/detailItemCountInfo - xem PaSalaryCheckController#page().
        // Đối chiếu hạng mục.
        path: 'pa/workManagement/detailItemCountInfo',
        loadComponent: () =>
          import('./pages/pa/pa-detail-item-count/pa-detail-item-count.component').then(
            (m) => m.PaDetailItemCountComponent,
          ),
      },
      {
        // /pa/workManagement/detailItemDifCountInfo - xem PaSalaryCheckController#page().
        // Khoản tiền thay đổi.
        path: 'pa/workManagement/detailItemDifCountInfo',
        loadComponent: () =>
          import('./pages/pa/pa-detail-item-dif/pa-detail-item-dif.component').then(
            (m) => m.PaDetailItemDifComponent,
          ),
      },
      {
        // /pa/workManagement/viewResultConfirmList - xem PaSalaryCheckController#page().
        // Đối chiếu kết quả.
        path: 'pa/workManagement/viewResultConfirmList',
        loadComponent: () =>
          import('./pages/pa/pa-result-confirm/pa-result-confirm.component').then(
            (m) => m.PaResultConfirmComponent,
          ),
      },
      {
        // /pa/workManagement/viewPaResultList - xem
        // PaSalaryResultController#viewPaResultList(). Tổng hợp lương (cá nhân).
        path: 'pa/workManagement/viewPaResultList',
        loadComponent: () =>
          import('./pages/pa/pa-pay-result-list/pa-pay-result-list.component').then(
            (m) => m.PaPayResultListComponent,
          ),
      },
      {
        // /pa/workManagement/viewDeptPaResultList - xem
        // PaSalaryResultController#viewDeptPaResultList(). Tổng hợp lương (phòng ban).
        path: 'pa/workManagement/viewDeptPaResultList',
        loadComponent: () =>
          import('./pages/pa/pa-dept-pay-result-list/pa-dept-pay-result-list.component').then(
            (m) => m.PaDeptPayResultListComponent,
          ),
      },
      {
        // /sys/basicMaintenance/viewCodeManage - xem
        // SyCodeController#viewCodeManage(). Quản lý danh mục Code.
        path: 'sys/basicMaintenance/viewCodeManage',
        loadComponent: () =>
          import('./pages/sys/sy-code-manage/sy-code-manage.component').then(
            (m) => m.SyCodeManageComponent,
          ),
      },
      {
        // /sys/basicMaintenance/viewCodePamers - xem
        // SyCodeParamController#viewCodePamers(). Tham số Code theo công ty.
        path: 'sys/basicMaintenance/viewCodePamers',
        loadComponent: () =>
          import('./pages/sys/sy-code-param/sy-code-param.component').then(
            (m) => m.SyCodeParamComponent,
          ),
      },
      {
        // /sys/basicMaintenance/viewCompany - xem HrCompanyController#viewCompany().
        // Quản lý Công ty.
        path: 'sys/basicMaintenance/viewCompany',
        loadComponent: () =>
          import('./pages/sys/sy-company/sy-company.component').then((m) => m.SyCompanyComponent),
      },
      {
        // /sys/menu/viewMenuList - xem SyMenuController#viewMenuList().
        // Quản lý Menu hệ thống.
        path: 'sys/menu/viewMenuList',
        loadComponent: () =>
          import('./pages/sys/sy-menu-list/sy-menu-list.component').then(
            (m) => m.SyMenuListComponent,
          ),
      },
      {
        // /sys/menu/viewMenuParamList - xem
        // SyMenuParamController#viewMenuParamList(). Tham số Menu theo công ty.
        path: 'sys/menu/viewMenuParamList',
        loadComponent: () =>
          import('./pages/sys/sy-menu-param/sy-menu-param.component').then(
            (m) => m.SyMenuParamComponent,
          ),
      },
      {
        // /sys/rightsManagement/viewLoginUser - xem SyUserController#viewLoginUser().
        // Quản lý người dùng đăng nhập.
        path: 'sys/rightsManagement/viewLoginUser',
        loadComponent: () =>
          import('./pages/sys/sy-login-user/sy-login-user.component').then(
            (m) => m.SyLoginUserComponent,
          ),
      },
      {
        // /sys/rightsManagement/syRoleGroup/viewSyRolesGroupList - xem
        // SyRoleGroupController#viewSyRolesGroupList(). Danh sách Nhóm quyền.
        path: 'sys/rightsManagement/syRoleGroup/viewSyRolesGroupList',
        loadComponent: () =>
          import('./pages/sys/sy-role-group-list/sy-role-group-list.component').then(
            (m) => m.SyRoleGroupListComponent,
          ),
      },
      {
        // /sys/rightsManagement/viewRolesGroup - xem SyRoleController#viewRolesGroup().
        // Quản lý Role + Phân quyền Menu.
        path: 'sys/rightsManagement/viewRolesGroup',
        loadComponent: () =>
          import('./pages/sys/sy-roles-group/sy-roles-group.component').then(
            (m) => m.SyRolesGroupComponent,
          ),
      },
      {
        // /sys/viewFeedback - xem SyFeedbackController#viewFeedback().
        // Danh sách góp ý người dùng.
        path: 'sys/viewFeedback',
        loadComponent: () =>
          import('./pages/sys/sy-feedback/sy-feedback.component').then(
            (m) => m.SyFeedbackComponent,
          ),
      },
      {
        // /org/orgManage/viewComposeOrg - xem OrgComposeController#viewComposeOrg().
        // Quản lý cơ cấu tổ chức theo phiên bản thay đổi.
        path: 'org/orgManage/viewComposeOrg',
        loadComponent: () =>
          import('./pages/org/org-compose/org-compose.component').then(
            (m) => m.OrgComposeComponent,
          ),
      },
      {
        // /org/orgManage/viewCurrentOrgInfo - xem CurrentOrgController#viewCurrentOrgInfo().
        // Sơ đồ tổ chức hiện hành (chỉ xem).
        path: 'org/orgManage/viewCurrentOrgInfo',
        loadComponent: () =>
          import('./pages/org/org-current-info/org-current-info.component').then(
            (m) => m.OrgCurrentInfoComponent,
          ),
      },
      {
        // /org/orgManage/viewDeptManagerCheck - xem OrgComposeController#viewDeptManagerCheck().
        // Kiểm tra trưởng bộ phận theo phiên bản thay đổi.
        path: 'org/orgManage/viewDeptManagerCheck',
        loadComponent: () =>
          import('./pages/org/org-dept-manager-check/org-dept-manager-check.component').then(
            (m) => m.OrgDeptManagerCheckComponent,
          ),
      },
      {
        // /org/orgManage/viewHistoryOrgInfo - xem OrgComposeController#viewHistoryOrgInfo().
        // Lịch sử thay đổi cơ cấu tổ chức (chỉ xem, bản read-only của org-compose).
        path: 'org/orgManage/viewHistoryOrgInfo',
        loadComponent: () =>
          import('./pages/org/org-history-info/org-history-info.component').then(
            (m) => m.OrgHistoryInfoComponent,
          ),
      },
      {
        // /org/orgManage/viewOrgBusiness - xem OrgBusinessController#viewOrgBusiness().
        // Quản lý nghiệp vụ phòng ban theo phiên bản thay đổi.
        path: 'org/orgManage/viewOrgBusiness',
        loadComponent: () =>
          import('./pages/org/org-business/org-business.component').then(
            (m) => m.OrgBusinessComponent,
          ),
      },
      {
        // /org/orgManage/viewOrgCostCenter - xem OrgCostCenterController#viewOrgCostCenter().
        // Quản lý trung tâm chi phí.
        path: 'org/orgManage/viewOrgCostCenter',
        loadComponent: () =>
          import('./pages/org/org-cost-center/org-cost-center.component').then(
            (m) => m.OrgCostCenterComponent,
          ),
      },
      {
        // /org/orgManage/viewOrgInfo - xem CurrentOrgController#viewOrgInfo().
        // Sơ đồ tổ chức dạng biểu đồ trực quan (chỉ xem).
        path: 'org/orgManage/viewOrgInfo',
        loadComponent: () =>
          import('./pages/org/org-info/org-info.component').then((m) => m.OrgInfoComponent),
      },
      {
        // /org/orgManage/viewResumeList - xem OrgResumeInfoController#viewResumeList().
        // Danh sách yêu cầu thay đổi tổ chức.
        path: 'org/orgManage/viewResumeList',
        loadComponent: () =>
          import('./pages/org/org-resume-list/org-resume-list.component').then(
            (m) => m.OrgResumeListComponent,
          ),
      },
      {
        // /org/orgManage/viewResumeProcess - xem OrgResumeInfoController#viewResumeProcess().
        // Quy trình xử lý thay đổi tổ chức theo phiên bản.
        path: 'org/orgManage/viewResumeProcess',
        loadComponent: () =>
          import('./pages/org/org-resume-process/org-resume-process.component').then(
            (m) => m.OrgResumeProcessComponent,
          ),
      },
      {
        // /disc/autoExcel/viewRetrieveSqlMasterList - xem
        // DiscAutoExcelController#viewRetrieveSqlMasterList(). Quản lý truy vấn SQL tự động xuất Excel
        // (Thêm/Sửa dùng modal ngay trong trang, xem disc-sql-master-list.component.ts).
        path: 'disc/autoExcel/viewRetrieveSqlMasterList',
        loadComponent: () =>
          import('./pages/disc/disc-sql-master-list/disc-sql-master-list.component').then(
            (m) => m.DiscSqlMasterListComponent,
          ),
      },
      // ===== Module `edu` (đào tạo) =====
      {
        // /edu/traineducation/systemManager - xem
        // EduSystemManagerController#viewSystemManager(). Hệ thống đào tạo
        // (Thêm/Sửa dùng modal ngay trong trang).
        path: 'edu/traineducation/systemManager',
        loadComponent: () =>
          import('./pages/edu/edu-system-manager/edu-system-manager.component').then(
            (m) => m.EduSystemManagerComponent,
          ),
      },
      {
        // /edu/traineducation/courseManager - xem EduCourseManagerController#viewCourseManager().
        // Quản lý khóa học (port từ Hanwha_HTSV).
        path: 'edu/traineducation/courseManager',
        loadComponent: () =>
          import('./pages/edu/edu-course-manager/edu-course-manager.component').then(
            (m) => m.EduCourseManagerComponent,
          ),
      },
      {
        // /edu/traineducation/planManager - xem EduPlanManagerController#viewPlanManager().
        // Kế hoạch đào tạo + lịch học (port từ Hanwha_HTSV).
        path: 'edu/traineducation/planManager',
        loadComponent: () =>
          import('./pages/edu/edu-plan-manager/edu-plan-manager.component').then(
            (m) => m.EduPlanManagerComponent,
          ),
      },
      {
        // /edu/traineducation/teacherManager - xem EduTeacherManagerController#viewTeacherManager().
        // Quản lý giảng viên (port từ Hanwha_HTSV).
        path: 'edu/traineducation/teacherManager',
        loadComponent: () =>
          import('./pages/edu/edu-teacher-manager/edu-teacher-manager.component').then(
            (m) => m.EduTeacherManagerComponent,
          ),
      },
      {
        // /edu/traineducation/trainAgreement - xem EduTrainAgreementController#viewTrainAgreement().
        // Hợp đồng đào tạo, import/xuất Excel (port từ Hanwha_HTSV).
        path: 'edu/traineducation/trainAgreement',
        loadComponent: () =>
          import('./pages/edu/edu-train-agreement/edu-train-agreement.component').then(
            (m) => m.EduTrainAgreementComponent,
          ),
      },
      {
        // /edu/traineducation/trainOrgan - xem EduTrainOrganController#viewTrainOrgan().
        // Đơn vị đào tạo (port từ Hanwha_HTSV).
        path: 'edu/traineducation/trainOrgan',
        loadComponent: () =>
          import('./pages/edu/edu-train-organ/edu-train-organ.component').then(
            (m) => m.EduTrainOrganComponent,
          ),
      },
      {
        // /edu/traineducation/courseSubjects - xem EduCourseSubjectController#viewCourseSubjects().
        // Môn học đào tạo (port từ Hanwha_HAE - Hanwha_HTSV không có màn này).
        path: 'edu/traineducation/courseSubjects',
        loadComponent: () =>
          import('./pages/edu/edu-course-subjects/edu-course-subjects.component').then(
            (m) => m.EduCourseSubjectsComponent,
          ),
      },
      {
        // /edu/traineducation/trainBasicInformation - xem EduBasicInfoController#viewTrainBasicInformation().
        // Thông tin đào tạo cơ bản - lập khóa đào tạo từ kế hoạch (port từ Hanwha_HTSV).
        path: 'edu/traineducation/trainBasicInformation',
        loadComponent: () =>
          import('./pages/edu/edu-train-basic-info/edu-train-basic-info.component').then(
            (m) => m.EduTrainBasicInfoComponent,
          ),
      },
      {
        // /edu/traineducation/studentEvaluate - xem EduEvaluateController#viewEvaluate(). Đánh giá học viên.
        path: 'edu/traineducation/studentEvaluate',
        loadComponent: () =>
          import('./pages/edu/edu-student-evaluate/edu-student-evaluate.component').then(
            (m) => m.EduStudentEvaluateComponent,
          ),
      },
      {
        // /edu/traineducation/teacherEvaluate - xem EduEvaluateController#viewEvaluate(). Đánh giá giảng viên.
        path: 'edu/traineducation/teacherEvaluate',
        loadComponent: () =>
          import('./pages/edu/edu-teacher-evaluate/edu-teacher-evaluate.component').then(
            (m) => m.EduTeacherEvaluateComponent,
          ),
      },
      {
        // /edu/traineducation/trainResult - xem EduEvaluateController#viewEvaluate(). Kết quả đào tạo.
        path: 'edu/traineducation/trainResult',
        loadComponent: () =>
          import('./pages/edu/edu-train-result/edu-train-result.component').then(
            (m) => m.EduTrainResultComponent,
          ),
      },
      {
        // /edu/traineducation/trainCostManager - xem EduTrainCostController#viewTrainCostManager(). Chi phí đào tạo.
        path: 'edu/traineducation/trainCostManager',
        loadComponent: () =>
          import('./pages/edu/edu-train-cost/edu-train-cost.component').then(
            (m) => m.EduTrainCostComponent,
          ),
      },
      {
        // /edu/trainfile/trainCalendar - xem EduTrainCalendarController#viewTrainCalendar(). Lịch đào tạo.
        path: 'edu/trainfile/trainCalendar',
        loadComponent: () =>
          import('./pages/edu/edu-train-calendar/edu-train-calendar.component').then(
            (m) => m.EduTrainCalendarComponent,
          ),
      },
      {
        // /edu/trainfile/personalTrainCalendar - xem EduTrainCalendarController#viewTrainCalendar(). Lịch đào tạo cá nhân.
        path: 'edu/trainfile/personalTrainCalendar',
        data: { personal: true },
        loadComponent: () =>
          import('./pages/edu/edu-train-calendar/edu-train-calendar.component').then(
            (m) => m.EduTrainCalendarComponent,
          ),
      },
      {
        // /edu/traineducation/viewRegisterForTraining - xem EduTrainingRegisterController#view(). Đăng ký đào tạo bên ngoài.
        path: 'edu/traineducation/viewRegisterForTraining',
        loadComponent: () =>
          import('./pages/edu/edu-register-training/edu-register-training.component').then(
            (m) => m.EduRegisterTrainingComponent,
          ),
      },
      {
        // /report/ar/viewTrainReport - xem EduTrainReportController#viewTrainReport(). Báo cáo đào tạo.
        path: 'report/ar/viewTrainReport',
        loadComponent: () =>
          import('./pages/edu/edu-train-report/edu-train-report.component').then(
            (m) => m.EduTrainReportComponent,
          ),
      },
      {
        // /report/ar/viewArReportsList - xem ArReportController#viewArReportsList(). Trung tâm báo
        // cáo (lương / nhân sự / chấm công / đào tạo theo menuNo).
        path: 'report/ar/viewArReportsList',
        loadComponent: () =>
          import('./pages/ar/ar-reports-list/ar-reports-list.component').then(
            (m) => m.ArReportsListComponent,
          ),
      },
      {
        // /edu/traineducation/trainArchives - xem EduTrainArchivesController#viewTrainArchives(). Hồ sơ đào tạo.
        path: 'edu/traineducation/trainArchives',
        loadComponent: () =>
          import('./pages/edu/edu-train-archives/edu-train-archives.component').then(
            (m) => m.EduTrainArchivesComponent,
          ),
      },
      {
        // /edu/traineducation/courseApply - xem EduCourseApplyController#view(). Đăng ký khóa đào tạo.
        path: 'edu/traineducation/courseApply',
        loadComponent: () =>
          import('./pages/edu/edu-course-apply/edu-course-apply.component').then(
            (m) => m.EduCourseApplyComponent,
          ),
      },
      {
        // /edu/traineducation/courseMaker - xem EduCourseApplyController#view(). Phê duyệt đăng ký khóa.
        path: 'edu/traineducation/courseMaker',
        data: { mode: 'maker' },
        loadComponent: () =>
          import('./pages/edu/edu-course-review/edu-course-review.component').then(
            (m) => m.EduCourseReviewComponent,
          ),
      },
      {
        // /edu/traineducation/courseConfirm - xem EduCourseApplyController#view(). Xác nhận đăng ký khóa.
        path: 'edu/traineducation/courseConfirm',
        data: { mode: 'confirm' },
        loadComponent: () =>
          import('./pages/edu/edu-course-review/edu-course-review.component').then(
            (m) => m.EduCourseReviewComponent,
          ),
      },
      {
        // /edu/traineducation/makerSituation - xem EduCourseApplyController#view(). Tình hình đăng ký.
        path: 'edu/traineducation/makerSituation',
        data: { hub: false },
        loadComponent: () =>
          import('./pages/edu/edu-maker-situation/edu-maker-situation.component').then(
            (m) => m.EduMakerSituationComponent,
          ),
      },
      {
        // /edu/traineducation/makerSituationHUB - xem EduCourseApplyController#view(). Tình hình đăng ký (HUB).
        path: 'edu/traineducation/makerSituationHUB',
        data: { hub: true },
        loadComponent: () =>
          import('./pages/edu/edu-maker-situation/edu-maker-situation.component').then(
            (m) => m.EduMakerSituationComponent,
          ),
      },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'dashboard' },
];
