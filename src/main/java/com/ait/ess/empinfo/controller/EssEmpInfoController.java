package com.ait.ess.empinfo.controller;

import com.ait.ess.empinfo.dto.EssApplyInfoDto;
import com.ait.ess.empinfo.dto.EssFileDto;
import com.ait.ess.empinfo.dto.EssPersonalInfoDto;
import com.ait.sy.sys.dto.DataTablesResponse;
import com.ait.ess.empinfo.dto.HrEducationApplyDto;
import com.ait.ess.empinfo.dto.HrEmergencyAddressApplyDto;
import com.ait.ess.empinfo.dto.HrQualificationApplyDto;
import com.ait.ess.empinfo.dto.HrFamilyApplyDto;
import com.ait.ess.empinfo.dto.HrAddressMattersApplyDto;
import com.ait.ess.empinfo.dto.HrPersonalInfoApplyDto;
import com.ait.ess.empinfo.dto.HrWorkExperienceApplyDto;
import com.ait.ess.empinfo.mapper.EssFileMapper;
import com.ait.ess.empinfo.service.EssPersonalInfoService;
import com.ait.ess.viewDept.dto.ManageEmpPositionInsideDto;
import com.ait.ess.viewDept.service.ManageEmpPositionInfoService;
import com.ait.hrm.empinfo.model.HrAddressMatters;
import com.ait.hrm.empinfo.model.HrEmergencyAddress;
import com.ait.hrm.empinfo.model.HrFamily;
import com.ait.hrm.empinfo.model.HrWorkExperience;
import com.ait.hrm.empinfo.model.HrEducation;
import com.ait.hrm.empinfo.model.HrQualification;
import com.ait.hrm.empinfo.model.HrReward;
import com.ait.hrm.empinfo.service.HrAddressMattersService;
import com.ait.hrm.empinfo.service.HrEducationService;
import com.ait.hrm.empinfo.service.HrEmergencyAddressService;
import com.ait.hrm.empinfo.service.HrFamilyService;
import com.ait.hrm.empinfo.service.HrQualificationService;
import com.ait.hrm.empinfo.service.HrRewardService;
import com.ait.hrm.empinfo.service.HrWorkExperienceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/ess/empinfo")
public class EssEmpInfoController {

    private static final Logger log = LoggerFactory.getLogger(EssEmpInfoController.class);

    @Value("${app.file.upload.path:D:/source/VHR/HAE_HR/resources/fileUpload}")
    private String fileUploadPath;

    @Autowired
    private EssFileMapper essFileMapper;

    @Autowired
    private EssPersonalInfoService essPersonalInfoService;

    @Autowired
    private HrAddressMattersService hrAddressMattersService;

    @Autowired
    private HrFamilyService hrFamilyService;

    @Autowired
    private HrEmergencyAddressService hrEmergencyAddressService;

    @Autowired
    private HrWorkExperienceService hrWorkExperienceService;

    @Autowired
    private ManageEmpPositionInfoService manageEmpPositionInfoService;

    @Autowired
    private HrEducationService hrEducationService;

    @Autowired
    private HrQualificationService hrQualificationService;

    @Autowired
    private HrRewardService hrRewardService;

    /**
     * Mở giao diện Tra cứu chi tiết thay đổi thông tin
     */
    @GetMapping("/viewEssApplyInfo")
    public String viewEssApplyInfo(Model model, HttpSession session) {
        return "ess/empinfo/viewEssApplyInfo";
    }

    /**
     * API: Lấy danh sách phân trang các apply của nhân viên đang đăng nhập
     */
    @GetMapping("/api/apply/myApplyList")
    @ResponseBody
    public DataTablesResponse<EssApplyInfoDto> getMyApplyList(EssApplyInfoDto dto, HttpSession session) {
        try {
            String personId = (String) session.getAttribute("adminID");
            if (personId == null) return new DataTablesResponse<>(dto.getDraw(), "Chưa đăng nhập");
            dto.setPersonId(personId);
            int total = essPersonalInfoService.countMyApplyList(dto);
            List<EssApplyInfoDto> list = essPersonalInfoService.getMyApplyListPage(dto);
            return new DataTablesResponse<>(dto.getDraw(), total, total, list);
        } catch (Exception e) {
            log.error("Lỗi lấy danh sách apply của nhân viên ESS", e);
            return new DataTablesResponse<>(dto.getDraw(), "Lỗi hệ thống");
        }
    }

