package com.ait.ess.infoApplyLeave.controller;

import com.ait.ess.infoApplyLeave.dto.EssCardApplyListDto;
import com.ait.ess.infoApplyLeave.service.EssCardApplyListService;
import com.ait.util.I18nUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/ess/infoApplyLeave")
public class EssInfoApplyLeaveController {

    private static final Logger log = LoggerFactory.getLogger(EssInfoApplyLeaveController.class);

    @Autowired
    private EssCardApplyListService service;

    @GetMapping("/viewApplyLeaveInfoList")
    public String viewApplyLeaveInfoList() {
        return "ess/infoApplyLeave/viewApplyLeaveInfoList";
    }

    @GetMapping("/api/myCardApply/list")
    @ResponseBody
    public ResponseEntity<List<EssCardApplyListDto>> getMyCardApplyList(
            @RequestParam(required = false) String affirmFlag,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        EssCardApplyListDto dto = new EssCardApplyListDto();
        dto.setAffirmFlagSearch(affirmFlag);
        dto.setStartDate(startDate);
        dto.setEndDate(endDate);
        return ResponseEntity.ok(service.getMyList(dto));
    }

    @PostMapping("/api/myCardApply/cancel")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> cancelMyCardApplyList(
            @RequestBody List<String> applyNos) {
        Map<String, Object> response = new HashMap<>();
        try {
            int count = service.cancelMyList(applyNos);
            response.put("success", true);
            response.put("count", count);
            response.put("message", "Hủy bỏ thành công " + count + " dòng.");
        } catch (IllegalStateException e) {
            log.warn("Cancel blocked: {}", e.getMessage());
            response.put("success", false);
            response.put("error", I18nUtil.getMessage(e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to cancel card apply list", e);
            response.put("success", false);
            response.put("error", e.getMessage() == null || e.getMessage().isBlank()
                    ? "Hủy bỏ thất bại." : e.getMessage());
        }
        return ResponseEntity.ok(response);
    }
}
