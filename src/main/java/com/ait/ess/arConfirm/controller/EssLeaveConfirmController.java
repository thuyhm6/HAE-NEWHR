package com.ait.ess.arConfirm.controller;

import com.ait.ess.arConfirm.dto.EssAttendanceExConfirmDto;
import com.ait.ess.arConfirm.dto.EssLeaveConfirmDto;
import com.ait.ess.arConfirm.service.EssAttendanceExConfirmService;
import com.ait.ess.arConfirm.service.EssLeaveConfirmService;
import com.ait.sy.sys.dto.DataTablesResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/ess/arConfirm")
public class EssLeaveConfirmController {

    private static final Logger log = LoggerFactory.getLogger(EssLeaveConfirmController.class);

    @Autowired
    private EssLeaveConfirmService service;

    @Autowired
    private EssAttendanceExConfirmService attendanceExConfirmService;

    @GetMapping("/viewAttendanceExConfirm")
    public String viewAttendanceExConfirm() {
        return "ess/arConfirm/viewAttendanceExConfirm";
    }

    @GetMapping("/api/attendanceExConfirm/list")
    @ResponseBody
    public ResponseEntity<DataTablesResponse<EssAttendanceExConfirmDto>> getAttendanceExConfirmList(
            @RequestParam(required = false) String searchEmpId,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) String confirmFlag,
            @RequestParam(defaultValue = "1") int draw,
            @RequestParam(defaultValue = "0") int start,
            @RequestParam(defaultValue = "25") int length) {

        EssAttendanceExConfirmDto dto = new EssAttendanceExConfirmDto();
        dto.setSearchEmpId(searchEmpId);
        dto.setFromDate(fromDate);
        dto.setToDate(toDate);
        dto.setSearchConfirmFlag(confirmFlag);
        dto.setDraw(draw);
        dto.setStart(start);
        dto.setLength(length);

        return ResponseEntity.ok(attendanceExConfirmService.getPageList(dto));
    }

    @PostMapping("/api/attendanceExConfirm/confirm")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> confirmAttendanceEx(@RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        String applyNo = (String) body.get("applyNo");
        String flag = (String) body.get("flag");
        String hrComment = (String) body.getOrDefault("hrComment", "");

        try {
            String message = attendanceExConfirmService.confirmAttendanceEx(applyNo, flag, hrComment);
            if (message != null && !message.isEmpty() && !"OK".equalsIgnoreCase(message)) {
                response.put("success", false);
                response.put("error", message);
            } else {
                response.put("success", true);
            }
        } catch (Exception e) {
            log.error("[EssLeaveConfirmController] confirmAttendanceEx error, applyNo={}", applyNo, e);
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/attendanceExConfirm/confirmBatch")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> confirmAttendanceExBatch(@RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        @SuppressWarnings("unchecked")
        List<String> applyNos = (List<String>) body.get("applyNos");
        String flag = (String) body.get("flag");
        String hrComment = (String) body.getOrDefault("hrComment", "");

        if (applyNos == null || applyNos.isEmpty()) {
            response.put("success", false);
            response.put("error", "Không có đơn nào được chọn.");
            return ResponseEntity.ok(response);
        }

        List<String> errors = new ArrayList<>();
        for (String applyNo : applyNos) {
            try {
                String message = attendanceExConfirmService.confirmAttendanceEx(applyNo, flag, hrComment);
                if (message != null && !message.isEmpty() && !"OK".equalsIgnoreCase(message)) {
                    errors.add(applyNo + ": " + message);
                }
            } catch (Exception e) {
                log.error("[EssLeaveConfirmController] confirmAttendanceExBatch error, applyNo={}", applyNo, e);
                errors.add(applyNo + ": " + e.getMessage());
            }
        }

        if (errors.isEmpty()) {
            response.put("success", true);
        } else {
            response.put("success", false);
            response.put("error", String.join("\n", errors));
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/viewLeaveConfirmList")
    public String viewLeaveConfirmList() {
        return "ess/arConfirm/viewLeaveConfirmList";
    }

    @GetMapping("/api/leaveConfirm/list")
    @ResponseBody
    public ResponseEntity<DataTablesResponse<EssLeaveConfirmDto>> getList(
            @RequestParam(required = false) String searchEmpId,
            @RequestParam(required = false) String searchLocalName,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) String searchLeaveTypeCode,
            @RequestParam(required = false) String confirmFlag,
            @RequestParam(defaultValue = "1") int draw,
            @RequestParam(defaultValue = "0") int start,
            @RequestParam(defaultValue = "25") int length) {

        EssLeaveConfirmDto dto = new EssLeaveConfirmDto();
        dto.setSearchEmpId(searchEmpId);
        dto.setSearchLocalName(searchLocalName);
        dto.setFromDate(fromDate);
        dto.setToDate(toDate);
        dto.setSearchLeaveTypeCode(searchLeaveTypeCode);
        dto.setSearchConfirmFlag(confirmFlag);
        dto.setDraw(draw);
        dto.setStart(start);
        dto.setLength(length);

        return ResponseEntity.ok(service.getPageList(dto));
    }

    @PostMapping("/api/leaveConfirm/confirm")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> confirm(@RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        String applyNo = (String) body.get("applyNo");
        String flag = (String) body.get("flag");
        String hrComment = (String) body.getOrDefault("hrComment", "");

        try {
            String message = service.confirmLeave(applyNo, flag, hrComment);
            if (message != null && !message.isEmpty() && !"OK".equalsIgnoreCase(message)) {
                response.put("success", false);
                response.put("error", message);
            } else {
                response.put("success", true);
            }
        } catch (Exception e) {
            log.error("[EssLeaveConfirmController] confirm error, applyNo={}", applyNo, e);
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/leaveConfirm/confirmBatch")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> confirmBatch(@RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        @SuppressWarnings("unchecked")
        List<String> applyNos = (List<String>) body.get("applyNos");
        String flag = (String) body.get("flag");
        String hrComment = (String) body.getOrDefault("hrComment", "");

        if (applyNos == null || applyNos.isEmpty()) {
            response.put("success", false);
            response.put("error", "Không có đơn nào được chọn.");
            return ResponseEntity.ok(response);
        }

        List<String> errors = new ArrayList<>();
        for (String applyNo : applyNos) {
            try {
                String message = service.confirmLeave(applyNo, flag, hrComment);
                if (message != null && !message.isEmpty() && !"OK".equalsIgnoreCase(message)) {
                    errors.add(applyNo + ": " + message);
                }
            } catch (Exception e) {
                log.error("[EssLeaveConfirmController] confirmBatch error, applyNo={}", applyNo, e);
                errors.add(applyNo + ": " + e.getMessage());
            }
        }

        if (errors.isEmpty()) {
            response.put("success", true);
        } else {
            response.put("success", false);
            response.put("error", String.join("\n", errors));
        }
        return ResponseEntity.ok(response);
    }
}
