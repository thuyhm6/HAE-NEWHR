package com.ait.sy.excel.controller;

import com.ait.ar.attendanceSettings.dto.ArShift010Dto;
import com.ait.ar.attendanceSettings.service.ArShiftService;
import com.ait.sy.basicMaintenance.dto.SyCodeParamDto;
import com.ait.sy.basicMaintenance.service.SyCodeParamService;
import com.ait.sy.excel.service.ExcelService;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.poi.ss.usermodel.Workbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Controller
@RequestMapping("/sy/excel")
public class ExcelController {
    private static final Logger log = LoggerFactory.getLogger(ExcelController.class);
    private static final long MAX_UPLOAD_SIZE_BYTES = 5L * 1024L * 1024L;

    @Autowired
    private ExcelService excelService;

    @Autowired
    private ArShiftService arShiftService;

    @Autowired
    private SyCodeParamService syCodeParamService;

    /**
     * Download template dung chung.
     * GET /sy/excel/api/downloadTemplate?templateName=AR_SCHEDULE_HTSV_Template
     */
    @GetMapping("/api/downloadTemplate")
    public void downloadTemplate(@RequestParam("templateName") String templateName,
                                 HttpServletResponse response) throws IOException {
        downloadTemplateInternal(templateName, response);
    }

    /**
     * Alias cu cho AR_SCHEDULE_HTSV.
     */
    @GetMapping("/api/scheduleHtsv/downloadTemplate")
    public void downloadScheduleHtsvTemplate(HttpServletResponse response) throws IOException {
        downloadTemplateInternal("AR_SCHEDULE_HTSV_Template", response);
    }

    /**
     * Import file excel dung chung theo templateName.
     * POST /sy/excel/api/importTemplate (multipart)
     */
    @PostMapping({"/api/importTemplate", "/api/upload"})
    @ResponseBody
    public ResponseEntity<Map<String, Object>> importTemplate(@RequestParam("templateName") String templateName,
                                                              @RequestParam("file") MultipartFile file) {
        Map<String, Object> result = new HashMap<>();
        try {
            String validationError = validateUploadFile(file);
            if (validationError != null) {
                result.put("success", false);
                result.put("message", validationError);
                return ResponseEntity.badRequest().body(result);
            }

            List<String> errors = excelService.importTemplate(templateName, file);
            if (errors.isEmpty()) {
                result.put("success", true);
                result.put("message", "Import thanh cong!");
            } else {
                result.put("success", false);
                result.put("errors", errors);
                result.put("message", "Import hoan tat nhung co " + errors.size() + " loi.");
            }
        } catch (IllegalArgumentException e) {
            result.put("success", false);
            result.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(result);
        } catch (Exception e) {
            log.error("Failed to import template file templateName={}", templateName, e);
            result.put("success", false);
            result.put("message", "Loi he thong khi xu ly file import.");
        }
        return ResponseEntity.ok(result);
    }

    /**
     * Alias cu cho upload schedule.
     */
    @PostMapping("/api/scheduleHtsv/upload")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> importScheduleHtsvTemplate(@RequestParam("file") MultipartFile file) {
        return importTemplate("AR_SCHEDULE_HTSV_Template", file);
    }

