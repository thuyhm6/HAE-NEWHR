package com.ait.hrm.empinfo.controller;

import com.ait.hrm.empinfo.dto.EmployeeSearchResponse;
import com.ait.hrm.empinfo.dto.HrExpInsideDto;
import com.ait.hrm.empinfo.dto.PhotoImportResultDto;
import com.ait.hrm.empinfo.model.HrAddressMatters;
import com.ait.hrm.empinfo.model.HrEducation;
import com.ait.hrm.empinfo.model.HrEmergencyAddress;
import com.ait.hrm.empinfo.model.HrFamily;
import com.ait.hrm.empinfo.model.HrPersonalInfo;
import com.ait.hrm.empinfo.model.HrPunishment;
import com.ait.hrm.empinfo.model.HrReward;
import com.ait.hrm.empinfo.model.HrSpecialMatter;
import com.ait.hrm.empinfo.service.HrAddressMattersService;
import com.ait.hrm.empinfo.service.HrEducationService;
import com.ait.hrm.empinfo.service.HrEmergencyAddressService;
import com.ait.hrm.empinfo.service.HrEmployeeService;
import com.ait.hrm.empinfo.service.HrFamilyService;
import com.ait.hrm.empinfo.service.HrPersonalInfoService;
import com.ait.hrm.empinfo.service.HrExpInsideService;
import com.ait.hrm.empinfo.service.HrPhotoImportService;
import com.ait.hrm.empinfo.service.HrPunishmentService;
import com.ait.hrm.empinfo.service.HrRewardService;
import com.ait.hrm.empinfo.service.HrSpecialMatterService;
import com.ait.sy.sys.dto.DataTablesRequest;
import com.ait.sy.sys.dto.DataTablesResponse;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import jakarta.servlet.http.HttpServletResponse;
import com.ait.sy.sys.service.PermissionService;
import com.ait.sy.sys.service.HrAuthenticationService.HrUserInfo;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;

import jakarta.servlet.http.HttpSession;
import java.util.List;

@Controller
@RequestMapping("/hrm/empinfo")
public class HrEmpinfoController {
    private static final Logger log = LoggerFactory.getLogger(HrEmpinfoController.class);

    @Autowired
    private HrSpecialMatterService hrSpecialMatterService;

    @Autowired
    private HrPersonalInfoService hrPersonalInfoService;

    @Autowired
    private HrEmployeeService hrEmployeeService;

    @Autowired
    private com.ait.hrm.empinfo.service.HrWorkExperienceService hrWorkExperienceService;

    @Autowired
    private HrEducationService hrEducationService;

    @Autowired
    private HrAddressMattersService hrAddressMattersService;

    @Autowired
    private HrFamilyService hrFamilyService;

    @Autowired
    private HrEmergencyAddressService hrEmergencyAddressService;

    @Autowired
    private HrRewardService hrRewardService;

    @Autowired
    private HrPunishmentService hrPunishmentService;

    @Autowired
    private com.ait.hrm.empinfo.service.HrQualificationService hrQualificationService;

    @Autowired
    private HrPhotoImportService hrPhotoImportService;

    @Autowired
    private HrExpInsideService hrExpInsideService;

    /**
     * Trang xem thông tin cá nhân nhân viên
     */
    @GetMapping("/viewPersonalInfo")
    public String viewPersonalInfo(Model model, HttpSession session) {
        // Lấy thông tin user từ session (đã được kiểm tra bởi interceptor)
        HrUserInfo currentHrUser = (HrUserInfo) session.getAttribute("currentHrUser");
        PermissionService.UserPermissionInfo permissionInfo = (PermissionService.UserPermissionInfo) session
                .getAttribute("currentPermissionInfo");

        // Lấy thông tin personal info chi tiết
        HrPersonalInfo personalInfo = hrPersonalInfoService.getPersonalInfoFromHrUserInfo(currentHrUser);

        model.addAttribute("currentHrUser", currentHrUser);
        model.addAttribute("permissionInfo", permissionInfo);
        model.addAttribute("personalInfo", personalInfo);
        model.addAttribute("title", "Hồ sơ nhân viên - HR System");

        return "hrm/empinfo/viewPersonalInfo";
    }

    /**
     * Hiển thị danh sách nhân viên nữ với DataTables
     */
    @GetMapping("/viewTempEmpInfoList")
    public String viewTempEmpInfoList(Model model, HttpSession session) {
        // Lấy thông tin user từ session
        HrUserInfo currentHrUser = (HrUserInfo) session.getAttribute("currentHrUser");
        model.addAttribute("currentHrUser", currentHrUser);
        model.addAttribute("title", "Quản lý nhân viên nữ");

        return "hrm/empinfo/viewTempEmpInfoList";
    }

    /**
     * Xuất kết quả tìm kiếm nhân viên nữ
     */
    @GetMapping("/export")
    public String exportFemaleEmployees(
            @RequestParam(value = "localName", required = false) String localName,
            @RequestParam(value = "empId", required = false) String empId,
            @RequestParam(value = "deptNo", required = false) String deptNo,
            @RequestParam(value = "position", required = false) String position,
            @RequestParam(value = "createDateFrom", required = false) String createDateFrom,
            @RequestParam(value = "createDateTo", required = false) String createDateTo,
            @RequestParam(value = "activity", required = false) String activity,
            @RequestParam(value = "otFlag", required = false) String otFlag,
            Model model, HttpSession session) {

        // Lấy thông tin user từ session
        HrUserInfo currentHrUser = (HrUserInfo) session.getAttribute("currentHrUser");
        if (currentHrUser == null) {
            return "redirect:/login";
        }

        try {
            // Lấy dữ liệu với điều kiện tìm kiếm
            List<HrSpecialMatter> employees = hrSpecialMatterService.searchFemaleEmployeesWithConditions(
                    localName, empId, deptNo, position, createDateFrom, createDateTo, activity, otFlag);

            model.addAttribute("employees", employees);
            model.addAttribute("searchParams", java.util.Map.of(
                    "localName", localName != null ? localName : "",
                    "empId", empId != null ? empId : "",
                    "deptNo", deptNo != null ? deptNo : "",
                    "position", position != null ? position : "",
                    "createDateFrom", createDateFrom != null ? createDateFrom : "",
                    "createDateTo", createDateTo != null ? createDateTo : "",
                    "activity", activity != null ? activity : "",
                    "otFlag", otFlag != null ? otFlag : ""));
            model.addAttribute("exportDate", java.time.LocalDateTime.now());
            model.addAttribute("title", "Xuất danh sách nhân viên nữ");

            return "hrm/empinfo/exportFemaleEmployees";
        } catch (Exception e) {
            model.addAttribute("error", "Loi he thong khi xu ly du lieu.");
            return "hrm/empinfo/tempEmpInfoList";
        }
    }

