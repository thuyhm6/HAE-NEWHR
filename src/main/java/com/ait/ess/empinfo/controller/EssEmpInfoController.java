package com.ait.ess.empinfo.controller;

import com.ait.ess.empinfo.dto.EssPersonalInfoDto;
import com.ait.ess.empinfo.service.EssPersonalInfoService;
import com.ait.ess.viewDept.dto.ManageEmpPositionInsideDto;
import com.ait.ess.viewDept.service.ManageEmpPositionInfoService;
import com.ait.hrm.empinfo.model.HrAddressMatters;
import com.ait.hrm.empinfo.model.HrEmergencyAddress;
import com.ait.hrm.empinfo.model.HrFamily;
import com.ait.hrm.empinfo.model.HrPersonalInfo;
import com.ait.hrm.empinfo.model.HrWorkExperience;
import com.ait.hrm.empinfo.model.HrEducation;
import com.ait.hrm.empinfo.model.HrQualification;
import com.ait.hrm.empinfo.model.HrReward;
import com.ait.hrm.empinfo.service.HrAddressMattersService;
import com.ait.hrm.empinfo.service.HrEducationService;
import com.ait.hrm.empinfo.service.HrEmergencyAddressService;
import com.ait.hrm.empinfo.service.HrFamilyService;
import com.ait.hrm.empinfo.service.HrPersonalInfoService;
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
import org.springframework.web.bind.annotation.ResponseBody;

import jakarta.servlet.http.HttpSession;
import java.util.Collections;
import java.util.List;

@Controller
@RequestMapping("/ess/empinfo")
public class EssEmpInfoController {

    private static final Logger log = LoggerFactory.getLogger(EssEmpInfoController.class);

    @Autowired
    private EssPersonalInfoService essPersonalInfoService;

    @Autowired
    private HrPersonalInfoService hrPersonalInfoService;

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
     * API: Cập nhật thông tin cá nhân
     */
    @PostMapping("/api/personalInfo/savePersonal")
    @ResponseBody
    public ResponseEntity<?> savePersonal(@RequestBody HrPersonalInfo info, HttpSession session) {
        try {
            String personId = (String) session.getAttribute("adminID");
            if (personId == null) return ResponseEntity.status(401).body(Collections.singletonMap("error", "Chưa đăng nhập"));
            info.setPersonId(personId);
            if (hrPersonalInfoService.updatePersonalInfo(info)) {
                return ResponseEntity.ok(Collections.singletonMap("message", "Cập nhật thành công"));
            }
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Cập nhật thất bại"));
        } catch (Exception e) {
            log.error("Lỗi cập nhật thông tin cá nhân ESS", e);
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Lỗi hệ thống"));
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
     * API: Thêm mới hoặc cập nhật địa chỉ
     */
    @PostMapping("/api/personalInfo/saveAddress")
    @ResponseBody
    public ResponseEntity<?> saveAddress(@RequestBody HrAddressMatters info, HttpSession session) {
        try {
            String personId = (String) session.getAttribute("adminID");
            if (personId == null) return ResponseEntity.status(401).body(Collections.singletonMap("error", "Chưa đăng nhập"));
            info.setPersonId(personId);
            boolean isNew = info.getAddressNo() == null;
            if (hrAddressMattersService.saveAddress(info, isNew)) {
                return ResponseEntity.ok(Collections.singletonMap("message", isNew ? "Thêm mới thành công" : "Cập nhật thành công"));
            }
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Lưu thất bại"));
        } catch (Exception e) {
            log.error("Lỗi lưu địa chỉ ESS", e);
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
     * API: Thêm mới hoặc cập nhật thành viên gia đình
     */
    @PostMapping("/api/personalInfo/saveFamily")
    @ResponseBody
    public ResponseEntity<?> saveFamily(@RequestBody HrFamily info, HttpSession session) {
        try {
            String personId = (String) session.getAttribute("adminID");
            if (personId == null) return ResponseEntity.status(401).body(Collections.singletonMap("error", "Chưa đăng nhập"));
            info.setPersonId(personId);
            boolean isNew = info.getFamilyNo() == null;
            if (hrFamilyService.saveFamily(info, isNew)) {
                return ResponseEntity.ok(Collections.singletonMap("message", isNew ? "Thêm mới thành công" : "Cập nhật thành công"));
            }
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Lưu thất bại"));
        } catch (Exception e) {
            log.error("Lỗi lưu thông tin gia đình ESS", e);
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
     * API: Thêm mới hoặc cập nhật liên hệ khẩn cấp
     */
    @PostMapping("/api/personalInfo/saveEmergency")
    @ResponseBody
    public ResponseEntity<?> saveEmergency(@RequestBody HrEmergencyAddress info, HttpSession session) {
        try {
            String personId = (String) session.getAttribute("adminID");
            if (personId == null) return ResponseEntity.status(401).body(Collections.singletonMap("error", "Chưa đăng nhập"));
            info.setPersonId(personId);
            boolean isNew = info.getEmergencyNo() == null;
            if (hrEmergencyAddressService.saveEmergencyAddress(info, isNew)) {
                return ResponseEntity.ok(Collections.singletonMap("message", isNew ? "Thêm mới thành công" : "Cập nhật thành công"));
            }
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Lưu thất bại"));
        } catch (Exception e) {
            log.error("Lỗi lưu liên hệ khẩn cấp ESS", e);
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
