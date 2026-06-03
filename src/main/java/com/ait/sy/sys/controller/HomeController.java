package com.ait.sy.sys.controller;

import com.ait.hrm.empinfo.dto.EmpMonthlyStatsDto;
import com.ait.hrm.empinfo.service.HrEmployeeService;
import com.ait.sy.sys.dto.MenuDTO;
import com.ait.sy.sys.service.HrAuthenticationService.HrUserInfo;
import com.ait.sy.sys.service.MenuService;
import com.ait.sy.sys.service.PermissionService.UserPermissionInfo;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import jakarta.servlet.http.HttpServletResponse;

/**
 * HomeController - Controller xu ly navigation va trang chu
 */
@Controller
public class HomeController {

    @Autowired
    private MenuService menuService;

    @Autowired
    private com.ait.hrm.contract.service.HrContractService hrContractService;

    @Autowired
    private HrEmployeeService hrEmployeeService;

    /**
     * Trang chu - redirect dua tren trang thai dang nhap
     */
    @GetMapping("/")
    public String home(Model model, HttpSession session) {
        HrUserInfo currentHrUser = (HrUserInfo) session.getAttribute("currentHrUser");
        if (currentHrUser != null) {
            return "redirect:/dashboard";
        }

        return "redirect:/login";
    }

    /**
     * Dashboard mac dinh cua he thong
     */
    @GetMapping("/dashboard")
    public String dashboard(Model model, HttpSession session) {
        return buildDashboardPage(model, session, "1", "Dashboard - HR System");
    }

    /**
     * Trang chu HRM mo trong tab moi voi bo menu SYS_TYPE = 0
     */
    @GetMapping("/sys/hrm")
    public String dashboardSysTypeZero(Model model, HttpSession session) {
        return buildHrmPage(model, session);
    }

    @GetMapping("/sys/viewSysTypeZeroMenuList")
    public String redirectLegacySysTypeZeroPage() {
        return "redirect:/sys/hrm";
    }

    @GetMapping("/hrm/api/empMonthlyStats")
    @ResponseBody
    public List<EmpMonthlyStatsDto> getEmpMonthlyStats(
            @RequestParam(value = "year", required = false) Integer year) {
        int targetYear = (year != null) ? year : LocalDate.now().getYear();
        return hrEmployeeService.getEmpMonthlyStats(targetYear);
    }

    @GetMapping("/hrm/api/empMonthlyStats/export")
    public void exportEmpMonthlyStats(
            @RequestParam(value = "year", required = false) Integer year,
            HttpServletResponse response) throws IOException {
        int targetYear = (year != null) ? year : LocalDate.now().getYear();
        List<EmpMonthlyStatsDto> data = hrEmployeeService.getEmpMonthlyStats(targetYear);

        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition",
                "attachment; filename=\"nhan-su-" + targetYear + ".xlsx\"");

        try (Workbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Nhân sự " + targetYear);

            CellStyle headerStyle = wb.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.CORNFLOWER_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);
            org.apache.poi.ss.usermodel.Font hFont = wb.createFont();
            hFont.setBold(true);
            hFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(hFont);

            CellStyle numStyle = wb.createCellStyle();
            numStyle.setAlignment(HorizontalAlignment.CENTER);
            numStyle.setBorderBottom(BorderStyle.THIN);
            numStyle.setBorderTop(BorderStyle.THIN);
            numStyle.setBorderLeft(BorderStyle.THIN);
            numStyle.setBorderRight(BorderStyle.THIN);