    /**
     * API lấy thông tin chi tiết nhân viên theo specialNo
     */
    @GetMapping("/specialMatter/{specialNo}")
    @ResponseBody
    public ResponseEntity<?> getSpecialMatterById(@PathVariable String specialNo, HttpSession session) {

        try {
            HrSpecialMatter employee = hrSpecialMatterService.getSpecialMatterById(specialNo);
            if (employee == null) {
                return ResponseEntity.status(404).body("Không tìm thấy thông tin");
            }
            return ResponseEntity.ok(employee);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Loi he thong. Vui long thu lai.");
        }
    }

    /**
     * API cập nhật thông tin nhân viên
     */
    @PostMapping("/specialMatter/update")
    @ResponseBody
    public ResponseEntity<?> updateSpecialMatter(@RequestBody HrSpecialMatter employee, HttpSession session) {

        try {
            // Cập nhật thông tin người cập nhật (handled by Mapper)

            // Gọi service để cập nhật
            boolean success = hrSpecialMatterService.updateSpecialMatter(employee);

            if (success) {
                return ResponseEntity.ok("Cập nhật thành công");
            } else {
                return ResponseEntity.status(500).body("Cập nhật thất bại");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Loi he thong. Vui long thu lai.");
        }
    }

    @PostMapping("/specialMatter/add")
    @ResponseBody
    public ResponseEntity<?> addSpecialMatter(@RequestBody HrSpecialMatter employee, HttpSession session) {

        try {
            // Set thông tin người tạo (handled by Mapper)

            // Gọi service để thêm mới
            boolean success = hrSpecialMatterService.addSpecialMatter(employee);

            if (success) {
                return ResponseEntity.ok("Thêm mới thành công");
            } else {
                return ResponseEntity.badRequest().body("Thêm mới thất bại");
            }
        } catch (Exception e) {
            log.error("Error adding employee: ", e);
            
            return ResponseEntity.status(500).body("Loi he thong. Vui long thu lai.");
        }
    }

    @DeleteMapping("/specialMatter/delete/{specialNo}")
    @ResponseBody
    public ResponseEntity<?> deleteSpecialMatter(@PathVariable String specialNo) {
        try {
            // Gọi service để xóa
            boolean success = hrSpecialMatterService.deleteSpecialMatter(specialNo);

            if (success) {
                return ResponseEntity.ok("Xóa thành công");
            } else {
                return ResponseEntity.badRequest().body("Xóa thất bại - Không tìm thấy thông tin");
            }
        } catch (Exception e) {
            log.error("Error deleting employee: ", e);
            
            return ResponseEntity.status(500).body("Loi he thong. Vui long thu lai.");
        }
    }

    @GetMapping("/api/employee/search")
    @ResponseBody
    public ResponseEntity<?> searchEmployees(@RequestParam(required = false) String empId,
            @RequestParam(required = false) String localName,
            @RequestParam(required = false) String deptNo,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) List<String> deptCodes,
            @RequestParam(required = false) String empOffice) {
        try {
            List<EmployeeSearchResponse> employees = hrEmployeeService.searchEmployees(empId, localName, deptNo, keyword, deptCodes, empOffice);
            return ResponseEntity.ok(employees);
        } catch (Exception e) {
            log.error("Error searching employees: ", e);
            return ResponseEntity.status(500).body("Loi he thong. Vui long thu lai.");
        }
    }

