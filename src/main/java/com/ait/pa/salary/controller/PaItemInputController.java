package com.ait.pa.salary.controller;

import com.ait.util.CollectionUtil;

import com.ait.pa.salary.dto.PaItemInputSaveReqDto;
import com.ait.pa.salary.dto.PaResultExportReqDto;
import com.ait.pa.salary.service.PaItemInputService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import javax.servlet.http.HttpServletResponse;

@Controller
@RequestMapping("/pa/salary")
public class PaItemInputController {

    private static final Logger log = LoggerFactory.getLogger(PaItemInputController.class);

    @Autowired
    private PaItemInputService paItemInputService;

    @Autowired
    private com.ait.util.AngularIndexService angularIndexService;

    @GetMapping("/viewPaResult")
    public String viewPaResult(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/result/api/sectionItems")
    @ResponseBody
    public ResponseEntity<?> getSectionItems() {
        try {
            return ResponseEntity.ok(paItemInputService.getAllSectionItems());
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách hạng mục phần: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(CollectionUtil.mapOf("error", e.getMessage()));
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
            return ResponseEntity.internalServerError().body(CollectionUtil.mapOf("error", e.getMessage()));
        }
    }

    @PostMapping("/result/api/save")
    @ResponseBody
    public ResponseEntity<?> save(@RequestBody PaItemInputSaveReqDto req) {
        try {
            if (req.getIsUse() == null) {
                return ResponseEntity.badRequest().body(CollectionUtil.mapOf("error", "Vui lòng chọn Hạng mục tích chọn!"));
            }
            if (req.getItemType() == null) {
                return ResponseEntity.badRequest().body(CollectionUtil.mapOf("error", "Vui lòng chọn Phân biệt hạng mục!"));
            }
            paItemInputService.saveItems(req);
            return ResponseEntity.ok(CollectionUtil.mapOf("success", true, "message", "Lưu thành công"));
        } catch (Exception e) {
            log.error("Lỗi khi lưu PA_ITEM_INPUT: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(CollectionUtil.mapOf("error", e.getMessage()));
        }
    }

    @PostMapping("/result/api/exportExcel")
    public ResponseEntity<byte[]> exportExcel(@RequestBody PaResultExportReqDto req) {
        try {
            if (req.getPayScheduleNo() == null || req.getPayScheduleNo().trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            if (req.getColumns() == null || req.getColumns().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            byte[] data = paItemInputService.exportSummaryHae(req);

            String filename = URLEncoder.encode("PaResult_" + req.getPayScheduleNo() + ".xlsx", StandardCharsets.UTF_8.name());
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + filename)
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(data);
        } catch (Exception e) {
            log.error("Lỗi khi xuất Excel PA_SUMMARY_HAE payScheduleNo={}: {}", req.getPayScheduleNo(), e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
