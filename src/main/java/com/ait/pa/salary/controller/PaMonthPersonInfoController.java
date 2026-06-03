package com.ait.pa.salary.controller;

import com.ait.pa.workManagement.dto.PaPayScheduleDto;
import com.ait.pa.workManagement.dto.PaPayStubDto;
import com.ait.pa.workManagement.service.PaPayScheduleService;
import com.ait.pa.workManagement.service.PaPayStubService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/pa/salary")
public class PaMonthPersonInfoController {

    private static final Logger log = LoggerFactory.getLogger(PaMonthPersonInfoController.class);

    @Autowired
    private PaPayScheduleService paPayScheduleService;

    @Autowired
    private PaPayStubService paPayStubService;

    @GetMapping("/viewPaMonthPersonInfoEssList")
    public String viewPaMonthPersonInfoEssList() {
        return "pa/salary/viewPaMonthPersonInfoEssList";
    }

    // ── API Danh sách kế hoạch trả lương đã mở (PA_OPEN_FLAG = 1) ──────────────

    @GetMapping("/api/monthPersonInfo/payScheduleOpen")
    @ResponseBody
    public ResponseEntity<?> getOpenPayScheduleList() {
        try {
            List<PaPayScheduleDto> list = paPayScheduleService.getOpenList();
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách kế hoạch trả lương đã mở: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // ── API Tải phiếu lương cá nhân (chỉ của nhân viên đang đăng nhập) ─────────

    @GetMapping("/api/monthPersonInfo/payStub/load")
    @ResponseBody
    public ResponseEntity<?> loadSelfPayStub(
            @RequestParam(required = false) String payScheduleNo,
            @RequestParam(required = false) String lang) {
        try {
            if (payScheduleNo == null || payScheduleNo.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Vui lòng chọn kế hoạch trả lương!"));
            }
            PaPayStubDto params = new PaPayStubDto();
            params.setPayScheduleNo(payScheduleNo);
            List<PaPayStubDto> result = paPayStubService.loadSelfPayStub(params, lang);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Lỗi khi tải phiếu lương cá nhân payScheduleNo={}: {}", payScheduleNo, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
