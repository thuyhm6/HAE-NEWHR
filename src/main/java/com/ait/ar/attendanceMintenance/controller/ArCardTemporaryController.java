package com.ait.ar.attendanceMintenance.controller;

import com.ait.ar.attendanceMintenance.dto.ArCardTemporaryDto;
import com.ait.ar.attendanceMintenance.dto.ArCardTemporarySaveRequest;
import com.ait.ar.attendanceMintenance.service.ArCardTemporaryService;
import com.ait.util.AngularIndexService;
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

import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Thẻ chấm công tạm thời (/ar/attendanceMintenance/viewArCardTemporary) - port từ
 * ArCardRecordCtroller#viewArCardTemporaryList/#addArCardTemporaryInfo/
 * #updateArCardTemporaryInfo của dự án cũ.
 */
@Controller
@RequestMapping("/ar/attendanceMintenance")
public class ArCardTemporaryController {

    private static final Logger log = LoggerFactory.getLogger(ArCardTemporaryController.class);

    @Autowired
    private ArCardTemporaryService service;

    @Autowired
    private AngularIndexService angularIndexService;

    @GetMapping("/viewArCardTemporary")
    public String viewArCardTemporary(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/api/arCardTemporary/list")
    @ResponseBody
    public ResponseEntity<List<ArCardTemporaryDto>> getList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String activity) {
        ArCardTemporaryDto params = new ArCardTemporaryDto();
        params.setKeyword(keyword);
        params.setFilterActivity(activity);
        return ResponseEntity.ok(service.getList(params));
    }

    @GetMapping("/api/arCardTemporary/info")
    @ResponseBody
    public ResponseEntity<ArCardTemporaryDto> getInfo(@RequestParam Long recordNo) {
        ArCardTemporaryDto info = service.getInfo(recordNo);
        return info == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(info);
    }

    @PostMapping("/api/arCardTemporary/add")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> add(@Valid @RequestBody ArCardTemporarySaveRequest request) {
        Map<String, Object> result = new HashMap<>();
        try {
            service.add(request);
            result.put("success", true);
            result.put("messageKey", "common.addSuccess");
        } catch (Exception e) {
            log.error("Failed to add arCardTemporary", e);
            result.put("success", false);
            result.put("messageKey", "common.saveFail");
            result.put("message", e.getMessage());
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/api/arCardTemporary/update")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> update(@Valid @RequestBody ArCardTemporarySaveRequest request) {
        Map<String, Object> result = new HashMap<>();
        try {
            int updated = service.update(request);
            result.put("success", updated > 0);
            result.put("messageKey", updated > 0 ? "common.updateSuccess" : "common.saveFail");
        } catch (Exception e) {
            log.error("Failed to update arCardTemporary", e);
            result.put("success", false);
            result.put("messageKey", "common.saveFail");
            result.put("message", e.getMessage());
        }
        return ResponseEntity.ok(result);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> handleValidationException(MethodArgumentNotValidException e) {
        log.warn("Validation failed: {}", e.getMessage());
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("messageKey", "common.saveFail");
        response.put("message", e.getBindingResult().getFieldErrors().stream()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .reduce((a, b) -> a + "; " + b).orElse(""));
        return ResponseEntity.ok(response);
    }
}
