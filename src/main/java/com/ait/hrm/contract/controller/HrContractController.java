package com.ait.hrm.contract.controller;

import com.ait.hrm.contract.model.HrContract;
import com.ait.hrm.contract.service.HrContractService;
import com.ait.sy.sys.dto.DataTablesRequest;
import com.ait.sy.sys.dto.DataTablesResponse;
import com.ait.sy.sys.service.HrAuthenticationService.HrUserInfo;
import com.ait.util.DataTablesSearchUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;

/**
 * Controller for HR Contract management
 * Handles contract CRUD operations and views
 */
@Controller
@RequestMapping("/hrm/contractInfo")
public class HrContractController {
    private static final Logger log = LoggerFactory.getLogger(HrContractController.class);

    @Autowired
    private HrContractService hrContractService;

    /**
     * Display contract list page
     */
    @GetMapping("/viewNOContractInfo")
    public String viewNOContractInfo(Model model, HttpSession session) {
        // Check authentication
        HrUserInfo currentHrUser = getAuthenticatedUser(session);

        model.addAttribute("currentHrUser", currentHrUser);
        return "hrm/contract/viewNOContractInfo";
    }

    /**
     * Display expired contract list page for extension
     */
    @GetMapping("/viewExpiredContract")
    public String viewExpiredContract(Model model, HttpSession session) {
        // Check authentication
        HrUserInfo currentHrUser = getAuthenticatedUser(session);

        model.addAttribute("currentHrUser", currentHrUser);
        return "hrm/contract/viewExpiredContract";
    }

    /**
     * Display contract search page
     */
    @GetMapping("/viewContractInfoForSearch")
    public String viewContractInfoForSearch(Model model, HttpSession session) {
        // Check authentication
        HrUserInfo currentHrUser = getAuthenticatedUser(session);

        model.addAttribute("currentHrUser", currentHrUser);
        return "hrm/contract/viewContractInfoForSearch";
    }

