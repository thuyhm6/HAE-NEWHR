package com.ait.org.orgManage.controller;

import com.ait.org.orgManage.model.OrgResumeInfo;
import com.ait.org.orgManage.service.OrgResumeInfoService;
import com.ait.sy.sys.dto.DataTablesRequest;
import com.ait.sy.sys.dto.DataTablesResponse;
import com.ait.sy.sys.service.HrAuthenticationService.HrUserInfo;
import com.ait.util.DataTablesSearchUtil;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;
import java.text.SimpleDateFormat;

@Controller
@RequestMapping("/org")
public class OrgResumeInfoController {
    private static final Logger log = LoggerFactory.getLogger(OrgResumeInfoController.class);

    @Autowired
    private OrgResumeInfoService resumeService;

    @GetMapping("/orgManage/viewResumeList")
    public String viewResumeList(Model model, HttpSession session) {
        HrUserInfo currentHrUser = getAuthenticatedUser(session);
        model.addAttribute("currentHrUser", currentHrUser);
        return "org/orgManage/viewResumeList";
    }

    @GetMapping("/orgManage/viewResumeProcess")
    public String viewResumeProcess(Model model, HttpSession session) {
        HrUserInfo currentHrUser = getAuthenticatedUser(session);
        model.addAttribute("currentHrUser", currentHrUser);
        return "org/orgManage/viewResumeProcess";
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

        response.setContentType("text/csv; charset=UTF-8");
        response.setHeader("Content-Disposition", "attachment; filename=org_resume_list.csv");
        response.setCharacterEncoding("UTF-8");

        PrintWriter writer = response.getWriter();
        writer.write('\ufeff'); // BOM
        writer.println("Mã thay đổi,Tên thay đổi,Ngày hiệu lực,Nguyên nhân,Trạng thái,Người tạo,Ngày tạo");

        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy");
        for (OrgResumeInfo item : list) {
            String changeDateStr = item.getChangeDate() != null ? sdf.format(item.getChangeDate()) : "";
            String createDateStr = item.getCreateDate() != null ? sdf.format(item.getCreateDate()) : "";
            writer.println(String.format("%s,%s,%s,%s,%s,%s,%s",
                    escapeCsv(item.getNo()),
                    escapeCsv(item.getResumeName()),
                    escapeCsv(changeDateStr),
                    escapeCsv(item.getChangeReason()),
                    escapeCsv(item.getActivity()),
                    escapeCsv(item.getCreatedBy()),
                    escapeCsv(createDateStr)));
        }
        writer.flush();
    }

    private String escapeCsv(String val) {
        if (val == null)
            return "";
        if (isPotentialFormula(val)) {
            val = "'" + val;
        }
        if (val.contains(",") || val.contains("\n") || val.contains("\"")) {
            return "\"" + val.replace("\"", "\"\"") + "\"";
        }
        return val;
    }

    private boolean isPotentialFormula(String value) {
        if (value.isEmpty()) {
            return false;
        }
        char firstChar = value.charAt(0);
        return firstChar == '=' || firstChar == '+' || firstChar == '-' || firstChar == '@';
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
