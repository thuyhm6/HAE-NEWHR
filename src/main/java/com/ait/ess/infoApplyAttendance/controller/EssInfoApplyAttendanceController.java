package com.ait.ess.infoApplyAttendance.controller;

import com.ait.ar.attendanceMintenance.controller.EssLeaveApplyController;
import com.ait.ar.attendanceMintenance.dto.ArOvertimeManagentDto;
import com.ait.ar.attendanceMintenance.dto.EssLeaveApplyDto;
import com.ait.ar.attendanceMintenance.service.EssLeaveApplyService;
import com.ait.ess.infoApply.service.EssSstApplyService;
import com.ait.ess.infoApplyAttendance.dto.EssApplyAttBatchDto;
import com.ait.ess.infoApplyAttendance.dto.EssApplyAttBatchSaveDto;
import com.ait.ess.infoApplyAttendance.dto.EssApplyAttBatchSaveRequest;
import com.ait.ess.infoApplyAttendance.dto.EssAttendanceExForBatchDto;
import com.ait.ess.infoApplyAttendance.dto.EssAttendancePersonalInfoDto;
import com.ait.ess.infoApplyAttendance.dto.EssCoordApplyAttendanceDto;
import com.ait.ess.infoApplyAttendance.service.EssApplyAttBatchService;
import com.ait.ess.infoApplyAttendance.service.EssAttendanceExForBatchService;
import com.ait.ess.infoApplyAttendance.service.EssAttendancePersonalInfoService;
import com.ait.ess.infoApplyAttendance.service.EssCoordApplyAttendanceService;
import com.ait.sy.syAffirm.dto.SyAffirmEmailDto;
import com.ait.sy.sys.dto.DataTablesResponse;
import com.ait.util.AngularIndexService;
import com.ait.util.MailSendApprovalManager;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/ess/infoApplyAttendance")
public class EssInfoApplyAttendanceController {
        private static final Logger log = LoggerFactory.getLogger(EssLeaveApplyController.class);

    @Autowired
    private EssAttendanceExForBatchService service;

    @Autowired
    private EssLeaveApplyService essLeaveApplyService;

    @Autowired
    private EssAttendancePersonalInfoService personalInfoService;

    @Autowired
    private EssCoordApplyAttendanceService coordApplyAttendanceService;
    @Autowired
    private MailSendApprovalManager mailSendApprovalManager;

    @Autowired
    private AngularIndexService angularIndexService;

    @Autowired
    private EssApplyAttBatchService applyAttBatchService;

    @Autowired
    private EssSstApplyService sstApplyService;

    @GetMapping("/viewSSTApplyAttendance")
    public String viewSSTApplyAttendance(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/api/vacationInfo")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getMyVacationInfo(HttpSession session) {
        String personId = (String) session.getAttribute("adminID");
        return ResponseEntity.ok(essLeaveApplyService.getMyVacationInfo(personId));
    }

    @GetMapping("/api/leaveLength")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getLeaveLength(
            @RequestParam String fromDateTime,
            @RequestParam String toDateTime,
            @RequestParam(required = false, defaultValue = "") String leaveTypeCode) {
        return ResponseEntity.ok(essLeaveApplyService.calculateLeaveLength(fromDateTime, toDateTime, leaveTypeCode));
    }

