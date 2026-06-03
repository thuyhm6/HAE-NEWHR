package com.ait.pa.salary.controller;

import com.ait.pa.salary.dto.PaItemInputSaveReqDto;
import com.ait.pa.salary.service.PaItemInputService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import java.util.Map;

@Controller
@RequestMapping("/pa/salary")
public class PaItemInputController {

    private static final Logger log = LoggerFactory.getLogger(PaItemInputController.class);

    @Autowired
    private PaItemInputService paItemInputService;

    @GetMapping("/viewPaResult")
    public String viewPaResult() {
        return "pa/salary/viewPaResult";
    }

    @GetMapping("/result/api/sectionItems")
    @ResponseBody
    public ResponseEntity<?> getSectionItems() {
        try {
            return ResponseEntity.ok(paItemInputService.getAllSectionItems());
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách hạng mục phần: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/result/api/savedItems")
    @ResponseBody
    public ResponseEntity<?> getSavedItems(
            @RequestParam(required = false) Integer isUse,
            @RequestParam(required = false) Integer itemType) {
        try {
            return ResponseEntity.ok(paItemInputService.getSavedItems(isUse, itemType));
        } catch (Exception e) {
            log.error("Lỗi khi lấy PA_ITEM_INPUT isUse={}, itemType={}: {}", isUse, itemType, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/result/api/save")
    @ResponseBody
    public ResponseEntity<?> save(@RequestBody PaItemInputSaveReqDto req) {
        try {
            if (req.getIsUse() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Vui lòng chọn Hạng mục tích chọn!"));
            }
            if (req.getItemType() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Vui lòng chọn Phân biệt hạng mục!"));
            }
            paItemInputService.saveItems(req);
            return ResponseEntity.ok(Map.of("success", true, "message", "Lưu thành công"));
        } catch (Exception e) {
            log.error("Lỗi khi lưu PA_ITEM_INPUT: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/result/api/exportExcel")
    public ResponseEntity<byte[]> exportExcel(
            @RequestParam String payScheduleNo,
            @RequestParam(required = false, defaultValue = "") String deptNos,
            @RequestParam String itemIds) {
        try {
            if (payScheduleNo == null || payScheduleNo.isBlank()) {
                return ResponseEntity.badRequest().build();
            }
            if (itemIds == null || itemIds.isBlank()) {
                return ResponseEntity.badRequest().build();
            }
            List<String> deptList = deptNos.isBlank()
                    ? Collections.emptyList()
                    : Arrays.asList(deptNos.split(","));
            List<String> itemIdList = Arrays.asList(itemIds.split(","));

            byte[] data = paItemInputService.exportSummaryHtsv(payScheduleNo, deptList, itemIdList);

            String filename = URLEncoder.encode("PaSummary_" + payScheduleNo + ".xlsx", StandardCharsets.UTF_8);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + filename)
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(data);
        } catch (Exception e) {
            log.error("Lỗi khi xuất Excel PA_SUMMARY_HTSV payScheduleNo={}: {}", payScheduleNo, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