    /**
     * API endpoint cho DataTables server-side processing
     * Lấy danh sách nhân viên nữ với tìm kiếm, sắp xếp và phân trang
     */
    @PostMapping("/female-employees")
    public ResponseEntity<DataTablesResponse<HrSpecialMatter>> getFemaleEmployees(
            @RequestBody DataTablesRequest request,
            HttpSession session) {


        // Log search parameters from form
        if (request.getSearchParams() != null) {
        }

        // Kiểm tra authentication
        HrUserInfo currentHrUser = (HrUserInfo) session.getAttribute("currentHrUser");
        if (currentHrUser == null) {
            DataTablesResponse<HrSpecialMatter> errorResponse = new DataTablesResponse<>();
            errorResponse.setDraw(request.getDraw());
            errorResponse.setError("Chưa đăng nhập");
            return ResponseEntity.status(401).body(errorResponse);
        }

        try {
            DataTablesResponse<HrSpecialMatter> response = hrSpecialMatterService
                    .getFemaleEmployeesForDataTables(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error processing DataTables request: ", e);
            
            DataTablesResponse<HrSpecialMatter> errorResponse = new DataTablesResponse<>();
            errorResponse.setDraw(request.getDraw());
            errorResponse.setError("Loi he thong khi xu ly du lieu nhan vien.");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Trang xem thông tin công việc (kinh nghiệm làm việc)
     */
    @GetMapping("/viewWorkInformation")
    public String viewWorkInformation(Model model, HttpSession session) {
        HrUserInfo currentHrUser = (HrUserInfo) session.getAttribute("currentHrUser");
        model.addAttribute("currentHrUser", currentHrUser);
        model.addAttribute("title", "Thông tin công việc");
        return "hrm/empinfo/viewWorkInformation";
    }

    /**
     * API tìm kiếm thông tin kinh nghiệm làm việc
     */
    @GetMapping("/api/work-experience")
    @ResponseBody
    public ResponseEntity<List<com.ait.hrm.empinfo.model.HrWorkExperience>> searchWorkExperience(
            @RequestParam(required = false) String empId,
            @RequestParam(required = false) String localName,
            @RequestParam(required = false) String companyName) {
        try {
            return ResponseEntity.ok(hrWorkExperienceService.searchWorkExperience(empId, localName, companyName));
        } catch (Exception e) {
            
            return ResponseEntity.status(500).body(null);
        }
    }

    /**
     * API thêm mới hoặc cập nhật thông tin kinh nghiệm làm việc
     */
    @PostMapping("/api/work-experience/save")
    @ResponseBody
    public ResponseEntity<?> saveWorkExperience(@RequestBody com.ait.hrm.empinfo.model.HrWorkExperience info) {
        try {
            boolean isNew = info.getWorkExpNo() == null;
            if (hrWorkExperienceService.saveWorkExperience(info, isNew)) {
                java.util.Map<String, String> response = new java.util.HashMap<>();
                response.put("message", isNew ? "Thêm mới thành công" : "Cập nhật thành công");
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(500).body(java.util.Collections.singletonMap("error", "Lưu thất bại"));
            }
        } catch (Exception e) {
            
            return ResponseEntity.status(500)
                    .body(java.util.Collections.singletonMap("error", "Loi he thong. Vui long thu lai."));
        }
    }

    /**
     * API xóa thông tin kinh nghiệm làm việc
     */
    @DeleteMapping("/api/work-experience/delete/{workExpNo}")
    @ResponseBody
    public ResponseEntity<?> deleteWorkExperience(@PathVariable Long workExpNo) {
        try {
            if (hrWorkExperienceService.deleteWorkExperience(workExpNo)) {
                return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Xóa thành công"));
            } else {
                return ResponseEntity.status(500).body(java.util.Collections.singletonMap("error", "Xóa thất bại"));
            }
        } catch (Exception e) {
            
            return ResponseEntity.status(500)
                    .body(java.util.Collections.singletonMap("error", "Loi he thong. Vui long thu lai."));
        }
    }

    /**
     * API lấy chi tiết thông tin kinh nghiệm làm việc
     */
    @GetMapping("/api/work-experience/{workExpNo}")
    @ResponseBody
    public ResponseEntity<?> getWorkExperience(@PathVariable Long workExpNo) {
        try {
            com.ait.hrm.empinfo.model.HrWorkExperience info = hrWorkExperienceService.getById(workExpNo);
            if (info != null) {
                return ResponseEntity.ok(info);
            } else {
                return ResponseEntity.status(404).body("Không tìm thấy thông tin");
            }
        } catch (Exception e) {
            
            return ResponseEntity.status(500).body("Loi he thong. Vui long thu lai.");
        }
    }

    /**
     * Trang tìm kiếm quá trình học tập
     */
    @GetMapping("/educationSearch")
    public String viewEducationSearch(Model model, HttpSession session) {
        HrUserInfo currentHrUser = (HrUserInfo) session.getAttribute("currentHrUser");
        model.addAttribute("currentHrUser", currentHrUser);
        model.addAttribute("title", "Quá trình học tập");
        return "hrm/empinfo/educationSearch";
    }

    /**
     * API tìm kiếm quá trình học tập
     */
    @GetMapping("/api/education")
    @ResponseBody
    public ResponseEntity<List<HrEducation>> searchEducation(
            @RequestParam(required = false) String empId,
            @RequestParam(required = false) String personId,
            @RequestParam(required = false) String localName,
            @RequestParam(required = false) String institutionName) {
        try {
            return ResponseEntity.ok(hrEducationService.searchEducation(empId, personId, localName, institutionName));
        } catch (Exception e) {
            
            return ResponseEntity.status(500).body(null);
        }
    }

    /**
     * API thêm mới hoặc cập nhật quá trình học tập
     */
    @PostMapping("/api/education/save")
    @ResponseBody
    public ResponseEntity<?> saveEducation(@RequestBody HrEducation info, HttpSession session) {
        try {

            boolean isNew = info.getEducNo() == null;
            if (hrEducationService.saveEducation(info, isNew)) {
                java.util.Map<String, String> response = new java.util.HashMap<>();
                response.put("message", isNew ? "Thêm mới thành công" : "Cập nhật thành công");
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(500).body(java.util.Collections.singletonMap("error", "Lưu thất bại"));
            }
        } catch (Exception e) {
            
            return ResponseEntity.status(500)
                    .body(java.util.Collections.singletonMap("error", "Loi he thong. Vui long thu lai."));
        }
    }

    /**
     * API xóa quá trình học tập
     */
    @DeleteMapping("/api/education/delete/{educNo}")
    @ResponseBody
    public ResponseEntity<?> deleteEducation(@PathVariable Long educNo) {
        try {
            if (hrEducationService.deleteEducation(educNo)) {
                return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Xóa thành công"));
            } else {
                return ResponseEntity.status(500).body(java.util.Collections.singletonMap("error", "Xóa thất bại"));
            }
        } catch (Exception e) {
            
            return ResponseEntity.status(500)
                    .body(java.util.Collections.singletonMap("error", "Loi he thong. Vui long thu lai."));
        }
    }

    /**
     * API lấy chi tiết quá trình học tập
     */
    @GetMapping("/api/education/{educNo}")
    @ResponseBody
    public ResponseEntity<?> getEducation(@PathVariable Long educNo) {
        try {
            HrEducation info = hrEducationService.getById(educNo);
            if (info != null) {
                return ResponseEntity.ok(info);
            } else {
                return ResponseEntity.status(404).body("Không tìm thấy thông tin");
            }
        } catch (Exception e) {
            
            return ResponseEntity.status(500).body("Loi he thong. Vui long thu lai.");
        }
    }

    /**
     * Trang tra cứu địa chỉ
     */
    @GetMapping("/addressSearch")
    public String viewAddressSearch(Model model, HttpSession session) {
        HrUserInfo currentHrUser = (HrUserInfo) session.getAttribute("currentHrUser");
        model.addAttribute("currentHrUser", currentHrUser);
        model.addAttribute("title", "Tra cứu địa chỉ");
        return "hrm/empinfo/addressSearch";
    }

    /**
     * API tra cứu địa chỉ
     */
    @GetMapping("/api/address")
    @ResponseBody
    public ResponseEntity<List<HrAddressMatters>> searchAddress(
            @RequestParam(required = false) String empId,
            @RequestParam(required = false) String personId,
            @RequestParam(required = false) String localName,
            @RequestParam(required = false) String addressContent) {
        try {
            return ResponseEntity.ok(hrAddressMattersService.searchAddress(empId, personId, localName, addressContent));
        } catch (Exception e) {
            
            return ResponseEntity.status(500).body(null);
        }
    }

    /**
     * API thêm mới hoặc cập nhật địa chỉ
     */
    @PostMapping("/api/address/save")
    @ResponseBody
    public ResponseEntity<?> saveAddress(@RequestBody HrAddressMatters info, HttpSession session) {
        try {

            boolean isNew = info.getAddressNo() == null;
            if (hrAddressMattersService.saveAddress(info, isNew)) {
                java.util.Map<String, String> response = new java.util.HashMap<>();
                response.put("message", isNew ? "Thêm mới thành công" : "Cập nhật thành công");
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(500).body(java.util.Collections.singletonMap("error", "Lưu thất bại"));
            }
        } catch (Exception e) {
            
            return ResponseEntity.status(500)
                    .body(java.util.Collections.singletonMap("error", "Loi he thong. Vui long thu lai."));
        }
    }

    /**
     * API xóa địa chỉ
     */
    @DeleteMapping("/api/address/delete/{addressNo}")
    @ResponseBody
    public ResponseEntity<?> deleteAddress(@PathVariable Long addressNo) {
        try {
            if (hrAddressMattersService.deleteAddress(addressNo)) {
                return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Xóa thành công"));
            } else {
                return ResponseEntity.status(500).body(java.util.Collections.singletonMap("error", "Xóa thất bại"));
            }
        } catch (Exception e) {
            
            return ResponseEntity.status(500)
                    .body(java.util.Collections.singletonMap("error", "Loi he thong. Vui long thu lai."));
        }
    }

    /**
     * API lấy chi tiết địa chỉ
     */
    @GetMapping("/api/address/{addressNo}")
    @ResponseBody
    public ResponseEntity<?> getAddress(@PathVariable Long addressNo) {
        try {
            HrAddressMatters info = hrAddressMattersService.getById(addressNo);
            if (info != null) {
                return ResponseEntity.ok(info);
            } else {
                return ResponseEntity.status(404).body("Không tìm thấy thông tin");
            }
        } catch (Exception e) {
            
            return ResponseEntity.status(500).body("Loi he thong. Vui long thu lai.");
        }
    }

    /**
     * Trang tra cứu gia đình
     */
    @GetMapping("/familySearch")
    public String viewFamilySearch(Model model, HttpSession session) {
        HrUserInfo currentHrUser = (HrUserInfo) session.getAttribute("currentHrUser");
        model.addAttribute("currentHrUser", currentHrUser);
        model.addAttribute("title", "Tra cứu gia đình");
        return "hrm/empinfo/familySearch";
    }

    /**
     * API tra cứu gia đình
     */
    @GetMapping("/api/family")
    @ResponseBody
    public ResponseEntity<List<HrFamily>> searchFamily(
        @RequestParam(required = false) String empId,
        @RequestParam(required = false) String personId,
        @RequestParam(required = false) String localName,
        @RequestParam(required = false) String famName) {
        try {
            return ResponseEntity.ok(hrFamilyService.searchFamily(empId, personId, localName, famName));
        } catch (Exception e) {
            
            return ResponseEntity.status(500).body(null);
        }
    }

    /**
     * API thêm mới hoặc cập nhật gia đình
     */
    @PostMapping("/api/family/save")
    @ResponseBody
    public ResponseEntity<?> saveFamily(@RequestBody HrFamily info, HttpSession session) {
        try {

            boolean isNew = info.getFamilyNo() == null;
            if (hrFamilyService.saveFamily(info, isNew)) {
                java.util.Map<String, String> response = new java.util.HashMap<>();
                response.put("message", isNew ? "Thêm mới thành công" : "Cập nhật thành công");
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(500).body(java.util.Collections.singletonMap("error", "Lưu thất bại"));
            }
        } catch (Exception e) {
            
            return ResponseEntity.status(500)
                    .body(java.util.Collections.singletonMap("error", "Loi he thong. Vui long thu lai."));
        }
    }

    /**
     * API xóa gia đình
     */
    @DeleteMapping("/api/family/delete/{familyNo}")
    @ResponseBody
    public ResponseEntity<?> deleteFamily(@PathVariable Long familyNo) {
        try {
            if (hrFamilyService.deleteFamily(familyNo)) {
                return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Xóa thành công"));
            } else {
                return ResponseEntity.status(500).body(java.util.Collections.singletonMap("error", "Xóa thất bại"));
            }
        } catch (Exception e) {
            
            return ResponseEntity.status(500)
                    .body(java.util.Collections.singletonMap("error", "Loi he thong. Vui long thu lai."));
        }
    }

    /**
     * API lấy chi tiết gia đình
     */
    @GetMapping("/api/family/{familyNo}")
    @ResponseBody
    public ResponseEntity<?> getFamily(@PathVariable Long familyNo) {
        try {
            HrFamily info = hrFamilyService.getById(familyNo);
            if (info != null) {
                return ResponseEntity.ok(info);
            } else {
                return ResponseEntity.status(404).body("Không tìm thấy thông tin");
            }
        } catch (Exception e) {
            
            return ResponseEntity.status(500).body("Loi he thong. Vui long thu lai.");
        }
    }

    /**
     * Trang tra cứu địa chỉ khẩn cấp
     */
    @GetMapping("/emergencyAddressSearch")
    public String viewEmergencyAddressSearch(Model model, HttpSession session) {
        HrUserInfo currentHrUser = (HrUserInfo) session.getAttribute("currentHrUser");
        model.addAttribute("currentHrUser", currentHrUser);
        model.addAttribute("title", "Tra cứu địa chỉ khẩn cấp");
        return "hrm/empinfo/emergencyAddressSearch";
    }

    /**
     * API tra cứu địa chỉ khẩn cấp
     */
    @GetMapping("/api/emergency-address")
    @ResponseBody
    public ResponseEntity<List<HrEmergencyAddress>> searchEmergencyAddress(
            @RequestParam(required = false) String empId,
            @RequestParam(required = false) String personId,
            @RequestParam(required = false) String localName,
            @RequestParam(required = false) String emerName) {
        try {
            return ResponseEntity.ok(hrEmergencyAddressService.searchEmergencyAddress(empId, personId, localName, emerName));
        } catch (Exception e) {
            
            return ResponseEntity.status(500).body(null);
        }
    }

    /**
     * API thêm mới hoặc cập nhật địa chỉ khẩn cấp
     */
    @PostMapping("/api/emergency-address/save")
    @ResponseBody
    public ResponseEntity<?> saveEmergencyAddress(@RequestBody HrEmergencyAddress info, HttpSession session) {
        try {

            boolean isNew = info.getEmergencyNo() == null;
            if (hrEmergencyAddressService.saveEmergencyAddress(info, isNew)) {
                java.util.Map<String, String> response = new java.util.HashMap<>();
                response.put("message", isNew ? "Thêm mới thành công" : "Cập nhật thành công");
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(500).body(java.util.Collections.singletonMap("error", "Lưu thất bại"));
            }
        } catch (Exception e) {
            
            return ResponseEntity.status(500)
                    .body(java.util.Collections.singletonMap("error", "Loi he thong. Vui long thu lai."));
        }
    }

    /**
     * API xóa địa chỉ khẩn cấp
     */
    @DeleteMapping("/api/emergency-address/delete/{emergencyNo}")
    @ResponseBody
    public ResponseEntity<?> deleteEmergencyAddress(@PathVariable Long emergencyNo) {
        try {
            if (hrEmergencyAddressService.deleteEmergencyAddress(emergencyNo)) {
                return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Xóa thành công"));
            } else {
                return ResponseEntity.status(500).body(java.util.Collections.singletonMap("error", "Xóa thất bại"));
            }
        } catch (Exception e) {
            
            return ResponseEntity.status(500)
                    .body(java.util.Collections.singletonMap("error", "Loi he thong. Vui long thu lai."));
        }
    }

    /**
     * API lấy chi tiết địa chỉ khẩn cấp
     */
    @GetMapping("/api/emergency-address/{emergencyNo}")
    @ResponseBody
    public ResponseEntity<?> getEmergencyAddress(@PathVariable Long emergencyNo) {
        try {
            HrEmergencyAddress info = hrEmergencyAddressService.getById(emergencyNo);
            if (info != null) {
                return ResponseEntity.ok(info);
            } else {
                return ResponseEntity.status(404).body("Không tìm thấy thông tin");
            }
        } catch (Exception e) {
            
            return ResponseEntity.status(500).body("Loi he thong. Vui long thu lai.");
        }
    }

    /**
     * Trang tra cứu khen thưởng
     */
    @GetMapping("/recognitionSearch")
    public String recognitionSearch(Model model, HttpSession session) {
        HrUserInfo currentHrUser = (HrUserInfo) session.getAttribute("currentHrUser");
        model.addAttribute("currentHrUser", currentHrUser);
        model.addAttribute("title", "Tra cứu khen thưởng");
        return "hrm/empinfo/recognitionSearch";
    }

    /**
     * API tra cứu khen thưởng
     */
    @GetMapping("/api/reward")
    @ResponseBody
    public ResponseEntity<List<HrReward>> searchReward(
            @RequestParam(required = false) String empId,
            @RequestParam(required = false) String localName,
            @RequestParam(required = false) String rewardType) {
        try {
            return ResponseEntity.ok(hrRewardService.searchReward(empId, localName, rewardType));
        } catch (Exception e) {
            
            return ResponseEntity.status(500).body(null);
        }
    }

    /**
     * API thêm mới hoặc cập nhật khen thưởng
     */
    @PostMapping("/api/reward/save")
    @ResponseBody
    public ResponseEntity<?> saveReward(@RequestBody HrReward info, HttpSession session) {
        try {
            boolean isNew = info.getRewardNo() == null;
            if (hrRewardService.saveReward(info, isNew)) {
                java.util.Map<String, String> response = new java.util.HashMap<>();
                response.put("message", isNew ? "Thêm mới thành công" : "Cập nhật thành công");
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(500).body(java.util.Collections.singletonMap("error", "Lưu thất bại"));
            }
        } catch (Exception e) {
            
            return ResponseEntity.status(500)
                    .body(java.util.Collections.singletonMap("error", "Loi he thong. Vui long thu lai."));
        }
    }

    /**
     * Trang tra cứu chứng chỉ
     */
    @GetMapping("/viewQualification")
    public String viewQualification(Model model, HttpSession session) {
        HrUserInfo currentHrUser = (HrUserInfo) session.getAttribute("currentHrUser");
        model.addAttribute("currentHrUser", currentHrUser);
        model.addAttribute("title", "Tra cứu chứng chỉ");
        return "hrm/empinfo/viewQualification";
    }

    /**
     * API tra cứu chứng chỉ
     */
    @GetMapping("/api/qualification")
    @ResponseBody
    public ResponseEntity<List<com.ait.hrm.empinfo.model.HrQualification>> searchQualification(
            @RequestParam(required = false) String empId,
            @RequestParam(required = false) String localName,
            @RequestParam(required = false) String qualName) {
        try {
            return ResponseEntity.ok(hrQualificationService.searchQualification(empId, localName, qualName));
        } catch (Exception e) {
            
            return ResponseEntity.status(500).body(null);
        }
    }

    /**
     * API thêm mới hoặc cập nhật chứng chỉ
     */
    @PostMapping("/api/qualification/save")
    @ResponseBody
    public ResponseEntity<?> saveQualification(@RequestBody com.ait.hrm.empinfo.model.HrQualification info, HttpSession session) {
        try {
            boolean isNew = info.getQualNo() == null;
            if (hrQualificationService.saveQualification(info, isNew)) {
                java.util.Map<String, String> response = new java.util.HashMap<>();
                response.put("message", isNew ? "Thêm mới thành công" : "Cập nhật thành công");
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(500).body(java.util.Collections.singletonMap("error", "Lưu thất bại"));
            }
        } catch (Exception e) {
            
            return ResponseEntity.status(500)
                    .body(java.util.Collections.singletonMap("error", "Loi he thong. Vui long thu lai."));
        }
    }

    /**
     * API xóa chứng chỉ
     */
    @DeleteMapping("/api/qualification/delete/{qualNo}")
    @ResponseBody
    public ResponseEntity<?> deleteQualification(@PathVariable Long qualNo) {
        try {
            if (hrQualificationService.deleteQualification(qualNo)) {
                return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Xóa thành công"));
            } else {
                return ResponseEntity.status(500).body(java.util.Collections.singletonMap("error", "Xóa thất bại"));
            }
        } catch (Exception e) {
            
            return ResponseEntity.status(500)
                    .body(java.util.Collections.singletonMap("error", "Loi he thong. Vui long thu lai."));
        }
    }

    /**
     * API lấy chi tiết chứng chỉ
     */
    @GetMapping("/api/qualification/{qualNo}")
    @ResponseBody
    public ResponseEntity<?> getQualification(@PathVariable Long qualNo) {
        try {
            com.ait.hrm.empinfo.model.HrQualification info = hrQualificationService.getById(qualNo);
            if (info != null) {
                return ResponseEntity.ok(info);
            } else {
                return ResponseEntity.status(404).body("Không tìm thấy thông tin");
            }
        } catch (Exception e) {
            
            return ResponseEntity.status(500).body("Loi he thong. Vui long thu lai.");
        }
    }

    /**
     * API xóa khen thưởng
     */
    @DeleteMapping("/api/reward/delete/{rewardNo}")
    @ResponseBody
    public ResponseEntity<?> deleteReward(@PathVariable Long rewardNo) {
        try {
            if (hrRewardService.deleteReward(rewardNo)) {
                return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Xóa thành công"));
            } else {
                return ResponseEntity.status(500).body(java.util.Collections.singletonMap("error", "Xóa thất bại"));
            }
        } catch (Exception e) {
            
            return ResponseEntity.status(500)
                    .body(java.util.Collections.singletonMap("error", "Loi he thong. Vui long thu lai."));
        }
    }

    /**
     * API lấy chi tiết khen thưởng
     */
    @GetMapping("/api/reward/{rewardNo}")
    @ResponseBody
    public ResponseEntity<?> getReward(@PathVariable Long rewardNo) {
        try {
            HrReward info = hrRewardService.getById(rewardNo);
            if (info != null) {
                return ResponseEntity.ok(info);
            } else {
                return ResponseEntity.status(404).body("Không tìm thấy thông tin");
            }
        } catch (Exception e) {
            
            return ResponseEntity.status(500).body("Loi he thong. Vui long thu lai.");
        }
    }

    /**
     * Trang tra cứu kỷ luật
     */
    @GetMapping("/punishmentSearch")
    public String punishmentSearch(Model model, HttpSession session) {
        HrUserInfo currentHrUser = (HrUserInfo) session.getAttribute("currentHrUser");
        model.addAttribute("currentHrUser", currentHrUser);
        model.addAttribute("title", "Tra cứu kỷ luật");
        return "hrm/empinfo/punishmentSearch";
    }

    /**
     * API tra cứu kỷ luật
     */
    @GetMapping("/api/punishment")
    @ResponseBody
    public ResponseEntity<List<HrPunishment>> searchPunishment(
            @RequestParam(required = false) String empId,
            @RequestParam(required = false) String localName,
            @RequestParam(required = false) String punishCode) {
        try {
            return ResponseEntity.ok(hrPunishmentService.searchPunishment(empId, localName, punishCode));
        } catch (Exception e) {
            
            return ResponseEntity.status(500).body(null);
        }
    }

    /**
     * API thêm mới hoặc cập nhật kỷ luật
     */
    @PostMapping("/api/punishment/save")
    @ResponseBody
    public ResponseEntity<?> savePunishment(@RequestBody HrPunishment info, HttpSession session) {
        try {
            boolean isNew = info.getPunishNo() == null;
            if (hrPunishmentService.savePunishment(info, isNew)) {
                java.util.Map<String, String> response = new java.util.HashMap<>();
                response.put("message", isNew ? "Thêm mới thành công" : "Cập nhật thành công");
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(500).body(java.util.Collections.singletonMap("error", "Lưu thất bại"));
            }
        } catch (Exception e) {
            
            return ResponseEntity.status(500)
                    .body(java.util.Collections.singletonMap("error", "Loi he thong. Vui long thu lai."));
        }
    }

    /**
     * API xóa kỷ luật
     */
    @DeleteMapping("/api/punishment/delete/{punishNo}")
    @ResponseBody
    public ResponseEntity<?> deletePunishment(@PathVariable Long punishNo) {
        try {
            if (hrPunishmentService.deletePunishment(punishNo)) {
                return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Xóa thành công"));
            } else {
                return ResponseEntity.status(500).body(java.util.Collections.singletonMap("error", "Xóa thất bại"));
            }
        } catch (Exception e) {
            
            return ResponseEntity.status(500)
                    .body(java.util.Collections.singletonMap("error", "Loi he thong. Vui long thu lai."));
        }
    }

    /**
     * API lấy chi tiết kỷ luật
     */
    @GetMapping("/api/punishment/{punishNo}")
    @ResponseBody
    public ResponseEntity<?> getPunishment(@PathVariable Long punishNo) {
        try {
            HrPunishment info = hrPunishmentService.getById(punishNo);
            if (info != null) {
                return ResponseEntity.ok(info);
            } else {
                return ResponseEntity.status(404).body("Không tìm thấy thông tin");
            }
        } catch (Exception e) {
            
            return ResponseEntity.status(500).body("Loi he thong. Vui long thu lai.");
        }
    }

    /**
     * Trang import ảnh đại diện nhân viên
     */
    @GetMapping("/photoImport")
    public String photoImport(Model model, HttpSession session) {
        HrUserInfo currentHrUser = (HrUserInfo) session.getAttribute("currentHrUser");
        model.addAttribute("currentHrUser", currentHrUser);
        model.addAttribute("title", "Import ảnh đại diện");
        return "hrm/empinfo/photoImport";
    }

    /**
     * API kiểm tra danh sách ảnh trước khi lưu (không lưu file, không cập nhật DB)
     */
    @PostMapping("/api/photo/preview")
    @ResponseBody
    public ResponseEntity<List<PhotoImportResultDto>> previewPhotos(
            @RequestParam("files") MultipartFile[] files) {
        try {
            List<PhotoImportResultDto> results = hrPhotoImportService.validatePhotos(files);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            log.error("Lỗi khi kiểm tra ảnh: ", e);
            return ResponseEntity.status(500).body(null);
        }
    }

    /**
     * API lưu ảnh vào thư mục upload và cập nhật PHOTO_PATH trong DB
     */
    @PostMapping("/api/photo/save")
    @ResponseBody
    public ResponseEntity<List<PhotoImportResultDto>> savePhotos(
            @RequestParam("files") MultipartFile[] files) {
        try {
            List<PhotoImportResultDto> results = hrPhotoImportService.savePhotos(files);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            log.error("Lỗi khi lưu ảnh: ", e);
            return ResponseEntity.status(500).body(null);
        }
    }

    // ── Quyết định nhân sự (HR_EXPERIENCE_INSIDE) ─────────────────────────────

    @GetMapping("/viewStartPoint")
    public String viewStartPoint(Model model, HttpSession session) {
        HrUserInfo currentHrUser = (HrUserInfo) session.getAttribute("currentHrUser");
        model.addAttribute("currentHrUser", currentHrUser);
        model.addAttribute("title", "Quyết định nhân sự");
        return "hrm/empinfo/viewStartPoint";
    }

    @GetMapping("/api/startpoint/employee/search")
    @ResponseBody
    public ResponseEntity<?> searchEmployeeForStartPoint(
            @RequestParam(required = false) String keyword,
            HttpSession session) {
        try {
            HrUserInfo currentHrUser = (HrUserInfo) session.getAttribute("currentHrUser");
            HrExpInsideDto dto = new HrExpInsideDto();
            dto.setSearchKeyword(keyword);
            HrExpInsideDto emp = hrExpInsideService.searchEmployee(dto);
            if (emp == null) {
                return ResponseEntity.status(404).body("Không tìm thấy nhân viên");
            }
            return ResponseEntity.ok(emp);
        } catch (Exception e) {
            log.error("Lỗi tìm kiếm nhân viên startpoint: ", e);
            return ResponseEntity.status(500).body("Lỗi hệ thống");
        }
    }

    @PostMapping("/api/startpoint/decisions/list")
    @ResponseBody
    public DataTablesResponse<HrExpInsideDto> getDecisionList(
            @RequestBody HrExpInsideDto dto) {
        return hrExpInsideService.getDecisionList(dto);
    }

    @GetMapping("/api/startpoint/decisions/detail")
    @ResponseBody
    public ResponseEntity<?> getDecisionDetail(@RequestParam("seq") Long seq) {
        try {
            HrExpInsideDto dto = hrExpInsideService.getDecisionBySeq(seq);
            if (dto == null) {
                return ResponseEntity.status(404).body("Không tìm thấy quyết định");
            }
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Lỗi lấy chi tiết quyết định seq={}: ", seq, e);
            return ResponseEntity.status(500).body("Lỗi hệ thống");
        }
    }

    @PostMapping("/api/startpoint/decisions/save")
    @ResponseBody
    public ResponseEntity<?> saveDecision(@RequestBody HrExpInsideDto dto) {
        try {
            java.util.Map<String, Object> result = hrExpInsideService.saveDecision(dto);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Lỗi lưu quyết định: ", e);
            return ResponseEntity.status(500).body(java.util.Collections.singletonMap("success", false));
        }
    }

    @PostMapping("/api/startpoint/decisions/delete")
    @ResponseBody
    public ResponseEntity<?> deleteDecision(@RequestParam("seq") Long seq) {
        try {
            java.util.Map<String, Object> result = hrExpInsideService.deleteDecision(seq);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Lỗi xóa quyết định seq={}: ", seq, e);
            return ResponseEntity.status(500).body(java.util.Collections.singletonMap("success", false));
        }
    }

    @GetMapping("/api/startpoint/decisions/export")
    public void exportDecisionsExcel(
            @RequestParam("personId") String personId,
            @RequestParam(value = "localName", required = false, defaultValue = "") String localName,
            HttpSession session,
            HttpServletResponse response) {
        try {
            java.util.List<HrExpInsideDto> list = hrExpInsideService.getAllDecisionsByPersonId(personId);

            Workbook wb = new XSSFWorkbook();
            Sheet sheet = wb.createSheet("Quyết định nhân sự");

            CellStyle headerStyle = wb.createCellStyle();
            Font headerFont = wb.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            String[] headers = {
                "STT", "Tên quyết định", "Ngày quyết định", "Phòng ban",
                "Loại nhân viên", "Nhóm NV", "Cấp bậc", "Chức vụ",
                "Loại giờ làm", "Loại lương", "Lý do QĐ", "Ghi chú"
            };
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            CellStyle dataStyle = wb.createCellStyle();
            dataStyle.setBorderBottom(BorderStyle.THIN);
            dataStyle.setBorderTop(BorderStyle.THIN);
            dataStyle.setBorderLeft(BorderStyle.THIN);
            dataStyle.setBorderRight(BorderStyle.THIN);

            for (int i = 0; i < list.size(); i++) {
                HrExpInsideDto d = list.get(i);
                Row row = sheet.createRow(i + 1);
                row.createCell(0).setCellValue(i + 1);
                row.createCell(1).setCellValue(d.getTransCodeName() != null ? d.getTransCodeName() : "");
                row.createCell(2).setCellValue(d.getStartDate() != null ? d.getStartDate() : "");
                row.createCell(3).setCellValue(d.getDeptno() != null ? d.getDeptno() : "");
                row.createCell(4).setCellValue(d.getEmpTypeName() != null ? d.getEmpTypeName() : "");
                row.createCell(5).setCellValue(d.getPostFamilyName() != null ? d.getPostFamilyName() : "");
                row.createCell(6).setCellValue(d.getPostGradeName() != null ? d.getPostGradeName() : "");
                row.createCell(7).setCellValue(d.getPositionNo() != null ? d.getPositionNo() : "");
                row.createCell(8).setCellValue(d.getWorkHourType() != null ? d.getWorkHourType() : "");
                row.createCell(9).setCellValue(d.getWageType() != null ? d.getWageType() : "");
                row.createCell(10).setCellValue(d.getTransResource() != null ? d.getTransResource() : "");
                row.createCell(11).setCellValue(d.getRemark() != null ? d.getRemark() : "");
                for (int j = 0; j < headers.length; j++) {
                    if (row.getCell(j) != null) row.getCell(j).setCellStyle(dataStyle);
                }
            }
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            String filename = "QuyetDinhNhanSu_" + localName.replace(" ", "_") + ".xlsx";
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader("Content-Disposition", "attachment; filename=\"" +
                    java.net.URLEncoder.encode(filename, "UTF-8") + "\"");
            wb.write(response.getOutputStream());
            wb.close();
        } catch (Exception e) {
            log.error("Lỗi xuất Excel quyết định nhân sự personId={}: ", personId, e);
        }
    }

    /**
     * Trang Thẻ nhân sự
     */
    @GetMapping("/viewHTSVCardInfoList")
    public String viewHTSVCardInfoList(Model model, HttpSession session) {
        HrUserInfo currentHrUser = (HrUserInfo) session.getAttribute("currentHrUser");
        model.addAttribute("currentHrUser", currentHrUser);
        model.addAttribute("title", "Thẻ nhân sự");
        return "hrm/empinfo/viewHTSVCardInfoList";
    }

    /**
     * API lấy chi tiết Thẻ nhân sự để in
     */
    @GetMapping("/api/hrCard/detail")
    @ResponseBody
    public ResponseEntity<?> getHrCardDetail(@RequestParam("empId") String empId) {
        try {
            com.ait.hrm.empinfo.model.HrEmployee employee = hrEmployeeService.getEmployeeByEmpId(empId);
            if (employee == null) {
                return ResponseEntity.status(404).body("Không tìm thấy nhân viên");
            }
            String personId = employee.getPersonId();
            
            java.util.Map<String, Object> result = new java.util.HashMap<>();
            result.put("employee", employee);
            
            // Thông tin cá nhân
            com.ait.hrm.empinfo.model.HrPersonalInfo personalInfo = hrPersonalInfoService.getPersonalInfoByPersonId(personId);
            result.put("personalInfo", personalInfo);
            
            // Quá trình học tập
            List<HrEducation> educations = hrEducationService.searchEducation(empId, personId, null, null);
            result.put("educations", educations);
            
            // Gia đình
            List<HrFamily> families = hrFamilyService.searchFamily(empId, personId, null, null);
            result.put("families", families);
            
            // Kinh nghiệm làm việc
            List<com.ait.hrm.empinfo.model.HrWorkExperience> experiences = hrWorkExperienceService.searchWorkExperience(personId, null, null);
            result.put("experiences", experiences);
            
            // Chứng chỉ
            List<com.ait.hrm.empinfo.model.HrQualification> qualifications = hrQualificationService.searchQualification(personId, null, null);
            result.put("qualifications", qualifications);
            
            // Kỷ luật
            List<HrPunishment> punishments = hrPunishmentService.searchPunishment(personId, null, null);
            result.put("punishments", punishments);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Lỗi khi lấy thông tin thẻ nhân sự: ", e);
            return ResponseEntity.status(500).body("Loi he thong. Vui long thu lai.");
        }
    }
}

