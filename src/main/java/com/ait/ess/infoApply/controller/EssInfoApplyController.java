package com.ait.ess.infoApply.controller;

import com.ait.ar.attendanceMintenance.dto.ArOvertimeManagentDto;
import com.ait.ess.infoApply.dto.EssAbnormalAnyApproverRequest;
import com.ait.ess.infoApply.dto.EssApplyOtBatchHAEDto;
import com.ait.ess.infoApply.dto.EssSstApplyDto;
import com.ait.ess.infoApply.dto.EssOtBatchApproverDto;
import com.ait.ess.infoApply.dto.EssOtBatchApproverSaveRequest;
import com.ait.ess.infoApply.service.EssOtBatchApproverService;
import com.ait.ess.infoApply.service.EssSstApplyService;
import com.ait.ess.infoApplyAttendance.dto.EssAttendanceExForBatchDto;
import com.ait.ess.infoApplyAttendance.service.EssAttendanceExForBatchService;
import com.ait.ess.infoApply.dto.EssCwaAbnormalDto;
import com.ait.ess.infoApply.dto.EssCoordApplyOtInfoDto;
import com.ait.ess.infoApply.dto.EssOtApplyListDto;
import com.ait.ess.infoApply.dto.EssPersonOtInfoDto;
import com.ait.ess.infoApply.service.EssApplyOtBatchHAEService;
import com.ait.ess.infoApply.service.EssCwaAbnormalService;
import com.ait.ess.infoApply.service.EssCoordApplyOtInfoService;
import com.ait.ess.infoApply.service.EssOtApplyService;
import com.ait.ess.infoApply.service.EssPersonOtInfoService;
import com.ait.sy.sys.dto.DataTablesResponse;
import com.ait.sy.syAffirm.dto.SyAffirmEmailDto;
import com.ait.sy.syAffirm.service.SyAffirmEmailService;
import com.ait.util.AngularIndexService;
import com.ait.util.MailSendApprovalManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import javax.validation.Valid;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/ess/infoApply")
public class EssInfoApplyController {

    private static final Logger log = LoggerFactory.getLogger(EssInfoApplyController.class);

    @Autowired
    private EssOtApplyService essOtApplyService;

    @Autowired
    private EssCwaAbnormalService essCwaAbnormalService;

    @Autowired
    private EssPersonOtInfoService essPersonOtInfoService;

    @Autowired
    private EssCoordApplyOtInfoService essCoordApplyOtInfoService;

    @Autowired
    private EssApplyOtBatchHAEService essApplyOtBatchHAEService;

    @Autowired
    private SyAffirmEmailService syAffirmEmailService;

    @Autowired
    private EssSstApplyService essSstApplyService;

    @Autowired
    private EssAttendanceExForBatchService essAttendanceExForBatchService;

    @Autowired
    private EssOtBatchApproverService essOtBatchApproverService;

    @Autowired
    private MailSendApprovalManager mailSendApprovalManager;

    @Autowired
    private AngularIndexService angularIndexService;