    /**
     * addLeaveApplySST - lưu đơn nghỉ phép của chính user đăng nhập (viewSSTApplyAttendance).
     * Kiểm tra CHECK_LEAVE_TIME + giới tính + MIN_VALUE + trùng/khóa công rồi ghi đơn và dây chuyền duyệt.
     */
    @PostMapping("/api/sstLeave/save")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveSstLeave(
            @Valid @RequestBody EssApplyAttBatchSaveDto body, HttpServletRequest request, HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        try {
            body.setPersonId((String) session.getAttribute("adminID"));
            String applyNo = sstApplyService.saveLeave(body);
            response.put("success", true);
            response.put("messageKey", "alert.message.save_success");
            try {
                mailSendApprovalManager.sendAffirmInfoEmailApproval(request, applyNo);
            } catch (Exception eagleEx) {
                log.warn("EagleOffice notification failed for applyNo={}: {}", applyNo, eagleEx.getMessage());
            }
        } catch (EssApplyAttBatchService.BusinessException e) {
            response.put("success", false);
            response.put("messageKey", e.getMessageKey());
            response.put("suffix", e.getSuffix());
        } catch (EssSstApplyService.CheckException | IllegalArgumentException | IllegalStateException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        } catch (Exception e) {
            log.error("Failed to save SST leave apply", e);
            response.put("success", false);
            response.put("messageKey", "alert.message.add_fail");
            response.put("message", e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/viewAttendanceExForBatchInfoList")
    public String viewAttendanceExForBatchInfoList(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/api/attendanceEx/list")
    @ResponseBody
    public ResponseEntity<List<EssAttendanceExForBatchDto>> getAttendanceExForBatchList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String deptNos,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) String postFamily,
            @RequestParam(required = false) String shiftNo,
            @RequestParam(required = false) String itemNo) {
        EssAttendanceExForBatchDto params = new EssAttendanceExForBatchDto();
        params.setKeyword(keyword);
        params.setDeptNos(deptNos);
        params.setFromDate(fromDate);
        params.setToDate(toDate);
        params.setPostFamily(postFamily);
        params.setShiftNo(shiftNo);
        params.setItemNo(itemNo);
        return ResponseEntity.ok(service.getAttendanceExForBatchList(params));
    }

    @GetMapping("/api/checkAttendanceEx/list")
    @ResponseBody
    public ResponseEntity<List<EssAttendanceExForBatchDto>> getCheckAttendanceExForBatchList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String deptNos,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) String postFamily,
            @RequestParam(required = false) String shiftNo,
            @RequestParam(required = false) String itemNo) {
        EssAttendanceExForBatchDto params = new EssAttendanceExForBatchDto();
        params.setKeyword(keyword);
        params.setDeptNos(deptNos);
        params.setFromDate(fromDate);
        params.setToDate(toDate);
        params.setPostFamily(postFamily);
        params.setShiftNo(shiftNo);
        params.setItemNo(itemNo);
        return ResponseEntity.ok(service.getCheckAttendanceExForBatchList(params));
    }

    @GetMapping("/api/checkAttendanceEx/detail")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getCardApplyDetail(
            @RequestParam(name = "applyNo") String applyNo,
            @RequestParam(name = "applyType", required = false) String applyType) {
        return ResponseEntity.ok(service.getCardApplyDetail(applyNo, applyType));
    }