            Row header = sheet.createRow(0);
            String[] cols = {"Tháng", "Tổng nhân viên", "Nhân viên mới", "Nhân viên nghỉ việc"};
            for (int i = 0; i < cols.length; i++) {
                Cell c = header.createCell(i);
                c.setCellValue(cols[i]);
                c.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 5000);
            }

            int[] totals = new int[3];
            for (EmpMonthlyStatsDto d : data) {
                Row row = sheet.createRow(d.getMonthNum());
                Cell mCell = row.createCell(0);
                mCell.setCellValue("Tháng " + d.getMonthNum());
                mCell.setCellStyle(numStyle);
                Cell tCell = row.createCell(1);
                tCell.setCellValue(d.getEmpCount());
                tCell.setCellStyle(numStyle);
                Cell nCell = row.createCell(2);
                nCell.setCellValue(d.getNewJoinerCount());
                nCell.setCellStyle(numStyle);
                Cell lCell = row.createCell(3);
                lCell.setCellValue(d.getLeaverCount());
                lCell.setCellStyle(numStyle);
                totals[0] += d.getEmpCount();
                totals[1] += d.getNewJoinerCount();
                totals[2] += d.getLeaverCount();
            }

            Row totalRow = sheet.createRow(13);
            CellStyle totalStyle = wb.createCellStyle();
            totalStyle.setAlignment(HorizontalAlignment.CENTER);
            totalStyle.setBorderBottom(BorderStyle.MEDIUM);
            totalStyle.setBorderTop(BorderStyle.MEDIUM);
            totalStyle.setBorderLeft(BorderStyle.THIN);
            totalStyle.setBorderRight(BorderStyle.THIN);
            org.apache.poi.ss.usermodel.Font tFont = wb.createFont();
            tFont.setBold(true);
            totalStyle.setFont(tFont);
            Cell totalLabel = totalRow.createCell(0);
            totalLabel.setCellValue("Tổng cộng");
            totalLabel.setCellStyle(totalStyle);
            for (int i = 0; i < 3; i++) {
                Cell c = totalRow.createCell(i + 1);
                c.setCellValue(totals[i]);
                c.setCellStyle(totalStyle);
            }

            wb.write(response.getOutputStream());
        }
    }

    private String buildHrmPage(Model model, HttpSession session) {
        HrUserInfo currentHrUser = (HrUserInfo) session.getAttribute("currentHrUser");
        UserPermissionInfo permissionInfo = (UserPermissionInfo) session.getAttribute("currentPermissionInfo");

        if (currentHrUser == null || currentHrUser.getSyUser() == null) {
            return "redirect:/login";
        }

        List<MenuDTO> userMenus = menuService.getMenusByUserPermissionBySysType(currentHrUser.getSyUser().getUserNo(), "0");
        int expiringContractsCount = hrContractService.countExpiringContracts(7);

        model.addAttribute("currentHrUser", currentHrUser);
        model.addAttribute("permissionInfo", permissionInfo);
        model.addAttribute("userMenus", userMenus);
        model.addAttribute("title", "HR Management System");
        model.addAttribute("message", "Chào mừng " + currentHrUser.getEmployeeName() + " đến với hệ thống HR!");
        model.addAttribute("expiringContractsCount", expiringContractsCount);
        model.addAttribute("sysMode", "hrm");
        session.setAttribute("sysMode", "hrm");

        return "login/hrm";
    }

    private String buildDashboardPage(Model model, HttpSession session, String sysType, String title) {
        HrUserInfo currentHrUser = (HrUserInfo) session.getAttribute("currentHrUser");
        UserPermissionInfo permissionInfo = (UserPermissionInfo) session.getAttribute("currentPermissionInfo");

        if (currentHrUser == null || currentHrUser.getSyUser() == null) {
            return "redirect:/login";
        }

        List<MenuDTO> userMenus = menuService.getMenusByUserPermissionBySysType(currentHrUser.getSyUser().getUserNo(),
                sysType);
        int expiringContractsCount = hrContractService.countExpiringContracts(7);

        model.addAttribute("currentHrUser", currentHrUser);
        model.addAttribute("permissionInfo", permissionInfo);
        model.addAttribute("userMenus", userMenus);
        model.addAttribute("title", title);
        model.addAttribute("message", "Chào mừng " + currentHrUser.getEmployeeName() + " đến với hệ thống HR!");
        model.addAttribute("expiringContractsCount", expiringContractsCount);
        model.addAttribute("sysMode", "ess");
        session.setAttribute("sysMode", "ess");

        return "login/dashboard";
    }
}
