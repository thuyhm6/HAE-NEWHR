package com.ait.ess.infoApplyAttendance.controller;

import com.ait.ar.attendanceMintenance.controller.EssLeaveApplyController;
import com.ait.ar.attendanceMintenance.dto.EssLeaveApplyDto;
import com.ait.ar.attendanceMintenance.service.EssLeaveApplyService;
import com.ait.ess.infoApplyAttendance.dto.EssAttendanceExForBatchDto;
import com.ait.ess.infoApplyAttendance.dto.EssAttendancePersonalInfoDto;
import com.ait.ess.infoApplyAttendance.dto.EssCoordApplyAttendanceDto;
import com.ait.ess.infoApplyAttendance.service.EssAttendanceExForBatchService;
import com.ait.ess.infoApplyAttendance.service.EssAttendancePersonalInfoService;
import com.ait.ess.infoApplyAttendance.service.EssCoordApplyAttendanceService;
import com.ait.sy.sys.dto.DataTablesResponse;

import jakarta.servlet.http.HttpSession;
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

    @GetMapping("/viewSSTApplyAttendance")
    public String viewSSTApplyAttendance() {
        return "ess/infoApplyAttendance/viewSSTApplyAttendance";
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

    @GetMapping("/viewAttendanceExForBatchInfoList")
    public String viewAttendanceExForBatchInfoList() {
        return "ess/infoApplyAttendance/viewAttendanceExForBatchInfoList";
    }

    @GetMapping("/viewCheckAttencetanceExForBatchList")
    public String viewCheckAttencetanceExForBatchList() {
        return "ess/infoApplyAttendance/viewCheckAttencetanceExForBatchList";
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
    public String viewApplyAttendanceInfoList() {
        return "ess/infoApplyAttendance/viewApplyAttendanceInfoList";
    }

    @GetMapping("/viewApplyAttenanceBatchInfoList")
    public String viewApplyAttenanceBatchInfoList() {
        return "ess/infoApplyAttendance/viewApplyAttenanceBatchInfoList";
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
        } catch (Exception e) {
            log.error("Failed to cancel leave applications", e);
            response.put("success", false);
            response.put("error", e.getMessage() == null || e.getMessage().isBlank()
                    ? "Hủy bỏ thất bại."
                    : e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/viewAttendancePersonalInfoList")
    public String viewAttendancePersonalInfoList() {
        return "ess/infoApplyAttendance/viewAttendancePersonalInfoList";
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
    public String viewCoordApplyAttendanceInfoList() {
        return "ess/infoApplyAttendance/viewCoordApplyAttendanceInfoList";
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
            @RequestBody List<EssAttendanceExForBatchDto> selectedRows) {
        Map<String, Object> response = new HashMap<>();
        try {
            int successCount = service.applyAttendanceExForBatch(selectedRows);
            response.put("success", true);
            response.put("count", successCount);
            response.put("message", "Xin phép thành công " + successCount + " dòng.");
        } catch (Exception e) {
            log.error("Failed to save leave application data", e);
            response.put("success", false);
            response.put("error", e.getMessage() == null || e.getMessage().isBlank()
                    ? "Xin phép thất bại."
                    : e.getMessage());
        }
        return ResponseEntity.ok(response);
    }
}
