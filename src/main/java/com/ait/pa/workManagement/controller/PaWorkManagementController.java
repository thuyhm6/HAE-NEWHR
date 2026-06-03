package com.ait.pa.workManagement.controller;

import com.ait.pa.workManagement.dto.PaEmpAccountDto;
import com.ait.pa.workManagement.dto.PaPayObjDto;
import com.ait.pa.workManagement.dto.PaPayScheduleDto;
import com.ait.pa.workManagement.dto.PaPayStubDto;
import com.ait.pa.workManagement.dto.PaWorkFlowDto;
import com.ait.pa.workManagement.dto.PaWorkFlowRecordsDto;
import com.ait.pa.workManagement.service.PaEmpAccountService;
import com.ait.pa.workManagement.service.PaPayObjService;
import com.ait.pa.workManagement.service.PaPayScheduleService;
import com.ait.pa.workManagement.service.PaPayStubService;
import com.ait.pa.workManagement.service.PaWorkFlowService;
import com.ait.sy.sys.dto.DataTablesResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/pa/workManagement")
public class PaWorkManagementController {

    private static final Logger log = LoggerFactory.getLogger(PaWorkManagementController.class);

    @Autowired
    private PaEmpAccountService paEmpAccountService;

    @Autowired
    private PaPayScheduleService paPayScheduleService;

    @Autowired
    private PaPayObjService paPayObjService;

    @Autowired
    private PaWorkFlowService paWorkFlowService;

    @Autowired
    private PaPayStubService paPayStubService;

    @GetMapping("/viewPaPaySchedule")
    public String viewPaPaySchedule() {
        return "pa/workManagement/viewPaPaySchedule";
    }

    @GetMapping("/viewPaPayObj")
    public String viewPaPayObj() {
        return "pa/workManagement/viewPaPayObj";
    }

    @GetMapping("/viewPaWorkFlow")
    public String viewPaWorkFlow() {
        return "pa/workManagement/viewPaWorkFlow";
    }

    @GetMapping("/viewPaEmpAccount")
    public String viewPaEmpAccount() {
        return "pa/workManagement/viewPaEmpAccount";
    }

    @GetMapping("/payStub")
    public String payStub() {
        return "pa/workManagement/payStub";
    }

    // ── API Phiếu lương ────────────────────────────────────────────────────────

