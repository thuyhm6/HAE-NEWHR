package com.ait.pa.workManagement.controller;

import com.ait.pa.workManagement.dto.PaSalaryResultQueryDto;
import com.ait.pa.workManagement.service.PaSalaryResultService;
import com.ait.util.AngularIndexService;
import com.ait.util.CollectionUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.stream.Collectors;

/**
 * Kết quả lương - port từ viewPaParamCtroller của dự án cũ Hanwha_HAE:
 *  - /detailmonthCountInfoLeft : Lương tháng chi tiết
 *  - /detailYearCountInfoLeft  : Lương năm chi tiết
 *  - /viewPaResultList         : Tổng hợp lương (cá nhân)
 *  - /viewDeptPaResultList     : Tổng hợp lương (phòng ban)
 * Phần chi tiết bên phải (detailYearCountInfoRight bản gốc) gộp thành API monthDetail / yearDetail.
 * Xuất Excel dùng lại API SQL Master (/disc/api/sqlMaster/export) giống bản gốc (SQL_SEQMEAN 270/271).
 */
@Controller
@RequestMapping("/pa/workManagement")
public class PaSalaryResultController {

    private static final Logger log = LoggerFactory.getLogger(PaSalaryResultController.class);

    @Autowired
    private PaSalaryResultService service;

    @Autowired
    private AngularIndexService angularIndexService;

    // ── Trang Angular ─────────────────────────────────────────────────────────

    @GetMapping("/detailmonthCountInfoLeft")
    public String detailmonthCountInfoLeft(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/detailYearCountInfoLeft")
    public String detailYearCountInfoLeft(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/viewPaResultList")
    public String viewPaResultList(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/viewDeptPaResultList")
    public String viewDeptPaResultList(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    // ── Lương tháng / năm chi tiết ────────────────────────────────────────────

    @GetMapping("/api/salaryResult/monthEmpList")
    @ResponseBody
    public ResponseEntity<?> getMonthEmpList(
            @RequestParam(required = false) String payScheduleNo,
            @RequestParam(required = false) String key,
            @RequestParam(required = false) String deptNo) {
        try {
            PaSalaryResultQueryDto query = new PaSalaryResultQueryDto();
            query.setPayScheduleNo(trimToNull(payScheduleNo));
            query.setKey(trimToNull(key));
            query.setDeptNo(trimToNull(deptNo));
            return ResponseEntity.ok(service.getMonthEmpList(query));
        } catch (Exception e) {
            log.error("Lỗi khi tra cứu lương tháng chi tiết payScheduleNo={}: {}", payScheduleNo, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(CollectionUtil.mapOf("error", e.getMessage()));
        }
    }

    @GetMapping("/api/salaryResult/yearEmpList")
    @ResponseBody
    public ResponseEntity<?> getYearEmpList(
            @RequestParam(required = false) String personId,
            @RequestParam(required = false) String startMonth,
            @RequestParam(required = false) String endMonth) {
        try {
            PaSalaryResultQueryDto query = new PaSalaryResultQueryDto();
            query.setPersonId(trimToNull(personId));
            query.setStartMonth(trimToNull(startMonth));
            query.setEndMonth(trimToNull(endMonth));
            return ResponseEntity.ok(service.getYearEmpList(query));
        } catch (Exception e) {
            log.error("Lỗi khi tra cứu lương năm chi tiết personId={}: {}", personId, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(CollectionUtil.mapOf("error", e.getMessage()));
        }
    }

    /** POST vì procedure ghi dữ liệu tạm vào PA_MY_SALARY_PAGE_DATA trước khi đọc. */
    @PostMapping("/api/salaryResult/monthDetail")
    @ResponseBody
    public ResponseEntity<?> getMonthDetail(@RequestBody PaSalaryResultQueryDto query) {
        try {
            return ResponseEntity.ok(service.getMonthDetail(query));
        } catch (Exception e) {
            log.error("Lỗi khi lấy chi tiết lương tháng personId={}: {}", query.getPersonId(), e.getMessage(), e);
            return ResponseEntity.internalServerError().body(CollectionUtil.mapOf("error", e.getMessage()));
        }
    }

    @PostMapping("/api/salaryResult/yearDetail")
    @ResponseBody
    public ResponseEntity<?> getYearDetail(@RequestBody PaSalaryResultQueryDto query) {
        try {
            return ResponseEntity.ok(service.getYearDetail(query));
        } catch (Exception e) {
            log.error("Lỗi khi lấy chi tiết lương năm personId={}: {}", query.getPersonId(), e.getMessage(), e);
            return ResponseEntity.internalServerError().body(CollectionUtil.mapOf("error", e.getMessage()));
        }
    }

    // ── Tổng hợp lương (cá nhân / phòng ban) ──────────────────────────────────

    @GetMapping("/api/salaryResult/personResult")
    @ResponseBody
    public ResponseEntity<?> getPersonResult(
            @RequestParam(required = false) String payScheduleNo,
            @RequestParam(required = false) String key,
            @RequestParam(required = false) String deptNos) {
        try {
            return ResponseEntity.ok(service.getPersonResult(buildResultQuery(payScheduleNo, key, deptNos)));
        } catch (Exception e) {
            log.error("Lỗi khi tra cứu tổng hợp lương (cá nhân) payScheduleNo={}: {}", payScheduleNo, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(CollectionUtil.mapOf("error", e.getMessage()));
        }
    }

    @GetMapping("/api/salaryResult/deptResult")
    @ResponseBody
    public ResponseEntity<?> getDeptResult(
            @RequestParam(required = false) String payScheduleNo,
            @RequestParam(required = false) String deptNos) {
        try {
            return ResponseEntity.ok(service.getDeptResult(buildResultQuery(payScheduleNo, null, deptNos)));
        } catch (Exception e) {
            log.error("Lỗi khi tra cứu tổng hợp lương (phòng ban) payScheduleNo={}: {}", payScheduleNo, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(CollectionUtil.mapOf("error", e.getMessage()));
        }
    }

    private static PaSalaryResultQueryDto buildResultQuery(String payScheduleNo, String key, String deptNos) {
        PaSalaryResultQueryDto query = new PaSalaryResultQueryDto();
        query.setPayScheduleNo(trimToNull(payScheduleNo));
        query.setKey(trimToNull(key));
        if (deptNos != null && !deptNos.trim().isEmpty()) {
            query.setDeptNos(Arrays.stream(deptNos.split(","))
                    .map(String::trim).filter(s -> !s.isEmpty()).collect(Collectors.toList()));
        }
        return query;
    }

    private static String trimToNull(String s) {
        if (s == null) {
            return null;
        }
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }
}
