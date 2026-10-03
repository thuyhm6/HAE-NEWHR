package com.ait.pa.workManagement.controller;

import com.ait.pa.workManagement.dto.PaArSummaryItemDto;
import com.ait.pa.workManagement.dto.PaArSummaryManageDto;
import com.ait.pa.workManagement.dto.PaArSummarySaveReqDto;
import com.ait.pa.workManagement.dto.PaArSummaryScheduleDto;
import com.ait.pa.workManagement.service.PaArSummaryManageService;
import com.ait.util.CollectionUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Quản lý tổng hợp chấm công (viewPaArSummaryForManageList) - port từ
 * PaArSummaryManageCtroller của dự án cũ Hanwha_HAE.
 * Nút "Tổng hợp chấm công" dùng lại API /api/workFlow/execute (type=arMonthCal)
 * của PaWorkManagementController, không viết lại.
 */
@Controller
@RequestMapping("/pa/workManagement")
public class PaArSummaryManageController {

    private static final Logger log = LoggerFactory.getLogger(PaArSummaryManageController.class);

    @Autowired
    private PaArSummaryManageService service;

    @Autowired
    private com.ait.util.AngularIndexService angularIndexService;

    @GetMapping("/viewPaArSummaryForManageList")
    public String viewPaArSummaryForManageList(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/api/arSummaryManage/schedules")
    @ResponseBody
    public ResponseEntity<?> getScheduleList() {
        try {
            List<PaArSummaryScheduleDto> list = service.getScheduleList();
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách kế hoạch trả lương: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(CollectionUtil.mapOf("error", e.getMessage()));
        }
    }

    @GetMapping("/api/arSummaryManage/items")
    @ResponseBody
    public ResponseEntity<?> getItemList() {
        try {
            List<PaArSummaryItemDto> list = service.getItemList();
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách hạng mục tổng hợp chấm công: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(CollectionUtil.mapOf("error", e.getMessage()));
        }
    }

    @GetMapping("/api/arSummaryManage/list")
    @ResponseBody
    public ResponseEntity<?> getList(
            @RequestParam(required = false) String payScheduleNo,
            @RequestParam(required = false) String key,
            @RequestParam(required = false) String deptNo,
            @RequestParam(required = false) String itemNos,
            @RequestParam(required = false) String isSpecialFlag) {
        try {
            PaArSummaryManageDto params = buildParams(payScheduleNo, key, deptNo, itemNos, isSpecialFlag);
            return ResponseEntity.ok(service.getList(params));
        } catch (Exception e) {
            log.error("Lỗi khi tra cứu tổng hợp chấm công payScheduleNo={}: {}", payScheduleNo, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(CollectionUtil.mapOf("error", e.getMessage()));
        }
    }

    @PostMapping("/api/arSummaryManage/save")
    @ResponseBody
    public ResponseEntity<?> save(@Valid @RequestBody PaArSummarySaveReqDto req, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(CollectionUtil.mapOf("error",
                    bindingResult.getAllErrors().get(0).getDefaultMessage()));
        }
        try {
            int count = service.save(req);
            return ResponseEntity.ok(CollectionUtil.mapOf("success", true, "message", "Cập nhật thành công " + count + " bản ghi"));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(CollectionUtil.mapOf("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Lỗi khi lưu tổng hợp chấm công payScheduleNo={}: {}", req.getPayScheduleNo(), e.getMessage(), e);
            return ResponseEntity.internalServerError().body(CollectionUtil.mapOf("error", e.getMessage()));
        }
    }

    @GetMapping("/api/arSummaryManage/export")
    public ResponseEntity<byte[]> exportExcel(
            @RequestParam(required = false) String payScheduleNo,
            @RequestParam(required = false) String key,
            @RequestParam(required = false) String deptNo) {
        try {
            PaArSummaryManageDto params = buildParams(payScheduleNo, key, deptNo, null, null);
            byte[] data = service.exportExcel(params);
            String filename = URLEncoder.encode("ArSummary.xlsx", StandardCharsets.UTF_8.name());
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + filename)
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(data);
        } catch (Exception e) {
            log.error("Lỗi khi xuất Excel tổng hợp chấm công payScheduleNo={}: {}", payScheduleNo, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    private PaArSummaryManageDto buildParams(String payScheduleNo, String key, String deptNo,
                                             String itemNos, String isSpecialFlag) {
        PaArSummaryManageDto params = new PaArSummaryManageDto();
        params.setPayScheduleNo(payScheduleNo);
        params.setKey(key != null && !key.trim().isEmpty() ? key.trim() : null);
        params.setDeptNo(deptNo != null && !deptNo.trim().isEmpty() ? deptNo.trim() : null);
        if (itemNos != null && !itemNos.trim().isEmpty()) {
            params.setItemNos(Arrays.stream(itemNos.split(","))
                    .map(String::trim).filter(s -> !s.isEmpty()).collect(Collectors.toList()));
        }
        params.setIsSpecialFlag(isSpecialFlag != null && !isSpecialFlag.trim().isEmpty() ? isSpecialFlag.trim() : null);
        return params;
    }
}