    private String validateUploadFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return "Vui long chon file de import.";
        }

        if (file.getSize() > MAX_UPLOAD_SIZE_BYTES) {
            return "File vuot qua kich thuoc toi da 5MB.";
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            return "Ten file khong hop le.";
        }

        String normalizedFileName = originalFilename.toLowerCase(Locale.ROOT);
        boolean hasExcelExtension = normalizedFileName.endsWith(".xlsx") || normalizedFileName.endsWith(".xls");
        if (!hasExcelExtension) {
            return "Chi ho tro file Excel .xlsx hoac .xls.";
        }

        String contentType = file.getContentType();
        if (contentType == null || contentType.isBlank()) {
            return "Khong xac dinh duoc dinh dang file upload.";
        }

        Set<String> allowedContentTypes = Set.of(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "application/vnd.ms-excel",
                "application/octet-stream"
        );
        if (!allowedContentTypes.contains(contentType.toLowerCase(Locale.ROOT))) {
            return "Dinh dang file upload khong hop le.";
        }

        return null;
    }

    private void downloadTemplateInternal(String templateName, HttpServletResponse response) throws IOException {
        String normalizedName = normalizeTemplateName(templateName);
        if (normalizedName == null) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "templateName is required.");
            return;
        }

        try (Workbook wb = buildTemplateByName(normalizedName)) {
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            String filename = normalizedName + ".xlsx";
            String encodedFilename = URLEncoder.encode(filename, StandardCharsets.UTF_8).replace("+", "%20");
            response.setHeader("Content-Disposition", "attachment; filename*=UTF-8''" + encodedFilename);
            wb.write(response.getOutputStream());
        } catch (IllegalArgumentException ex) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, ex.getMessage());
        }
    }

    private String normalizeTemplateName(String templateName) {
        if (templateName == null) {
            return null;
        }
        String value = templateName.trim();
        if (value.isEmpty()) {
            return null;
        }
        if (value.toLowerCase(Locale.ROOT).endsWith(".xlsx")) {
            value = value.substring(0, value.length() - 5);
        }
        return value;
    }

    private Workbook buildTemplateByName(String templateName) {
        if ("AR_SCHEDULE_HTSV_Template".equalsIgnoreCase(templateName)) {
            return excelService.buildTemplate(loadShiftList(), loadCodeList("1439"), templateName);
        } else if ("AttendanceApply_add_Template".equalsIgnoreCase(templateName)) {
            return excelService.buildTemplate(loadShiftList(), loadCodeList("21"), templateName);
        } else if ("OvertimeApply_add_Template".equalsIgnoreCase(templateName)) {
            return excelService.buildTemplate(null, null, templateName);
        } else if ("Card_Template".equalsIgnoreCase(templateName)) {
            return excelService.buildCardRecordTemplate();
        } else if ("StartPoint_add_Template".equalsIgnoreCase(templateName)) {
            return excelService.buildStartPointTemplate(loadStartPointGroups(), templateName);
        } else if ("NewEmp_add_Template".equalsIgnoreCase(templateName)) {
            return excelService.buildNewEmpTemplate(loadNewEmpGroups(), templateName);
        } else {
            return excelService.buildTemplate(null, null, templateName);
        }
    }

    private List<List<String[]>> loadStartPointGroups() {
        List<List<String[]>> groups = new ArrayList<>();
        List<String[]> deptPairs = deptToStringPairs(loadDeptList());
        groups.add(codeToStringPairs(loadCodeList("14013956"))); // A,B: transCode
        groups.add(deptPairs);                                    // C,D: department
        groups.add(codeToStringPairs(loadCodeList("14015812"))); // E,F: postFamily
        groups.add(combinedCodeToStringPairs("14015815", "14015813")); // G,H: postGradeNo
        groups.add(codeToStringPairs(loadCodeList("14014036"))); // I,J: positionNo
        groups.add(codeToStringPairs(loadCodeList("13864")));    // K,L: empType
        groups.add(codeToStringPairs(loadCodeList("400098")));   // M,N: mainBusiness
        groups.add(deptPairs);                                    // O,P: department (lặp lại)
        return groups;
    }

    private List<List<String[]>> loadNewEmpGroups() {
        List<List<String[]>> groups = new ArrayList<>();
        List<String[]> deptPairs = deptToStringPairs(loadDeptList());
        groups.add(codeToStringPairs(loadCodeList("1359")));                              // A,B
        groups.add(combinedCodeToStringPairs("400414", "400435", "400429"));              // C,D
        groups.add(codeToStringPairs(loadCodeList("14015812")));                          // E,F
        groups.add(combinedCodeToStringPairs("14015815", "14015813"));                // G,H
        groups.add(codeToStringPairs(loadCodeList("14014036")));                          // I,J
        groups.add(codeToStringPairs(loadCodeList("13864")));                             // K,L
        groups.add(codeToStringPairs(loadCodeList("400098")));                            // M,N
        groups.add(deptPairs);                                                             // O,P (và Q,R lặp lại)
        groups.add(codeToStringPairs(loadCodeList("13769")));                             // S,T
        groups.add(codeToStringPairs(loadCodeList("1324")));                              // U,V
        groups.add(codeToStringPairs(loadCodeList("870")));                               // W,X
        groups.add(codeToStringPairs(loadCodeList("210942")));                            // Y,Z
        groups.add(codeToStringPairs(loadCodeList("1709")));                              // AA,AB
        return groups;
    }

    private List<Map<String, Object>> loadDeptList() {
        try {
            return excelService.getDeptList();
        } catch (Exception ignored) {
            return new ArrayList<>();
        }
    }

    private List<String[]> combinedCodeToStringPairs(String... parentCodes) {
        List<String[]> combined = new ArrayList<>();
        for (String parentCode : parentCodes) {
            combined.addAll(codeToStringPairs(loadCodeList(parentCode)));
        }
        return combined;
    }

    private List<String[]> codeToStringPairs(List<Map<String, Object>> codeList) {
        List<String[]> pairs = new ArrayList<>();
        for (Map<String, Object> item : codeList) {
            pairs.add(new String[]{str(item.get("name")), str(item.get("code"))});
        }
        return pairs;
    }

    private List<String[]> deptToStringPairs(List<Map<String, Object>> deptList) {
        List<String[]> pairs = new ArrayList<>();
        for (Map<String, Object> item : deptList) {
            // mapUnderscoreToCamelCase=true: DEPTNO → deptno, ORG_NAME_LOCAL → orgNameLocal
            pairs.add(new String[]{str(item.get("orgNameLocal")), str(item.get("deptno"))});
        }
        return pairs;
    }

    private String str(Object o) {
        return o == null ? "" : o.toString();
    }

    private List<Map<String, Object>> loadShiftList() {
        List<Map<String, Object>> shiftList = new ArrayList<>();
        try {
            List<ArShift010Dto> shifts = arShiftService.getShiftList(null, null);
            if (shifts != null) {
                for (ArShift010Dto s : shifts) {
                    Map<String, Object> item = new HashMap<>();
                    item.put("shiftNo", s.getShiftNo());
                    String name = s.getNameVi();
                    if (name == null || name.isBlank()) {
                        name = s.getShiftNo();
                    }
                    item.put("nameVi", name);
                    shiftList.add(item);
                }
            }
        } catch (Exception ignored) {
            // Bo qua loi, tra ve danh sach rong de van tao duoc template.
        }
        return shiftList;
    }

    private List<Map<String, Object>> loadCodeList(String parentCode) {
        List<Map<String, Object>> typeList = new ArrayList<>();
        try {
            List<SyCodeParamDto> types = syCodeParamService.getList(parentCode, null);
            if (types != null) {
                for (SyCodeParamDto t : types) {
                    Map<String, Object> item = new HashMap<>();
                    item.put("code", t.getCodeNo());
                    String name = t.getNameVi();
                    if (name == null || name.isBlank()) {
                        name = t.getCodeNo();
                    }
                    item.put("name", name);
                    typeList.add(item);
                }
            }
        } catch (Exception ignored) {
            // Bo qua loi, tra ve danh sach rong de van tao duoc template.
        }
        return typeList;
    }
}
