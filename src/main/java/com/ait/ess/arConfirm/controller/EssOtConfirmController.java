package com.ait.ess.arConfirm.controller;

import com.ait.ess.arConfirm.dto.EssOtConfirmDto;
import com.ait.ess.arConfirm.service.EssOtConfirmService;
import com.ait.sy.sys.dto.DataTablesResponse;
import com.ait.util.AngularIndexService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Xác nhận đơn tăng ca (nhân sự duyệt/từ chối) - cùng cấu trúc với
 * EssLeaveConfirmController#viewLeaveConfirmList (bảng phân trang server-side
 * + duyệt/từ chối theo dòng hoặc hàng loạt) nhưng dữ liệu lấy từ
 * ESS_APPLY_OT/ESS_APPLY_OT_OVER (UNION ALL, phân biệt bằng cột OT_OVER)
 * thay vì ESS_LEAVE_APPLY_TB.
 */
@Controller
@RequestMapping("/ess/arConfirm")
public class EssOtConfirmController {

    private static final Logger log = LoggerFactory.getLogger(EssOtConfirmController.class);

    @Autowired
    private EssOtConfirmService service;

    @Autowired
    private AngularIndexService angularIndexService;

    @GetMapping("/viewPOtApplyInfoConfirmList")
    public String viewPOtApplyInfoConfirmList(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/api/otConfirm/list")
    @ResponseBody
    public ResponseEntity<DataTablesResponse<EssOtConfirmDto>> getList(
            @RequestParam(required = false) String searchEmpId,
            @RequestParam(required = false) List<String> searchDeptNos,
            @RequestParam(required = false) String searchOtTypeCode,
            @RequestParam(required = false) String searchOtOver,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) String confirmFlag,
            @RequestParam(defaultValue = "1") int draw,
            @RequestParam(defaultValue = "0") int start,
            @RequestParam(defaultValue = "25") int length) {

        EssOtConfirmDto dto = new EssOtConfirmDto();
        dto.setSearchEmpId(searchEmpId);
        dto.setSearchDeptNos(searchDeptNos);
        dto.setSearchOtTypeCode(searchOtTypeCode);
        dto.setSearchOtOver(searchOtOver);
        dto.setFromDate(fromDate);
        dto.setToDate(toDate);
        dto.setSearchConfirmFlag(confirmFlag);
        dto.setDraw(draw);
        dto.setStart(start);
        dto.setLength(length);

        return ResponseEntity.ok(service.getPageList(dto));
    }

    @PostMapping("/api/otConfirm/confirm")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> confirm(@RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        String applyNo = (String) body.get("applyNo");
        String flag = (String) body.get("flag");
        String hrComment = (String) body.getOrDefault("hrComment", "");

        try {
            String message = service.confirmOt(applyNo, flag, hrComment);
            if (message != null && !message.isEmpty() && !"OK".equalsIgnoreCase(message)) {
                response.put("success", false);
                response.put("error", message);
            } else {
                response.put("success", true);
            }
        } catch (Exception e) {
            log.error("[EssOtConfirmController] confirm error, applyNo={}", applyNo, e);
            response.put("success", false);
            response.put("error", e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/otConfirm/confirmBatch")
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
                String message = service.confirmOt(applyNo, flag, hrComment);
                if (message != null && !message.isEmpty() && !"OK".equalsIgnoreCase(message)) {
                    errors.add(applyNo + ": " + message);
                }
            } catch (Exception e) {
                log.error("[EssOtConfirmController] confirmBatch error, applyNo={}", applyNo, e);
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
