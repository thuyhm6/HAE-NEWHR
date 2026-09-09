package com.ait.org.orgManage.controller;

import com.ait.org.orgManage.model.OrgResumeInfo;
import com.ait.org.orgManage.service.OrgResumeInfoService;
import com.ait.sy.sys.dto.DataTablesRequest;
import com.ait.sy.sys.dto.DataTablesResponse;
import com.ait.sy.sys.service.HrAuthenticationService.HrUserInfo;
import com.ait.util.DataTablesSearchUtil;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/org")
public class OrgResumeInfoController {
    private static final Logger log = LoggerFactory.getLogger(OrgResumeInfoController.class);

    @Autowired
    private OrgResumeInfoService resumeService;

    @Autowired
    private com.ait.util.AngularIndexService angularIndexService;

    @GetMapping("/orgManage/viewResumeList")
    public String viewResumeList(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/orgManage/viewResumeProcess")
    public String viewResumeProcess(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/api/resume/dropdown")
    @ResponseBody
    public ResponseEntity<List<OrgResumeInfo>> getResumeDropdown(HttpSession session) {
        try {
            getAuthenticatedUser(session);
            List<OrgResumeInfo> list = resumeService.getResumeListForDropdown();
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(List.of());
        }
    }

    @PostMapping("/api/process/execute")
    @ResponseBody
    public ResponseEntity<?> executeProcess(@RequestBody Map<String, Object> payload, HttpSession session) {
        try {
            String resumeNo = (String) payload.get("resumeNo");
            @SuppressWarnings("unchecked")
            List<String> types = (List<String>) payload.get("types");

            String result = resumeService.executeResumeProcess(resumeNo, types);
            return ResponseEntity.ok(Map.of("message", result));
        } catch (Exception e) {
            log.error("Failed to execute resume process", e);
            return ResponseEntity.status(500).body(Map.of("error", "Lỗi hệ thống khi thực hiện xử lý hồ sơ"));
        }
    }

    @PostMapping("/api/resumes")
    @ResponseBody
    public ResponseEntity<DataTablesResponse<OrgResumeInfo>> getResumes(
            @RequestBody DataTablesRequest request, HttpSession session) {
        try {
            getAuthenticatedUser(session);
            DataTablesResponse<OrgResumeInfo> response = resumeService.getResumeListForDataTables(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to get resumes for DataTables", e);
            return ResponseEntity.status(500).body(new DataTablesResponse<>());
        }
    }

    @GetMapping("/api/resume/{no}")
    @ResponseBody
    public ResponseEntity<?> getResume(@PathVariable String no, HttpSession session) {
        try {
            getAuthenticatedUser(session);
            OrgResumeInfo info = resumeService.getResumeByNo(no);
            if (info == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Không tìm thấy dữ liệu"));
            }
            return ResponseEntity.ok(info);
        } catch (Exception e) {
            log.error("Failed to get resume by no {}", no, e);
            return ResponseEntity.status(500).body(Map.of("error", "Lỗi hệ thống khi tải dữ liệu"));
        }
    }

    @PostMapping("/api/resume/add")
    @ResponseBody
    public ResponseEntity<?> addResume(@RequestBody OrgResumeInfo info, HttpSession session) {
        try {
            HrUserInfo user = getAuthenticatedUser(session);

            String error = resumeService.validateResume(info);
            if (error != null) {
                return ResponseEntity.badRequest().body(Map.of("error", error));
            }

            info.setCreatedBy(user.getUsername());
            info.setUpdatedBy(user.getUsername());
            info.setCreatedIp(getClientIpAddress(session));
            info.setUpdatedIp(getClientIpAddress(session));

            boolean success = resumeService.addResume(info);
            if (success) {
                return ResponseEntity.ok(Map.of("message", "Thêm mới thành công"));
            }
            return ResponseEntity.status(500).body(Map.of("error", "Thất bại"));
        } catch (Exception e) {
            log.error("Failed to add resume", e);
            return ResponseEntity.status(500).body(Map.of("error", "Lỗi hệ thống khi thêm mới"));
        }
    }

    @PostMapping("/api/resume/update")
    @ResponseBody
    public ResponseEntity<?> updateResume(@RequestBody OrgResumeInfo info, HttpSession session) {
        try {
            HrUserInfo user = getAuthenticatedUser(session);

            String error = resumeService.validateResume(info);
            if (error != null) {
                return ResponseEntity.badRequest().body(Map.of("error", error));
            }

            // Allow update of specific fields, prevent overwriting creation info if needed
            // But here we just update what's passed
            info.setUpdatedBy(user.getUsername());
            info.setUpdatedIp(getClientIpAddress(session));

            boolean success = resumeService.updateResume(info);
            if (success) {
                return ResponseEntity.ok(Map.of("message", "Cập nhật thành công"));
            }
            return ResponseEntity.status(500).body(Map.of("error", "Thất bại"));
        } catch (Exception e) {
            log.error("Failed to update resume {}", info.getNo(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Lỗi hệ thống khi cập nhật"));
        }
    }

    @DeleteMapping("/api/resume/delete/{no}")
    @ResponseBody
    public ResponseEntity<?> deleteResume(@PathVariable String no, HttpSession session) {
        try {
            getAuthenticatedUser(session);
            boolean success = resumeService.deleteResume(no);
            if (success) {
                return ResponseEntity.ok(Map.of("message", "Xóa thành công"));
            }
            return ResponseEntity.status(500).body(Map.of("error", "Xóa thất bại"));
        } catch (Exception e) {
            log.error("Failed to delete resume {}", no, e);
            return ResponseEntity.status(500).body(Map.of("error", "Lỗi hệ thống khi xóa"));
        }
    }

    @GetMapping("/resume/export")
    public void exportResumes(
            @RequestParam(required = false) String no,
            @RequestParam(required = false) String resumeName,
            @RequestParam(required = false) String changeDateFrom,
            @RequestParam(required = false) String changeDateTo,
            @RequestParam(required = false) String activity,
            HttpSession session,
            HttpServletResponse response) throws IOException {

        getAuthenticatedUser(session);

        DataTablesRequest request = new DataTablesRequest();
        // Use DataTablesSearchUtil to map params to searchParams map
        DataTablesSearchUtil.addSearchParam(request, "no", no);
        DataTablesSearchUtil.addSearchParam(request, "resumeName", resumeName);
        DataTablesSearchUtil.addSearchParam(request, "changeDateFrom", changeDateFrom);
        DataTablesSearchUtil.addSearchParam(request, "changeDateTo", changeDateTo);
        DataTablesSearchUtil.addSearchParam(request, "activity", activity);

        List<OrgResumeInfo> list = resumeService.getResumeListForExport(request);

        response.setContentType(MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet").toString());
        response.setHeader("Content-Disposition", "attachment; filename=org_resume_list.xlsx");

        java.time.format.DateTimeFormatter dtf = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy");
        try (Workbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("DanhSachThayDoiToChuc");

            CellStyle headerStyle = wb.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);
            Font headerFont = wb.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            String[] cols = { "Mã thay đổi", "Tên thay đổi", "Ngày hiệu lực", "Nguyên nhân", "Trạng thái",
                    "Người tạo", "Ngày tạo" };
            Row header = sheet.createRow(0);
            for (int i = 0; i < cols.length; i++) {
                Cell c = header.createCell(i);
                c.setCellValue(cols[i]);
                c.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 5000);
            }

            int rowIdx = 1;
            for (OrgResumeInfo item : list) {
                String changeDateStr = item.getChangeDate() != null ? item.getChangeDate() : "";
                String createDateStr = item.getCreateDate() != null ? item.getCreateDate().format(dtf) : "";
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(item.getNo());
                row.createCell(1).setCellValue(item.getResumeName());
                row.createCell(2).setCellValue(changeDateStr);
                row.createCell(3).setCellValue(item.getChangeReason());
                row.createCell(4).setCellValue(item.getActivity());
                row.createCell(5).setCellValue(item.getCreatedBy());
                row.createCell(6).setCellValue(createDateStr);
            }

            wb.write(response.getOutputStream());
        }
    }

    private HrUserInfo getAuthenticatedUser(HttpSession session) {
        HrUserInfo user = (HrUserInfo) session.getAttribute("currentHrUser");
        if (user == null) {
            throw new RuntimeException("Chưa đăng nhập");
        }
        return user;
    }

    private String getClientIpAddress(HttpSession session) {
        return "127.0.0.1";
    }
}
