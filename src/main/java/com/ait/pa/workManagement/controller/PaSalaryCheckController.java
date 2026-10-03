package com.ait.pa.workManagement.controller;

import com.ait.pa.workManagement.dto.PaSalaryCheckQueryDto;
import com.ait.pa.workManagement.service.PaSalaryCheckService;
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
import java.util.function.Supplier;

/**
 * Đối chiếu lương - port từ viewPaParamCtroller + PaMonthChainCtroller của dự án cũ Hanwha_HAE:
 *  - /pa/workManagement/monthPersonCountInfoList   : NV tham gia tính lương
 *  - /pa/paView/viewPaMonthChain                   : Các khoản chi trả
 *  - /pa/workManagement/viewVerificationList       : Quyết định thực hiện
 *  - /pa/workManagement/detailPersonCountInfo      : Chi tiết lương
 *  - /pa/workManagement/detailPersonCountInfoLeft  : Kiểm tra cá nhân
 *  - /pa/workManagement/detailItemCountInfo        : Đối chiếu hạng mục
 *  - /pa/workManagement/detailItemDifCountInfo     : Khoản tiền thay đổi
 *  - /pa/workManagement/viewResultConfirmList      : Đối chiếu kết quả
 * Các API GET bind tham số query vào PaSalaryCheckQueryDto; API gọi procedure (ghi dữ liệu tạm)
 * dùng POST. Xuất Excel (.xlsx) thực hiện phía frontend từ dữ liệu đang hiển thị.
 */
@Controller
@RequestMapping("/pa")
public class PaSalaryCheckController {

    private static final Logger log = LoggerFactory.getLogger(PaSalaryCheckController.class);

    private static final String API = "/workManagement/api/salaryCheck";

    @Autowired
    private PaSalaryCheckService service;

    @Autowired
    private AngularIndexService angularIndexService;

    // ── Trang Angular ─────────────────────────────────────────────────────────