    /**
     * API endpoint cho DataTables server-side processing
     * Lấy danh sách hợp đồng với tìm kiếm, sắp xếp và phân trang
     */
    @PostMapping("/contracts")
    public ResponseEntity<DataTablesResponse<HrContract>> getContracts(
            @RequestBody DataTablesRequest request,
            HttpSession session) {

        // Kiểm tra authentication
        HrUserInfo currentHrUser = getAuthenticatedUser(session); // Will throw exception if null

        try {
            log.debug("Processing contract DataTables request for user={}", currentHrUser.getUsername());
            DataTablesResponse<HrContract> response = hrContractService.getContractsForDataTables(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to process contract DataTables request for user={}", currentHrUser.getUsername(), e);
            DataTablesResponse<HrContract> errorResponse = new DataTablesResponse<>();
            errorResponse.setDraw(request.getDraw());
            errorResponse.setError("Loi he thong khi tai du lieu hop dong.");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Get contract by contract number
     */
    @GetMapping("/api/contract/{contractNo}")
    @ResponseBody
    public ResponseEntity<?> getContract(@PathVariable String contractNo, HttpSession session) {
        getAuthenticatedUser(session);
        try {
            HrContract contract = hrContractService.getContractByContractNo(contractNo);
            if (contract == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Không tìm thấy hợp đồng"));
            }
            return ResponseEntity.ok(contract);
        } catch (Exception e) {
            log.error("Failed to get contract contractNo={}", contractNo, e);
            return ResponseEntity.status(500).body(Map.of("error", "Loi he thong. Vui long thu lai."));
        }
    }

    /**
     * Add new contract
     */
    @PostMapping("/api/contract/add")
    @ResponseBody
    public ResponseEntity<?> addContract(@RequestBody HrContract contract, HttpSession session) {
        // Check authentication
        HrUserInfo currentHrUser = getAuthenticatedUser(session);

        try {
            // Validate contract data
            String validationError = hrContractService.validateContract(contract);
            if (validationError != null) {
                return ResponseEntity.badRequest().body(Map.of("error", validationError));
            }

            // Check if contract number already exists
            if (hrContractService.isContractNoExists(contract.getContractNo())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Số hợp đồng đã tồn tại"));
            }

            // Set audit fields
            contract.setCreatedBy(currentHrUser.getUsername());
            contract.setUpdatedBy(currentHrUser.getUsername());
            contract.setCreatedIp(getClientIpAddress(session));
            contract.setUpdatedIp(getClientIpAddress(session));

            // Add contract
            boolean success = hrContractService.addContract(contract);
            if (success) {
                return ResponseEntity.ok(Map.of("message", "Thêm hợp đồng thành công", "contract", contract));
            } else {
                return ResponseEntity.status(500).body(Map.of("error", "Không thể thêm hợp đồng"));
            }
        } catch (Exception e) {
            log.error("Failed to add contract contractNo={}", contract.getContractNo(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Loi he thong. Vui long thu lai."));
        }
    }

    /**
     * Update contract
     */
    @PostMapping("/api/contract/update")
    @ResponseBody
    public ResponseEntity<?> updateContract(@RequestBody HrContract contract, HttpSession session) {
        // Check authentication
        HrUserInfo currentHrUser = getAuthenticatedUser(session);

        try {
            // Validate contract data
            String validationError = hrContractService.validateContract(contract);
            if (validationError != null) {
                return ResponseEntity.badRequest().body(Map.of("error", validationError));
            }

            // Check if contract exists
            HrContract existingContract = hrContractService.getContractByContractNo(contract.getContractNo());
            if (existingContract == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Không tìm thấy hợp đồng"));
            }

            // Set audit fields
            contract.setUpdatedBy(currentHrUser.getUsername());
            contract.setUpdatedIp(getClientIpAddress(session));

            // Update contract
            boolean success = hrContractService.updateContract(contract);
            if (success) {
                return ResponseEntity.ok(Map.of("message", "Cập nhật hợp đồng thành công", "contract", contract));
            } else {
                return ResponseEntity.status(500).body(Map.of("error", "Không thể cập nhật hợp đồng"));
            }
        } catch (Exception e) {
            log.error("Failed to update contract contractNo={}", contract.getContractNo(), e);
            return ResponseEntity.status(500).body(Map.of("error", "Loi he thong. Vui long thu lai."));
        }
    }

    /**
     * Delete contract
     */
    @DeleteMapping("/api/contract/delete/{contractNo}")
    @ResponseBody
    public ResponseEntity<?> deleteContract(@PathVariable String contractNo, HttpSession session) {
        // Check authentication
        getAuthenticatedUser(session);

        try {
            // Check if contract exists
            HrContract existingContract = hrContractService.getContractByContractNo(contractNo);
            if (existingContract == null) {
                return ResponseEntity.status(404).body(Map.of("error", "Không tìm thấy hợp đồng"));
            }

            // Delete contract
            boolean success = hrContractService.deleteContract(contractNo);
            if (success) {
                return ResponseEntity.ok(Map.of("message", "Xóa hợp đồng thành công"));
            } else {
                return ResponseEntity.status(500).body(Map.of("error", "Không thể xóa hợp đồng"));
            }
        } catch (Exception e) {
            log.error("Failed to delete contract contractNo={}", contractNo, e);
            return ResponseEntity.status(500).body(Map.of("error", "Loi he thong. Vui long thu lai."));
        }
    }

    /**
     * Export contracts to CSV
     */
    @GetMapping("/export")
    public void exportContracts(
            @RequestParam(required = false) String contractNo,
            @RequestParam(required = false) String personId,
            @RequestParam(required = false) String contractType,
            @RequestParam(required = false) String deptNo,
            @RequestParam(required = false) String workPosition,
            @RequestParam(required = false) String startDateFrom,
            @RequestParam(required = false) String startDateTo,
            @RequestParam(required = false) String endDateFrom,
            @RequestParam(required = false) String endDateTo,
            @RequestParam(required = false) String activity,
            @RequestParam(required = false) String salaryFrom,
            @RequestParam(required = false) String salaryTo,
            HttpSession session,
            HttpServletResponse response) throws IOException {

        getAuthenticatedUser(session);

        try {
            // Create search request using utility class
            DataTablesRequest searchRequest = new DataTablesRequest();
            DataTablesSearchUtil.addContractSearchParams(searchRequest,
                    contractNo, personId, contractType, workPosition,
                    startDateFrom, startDateTo, endDateFrom, endDateTo,
                    activity, salaryFrom, salaryTo);
            DataTablesSearchUtil.addSearchParam(searchRequest, "deptNo", deptNo);

            // Get contracts for export
            List<HrContract> contracts = hrContractService.getContractsForExport(searchRequest);

            // Set response headers for CSV
            response.setContentType("text/csv; charset=UTF-8");
            response.setHeader("Content-Disposition", "attachment; filename=contracts_export.csv");
            response.setCharacterEncoding("UTF-8");

            // Write CSV content
            PrintWriter writer = response.getWriter();

            // Write BOM for UTF-8
            writer.write('\ufeff');

            // Write CSV header
            writer.println(
                    "Số hợp đồng,Tên hợp đồng,Mã nhân viên,Tên nhân viên,Loại hợp đồng,Ngày bắt đầu,Ngày kết thúc,Phòng ban,Vị trí,Lương,Hoạt động,Ngày tạo");

            // Write data rows
            for (HrContract contract : contracts) {
                writer.println(String.format("%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s",
                        escapeCsv(contract.getContractNo()),
                        escapeCsv(contract.getContractName()),
                        escapeCsv(contract.getPersonId()),
                        escapeCsv(contract.getLocalName()),
                        escapeCsv(contract.getContractType()),
                        contract.getStartContractDate() != null ? contract.getStartContractDate().toString() : "",
                        contract.getEndContractDate() != null ? contract.getEndContractDate().toString() : "",
                        escapeCsv(contract.getDeptNo()),
                        escapeCsv(contract.getWorkPosition()),
                        contract.getSalary() != null ? contract.getSalary().toString() : "",
                        escapeCsv(contract.getActivity()),
                        contract.getCreateDate() != null ? contract.getCreateDate().toString() : ""));
            }

            writer.flush();
            writer.close();

        } catch (Exception e) {
            log.error("Failed to export contracts", e);
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Loi he thong khi xuat du lieu hop dong.");
        }
    }

    /**
     * Escape CSV field values
     */
    private String escapeCsv(String value) {
        if (value == null) {
            return "";
        }
        if (isPotentialFormula(value)) {
            value = "'" + value;
        }
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }

    private boolean isPotentialFormula(String value) {
        if (value.isEmpty()) {
            return false;
        }
        char firstChar = value.charAt(0);
        return firstChar == '=' || firstChar == '+' || firstChar == '-' || firstChar == '@';
    }

    /**
     * Get client IP address
     */
    /**
     * Helper method to get authenticated user or throw exception
     */
    private HrUserInfo getAuthenticatedUser(HttpSession session) {
        HrUserInfo user = (HrUserInfo) session.getAttribute("currentHrUser");
        if (user == null) {
            throw new UnauthenticatedException();
        }
        return user;
    }

    /**
     * Custom exception for unauthenticated access
     */
    private static class UnauthenticatedException extends RuntimeException {
    }

    /**
     * Exception handler for unauthenticated access
     */
    @ExceptionHandler(UnauthenticatedException.class)
    public Object handleUnauthenticatedException(HttpServletRequest request, HttpServletResponse response) {
        String xRequestedWith = request.getHeader("X-Requested-With");

        // If AJAX request, return 401 JSON
        if ("XMLHttpRequest".equals(xRequestedWith)) {
            // Check if it's a DataTables request (implied by context often, or just return
            // generic JSON)
            // For DataTables, it expects a specific JSON format on error usually, relying
            // on 'error' field
            // But standard 401 with JSON body works if frontend handles it.
            // Our frontend DataTables error handler: showError('Lỗi khi tải dữ liệu: ' +
            // (xhr.responseJSON?.error || thrown));
            // So we return a map with "error".
            return ResponseEntity.status(401).body(Map.of("error", "Vui lòng đăng nhập lại"));
        }

        // Ensure response is not committed for redirect
        if (!response.isCommitted()) {
            return "redirect:/login";
        }
        return null; // Should not happen often
    }

    /**
     * Get client IP address
     */
    private String getClientIpAddress(HttpSession session) {
        // This is a simplified implementation
        // In a real application, you would get the actual client IP
        return "127.0.0.1";
    }
}
