package com.ait.ar.attendanceMintenance.controller;

import com.ait.ar.attendanceMintenance.dto.ArOverTimeLimitDto;
import com.ait.ar.attendanceMintenance.dto.ArOverTimeLimitSaveRequest;
import com.ait.ar.attendanceMintenance.service.ArOverTimeLimitService;
import com.ait.util.AngularIndexService;
import org.apache.poi.ss.usermodel.Workbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Giới hạn tăng ca (/ar/attendanceMintenance/viewOverTimeLimit) - port từ
 * ArDetailCtroller#viewOverTimeLimit/#updateOverTimeLimit/#overTimeLimitImportDemo
 * và ExcelImportCtroller#importOTLimitTSTO của dự án cũ.
 */
@Controller
@RequestMapping("/ar/attendanceMintenance")
public class ArOverTimeLimitController {

    private static final Logger log = LoggerFactory.getLogger(ArOverTimeLimitController.class);
    private static final long MAX_UPLOAD_SIZE_BYTES = 5L * 1024L * 1024L;
    private static final String TEMPLATE_FILE_NAME = "Over_Time_Limit.xlsx";

    @Autowired
    private ArOverTimeLimitService service;

    @Autowired
    private AngularIndexService angularIndexService;

    @GetMapping("/viewOverTimeLimit")
    public String viewOverTimeLimit(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/api/overTimeLimit/list")
    @ResponseBody
    public ResponseEntity<List<ArOverTimeLimitDto>> getList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String deptNos,
            @RequestParam(required = false) String startMonth,
            @RequestParam(required = false) String endMonth,
            @RequestParam(required = false) String postFamily,
            @RequestParam(required = false) String otLimitMonth,
            @RequestParam(required = false) String otLimitYear,
            @RequestParam(required = false) String minOtHours) {
        ArOverTimeLimitDto params = new ArOverTimeLimitDto();
        params.setKeyword(keyword);
        params.setDeptNos(deptNos);
        params.setStartMonth(startMonth);
        params.setEndMonth(endMonth);
        params.setPostFamily(postFamily);
        params.setFilterOtLimitMonth(otLimitMonth);
        params.setFilterOtLimitYear(otLimitYear);
        params.setMinOtHours(minOtHours);
        return ResponseEntity.ok(service.getList(params));
    }

    @PostMapping("/api/overTimeLimit/save")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> save(@Valid @RequestBody ArOverTimeLimitSaveRequest request) {
        Map<String, Object> result = new HashMap<>();
        try {
            int updated = service.saveOverTimeLimit(request);
            result.put("success", true);
            result.put("updated", updated);
            result.put("messageKey", "alert.message.update_success");
        } catch (Exception e) {
            log.error("Failed to save overTimeLimit", e);
            result.put("success", false);
            result.put("messageKey", "alert.message.update_fail");
            result.put("message", e.getMessage());
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/api/overTimeLimit/downloadTemplate")
    public void downloadTemplate(HttpServletResponse response) throws IOException {
        try (Workbook wb = service.buildImportTemplate()) {
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader("Content-Disposition", "attachment; filename=\"" + TEMPLATE_FILE_NAME + "\"");
            wb.write(response.getOutputStream());
        } catch (IOException e) {
            log.error("Failed to download overTimeLimit template", e);
            throw e;
        }
    }

    @PostMapping("/api/overTimeLimit/import")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> importExcel(@RequestParam("file") MultipartFile file) {
        Map<String, Object> result = new HashMap<>();
        String fileName = file == null ? null : file.getOriginalFilename();
        if (file == null || file.isEmpty() || fileName == null || file.getSize() > MAX_UPLOAD_SIZE_BYTES
                || !(fileName.toLowerCase(Locale.ROOT).endsWith(".xlsx") || fileName.toLowerCase(Locale.ROOT).endsWith(".xls"))) {
            result.put("success", false);
            result.put("message", "Chi ho tro file Excel .xlsx/.xls, toi da 5MB.");
            return ResponseEntity.badRequest().body(result);
        }
        try {
            List<String> errors = service.importOverTimeLimit(file);
            result.put("success", errors.isEmpty());
            result.put("errors", errors);
        } catch (Exception e) {
            log.error("Failed to import overTimeLimit file={}", fileName, e);
            result.put("success", false);
            result.put("message", "Loi he thong khi xu ly file import.");
        }
        return ResponseEntity.ok(result);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> handleValidationException(MethodArgumentNotValidException e) {
        log.warn("Validation failed: {}", e.getMessage());
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("messageKey", "alert.message.update_fail");
        response.put("message", e.getBindingResult().getFieldErrors().stream()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .reduce((a, b) -> a + "; " + b).orElse(""));
        return ResponseEntity.ok(response);
    }
}