    /**
     * API: Lấy chi tiết một apply theo applyNo và applyTableType
     */
    @GetMapping("/api/apply/detail")
    @ResponseBody
    public ResponseEntity<?> getApplyDetail(
            @RequestParam String applyNo,
            @RequestParam String applyTableType) {
        try {
            Object detail = essPersonalInfoService.getApplyDetail(applyNo, applyTableType);
            List<EssFileDto> files = essPersonalInfoService.getFilesByApplyNo(applyNo);
            Map<String, Object> result = new HashMap<>();
            result.put("detail", detail);
            result.put("files", files);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Lỗi lấy chi tiết apply applyNo={} type={}", applyNo, applyTableType, e);
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Lỗi hệ thống"));
        }
    }

    /**
     * Mở giao diện xem thông tin cá nhân
     */
    @GetMapping("/viewPersonalInfoForEss")
    public String viewPersonalInfoForEss(Model model, HttpSession session) {
        return "ess/empinfo/viewPersonalInfoForEss";
    }

    /**
     * Mở giao diện Thông tin Công việc
     */
    @GetMapping("/viewEssPersonalInfo")
    public String viewEssPersonalInfo(Model model, HttpSession session) {
        return "ess/empinfo/viewEssPersonalInfo";
    }

    // ==================== Thông tin công việc ====================

    @GetMapping("/api/workInfo/myInsideExperience")
    @ResponseBody
    public ResponseEntity<List<ManageEmpPositionInsideDto>> getMyInsideExperience(HttpSession session) {
        String personId = (String) session.getAttribute("adminID");
        return ResponseEntity.ok(manageEmpPositionInfoService.getInsideExperienceList(personId));
    }

    @GetMapping("/api/workInfo/myWorkExperience")
    @ResponseBody
    public ResponseEntity<List<HrWorkExperience>> getMyWorkExperience(HttpSession session) {
        String personId = (String) session.getAttribute("adminID");
        return ResponseEntity.ok(hrWorkExperienceService.getByPersonId(personId));
    }

    @PostMapping("/api/workInfo/saveWorkExperience")
    @ResponseBody
    public ResponseEntity<?> saveWorkExperience(@RequestBody HrWorkExperience info, HttpSession session) {
        try {
            String personId = (String) session.getAttribute("adminID");
            if (personId == null) return ResponseEntity.status(401).body(Collections.singletonMap("error", "Chưa đăng nhập"));
            info.setPersonId(personId);
            boolean isNew = info.getWorkExpNo() == null;
            if (hrWorkExperienceService.saveWorkExperience(info, isNew)) {
                return ResponseEntity.ok(Collections.singletonMap("message", isNew ? "Thêm mới thành công" : "Cập nhật thành công"));
            }
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Lưu thất bại"));
        } catch (Exception e) {
            log.error("Lỗi lưu kinh nghiệm làm việc ESS", e);
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Lỗi hệ thống"));
        }
    }

    /**
     * API: Gửi yêu cầu thêm mới/cập nhật kinh nghiệm làm việc (lưu vào HR_WORK_EXPERIENCE_APPLY).
     * Hỗ trợ upload file đính kèm, lưu vào ESS_FILE liên kết qua APPLY_NO.
     */
    @PostMapping("/api/workInfo/saveWorkExperienceApply")
    @ResponseBody
    public ResponseEntity<?> saveWorkExperienceApply(
            HrWorkExperienceApplyDto dto,
            @RequestParam(value = "attachFiles", required = false) List<MultipartFile> attachFiles,
            HttpSession session) {
        try {
            String personId = (String) session.getAttribute("adminID");
            if (personId == null) return ResponseEntity.status(401).body(Collections.singletonMap("error", "Chưa đăng nhập"));
            dto.setPersonId(personId);
            String applyNo = essPersonalInfoService.saveWorkExperienceApply(dto, attachFiles);
            Map<String, Object> result = new HashMap<>();
            result.put("message", "Gửi yêu cầu thành công");
            result.put("applyNo", applyNo);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Lỗi gửi yêu cầu kinh nghiệm làm việc ESS", e);
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Lỗi hệ thống"));
        }
    }