    @GetMapping({
            "/workManagement/monthPersonCountInfoList",
            "/paView/viewPaMonthChain",
            "/workManagement/viewVerificationList",
            "/workManagement/detailPersonCountInfo",
            "/workManagement/detailPersonCountInfoLeft",
            "/workManagement/detailItemCountInfo",
            "/workManagement/detailItemDifCountInfo",
            "/workManagement/viewResultConfirmList"
    })
    public String page(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    // ── NV tham gia tính lương ────────────────────────────────────────────────

    @GetMapping(API + "/monthPersonCount")
    @ResponseBody
    public ResponseEntity<?> getMonthPersonCount(PaSalaryCheckQueryDto query) {
        return execute("NV tham gia tính lương", () -> service.getMonthPersonCount(query));
    }

    @GetMapping(API + "/monthPersonChangeEmpList")
    @ResponseBody
    public ResponseEntity<?> getMonthPersonChangeEmpList(PaSalaryCheckQueryDto query) {
        return execute("danh sách NV tăng/giảm", () -> service.getMonthPersonChangeEmpList(query));
    }

    // ── Các khoản chi trả ─────────────────────────────────────────────────────

    @PostMapping(API + "/monthChain")
    @ResponseBody
    public ResponseEntity<?> getMonthChainList(@RequestBody PaSalaryCheckQueryDto query) {
        return execute("các khoản chi trả", () -> service.getMonthChainList(query));
    }

    // ── Quyết định thực hiện ──────────────────────────────────────────────────

    @GetMapping(API + "/verificationList")
    @ResponseBody
    public ResponseEntity<?> getVerificationList(PaSalaryCheckQueryDto query) {
        return execute("quyết định thực hiện", () -> service.getVerificationList(query));
    }

    // ── Chi tiết lương / Kiểm tra cá nhân ─────────────────────────────────────

    @GetMapping(API + "/detailEmpInfo")
    @ResponseBody
    public ResponseEntity<?> getPaDetailEmpInfo(PaSalaryCheckQueryDto query) {
        return execute("thông tin NV chi tiết lương", () -> service.getPaDetailEmpInfo(query));
    }

    @PostMapping(API + "/detailItemList")
    @ResponseBody
    public ResponseEntity<?> getSalaryDetailInfoList(@RequestBody PaSalaryCheckQueryDto query) {
        return execute("chi tiết hạng mục lương", () -> service.getSalaryDetailInfoList(query));
    }

    // ── Đối chiếu hạng mục ────────────────────────────────────────────────────

    @GetMapping(API + "/payItemOptions")
    @ResponseBody
    public ResponseEntity<?> getPayItemOptions() {
        return execute("danh sách hạng mục lương", () -> service.getPayItemOptions());
    }

    @GetMapping(API + "/itemCountList")
    @ResponseBody
    public ResponseEntity<?> getItemCountList(PaSalaryCheckQueryDto query) {
        return execute("đối chiếu hạng mục", () -> service.getItemCountList(query));
    }

    // ── Chênh lệch hạng mục ───────────────────────────────────────────────────

    /** Khoản tiền thay đổi (detailItemDifCountInfo): gọi procedure rồi lấy danh sách NV */
    @PostMapping(API + "/itemDifList")
    @ResponseBody
    public ResponseEntity<?> getItemDifList(@RequestBody PaSalaryCheckQueryDto query) {
        return execute("khoản tiền thay đổi", () -> service.getItemDifEmpList(query, true));
    }

    /** Tổng hợp chênh lệch theo hạng mục (tab Đối chiếu hạng mục chi trả / bảo hiểm) */
    @PostMapping(API + "/itemDifSummary")
    @ResponseBody
    public ResponseEntity<?> getItemDifSummary(@RequestBody PaSalaryCheckQueryDto query) {
        return execute("tổng hợp chênh lệch hạng mục", () -> service.getItemDifSummaryList(query));
    }

    /** Danh sách NV của 1 ô tổng hợp - đọc dữ liệu tạm đã sinh ở itemDifSummary / monthChain */
    @PostMapping(API + "/itemDifEmpList")
    @ResponseBody
    public ResponseEntity<?> getItemDifEmpList(@RequestBody PaSalaryCheckQueryDto query) {
        return execute("NV chênh lệch hạng mục", () -> service.getItemDifEmpList(query, false));
    }

    // ── Đối chiếu kết quả ─────────────────────────────────────────────────────

    @GetMapping(API + "/resultSummary")
    @ResponseBody
    public ResponseEntity<?> getResultConfirmSummary(PaSalaryCheckQueryDto query) {
        return execute("biến động chi tiết", () -> service.getResultConfirmSummary(query));
    }

    @GetMapping(API + "/overtimeList")
    @ResponseBody
    public ResponseEntity<?> getOvertimeList(PaSalaryCheckQueryDto query) {
        return execute("thống kê tăng ca", () -> service.getOvertimeList(query));
    }

    @GetMapping(API + "/arDetailList")
    @ResponseBody
    public ResponseEntity<?> getArDetailList(PaSalaryCheckQueryDto query) {
        return execute("chi tiết tăng ca", () -> service.getArDetailList(query));
    }

    @GetMapping(API + "/insuranceList")
    @ResponseBody
    public ResponseEntity<?> getInsuranceList(PaSalaryCheckQueryDto query) {
        return execute("chi tiết bảo hiểm", () -> service.getInsuranceList(query));
    }

    @GetMapping(API + "/taxList")
    @ResponseBody
    public ResponseEntity<?> getTaxList(PaSalaryCheckQueryDto query) {
        return execute("thuế", () -> service.getTaxList(query));
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private ResponseEntity<?> execute(String action, Supplier<Object> supplier) {
        try {
            return ResponseEntity.ok(supplier.get());
        } catch (IllegalArgumentException e) {
            log.warn("Tham số không hợp lệ khi tra cứu {}: {}", action, e.getMessage());
            return ResponseEntity.badRequest().body(CollectionUtil.mapOf("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Lỗi khi tra cứu {}: {}", action, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(CollectionUtil.mapOf("error", e.getMessage()));
        }
    }
}