    @GetMapping("/viewSSTOtApplyInfo")
    public String viewSSTOtApplyInfo(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/viewSSTOtApplyInfoTx")
    public String viewSSTOtApplyInfoTx(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/viewPiciOtAffirmPBatchList")
    public String viewPiciOtAffirmPBatchList(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/api/myOtApplyOver/list")
    @ResponseBody
    public ResponseEntity<List<EssOtApplyListDto>> getMyOtApplyOverList(
            @RequestParam(required = false) String otTypeCode,
            @RequestParam(required = false) String affirmFlag,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate) {
        EssOtApplyListDto dto = new EssOtApplyListDto();
        dto.setOtTypeCodeSearch(otTypeCode);
        dto.setAffirmFlagSearch(affirmFlag);
        dto.setFromDate(fromDate);
        dto.setToDate(toDate);
        return ResponseEntity.ok(essOtApplyService.getMyOtApplyOverList(dto));
    }

    @PostMapping("/api/myOtApplyOver/cancel")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> cancelMyOtApplyOverList(
            @RequestBody List<String> applyNos) {
        Map<String, Object> response = new HashMap<>();
        try {
            int count = essOtApplyService.cancelMyOtApplyOverList(applyNos);
            response.put("success", true);
            response.put("count", count);
            response.put("message", "Hủy bỏ thành công " + count + " dòng.");
        } catch (Exception e) {
            log.error("Failed to cancel OT over applications", e);
            response.put("success", false);
            response.put("error", e.getMessage() == null || e.getMessage().trim().isEmpty()
                    ? "Hủy bỏ thất bại." : e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/viewPOtApplyInfoList")
    public String viewPOtApplyInfoList(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/api/hrDeptManager")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getHrDeptManager() {
        return ResponseEntity.ok(essOtApplyService.getHrDeptManager());
    }

    @GetMapping("/api/otDateInfo")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getOtDateInfo(
            @RequestParam String applyDate) {
        return ResponseEntity.ok(essOtApplyService.getOtDateInfo(applyDate));
    }

    @GetMapping("/api/otDuration")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getOtDuration(
            @RequestParam String applyOtDate,
            @RequestParam String otFromTime,
            @RequestParam String otToTime,
            @RequestParam(defaultValue = "0") String deductYn) {
        return ResponseEntity.ok(essOtApplyService.getOtDuration(applyOtDate, otFromTime, otToTime, deductYn));
    }

    @GetMapping("/api/myOtApply/list")
    @ResponseBody
    public ResponseEntity<List<EssOtApplyListDto>> getMyOtApplyList(
            @RequestParam(required = false) String otTypeCode,
            @RequestParam(required = false) String affirmFlag,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate) {
        EssOtApplyListDto dto = new EssOtApplyListDto();
        dto.setOtTypeCodeSearch(otTypeCode);
        dto.setAffirmFlagSearch(affirmFlag);
        dto.setFromDate(fromDate);
        dto.setToDate(toDate);
        return ResponseEntity.ok(essOtApplyService.getMyOtApplyList(dto));
    }

    @PostMapping("/api/myOtApply/cancel")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> cancelMyOtApplyList(
            @RequestBody List<String> applyNos) {
        Map<String, Object> response = new HashMap<>();
        try {
            int count = essOtApplyService.cancelMyOtApplyList(applyNos);
            response.put("success", true);
            response.put("count", count);
            response.put("message", "Hủy bỏ thành công " + count + " dòng.");
        } catch (Exception e) {
            log.error("Failed to cancel OT applications", e);
            response.put("success", false);
            response.put("error", e.getMessage() == null || e.getMessage().trim().isEmpty()
                    ? "Hủy bỏ thất bại." : e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/viewPersonOtApplyInfoList")
    public String viewPersonOtApplyInfoList(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/api/personOt/list")
    @ResponseBody
    public ResponseEntity<List<EssPersonOtInfoDto>> getPersonOtList(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String itemNoSearch,
            @RequestParam(required = false) String minQuantity) {
        EssPersonOtInfoDto params = new EssPersonOtInfoDto();
        params.setStartDate(startDate);
        params.setEndDate(endDate);
        params.setItemNoSearch(itemNoSearch);
        params.setMinQuantity(minQuantity);
        return ResponseEntity.ok(essPersonOtInfoService.getPersonOtList(params));
    }

    @GetMapping("/api/personOt/items")
    @ResponseBody
    public ResponseEntity<List<EssPersonOtInfoDto>> getOtItemList() {
        return ResponseEntity.ok(essPersonOtInfoService.getOtItemList());
    }

    @GetMapping("/viewApplyOtLBatchByAnyApproverList")
    public String viewApplyOtLBatchByAnyApproverList(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/viewApplyOTBatchInfoHAE")
    public String viewApplyOTBatchInfoHAE(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    // ===== Tăng ca hàng loạt chọn người duyệt tùy ý (viewApplyOtLBatchByAnyApproverList / viewApplyOTBatchInfoHAE) =====
    // over=false: ESS_APPLY_OT (tăng ca thường), over=true: ESS_APPLY_OT_OVER (tăng ca vượt)

    @GetMapping("/api/otBatchApprover/list")
    @ResponseBody
    public ResponseEntity<List<EssOtBatchApproverDto>> getOtBatchApproverList(
            @RequestParam(defaultValue = "false") boolean over,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String deptNo,
            @RequestParam(required = false) String shiftNo,
            @RequestParam(required = false) String otTypeCode,
            @RequestParam(required = false) String affirmFlag,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        EssOtBatchApproverDto params = new EssOtBatchApproverDto();
        params.setOver(over);
        params.setKeyword(keyword);
        params.setDeptNo(deptNo);
        params.setShiftNo(shiftNo);
        params.setSearchOtTypeCode(otTypeCode);
        params.setSearchAffirmFlag(affirmFlag);
        params.setStartDate(startDate);
        params.setEndDate(endDate);
        return ResponseEntity.ok(essOtBatchApproverService.getList(params));
    }

    /** getValidateInfo - applyOtDate: YYYY-MM-DD, otFromTime/otToTime: YYYY-MM-DD HH:mm */
    @GetMapping("/api/otBatchApprover/validateInfo")
    @ResponseBody
    public ResponseEntity<EssOtBatchApproverDto> getOtBatchApproverValidateInfo(
            @RequestParam String personId,
            @RequestParam String applyOtDate,
            @RequestParam(required = false) String otFromTime,
            @RequestParam(required = false) String otToTime,
            @RequestParam(defaultValue = "0") String deductYn) {
        return ResponseEntity.ok(essOtBatchApproverService.getValidateInfo(personId, applyOtDate, otFromTime, otToTime, deductYn));
    }

    /** Thông tin nhân viên + tăng ca lũy kế/giới hạn tại ngày tăng ca (YYYY-MM-DD) */
    @GetMapping("/api/otBatchApprover/rowInfo")
    @ResponseBody
    public ResponseEntity<EssOtBatchApproverDto> getOtBatchApproverRowInfo(
            @RequestParam String personId,
            @RequestParam String applyOtDate) {
        return ResponseEntity.ok(essOtBatchApproverService.getRowInfo(personId, applyOtDate));
    }

    /** getDefaultOtTimeSST - loại ngày + giờ ca của người đăng nhập (YYYY-MM-DD) */
    @GetMapping("/api/otBatchApprover/dayDefault")
    @ResponseBody
    public ResponseEntity<EssOtBatchApproverDto> getOtBatchApproverDayDefault(@RequestParam String applyOtDate) {
        return ResponseEntity.ok(essOtBatchApproverService.getDayDefault(applyOtDate));
    }

    @PostMapping("/api/otBatchApprover/save")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveOtBatchApprover(
            @Valid @RequestBody EssOtBatchApproverSaveRequest body,
            @RequestParam(defaultValue = "false") boolean over,
            HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<String> applyNos = essOtBatchApproverService.save(body.getItems(), over);
            response.put("success", true);
            response.put("messageKey", "alert.message.save_success");
            // Gửi thông tin phê duyệt lên EagleOffice cho các đơn vừa lưu (best-effort)
            for (String applyNo : applyNos) {
                try {
                    mailSendApprovalManager.sendAffirmInfoEmailApproval(request, applyNo);
                } catch (Exception eagleEx) {
                    log.warn("EagleOffice notification failed for applyNo={}: {}", applyNo, eagleEx.getMessage());
                }
            }
        } catch (IllegalArgumentException | IllegalStateException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        } catch (Exception e) {
            log.error("Failed to save OT batch by approver over={}", over, e);
            response.put("success", false);
            response.put("messageKey", "alert.message.add_fail");
            response.put("message", e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/otBatchApprover/delete")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteOtBatchApprover(
            @RequestBody List<String> applyNos,
            @RequestParam(defaultValue = "false") boolean over) {
        Map<String, Object> response = new HashMap<>();
        try {
            int count = essOtBatchApproverService.delete(applyNos, over);
            response.put("success", true);
            response.put("count", count);
            response.put("messageKey", "alert.message.delete_success");
            // Hủy phê duyệt trên EagleOffice (best-effort)
            try {
                mailSendApprovalManager.cancelMailApprovaledInfo(applyNos);
            } catch (Exception eagleEx) {
                log.warn("EagleOffice cancel failed for applyNos={}: {}", applyNos, eagleEx.getMessage());
            }
        } catch (IllegalArgumentException | IllegalStateException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        } catch (Exception e) {
            log.error("Failed to delete OT batch by approver over={} applyNos={}", over, applyNos, e);
            response.put("success", false);
            response.put("messageKey", "alert.message.delete_fail");
            response.put("message", e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/viewApprovalEmail")
    public String viewApprovalEmail(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/api/approvalEmail/list")
    @ResponseBody
    public ResponseEntity<List<SyAffirmEmailDto>> getApprovalEmailList(SyAffirmEmailDto dto) {
        return ResponseEntity.ok(syAffirmEmailService.getApprovalEmailList(dto));
    }

    @PostMapping("/api/approvalEmail/syncEagleOffice")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> syncEagleOffice(HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            // null → đồng bộ toàn bộ đơn chờ gửi (SEND_EMAIL_FLAG = 0)
            boolean result = mailSendApprovalManager.sendAffirmInfoEmailApproval(request, null);
            response.put("success", result);
            response.put("message", result ? "Đồng bộ Clever thành công." : "Không có đơn nào cần đồng bộ.");
        } catch (Exception e) {
            log.error("Failed to sync EagleOffice", e);
            response.put("success", false);
            response.put("message", e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/viewApprovaledEmail")
    public String viewApprovaledEmail(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/api/approvaledEmail/list")
    @ResponseBody
    public ResponseEntity<List<SyAffirmEmailDto>> getApprovaledEmailList(SyAffirmEmailDto dto) {
        return ResponseEntity.ok(syAffirmEmailService.getApprovaledEmailList(dto));
    }

    @PostMapping("/api/approvalEmail/execute")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> executeApproval(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> items = (List<Map<String, Object>>) request.get("items");
            if (items == null || items.isEmpty()) {
                response.put("success", false);
                response.put("message", "Không có đơn nào được chọn.");
                return ResponseEntity.ok(response);
            }
            String errors = syAffirmEmailService.executeAffirm(items);
            if (errors.isEmpty()) {
                response.put("success", true);
            } else {
                response.put("success", false);
                response.put("message", errors.trim());
            }
        } catch (Exception e) {
            log.error("Failed to execute approval", e);
            response.put("success", false);
            response.put("message", e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/viewNoticeedEmail")
    public String viewNoticeedEmail(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/api/noticeedEmail/list")
    @ResponseBody
    public ResponseEntity<List<SyAffirmEmailDto>> getNoticeedEmailList(SyAffirmEmailDto dto) {
        return ResponseEntity.ok(syAffirmEmailService.getNoticeedEmailList(dto));
    }

    @GetMapping("/viewCoordApplyOtInfoList")
    public String viewCoordApplyOtInfoList(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/api/coordOt/list")
    @ResponseBody
    public ResponseEntity<DataTablesResponse<EssCoordApplyOtInfoDto>> getCoordApplyOtList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String deptNos,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String shiftNo,
            @RequestParam(required = false) String itemNoSearch,
            @RequestParam(required = false) String statusCode,
            @RequestParam(required = false) String postFamily,
            @RequestParam(defaultValue = "1") int draw,
            @RequestParam(defaultValue = "0") int start,
            @RequestParam(defaultValue = "25") int length) {
        EssCoordApplyOtInfoDto dto = new EssCoordApplyOtInfoDto();
        dto.setKeyword(keyword);
        dto.setDeptNos(deptNos);
        dto.setStartDate(startDate);
        dto.setEndDate(endDate);
        dto.setShiftNo(shiftNo);
        dto.setItemNoSearch(itemNoSearch);
        dto.setStatusCode(statusCode);
        dto.setPostFamily(postFamily);
        dto.setDraw(draw);
        dto.setStart(start);
        dto.setLength(length);
        return ResponseEntity.ok(essCoordApplyOtInfoService.getPageList(dto));
    }

    @GetMapping("/api/coordOt/items")
    @ResponseBody
    public ResponseEntity<List<EssCoordApplyOtInfoDto>> getCoordOtItemList() {
        return ResponseEntity.ok(essCoordApplyOtInfoService.getOtItemList());
    }

    @GetMapping("/viewApplyOTBatchInfoHAEList")
    public String viewApplyOTBatchInfoHAEList(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/api/otBatchHAE/list")
    @ResponseBody
    public ResponseEntity<DataTablesResponse<EssApplyOtBatchHAEDto>> getApplyOtBatchHAEList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String deptNos,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String shiftNo,
            @RequestParam(required = false) String itemNoSearch,
            @RequestParam(required = false) String statusCode,
            @RequestParam(required = false) String postFamily,
            @RequestParam(defaultValue = "1") int draw,
            @RequestParam(defaultValue = "0") int start,
            @RequestParam(defaultValue = "25") int length) {
        EssApplyOtBatchHAEDto dto = new EssApplyOtBatchHAEDto();
        dto.setKeyword(keyword);
        dto.setDeptNos(deptNos);
        dto.setStartDate(startDate);
        dto.setEndDate(endDate);
        dto.setShiftNo(shiftNo);
        dto.setItemNoSearch(itemNoSearch);
        dto.setStatusCode(statusCode);
        dto.setPostFamily(postFamily);
        dto.setDraw(draw);
        dto.setStart(start);
        dto.setLength(length);
        return ResponseEntity.ok(essApplyOtBatchHAEService.getPageList(dto));
    }

    @GetMapping("/api/otBatchHAE/items")
    @ResponseBody
    public ResponseEntity<List<EssApplyOtBatchHAEDto>> getApplyOtBatchHAEItemList() {
        return ResponseEntity.ok(essApplyOtBatchHAEService.getOtItemList());
    }

    @GetMapping("/viewShowCwaAbnormalApply")
    public String viewShowCwaAbnormalApply(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/api/myCwaAbnormal/list")
    @ResponseBody
    public ResponseEntity<List<EssCwaAbnormalDto>> getMyCwaAbnormalList(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        EssCwaAbnormalDto dto = new EssCwaAbnormalDto();
        dto.setStartDate(startDate);
        dto.setEndDate(endDate);
        return ResponseEntity.ok(essCwaAbnormalService.getMyList(dto));
    }

    // ===== Xin tăng ca SST (viewSSTOtApplyInfo / viewSSTOtApplyInfoTx) - port đúng JSP gốc Hanwha_HAE =====

    /** getOtShiftTime - applyDate: YYYY-MM-DD */
    @GetMapping("/api/sstOt/shiftTime")
    @ResponseBody
    public ResponseEntity<EssSstApplyDto> getSstOtShiftTime(@RequestParam String applyDate) {
        return ResponseEntity.ok(essSstApplyService.getOtShiftTime(applyDate));
    }

    /** getOtLength - applyDate: YYYY-MM-DD, otFromTime/otToTime: YYYY-MM-DD HH:mm */
    @GetMapping("/api/sstOt/length")
    @ResponseBody
    public ResponseEntity<EssSstApplyDto> getSstOtLength(
            @RequestParam String applyDate,
            @RequestParam(required = false) String otTypeCode,
            @RequestParam String otFromTime,
            @RequestParam String otToTime,
            @RequestParam(defaultValue = "0") String deductYn) {
        return ResponseEntity.ok(essSstApplyService.getOtLength(applyDate, otTypeCode, otFromTime, otToTime, deductYn));
    }

    /** AR_GET_OT_CLASH (over=false) / AR_GET_OT_OVER_CLASH (over=true) */
    @GetMapping("/api/sstOt/clash")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> checkSstOtClash(
            @RequestParam String otFromTime,
            @RequestParam String otToTime,
            @RequestParam(defaultValue = "0") String offsetYn,
            @RequestParam(defaultValue = "false") boolean over) {
        Map<String, Object> response = new HashMap<>();
        response.put("flag", essSstApplyService.checkOtClash(otFromTime, otToTime, offsetYn, over));
        return ResponseEntity.ok(response);
    }

    /** addSSTOvertimeApply (over=false) / addOtOverApply (over=true) - luôn lưu cho chính user đăng nhập */
    @PostMapping("/api/sstOt/save")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveSstOt(
            @RequestBody ArOvertimeManagentDto dto,
            @RequestParam(defaultValue = "false") boolean over,
            HttpServletRequest request,
            HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        try {
            dto.setPersonId((String) session.getAttribute("adminID"));
            String applyNo = essSstApplyService.saveOvertime(dto, over);
            response.put("success", true);
            response.put("messageKey", "alert.message.save_success");
            try {
                mailSendApprovalManager.sendAffirmInfoEmailApproval(request, applyNo);
            } catch (Exception eagleEx) {
                log.warn("EagleOffice notification failed for applyNo={}: {}", applyNo, eagleEx.getMessage());
            }
        } catch (EssSstApplyService.CheckException | IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        } catch (Exception e) {
            log.error("Failed to save SST overtime over={}", over, e);
            response.put("success", false);
            response.put("messageKey", "alert.message.add_fail");
            response.put("message", e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    // ===== Xin phép chấm công bất thường chọn người duyệt tùy ý (viewAbnormalApplyByAnyApprover) =====

    @GetMapping("/viewAbnormalApplyByAnyApprover")
    public String viewAbnormalApplyByAnyApprover(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    /** addAbnormalApplyByAnyApprover - các dòng chấm công bất thường + dây chuyền duyệt tự chọn */
    @PostMapping("/api/abnormalAnyApprover/apply")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> applyAbnormalAnyApprover(
            @Valid @RequestBody EssAbnormalAnyApproverRequest body,
            HttpServletRequest request,
            HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        try {
            String personId = (String) session.getAttribute("adminID");
            body.getItems().forEach(item -> item.setPersonId(personId));
            int count = essAttendanceExForBatchService.applyAbnormalByAnyApprover(body.getItems(), body.getApprovers());
            response.put("success", true);
            response.put("count", count);
            response.put("messageKey", "alert.message.save_success");
            for (EssAttendanceExForBatchDto item : body.getItems()) {
                String applyNo = item.getApplyNo() != null ? item.getApplyNo() : "";
                try {
                    mailSendApprovalManager.sendAffirmInfoEmailApproval(request, applyNo);
                } catch (Exception eagleEx) {
                    log.warn("EagleOffice notification failed for applyNo={}: {}", applyNo, eagleEx.getMessage());
                }
            }
        } catch (IllegalArgumentException | IllegalStateException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        } catch (Exception e) {
            log.error("Failed to apply abnormal attendance by any approver", e);
            response.put("success", false);
            response.put("messageKey", "alert.message.add_fail");
            response.put("message", e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    /** Lỗi @Valid của body - trả về cùng định dạng {success, messageKey, message} */
    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> handleValidationException(
            org.springframework.web.bind.MethodArgumentNotValidException e) {
        log.warn("Validation failed: {}", e.getMessage());
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("messageKey", "alert.message.add_fail");
        response.put("message", e.getBindingResult().getFieldErrors().stream()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .reduce((a, b) -> a + "; " + b).orElse(""));
        return ResponseEntity.ok(response);
    }
}