    @DeleteMapping("/api/workInfo/deleteWorkExperience/{workExpNo}")
    @ResponseBody
    public ResponseEntity<?> deleteWorkExperience(@PathVariable Long workExpNo) {
        try {
            if (hrWorkExperienceService.deleteWorkExperience(workExpNo)) {
                return ResponseEntity.ok(Collections.singletonMap("message", "Xóa thành công"));
            }
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Xóa thất bại"));
        } catch (Exception e) {
            log.error("Lỗi xóa kinh nghiệm làm việc ESS", e);
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Lỗi hệ thống"));
        }
    }

    // ==================== Thông tin chứng chỉ ====================

    @GetMapping("/viewQualificationInfo")
    public String viewQualificationInfo(Model model, HttpSession session) {
        return "ess/empinfo/viewQualificationInfo";
    }

    @GetMapping("/api/qualInfo/myEducation")
    @ResponseBody
    public ResponseEntity<List<HrEducation>> getMyEducation(HttpSession session) {
        String personId = (String) session.getAttribute("adminID");
        return ResponseEntity.ok(hrEducationService.searchEducation(null, personId, null, null));
    }

    @PostMapping("/api/qualInfo/saveEducation")
    @ResponseBody
    public ResponseEntity<?> saveEducation(@RequestBody HrEducation info, HttpSession session) {
        try {
            String personId = (String) session.getAttribute("adminID");
            if (personId == null) return ResponseEntity.status(401).body(Collections.singletonMap("error", "Chưa đăng nhập"));
            info.setPersonId(personId);
            boolean isNew = info.getEducNo() == null;
            if (hrEducationService.saveEducation(info, isNew)) {
                return ResponseEntity.ok(Collections.singletonMap("message", isNew ? "Thêm mới thành công" : "Cập nhật thành công"));
            }
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Lưu thất bại"));
        } catch (Exception e) {
            log.error("Lỗi lưu học vấn ESS", e);
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Lỗi hệ thống"));
        }
    }

    @DeleteMapping("/api/qualInfo/deleteEducation/{educNo}")
    @ResponseBody
    public ResponseEntity<?> deleteEducation(@PathVariable Long educNo) {
        try {
            if (hrEducationService.deleteEducation(educNo)) {
                return ResponseEntity.ok(Collections.singletonMap("message", "Xóa thành công"));
            }
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Xóa thất bại"));
        } catch (Exception e) {
            log.error("Lỗi xóa học vấn ESS", e);
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Lỗi hệ thống"));
        }
    }

    /**
     * API: Gửi yêu cầu thêm mới/cập nhật trình độ học vấn (lưu vào HR_EDUCATION_APPLY).
     * Hỗ trợ upload file đính kèm, lưu vào ESS_FILE liên kết qua APPLY_NO.
     */
    @PostMapping("/api/qualInfo/saveEducationApply")
    @ResponseBody
    public ResponseEntity<?> saveEducationApply(
            HrEducationApplyDto dto,
            @RequestParam(value = "attachFiles", required = false) List<MultipartFile> attachFiles,
            HttpSession session) {
        try {
            String personId = (String) session.getAttribute("adminID");
            if (personId == null) return ResponseEntity.status(401).body(Collections.singletonMap("error", "Chưa đăng nhập"));
            dto.setPersonId(personId);
            String applyNo = essPersonalInfoService.saveEducationApply(dto, attachFiles);
            Map<String, Object> result = new HashMap<>();
            result.put("message", "Gửi yêu cầu thành công");
            result.put("applyNo", applyNo);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Lỗi gửi yêu cầu trình độ học vấn ESS", e);
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Lỗi hệ thống"));
        }
    }