    @GetMapping("/api/payStub/load")
    @ResponseBody
    public ResponseEntity<?> loadPayStubs(
            @RequestParam(required = false) String payScheduleNo,
            @RequestParam(required = false) String deptNos,
            @RequestParam(required = false) String empSearch,
            @RequestParam(required = false) String empOffice,
            @RequestParam(required = false) String lang) {
        try {
            if (payScheduleNo == null || payScheduleNo.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Vui lòng chọn kế hoạch trả lương!"));
            }
            PaPayStubDto params = new PaPayStubDto();
            params.setPayScheduleNo(payScheduleNo);
            params.setDeptNos(deptNos);
            params.setEmpSearch(empSearch);
            params.setEmpOfficeCond(empOffice);
            List<PaPayStubDto> result = paPayStubService.loadPayStubs(params, lang);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Lỗi khi tải phiếu lương payScheduleNo={}: {}", payScheduleNo, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // ── API Tài khoản lương nhân viên ──────────────────────────────────────────

    @GetMapping("/api/empAccount/list")
    @ResponseBody
    public ResponseEntity<?> getEmpAccountList(
            @RequestParam(required = false) String empSearch,
            @RequestParam(required = false) String deptNos,
            @RequestParam(required = false) String empOfficeSearch,
            @RequestParam(required = false) String bankSearch,
            @RequestParam(required = false) String fromDateStarted,
            @RequestParam(required = false) String toDateStarted,
            @RequestParam(defaultValue = "1") int draw,
            @RequestParam(defaultValue = "0") int start,
            @RequestParam(defaultValue = "20") int length) {
        try {
            PaEmpAccountDto params = new PaEmpAccountDto();
            params.setEmpSearch(empSearch);
            params.setDeptNos(deptNos);
            params.setEmpOfficeSearch(empOfficeSearch);
            params.setBankSearch(bankSearch);
            params.setFromDateStarted(fromDateStarted);
            params.setToDateStarted(toDateStarted);
            params.setDraw(draw);
            params.setStart(start);
            params.setLength(length > 0 ? length : 20);
            DataTablesResponse<PaEmpAccountDto> result = paEmpAccountService.getPagedList(params);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách tài khoản lương nhân viên: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(new DataTablesResponse<>(draw, e.getMessage()));
        }
    }

    @GetMapping("/api/empAccount/{paEmpAccountNo}")
    @ResponseBody
    public ResponseEntity<?> getEmpAccountOne(@PathVariable Long paEmpAccountNo) {
        try {
            PaEmpAccountDto dto = paEmpAccountService.getOne(paEmpAccountNo);
            if (dto == null) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Lỗi khi lấy chi tiết PA_EMP_ACCOUNT no={}: {}", paEmpAccountNo, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/api/empAccount/save")
    @ResponseBody
    public ResponseEntity<?> saveEmpAccount(@RequestBody PaEmpAccountDto dto) {
        try {
            if (dto.getPersonId() == null || dto.getPersonId().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Vui lòng chọn nhân viên!"));
            }
            paEmpAccountService.save(dto);
            String msg = dto.getPaEmpAccountNo() == null ? "Thêm mới thành công" : "Cập nhật thành công";
            return ResponseEntity.ok(Map.of("success", true, "message", msg));
        } catch (Exception e) {
            log.error("Lỗi khi lưu PA_EMP_ACCOUNT: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/api/empAccount/deleteList")
    @ResponseBody
    public ResponseEntity<?> deleteEmpAccountList(@RequestBody List<Long> ids) {
        try {
            if (ids == null || ids.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Vui lòng chọn ít nhất một bản ghi!"));
            }
            paEmpAccountService.deleteList(ids);
            return ResponseEntity.ok(Map.of("success", true, "message", "Xóa thành công " + ids.size() + " bản ghi"));
        } catch (Exception e) {
            log.error("Lỗi khi xóa danh sách PA_EMP_ACCOUNT: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // ── API Quy trình tính lương ────────────────────────────────────────────

    @GetMapping("/api/workFlow")
    @ResponseBody
    public ResponseEntity<?> getWorkFlow(@RequestParam(required = false) String payScheduleNo) {
        try {
            if (payScheduleNo == null || payScheduleNo.isEmpty()) {
                return ResponseEntity.ok(null);
            }
            PaWorkFlowDto dto = paWorkFlowService.getWorkFlow(payScheduleNo);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Lỗi khi lấy quy trình tính lương payScheduleNo={}: {}", payScheduleNo, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/api/workFlow/records")
    @ResponseBody
    public ResponseEntity<?> getWorkFlowRecords(
            @RequestParam(required = false) String payScheduleNo,
            @RequestParam(required = false) Integer flowStep) {
        try {
            if (payScheduleNo == null || payScheduleNo.isEmpty()) {
                return ResponseEntity.ok(List.of());
            }
            List<PaWorkFlowRecordsDto> list = paWorkFlowService.getRecordList(payScheduleNo, flowStep);
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            log.error("Lỗi khi lấy lịch sử thao tác payScheduleNo={}: {}", payScheduleNo, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/api/workFlow/execute")
    @ResponseBody
    public ResponseEntity<?> executeWorkFlow(@RequestBody PaWorkFlowDto dto) {
        try {
            if (dto.getPayScheduleNo() == null || dto.getPayScheduleNo().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Vui lòng chọn kế hoạch trả lương!"));
            }
            if (dto.getType() == null || dto.getType().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Thiếu tham số type!"));
            }
            String message = paWorkFlowService.modifyWorkFlow(dto.getPayScheduleNo(), dto.getType());
            return ResponseEntity.ok(Map.of("success", true, "message", message != null ? message : "Thực hiện thành công"));
        } catch (Exception e) {
            log.error("Lỗi khi thực hiện quy trình lương payScheduleNo={}, type={}: {}", dto.getPayScheduleNo(), dto.getType(), e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // ── API Kế hoạch trả lương ──────────────────────────────────────────────

    @GetMapping("/api/paySchedule")
    @ResponseBody
    public ResponseEntity<?> getPayScheduleList(
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) String salaryDistinNo) {
        try {
            PaPayScheduleDto params = new PaPayScheduleDto();
            params.setFromDate(fromDate);
            params.setToDate(toDate);
            params.setSalaryDistinNo(salaryDistinNo);
            List<PaPayScheduleDto> list = paPayScheduleService.getList(params);
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách kế hoạch trả lương: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/api/paySchedule/{payScheduleNo}")
    @ResponseBody
    public ResponseEntity<?> getPayScheduleDetail(@PathVariable String payScheduleNo) {
        try {
            PaPayScheduleDto dto = paPayScheduleService.getOne(payScheduleNo);
            if (dto == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Lỗi khi lấy chi tiết kế hoạch trả lương {}: {}", payScheduleNo, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/api/paySchedule/save")
    @ResponseBody
    public ResponseEntity<?> savePaySchedule(@RequestBody PaPayScheduleDto dto) {
        try {
            paPayScheduleService.save(dto);
            String msg = (dto.getPayScheduleNo() == null || dto.getPayScheduleNo().isEmpty())
                    ? "Thêm mới thành công"
                    : "Cập nhật thành công";
            return ResponseEntity.ok(Map.of("success", true, "message", msg));
        } catch (Exception e) {
            log.error("Lỗi khi lưu kế hoạch trả lương: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/api/paySchedule/delete/{payScheduleNo}")
    @ResponseBody
    public ResponseEntity<?> deletePaySchedule(@PathVariable String payScheduleNo) {
        try {
            paPayScheduleService.delete(payScheduleNo);
            return ResponseEntity.ok(Map.of("success", true, "message", "Xóa thành công"));
        } catch (Exception e) {
            log.error("Lỗi khi xóa kế hoạch trả lương {}: {}", payScheduleNo, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // ── API Đối tượng nhận lương ────────────────────────────────────────────

    @GetMapping("/api/payObj")
    @ResponseBody
    public ResponseEntity<?> getPayObjList(
            @RequestParam(required = false) String empSearch,
            @RequestParam(required = false) String payScheduleNo,
            @RequestParam(required = false) String includeType,
            @RequestParam(required = false) String empOffice,
            @RequestParam(defaultValue = "1") int draw,
            @RequestParam(defaultValue = "0") int start,
            @RequestParam(defaultValue = "20") int length) {
        try {
            PaPayObjDto params = new PaPayObjDto();
            params.setEmpSearch(empSearch);
            params.setPayScheduleNo(payScheduleNo);
            if (includeType != null && !includeType.isEmpty()) {
                params.setIncludeType(Integer.parseInt(includeType));
            }
            params.setEmpOfficeCond(empOffice);
            params.setDraw(draw);
            params.setStart(start);
            params.setLength(length > 0 ? length : 20);
            DataTablesResponse<PaPayObjDto> result = paPayObjService.getPagedList(params);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách đối tượng nhận lương: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(new DataTablesResponse<>(draw, e.getMessage()));
        }
    }

    @GetMapping("/api/payObj/findEmployee")
    @ResponseBody
    public ResponseEntity<?> findEmployee(@RequestParam String empId) {
        try {
            PaPayObjDto emp = paPayObjService.findEmployee(empId);
            if (emp == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(emp);
        } catch (Exception e) {
            log.error("Lỗi khi tìm nhân viên empId={}: {}", empId, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/api/payObj/save")
    @ResponseBody
    public ResponseEntity<?> savePayObj(@RequestBody PaPayObjDto dto) {
        try {
            paPayObjService.save(dto);
            return ResponseEntity.ok(Map.of("success", true, "message", "Thêm mới thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Lỗi khi thêm mới đối tượng nhận lương: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/api/payObj/saveList")
    @ResponseBody
    public ResponseEntity<?> savePayObjList(@RequestBody List<PaPayObjDto> items) {
        try {
            paPayObjService.saveList(items);
            return ResponseEntity.ok(Map.of("success", true, "message", "Lưu thành công " + items.size() + " bản ghi"));
        } catch (Exception e) {
            log.error("Lỗi khi lưu danh sách đối tượng nhận lương: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/api/payObj/deleteList")
    @ResponseBody
    public ResponseEntity<?> deletePayObjList(@RequestBody List<PaPayObjDto> keys) {
        try {
            paPayObjService.deleteList(keys);
            return ResponseEntity.ok(Map.of("success", true, "message", "Xóa thành công " + keys.size() + " bản ghi"));
        } catch (Exception e) {
            log.error("Lỗi khi xóa danh sách đối tượng nhận lương: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