    @GetMapping("/viewApplyAttendanceInfoList")
    public String viewApplyAttendanceInfoList(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/viewApplyAttBatchByAnyApproverList")
    public String viewApplyAttBatchByAnyApproverList(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/api/myLeaveApply/list")
    @ResponseBody
    public ResponseEntity<List<EssLeaveApplyDto>> getMyLeaveApplyList(
            @RequestParam(required = false) String leaveTypeCode,
            @RequestParam(required = false) String affirmFlag,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate) {
        EssLeaveApplyDto params = new EssLeaveApplyDto();
        params.setLeaveTypeCode(leaveTypeCode);
        params.setAffirmFlag(affirmFlag);
        params.setFromDate(fromDate);
        params.setToDate(toDate);
        return ResponseEntity.ok(essLeaveApplyService.getMyLeaveApplyList(params));
    }

    @PostMapping("/api/myLeaveApply/cancel")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> cancelMyLeaveApplyList(
            @RequestBody List<String> applyNos) {
        Map<String, Object> response = new HashMap<>();
        try {
            int count = essLeaveApplyService.cancelMyLeaveApplyList(applyNos);
            response.put("success", true);
            response.put("count", count);
            response.put("message", "Hủy bỏ thành công " + count + " dòng.");

            boolean cancelApproval = mailSendApprovalManager.cancelMailApprovaledInfo(applyNos);
        } catch (Exception e) {
            log.error("Failed to cancel leave applications", e);
            response.put("success", false);
            response.put("error", e.getMessage() == null || e.getMessage().trim().isEmpty()
                    ? "Hủy bỏ thất bại."
                    : e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/viewAttendancePersonalInfoList")
    public String viewAttendancePersonalInfoList(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/api/attendancePersonal/list")
    @ResponseBody
    public ResponseEntity<List<EssAttendancePersonalInfoDto>> getPersonalAttendanceList(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String itemNoSearch) {
        EssAttendancePersonalInfoDto params = new EssAttendancePersonalInfoDto();
        params.setStartDate(startDate);
        params.setEndDate(endDate);
        params.setItemNoSearch(itemNoSearch);
        return ResponseEntity.ok(personalInfoService.getPersonalAttendanceList(params));
    }

    @GetMapping("/api/attendancePersonal/items")
    @ResponseBody
    public ResponseEntity<List<EssAttendancePersonalInfoDto>> getAttendanceItemList() {
        return ResponseEntity.ok(personalInfoService.getAttendanceItemList());
    }

    @GetMapping("/viewCoordApplyAttendanceInfoList")
    public String viewCoordApplyAttendanceInfoList(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/api/coordApply/list")
    @ResponseBody
    public ResponseEntity<DataTablesResponse<EssCoordApplyAttendanceDto>> getCoordApplyAttendanceList(
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
        EssCoordApplyAttendanceDto dto = new EssCoordApplyAttendanceDto();
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
        return ResponseEntity.ok(coordApplyAttendanceService.getPageList(dto));
    }

    @PostMapping("/api/attendanceEx/apply")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> applyAttendanceExForBatch(
            @RequestBody List<EssAttendanceExForBatchDto> selectedRows, HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            int successCount = service.applyAttendanceExForBatch(selectedRows);
            response.put("success", true);
            response.put("count", successCount);
            response.put("message", "Xin phép thành công " + successCount + " dòng.");

            // Gửi thông tin phê duyệt lên EagleOffice chỉ cho đơn vừa lưu (best-effort)
            for (EssAttendanceExForBatchDto dto : selectedRows) {
                String savedApplyNo = dto.getApplyNo() != null ? dto.getApplyNo() : "";
                try {
                    mailSendApprovalManager.sendAffirmInfoEmailApproval(request, savedApplyNo);
                } catch (Exception eagleEx) {
                    log.warn("EagleOffice notification failed for applyNo={}: {}", savedApplyNo, eagleEx.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("Failed to save leave application data", e);
            response.put("success", false);
            response.put("error", e.getMessage() == null || e.getMessage().trim().isEmpty()
                    ? "Xin phép thất bại."
                    : e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    /**
     * saveAttenanceExBatchInfo - xin phép chấm công bất thường hàng loạt thay nhân viên
     * (viewAttendanceExForBatchInfoList), mỗi dòng mang dây chuyền duyệt riêng.
     */
    @PostMapping("/api/attendanceEx/applyByApprover")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> applyAttendanceExByApprover(
            @RequestBody List<EssAttendanceExForBatchDto> selectedRows, HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            int successCount = service.applyAttendanceExWithRowApprovers(selectedRows);
            response.put("success", true);
            response.put("count", successCount);
            response.put("messageKey", "ar.alert.message.addempshift.success");

            // Gửi thông tin phê duyệt lên EagleOffice cho các đơn vừa lưu (best-effort)
            for (EssAttendanceExForBatchDto dto : selectedRows) {
                String savedApplyNo = dto.getApplyNo() != null ? dto.getApplyNo() : "";
                try {
                    mailSendApprovalManager.sendAffirmInfoEmailApproval(request, savedApplyNo);
                } catch (Exception eagleEx) {
                    log.warn("EagleOffice notification failed for applyNo={}: {}", savedApplyNo, eagleEx.getMessage());
                }
            }
        } catch (IllegalArgumentException | IllegalStateException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        } catch (Exception e) {
            log.error("Failed to apply attendance exception batch by approver", e);
            response.put("success", false);
            response.put("messageKey", "alert.message.add_fail");
            response.put("message", e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    // ===== Xin nghỉ phép hàng loạt (chọn người duyệt tùy ý) - viewApplyAttBatchByAnyApproverList =====

    @GetMapping("/api/applyAttBatch/list")
    @ResponseBody
    public ResponseEntity<List<EssApplyAttBatchDto>> getApplyAttBatchList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String deptNo,
            @RequestParam(required = false) String shiftNo,
            @RequestParam(required = false) String leaveTypeCode,
            @RequestParam(required = false) String affirmFlag,
            @RequestParam(required = false) String confirmFlag,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        EssApplyAttBatchDto params = new EssApplyAttBatchDto();
        params.setKeyword(keyword);
        params.setDeptNo(deptNo);
        params.setShiftNo(shiftNo);
        params.setSearchLeaveTypeCode(leaveTypeCode);
        params.setSearchAffirmFlag(affirmFlag);
        params.setSearchConfirmFlag(confirmFlag);
        params.setStartDate(startDate);
        params.setEndDate(endDate);
        return ResponseEntity.ok(applyAttBatchService.getList(params));
    }

    @PostMapping("/api/applyAttBatch/affirmors")
    @ResponseBody
    public ResponseEntity<Map<String, List<SyAffirmEmailDto>>> getApplyAttBatchAffirmors(
            @RequestBody List<String> applyNos) {
        return ResponseEntity.ok(applyAttBatchService.getAffirmorsByApplyNos(applyNos));
    }

    @GetMapping("/api/applyAttBatch/defaultAffirmors")
    @ResponseBody
    public ResponseEntity<List<SyAffirmEmailDto>> getApplyAttBatchDefaultAffirmors(
            @RequestParam String personId,
            @RequestParam(required = false) String leaveTypeCode,
            @RequestParam(required = false) String applyLength) {
        return ResponseEntity.ok(applyAttBatchService.getDefaultAffirmors(personId, leaveTypeCode, applyLength));
    }

    @GetMapping("/api/applyAttBatch/empInfo")
    @ResponseBody
    public ResponseEntity<EssApplyAttBatchDto> getApplyAttBatchEmpInfo(
            @RequestParam String personId,
            @RequestParam String applyDate) {
        return ResponseEntity.ok(applyAttBatchService.getEmpAttendanceInfo(personId, applyDate));
    }

    @GetMapping("/api/applyAttBatch/leaveLength")
    @ResponseBody
    public ResponseEntity<EssApplyAttBatchDto> getApplyAttBatchLeaveLength(
            @RequestParam String personId,
            @RequestParam String fromTime,
            @RequestParam String toTime,
            @RequestParam(required = false) String leaveTypeCode) {
        return ResponseEntity.ok(applyAttBatchService.calcLeaveLength(personId, fromTime, toTime, leaveTypeCode));
    }

    @GetMapping("/api/applyAttBatch/checkLeaveSex")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> checkApplyAttBatchLeaveSex(
            @RequestParam String personId,
            @RequestParam String leaveTypeCode) {
        Map<String, Object> response = new HashMap<>();
        String messageKey = applyAttBatchService.checkLeaveSex(personId, leaveTypeCode);
        response.put("valid", messageKey == null);
        response.put("messageKey", messageKey);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/applyAttBatch/save")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveApplyAttBatch(
            @Valid @RequestBody EssApplyAttBatchSaveRequest body, HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> result = applyAttBatchService.saveBatch(body.getItems());
            response.put("success", true);
            response.put("messageKey", "ar.alert.message.addempshift.success");

            // Hủy phê duyệt cũ trên EagleOffice của các đơn bị sửa (best-effort)
            cancelEagleOfficeApprovals(result.get("misDocIds"));
            // Gửi thông tin phê duyệt mới lên EagleOffice cho các đơn vừa lưu (best-effort)
            Object applyNos = result.get("applyNos");
            if (applyNos instanceof List) {
                for (Object applyNo : (List<?>) applyNos) {
                    try {
                        mailSendApprovalManager.sendAffirmInfoEmailApproval(request, String.valueOf(applyNo));
                    } catch (Exception eagleEx) {
                        log.warn("EagleOffice notification failed for applyNo={}: {}", applyNo, eagleEx.getMessage());
                    }
                }
            }
        } catch (EssApplyAttBatchService.BusinessException e) {
            response.put("success", false);
            response.put("messageKey", e.getMessageKey());
            response.put("suffix", e.getSuffix());
        } catch (Exception e) {
            log.error("Failed to save apply attendance batch", e);
            response.put("success", false);
            response.put("messageKey", "alert.message.add_fail");
            response.put("message", e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/applyAttBatch/delete")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteApplyAttBatch(@RequestBody List<String> applyNos) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> result = applyAttBatchService.deleteBatch(applyNos);
            response.put("success", true);
            response.put("messageKey", "alert.message.delete_success");
            cancelEagleOfficeApprovals(result.get("misDocIds"));
        } catch (EssApplyAttBatchService.BusinessException e) {
            response.put("success", false);
            response.put("messageKey", e.getMessageKey());
            response.put("suffix", e.getSuffix());
        } catch (Exception e) {
            log.error("Failed to delete apply attendance batch applyNos={}", applyNos, e);
            response.put("success", false);
            response.put("messageKey", "alert.message.delete_fail");
            response.put("message", e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    private void cancelEagleOfficeApprovals(Object misDocIds) {
        if (!(misDocIds instanceof List)) {
            return;
        }
        for (Object misDocId : (List<?>) misDocIds) {
            try {
                mailSendApprovalManager.cancelApproval(String.valueOf(misDocId), " ");
            } catch (Exception eagleEx) {
                log.warn("EagleOffice cancel failed for misDocId={}: {}", misDocId, eagleEx.getMessage());
            }
        }
    }

    /** Lỗi @Valid của body save - trả về cùng định dạng {success, messageKey, message} */
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