    /**
     * API: Gửi yêu cầu thêm mới/cập nhật chứng chỉ (lưu vào HR_QUALIFICATION_APPLY).
     * Hỗ trợ upload file đính kèm, lưu vào ESS_FILE liên kết qua APPLY_NO.
     */
    @PostMapping("/api/qualInfo/saveQualificationApply")
    @ResponseBody
    public ResponseEntity<?> saveQualificationApply(
            HrQualificationApplyDto dto,
            @RequestParam(value = "attachFiles", required = false) List<MultipartFile> attachFiles,
            HttpSession session) {
        try {
            String personId = (String) session.getAttribute("adminID");
            if (personId == null) return ResponseEntity.status(401).body(Collections.singletonMap("error", "Chưa đăng nhập"));
            dto.setPersonId(personId);
            String applyNo = essPersonalInfoService.saveQualificationApply(dto, attachFiles);
            Map<String, Object> result = new HashMap<>();
            result.put("message", "Gửi yêu cầu thành công");
            result.put("applyNo", applyNo);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Lỗi gửi yêu cầu chứng chỉ ESS", e);
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Lỗi hệ thống"));
        }
    }

    @GetMapping("/api/qualInfo/myQualification")
    @ResponseBody
    public ResponseEntity<List<HrQualification>> getMyQualification(HttpSession session) {
        String personId = (String) session.getAttribute("adminID");
        return ResponseEntity.ok(hrQualificationService.getByPersonId(personId));
    }

    @PostMapping("/api/qualInfo/saveQualification")
    @ResponseBody
    public ResponseEntity<?> saveQualification(@RequestBody HrQualification info, HttpSession session) {
        try {
            String personId = (String) session.getAttribute("adminID");
            if (personId == null) return ResponseEntity.status(401).body(Collections.singletonMap("error", "Chưa đăng nhập"));
            info.setPersonId(personId);
            boolean isNew = info.getQualNo() == null;
            if (hrQualificationService.saveQualification(info, isNew)) {
                return ResponseEntity.ok(Collections.singletonMap("message", isNew ? "Thêm mới thành công" : "Cập nhật thành công"));
            }
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Lưu thất bại"));
        } catch (Exception e) {
            log.error("Lỗi lưu chứng chỉ ESS", e);
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Lỗi hệ thống"));
        }
    }

    @DeleteMapping("/api/qualInfo/deleteQualification/{qualNo}")
    @ResponseBody
    public ResponseEntity<?> deleteQualification(@PathVariable Long qualNo) {
        try {
            if (hrQualificationService.deleteQualification(qualNo)) {
                return ResponseEntity.ok(Collections.singletonMap("message", "Xóa thành công"));
            }
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Xóa thất bại"));
        } catch (Exception e) {
            log.error("Lỗi xóa chứng chỉ ESS", e);
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Lỗi hệ thống"));
        }
    }

    @GetMapping("/api/qualInfo/myReward")
    @ResponseBody
    public ResponseEntity<List<HrReward>> getMyReward(HttpSession session) {
        String personId = (String) session.getAttribute("adminID");
        return ResponseEntity.ok(hrRewardService.getByPersonId(personId));
    }

    /**
     * API: Lấy thông tin cơ bản + cá nhân của user đang đăng nhập
     */
    @GetMapping("/api/personalInfo/myInfo")
    @ResponseBody
    public ResponseEntity<EssPersonalInfoDto> getMyInfo(HttpSession session) {
        String personId = (String) session.getAttribute("adminID");
       
        EssPersonalInfoDto info = essPersonalInfoService.getMyInfo(personId);
        return ResponseEntity.ok(info);
    }

    /**
     * API: Gửi yêu cầu thay đổi thông tin cá nhân (lưu vào HR_PERSONAL_INFO_APPLY, không sửa trực tiếp HR_PERSONAL_INFO)
     * Hỗ trợ upload file đính kèm, lưu vào ESS_FILE liên kết qua APPLY_NO
     */
    @PostMapping("/api/personalInfo/savePersonal")
    @ResponseBody
    public ResponseEntity<?> savePersonal(
            HrPersonalInfoApplyDto dto,
            @RequestParam(value = "attachFiles", required = false) List<MultipartFile> attachFiles,
            HttpSession session) {
        try {
            String personId = (String) session.getAttribute("adminID");
            if (personId == null) return ResponseEntity.status(401).body(Collections.singletonMap("error", "Chưa đăng nhập"));
            dto.setPersonId(personId);
            String applyNo = essPersonalInfoService.savePersonalApply(dto, attachFiles);
            Map<String, Object> result = new HashMap<>();
            result.put("message", "Gửi yêu cầu thành công");
            result.put("applyNo", applyNo);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Lỗi gửi yêu cầu thay đổi thông tin cá nhân ESS", e);
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Lỗi hệ thống"));
        }
    }

