package com.ait.ar.attendanceMintenance.controller;

import com.ait.ar.attendanceMintenance.dto.ArOvertimeImportTempDto;
import com.ait.ar.attendanceMintenance.dto.ArOvertimeManagentDto;
import com.ait.ar.attendanceMintenance.service.ArOvertimeManagentService;
import com.ait.sy.syAffirm.dto.SyAffirmEmailDto;
import com.ait.sy.syAffirm.service.SyAffirmEmailService;
import com.ait.util.AngularIndexService;
import com.ait.util.MailSendApprovalManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/ar/attendanceMintenance")
public class ArOvertimeManagentController {

    private static final Logger log = LoggerFactory.getLogger(ArOvertimeManagentController.class);

    @Autowired
    private ArOvertimeManagentService service;

    @Autowired
    private SyAffirmEmailService affirmorService;

    @Autowired
    private MailSendApprovalManager mailSendApprovalManager;

    @Autowired
    private AngularIndexService angularIndexService;

    @GetMapping("/viewApplyOtManagentByAnyApproverList")
    public String view(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/viewImportOtTempList")
    public String viewImportOtTempList(HttpServletResponse response) throws IOException {
        angularIndexService.writeIndexHtml(response);
        return null;
    }

    @GetMapping("/api/overtime/list")
    @ResponseBody
    public ResponseEntity<List<ArOvertimeManagentDto>> getList(
            @RequestParam(required = false) String empId,
            @RequestParam(required = false) String localName,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate) {
        ArOvertimeManagentDto dto = new ArOvertimeManagentDto();
        dto.setEmpId(empId);
        dto.setLocalName(localName);
        dto.setFromDate(fromDate);
        dto.setToDate(toDate);
        return ResponseEntity.ok(service.getList(dto));
    }

    @GetMapping("/api/overtime/over/list")
    @ResponseBody
    public ResponseEntity<List<ArOvertimeManagentDto>> getListOver(
            @RequestParam(required = false) String empId,
            @RequestParam(required = false) String localName,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate) {
        ArOvertimeManagentDto dto = new ArOvertimeManagentDto();
        dto.setEmpId(empId);
        dto.setLocalName(localName);
        dto.setFromDate(fromDate);
        dto.setToDate(toDate);
        return ResponseEntity.ok(service.getListOver(dto));
    }

    @GetMapping("/api/overtime/detail")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getDetail(
            @RequestParam(name = "applyNo") String applyNo,
            @RequestParam(name = "applyType", required = false) String applyType) {
        return ResponseEntity.ok(service.getDetail(applyNo, applyType));
    }

    @GetMapping("/api/overtime/detailOver")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getDetailOver(
            @RequestParam(name = "applyNo") String applyNo,
            @RequestParam(name = "applyType", required = false) String applyType) {
        return ResponseEntity.ok(service.getDetailOver(applyNo, applyType));
    }

    @GetMapping("/api/overtime/auto-fill-by-emp")
    @ResponseBody
    public ResponseEntity<ArOvertimeManagentDto> getAutoFillByEmp(
            @RequestParam(name = "personId", required = false) String personId,
            @RequestParam(name = "applyOtDate", required = false) String applyOtDate,
            @RequestParam(name = "deductYn", required = false, defaultValue = "0") String deductYn) {
        ArOvertimeManagentDto dto = new ArOvertimeManagentDto();
        dto.setPersonId(personId);
        dto.setApplyOtDate(applyOtDate);
        dto.setDeductYn(deductYn);
        return ResponseEntity.ok(service.getAutoFillOtInfo(dto));
    }

    @GetMapping("/api/overtime/affirmorsPreview")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getAffirmorsPreview(
            @RequestParam String personId) {
        Map<String, Object> result = new HashMap<>();
        try {
            List<SyAffirmEmailDto> list = affirmorService.findAffirmorList("31", personId, "", "8");
            String affirmStr = "";
            if (list != null && !list.isEmpty()) {
                StringBuilder sb = new StringBuilder();
                for (SyAffirmEmailDto dto : list) {
                    if (sb.length() > 0) sb.append(" → ");
                    sb.append(dto.getLocalName() != null ? dto.getLocalName() : "");
                }
                affirmStr = sb.toString();
            }
            result.put("affirmStr", affirmStr);
        } catch (Exception e) {
            log.error("getAffirmorsPreview overtime error personId={}", personId, e);
            result.put("affirmStr", "");
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/api/overtime/default-info")
    @ResponseBody
    public ResponseEntity<ArOvertimeManagentDto> getDefaultOtInfo(
            @RequestParam(name = "personId", required = false) String personId,
            @RequestParam(name = "applyOtDate", required = false) String applyOtDate,
            @RequestParam(name = "otFromTime", required = false) String otFromTime,
            @RequestParam(name = "otToTime", required = false) String otToTime,
            @RequestParam(name = "deductYn", required = false) String deductYn) {
        ArOvertimeManagentDto dto = new ArOvertimeManagentDto();
        dto.setPersonId(personId);
        dto.setApplyOtDate(applyOtDate);
        dto.setOtFromTime(otFromTime);
        dto.setOtToTime(otToTime);
        dto.setDeductYn(deductYn);
        return ResponseEntity.ok(service.getDefaultOtInfo(dto));
    }

    @GetMapping("/api/overtime/importTemp/list")
    @ResponseBody
    public ResponseEntity<List<ArOvertimeImportTempDto>> getImportTempList(
            @RequestParam(name = "errorOnly", required = false) String errorOnly) {
        return ResponseEntity.ok(service.getImportTempList(errorOnly));
    }

    @PostMapping("/api/overtime/importTemp/save")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> importTempToOfficial() {
        Map<String, Object> response = new HashMap<>();
        try {
            String message = service.importTempToOfficial();
            response.put("success", true);
            response.put("message", message.isBlank() ? "Luu thanh cong" : message);
        } catch (Exception e) {
            log.error("Failed to import overtime temp data", e);
            response.put("success", false);
            response.put("error", e.getMessage() == null || e.getMessage().isBlank()
                    ? "Loi he thong khi luu du lieu import."
                    : e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/overtime/saveBatch")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveBatch(@RequestBody List<ArOvertimeManagentDto> dtos, HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            service.saveBatch(dtos);
            response.put("success", true);
            response.put("message", "Lưu thành công");

            // Gửi thông tin phê duyệt lên EagleOffice chỉ cho đơn vừa lưu (best-effort)
            for (ArOvertimeManagentDto dto : dtos) {
                String savedApplyNo = dto.getApplyNo() != null ? dto.getApplyNo() : "";
                try {
                    mailSendApprovalManager.sendAffirmInfoEmailApproval(request, savedApplyNo);
                } catch (Exception eagleEx) {
                    log.warn("EagleOffice notification failed for applyNo={}: {}", savedApplyNo, eagleEx.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("Failed to save batch overtime data", e);
            response.put("success", false);
            response.put("error", e.getMessage() == null || e.getMessage().isBlank()
                    ? "Lỗi hệ thống khi lưu tăng ca."
                    : e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/overtime/over/saveBatch")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveBatchOver(@RequestBody List<ArOvertimeManagentDto> dtos, HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            service.saveBatchOver(dtos);
            response.put("success", true);
            response.put("message", "Lưu thành công");

            // Gửi thông tin phê duyệt lên EagleOffice chỉ cho đơn vừa lưu (best-effort)
            for (ArOvertimeManagentDto dto : dtos) {
                String savedApplyNo = dto.getApplyNo() != null ? dto.getApplyNo() : "";
                try {
                    mailSendApprovalManager.sendAffirmInfoEmailApproval(request, savedApplyNo);
                } catch (Exception eagleEx) {
                    log.warn("EagleOffice notification failed for applyNo={}: {}", savedApplyNo, eagleEx.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("Failed to save batch overtime-over data", e);
            response.put("success", false);
            response.put("error", e.getMessage() == null || e.getMessage().isBlank()
                    ? "Lỗi hệ thống khi lưu tăng ca vượt."
                    : e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/overtime/over/resubmit")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> resubmitOver(@RequestBody ArOvertimeManagentDto dto, HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            service.resubmitOvertimeApplyOver(dto);
            response.put("success", true);
            response.put("message", "Đã lưu lại đơn tăng ca vượt thành công");

            // Gửi thông tin phê duyệt lên EagleOffice chỉ cho đơn vừa lưu (best-effort)
            String savedApplyNo = dto.getApplyNo() != null ? dto.getApplyNo() : "";
            try {
                mailSendApprovalManager.sendAffirmInfoEmailApproval(request, savedApplyNo);
            } catch (Exception eagleEx) {
                log.warn("EagleOffice notification failed for applyNo={}: {}", savedApplyNo, eagleEx.getMessage());
            }
        } catch (Exception e) {
            log.error("Failed to resubmit overtime-over apply", e);
            response.put("success", false);
            response.put("error", e.getMessage() == null || e.getMessage().isBlank()
                    ? "Lỗi hệ thống khi lưu lại đơn tăng ca vượt."
                    : e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/overtime/over/cancel-batch")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> cancelBatchOver(@RequestBody ArOvertimeManagentDto dto, HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> result = service.cancelBatchOvertimeApplyOver(dto.getApplyNos());
            response.putAll(result);

            // Gửi thông tin hủy lên EagleOffice chỉ cho đơn vừa hủy (best-effort)
            try {
                mailSendApprovalManager.cancelMailApprovaledInfo(dto.getApplyNos());
            } catch (Exception eagleEx) {
                log.warn("EagleOffice notification failed for applyNo={}: {}", dto.getApplyNos(), eagleEx.getMessage());
            }
        } catch (Exception e) {
            log.error("Failed to batch cancel overtime-over applies", e);
            response.put("success", false);
            response.put("error", e.getMessage() == null || e.getMessage().isBlank()
                    ? "Lỗi hệ thống khi hủy đơn tăng ca vượt."
                    : e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/overtime/saveOver")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> saveOver(@RequestBody ArOvertimeManagentDto dto, HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            service.saveOver(dto);
            response.put("success", true);
            response.put("message", "Lưu thành công");
            
            // Gửi thông tin phê duyệt lên EagleOffice chỉ cho đơn vừa lưu (best-effort)
            String savedApplyNo = dto.getApplyNo() != null ? dto.getApplyNo() : "";
            try {
                mailSendApprovalManager.sendAffirmInfoEmailApproval(request, savedApplyNo);
            } catch (Exception eagleEx) {
                log.warn("EagleOffice notification failed for applyNo={}: {}", savedApplyNo, eagleEx.getMessage());
            }
        } catch (Exception e) {
            log.error("Failed to save overtime over data", e);
            response.put("success", false);
            response.put("error", e.getMessage() == null || e.getMessage().isBlank()
                    ? "Lỗi hệ thống khi lưu tăng ca vượt."
                    : e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/overtime/save")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> save(@RequestBody ArOvertimeManagentDto dto,
                                                      HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            service.save(dto);
            response.put("success", true);
            response.put("message", "Lưu thành công");

            // Gửi thông tin phê duyệt lên EagleOffice chỉ cho đơn vừa lưu (best-effort)
            String savedApplyNo = dto.getApplyNo() != null ? dto.getApplyNo() : "";
            try {
                mailSendApprovalManager.sendAffirmInfoEmailApproval(request, savedApplyNo);
            } catch (Exception eagleEx) {
                log.warn("EagleOffice notification failed for applyNo={}: {}", savedApplyNo, eagleEx.getMessage());
            }
        } catch (Exception e) {
            log.error("Failed to save overtime fast data", e);
            response.put("success", false);
            response.put("error", e.getMessage() == null || e.getMessage().isBlank()
                    ? "Lỗi hệ thống khi lưu tăng ca."
                    : e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/overtime/resubmit")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> resubmit(@RequestBody ArOvertimeManagentDto dto,
                                                          HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            service.resubmitOvertimeApply(dto);
            response.put("success", true);
            response.put("message", "Đã lưu lại đơn tăng ca thành công");

            // Gửi thông tin phê duyệt lên EagleOffice chỉ cho đơn vừa lưu (best-effort)
            String savedApplyNo = dto.getApplyNo() != null ? dto.getApplyNo() : "";
            try {
                mailSendApprovalManager.sendAffirmInfoEmailApproval(request, savedApplyNo);
            } catch (Exception eagleEx) {
                log.warn("EagleOffice notification failed for applyNo={}: {}", savedApplyNo, eagleEx.getMessage());
            }
        } catch (Exception e) {
            log.error("Failed to resubmit overtime apply", e);
            response.put("success", false);
            response.put("error", e.getMessage() == null || e.getMessage().isBlank()
                    ? "Lỗi hệ thống khi lưu lại đơn tăng ca."
                    : e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/overtime/ot-totals")
    @ResponseBody
    public ResponseEntity<ArOvertimeManagentDto> getOtTotals(
            @RequestParam(name = "personId", required = false) String personId,
            @RequestParam(name = "applyOtDate", required = false) String applyOtDate) {
        return ResponseEntity.ok(service.getOtTotals(personId, applyOtDate));
    }

    @PostMapping("/api/overtime/cancel")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> cancel(@RequestBody ArOvertimeManagentDto dto) {
        Map<String, Object> response = new HashMap<>();
        try {
            service.cancelOvertimeApply(dto.getApplyNo());
            response.put("success", true);
            response.put("message", "Hủy đơn thành công");

            // Gửi thông tin hủy lên EagleOffice chỉ cho đơn vừa hủy (best-effort)
            List<String> applyNos = Collections.singletonList(dto.getApplyNo());
            try {
                mailSendApprovalManager.cancelMailApprovaledInfo(applyNos);
            } catch (Exception eagleEx) {
                log.warn("EagleOffice notification failed for applyNo={}: {}", dto.getApplyNos(), eagleEx.getMessage());
            }
        } catch (Exception e) {
            log.error("Failed to cancel overtime apply", e);
            response.put("success", false);
            response.put("error", e.getMessage() == null || e.getMessage().isBlank()
                    ? "Lỗi hệ thống khi hủy đơn tăng ca."
                    : e.getMessage());
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/overtime/cancel-batch")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> cancelBatch(@RequestBody ArOvertimeManagentDto dto) {
        Map<String, Object> response = new HashMap<>();
        try {
            Map<String, Object> result = service.cancelBatchOvertimeApply(dto.getApplyNos());
            response.putAll(result);

            // Gửi thông tin hủy lên EagleOffice chỉ cho đơn vừa hủy (best-effort)
            try {
                mailSendApprovalManager.cancelMailApprovaledInfo(dto.getApplyNos());
            } catch (Exception eagleEx) {
                log.warn("EagleOffice notification failed for applyNo={}: {}", dto.getApplyNos(), eagleEx.getMessage());
            }
        } catch (Exception e) {
            log.error("Failed to batch cancel overtime applies", e);
            response.put("success", false);
            response.put("error", e.getMessage() == null || e.getMessage().isBlank()
                    ? "Lỗi hệ thống khi hủy đơn tăng ca."
                    : e.getMessage());
        }
        return ResponseEntity.ok(response);
    }
}