    /**
     * API: Lấy danh sách file đính kèm theo applyNo
     */
    @GetMapping("/api/personalInfo/files/{applyNo}")
    @ResponseBody
    public ResponseEntity<List<EssFileDto>> getFilesByApplyNo(@PathVariable String applyNo) {
        return ResponseEntity.ok(essPersonalInfoService.getFilesByApplyNo(applyNo));
    }

    /**
     * API: Download file đính kèm qua HTTP (tránh lỗi file:// trên browser).
     * fileNo là FILE_NO (sequence) trong DB. Lookup FILE_URL để lấy tên file UUID trên disk.
     */
    @GetMapping("/api/files/download/{fileNo}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileNo) {
        try {
            EssFileDto fileRecord = essFileMapper.selectByFileNo(fileNo);
            if (fileRecord == null) {
                return ResponseEntity.notFound().build();
            }
            // FILE_URL có thể là UUID filename hoặc full path (bản ghi cũ)
            String storedUrl = fileRecord.getFileUrl();
            String uuidFileName = storedUrl.replace("\\", "/").contains("/")
                    ? storedUrl.replace("\\", "/").substring(storedUrl.replace("\\", "/").lastIndexOf('/') + 1)
                    : storedUrl;

            Path filePath = Paths.get(fileUploadPath).resolve(uuidFileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) contentType = "application/octet-stream";
            String encodedName = URLEncoder.encode(fileRecord.getFileName(), StandardCharsets.UTF_8).replace("+", "%20");
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename*=UTF-8''" + encodedName)
                    .body(resource);
        } catch (Exception e) {
            log.error("Lỗi tải file fileNo={}", fileNo, e);
            return ResponseEntity.status(500).build();
        }
    }

    // ==================== Địa chỉ ====================

    /**
     * API: Lấy danh sách địa chỉ
     */
    @GetMapping("/api/personalInfo/myAddress")
    @ResponseBody
    public ResponseEntity<List<HrAddressMatters>> getMyAddresses(HttpSession session) {
        String personId = (String) session.getAttribute("adminID");
        return ResponseEntity.ok(essPersonalInfoService.getMyAddresses(personId));
    }

    /**
     * API: Gửi yêu cầu thêm mới/cập nhật địa chỉ qua apply workflow
     */
    @PostMapping("/api/personalInfo/saveAddress")
    @ResponseBody
    public ResponseEntity<?> saveAddress(@RequestBody HrAddressMattersApplyDto dto, HttpSession session) {
        try {
            String personId = (String) session.getAttribute("adminID");
            if (personId == null) return ResponseEntity.status(401).body(Collections.singletonMap("error", "Chưa đăng nhập"));
            dto.setPersonId(personId);
            String addressNo = essPersonalInfoService.saveAddressApply(dto, null);
            return ResponseEntity.ok(Collections.singletonMap("addressNo", addressNo));
        } catch (Exception e) {
            log.error("Lỗi lưu địa chỉ ESS apply", e);
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Lỗi hệ thống"));
        }
    }

    /**
     * API: Xóa địa chỉ
     */
    @DeleteMapping("/api/personalInfo/deleteAddress/{addressNo}")
    @ResponseBody
    public ResponseEntity<?> deleteAddress(@PathVariable Long addressNo) {
        try {
            if (hrAddressMattersService.deleteAddress(addressNo)) {
                return ResponseEntity.ok(Collections.singletonMap("message", "Xóa thành công"));
            }
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Xóa thất bại"));
        } catch (Exception e) {
            log.error("Lỗi xóa địa chỉ ESS", e);
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Lỗi hệ thống"));
        }
    }

    // ==================== Gia đình ====================

    /**
     * API: Lấy danh sách gia đình
     */
    @GetMapping("/api/personalInfo/myFamily")
    @ResponseBody
    public ResponseEntity<List<HrFamily>> getMyFamilies(HttpSession session) {
        String personId = (String) session.getAttribute("adminID");
        return ResponseEntity.ok(essPersonalInfoService.getMyFamilies(personId));
    }

    /**
     * API: Gửi yêu cầu thêm mới/cập nhật thông tin gia đình (lưu vào HR_FAMILY_APPLY).
     * Hỗ trợ upload file đính kèm, lưu vào ESS_FILE liên kết qua APPLY_NO.
     */
    @PostMapping("/api/personalInfo/saveFamily")
    @ResponseBody
    public ResponseEntity<?> saveFamily(
            HrFamilyApplyDto dto,
            @RequestParam(value = "attachFiles", required = false) List<MultipartFile> attachFiles,
            HttpSession session) {
        try {
            String personId = (String) session.getAttribute("adminID");
            if (personId == null) return ResponseEntity.status(401).body(Collections.singletonMap("error", "Chưa đăng nhập"));
            dto.setPersonId(personId);
            String applyNo = essPersonalInfoService.saveFamilyApply(dto, attachFiles);
            Map<String, Object> result = new HashMap<>();
            result.put("message", "Gửi yêu cầu thành công");
            result.put("applyNo", applyNo);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Lỗi gửi yêu cầu thay đổi thông tin gia đình ESS", e);
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Lỗi hệ thống"));
        }
    }

    /**
     * API: Xóa thành viên gia đình
     */
    @DeleteMapping("/api/personalInfo/deleteFamily/{familyNo}")
    @ResponseBody
    public ResponseEntity<?> deleteFamily(@PathVariable Long familyNo) {
        try {
            if (hrFamilyService.deleteFamily(familyNo)) {
                return ResponseEntity.ok(Collections.singletonMap("message", "Xóa thành công"));
            }
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Xóa thất bại"));
        } catch (Exception e) {
            log.error("Lỗi xóa thông tin gia đình ESS", e);
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Lỗi hệ thống"));
        }
    }

    // ==================== Liên hệ khẩn cấp ====================

    /**
     * API: Lấy danh sách liên hệ khẩn cấp
     */
    @GetMapping("/api/personalInfo/myEmergency")
    @ResponseBody
    public ResponseEntity<List<HrEmergencyAddress>> getMyEmergencies(HttpSession session) {
        String personId = (String) session.getAttribute("adminID");
        return ResponseEntity.ok(essPersonalInfoService.getMyEmergencies(personId));
    }

    /**
     * API: Gửi yêu cầu thêm mới/cập nhật người liên hệ khẩn cấp (lưu vào HR_EMERGENCY_ADDRESS_APPLY).
     * Hỗ trợ upload file đính kèm, lưu vào ESS_FILE liên kết qua APPLY_NO.
     */
    @PostMapping("/api/personalInfo/saveEmergency")
    @ResponseBody
    public ResponseEntity<?> saveEmergency(
            HrEmergencyAddressApplyDto dto,
            @RequestParam(value = "attachFiles", required = false) List<MultipartFile> attachFiles,
            HttpSession session) {
        try {
            String personId = (String) session.getAttribute("adminID");
            if (personId == null) return ResponseEntity.status(401).body(Collections.singletonMap("error", "Chưa đăng nhập"));
            dto.setPersonId(personId);
            String applyNo = essPersonalInfoService.saveEmergencyApply(dto, attachFiles);
            Map<String, Object> result = new HashMap<>();
            result.put("message", "Gửi yêu cầu thành công");
            result.put("applyNo", applyNo);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Lỗi gửi yêu cầu thay đổi người liên hệ khẩn cấp ESS", e);
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Lỗi hệ thống"));
        }
    }

    /**
     * API: Xóa liên hệ khẩn cấp
     */
    @DeleteMapping("/api/personalInfo/deleteEmergency/{emergencyNo}")
    @ResponseBody
    public ResponseEntity<?> deleteEmergency(@PathVariable Long emergencyNo) {
        try {
            if (hrEmergencyAddressService.deleteEmergencyAddress(emergencyNo)) {
                return ResponseEntity.ok(Collections.singletonMap("message", "Xóa thành công"));
            }
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Xóa thất bại"));
        } catch (Exception e) {
            log.error("Lỗi xóa liên hệ khẩn cấp ESS", e);
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Lỗi hệ thống"));
        }
    }
}
