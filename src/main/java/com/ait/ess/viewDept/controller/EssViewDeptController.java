package com.ait.ess.viewDept.controller;

import com.ait.ess.viewDept.dto.ArPersonalListDetailDto;
import com.ait.ess.viewDept.dto.ArPersonalListDto;
import com.ait.ess.viewDept.dto.ArPersonalSelfDetailDto;
import com.ait.ess.viewDept.dto.ArPersonalSelfDto;
import com.ait.ess.viewDept.dto.EssEntryInfoListDto;
import com.ait.ess.viewDept.dto.ManageCountInfoEmpDto;
import com.ait.ess.viewDept.dto.ManageCountInfoSummaryDto;
import com.ait.ess.viewDept.dto.ManageEvsResultEmpDto;
import com.ait.ess.viewDept.dto.ManageEmpPositionInfoDto;
import com.ait.ess.viewDept.dto.ManageEmpPositionInsideDto;
import com.ait.ess.viewDept.dto.OtApplyPersonalSelfDetailDto;
import com.ait.ess.viewDept.dto.OtApplyPersonalSelfDto;
import com.ait.ess.viewDept.dto.YearUseLeaveUsageDto;
import com.ait.ess.viewDept.dto.YearUseVacationDto;
import com.ait.ess.empinfo.dto.EssPersonalInfoDto;
import com.ait.ess.empinfo.dto.HrAddressMattersApplyDto;
import com.ait.ess.empinfo.dto.HrEducationApplyDto;
import com.ait.ess.empinfo.dto.HrEmergencyAddressApplyDto;
import com.ait.ess.empinfo.dto.HrFamilyApplyDto;
import com.ait.ess.empinfo.dto.HrPersonalInfoApplyDto;
import com.ait.ess.empinfo.service.EssPersonalInfoService;
import com.ait.ess.viewDept.service.ArPersonalListService;
import com.ait.ess.viewDept.service.ArPersonalSelfService;
import com.ait.ess.viewDept.service.EssEntryInfoListService;
import com.ait.ess.viewDept.service.ManageCountInfoService;
import com.ait.ess.viewDept.service.ManageEvsResultEmpService;
import com.ait.ess.viewDept.service.ManageEmpPositionInfoService;
import com.ait.ess.viewDept.service.OtApplyPersonalSelfService;
import com.ait.ess.viewDept.service.WeeklyHrReportService;
import com.ait.ess.viewDept.service.YearUseInfoService;
import com.ait.evs.manage.dto.EvsObjectDto;
import com.ait.evs.manage.service.EvsObjectService;
import com.ait.hrm.contract.model.HrContract;
import com.ait.hrm.contract.service.HrContractService;
import com.ait.hrm.empinfo.mapper.HrSpecialMatterMapper;
import com.ait.hrm.empinfo.model.HrAddressMatters;
import com.ait.hrm.empinfo.model.HrEducation;
import com.ait.hrm.empinfo.model.HrEmergencyAddress;
import com.ait.hrm.empinfo.model.HrFamily;
import com.ait.hrm.empinfo.model.HrPunishment;
import com.ait.hrm.empinfo.model.HrQualification;
import com.ait.hrm.empinfo.model.HrReward;
import com.ait.hrm.empinfo.model.HrSpecialMatter;
import com.ait.hrm.empinfo.model.HrWorkExperience;
import com.ait.hrm.empinfo.service.HrEducationService;
import com.ait.hrm.empinfo.service.HrPunishmentService;
import com.ait.hrm.empinfo.service.HrQualificationService;
import com.ait.hrm.empinfo.service.HrRewardService;
import com.ait.hrm.empinfo.service.HrSpecialMatterService;
import com.ait.hrm.empinfo.service.HrWorkExperienceService;
import com.ait.sy.sys.dto.DataTablesResponse;
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

import javax.servlet.http.HttpSession;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/ess/viewDept")
public class EssViewDeptController {

    private static final Logger log = LoggerFactory.getLogger(EssViewDeptController.class);

    @Autowired
    private ManageEmpPositionInfoService service;

    @Autowired
    private EssPersonalInfoService essPersonalInfoService;

    @Autowired
    private HrEducationService hrEducationService;

    @Autowired
    private HrSpecialMatterService hrSpecialMatterService;

    @Autowired
    private HrSpecialMatterMapper hrSpecialMatterMapper;

    @Autowired
    private ManageEvsResultEmpService manageEvsResultEmpService;

    @Autowired
    private ArPersonalSelfService arPersonalSelfService;

    @Autowired
    private OtApplyPersonalSelfService otApplyPersonalSelfService;

    @Autowired
    private YearUseInfoService yearUseInfoService;

    @Autowired
    private ArPersonalListService arPersonalListService;

    @Autowired
    private EssEntryInfoListService essEntryInfoListService;

    @Autowired
    private ManageCountInfoService manageCountInfoService;

    @Autowired
    private WeeklyHrReportService weeklyHrReportService;

    @Autowired
    private HrContractService hrContractService;

    @Autowired
    private HrWorkExperienceService hrWorkExperienceService;

    @Autowired
    private HrQualificationService hrQualificationService;

    @Autowired
    private HrRewardService hrRewardService;

    @Autowired
    private HrPunishmentService hrPunishmentService;

    @Autowired
    private EvsObjectService evsObjectService;

    @GetMapping("/viewEmpCalendar")
    public String viewEmpCalendar() {
        return "ess/viewDept/viewEmpCalendar";
    }

    @GetMapping("/ManageEmpPositionInfoList")
    public String viewManageEmpPositionInfoList() {
        return "ess/viewDept/ManageEmpPositionInfoList";
    }

    @GetMapping("/viewDeptPersonalInfoManageList")
    public String viewDeptPersonalInfoManageList() {
        return "ess/viewDept/viewDeptPersonalInfoManageList";
    }

    @GetMapping("/viewManageEvsResultEmpList")
    public String viewManageEvsResultEmpList() {
        return "ess/viewDept/viewManageEvsResultEmpList";
    }

    @GetMapping("/api/manageEmpPositionInfo/list")
    @ResponseBody
    public ResponseEntity<List<ManageEmpPositionInfoDto>> getManageEmpPositionInfoList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String deptNos,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) String postFamily,
            @RequestParam(required = false) String empTypeCode,
            @RequestParam(required = false) String empOffice,
            @RequestParam(required = false) String nationalityCode,
            @RequestParam(required = false) String asOfDate) {
        ManageEmpPositionInfoDto params = new ManageEmpPositionInfoDto();
        params.setKeyword(keyword);
        params.setDeptNos(deptNos);
        params.setFromDate(fromDate);
        params.setToDate(toDate);
        params.setPostFamily(postFamily);
        params.setEmpTypeCode(empTypeCode);
        params.setEmpOffice(empOffice);
        params.setNationalityCode(nationalityCode);
        params.setAsOfDate(asOfDate);
        return ResponseEntity.ok(service.getList(params));
    }

    @GetMapping("/api/manageEvsResultEmp/list")
    @ResponseBody
    public ResponseEntity<List<ManageEvsResultEmpDto>> getManageEvsResultEmpList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String deptNos,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) String year,
            @RequestParam(required = false) String postFamily,
            @RequestParam(required = false) String empTypeCode,
            @RequestParam(required = false) String empOffice) {
        ManageEvsResultEmpDto params = new ManageEvsResultEmpDto();
        params.setKeyword(keyword);
        params.setDeptNos(deptNos);
        params.setFromDate(fromDate);
        params.setToDate(toDate);
        params.setYear(year);
        params.setPostFamily(postFamily);
        params.setEmpTypeCode(empTypeCode);
        params.setEmpOffice(empOffice);
        return ResponseEntity.ok(manageEvsResultEmpService.getList(params));
    }

    @GetMapping("/api/manageEmpPositionInfo/insideExperience")
    @ResponseBody
    public ResponseEntity<List<ManageEmpPositionInsideDto>> getInsideExperienceList(
            @RequestParam String personId) {
        return ResponseEntity.ok(service.getInsideExperienceList(personId));
    }

    @GetMapping("/viewArPersonalSelfList")
    public String viewArPersonalSelfList() {
        return "ess/viewDept/viewArPersonalSelfList";
    }

    @GetMapping("/api/arPersonalSelf/items")
    @ResponseBody
    public ResponseEntity<List<ArPersonalSelfDto>> getArPersonalSelfItems() {
        return ResponseEntity.ok(arPersonalSelfService.getItemList());
    }

    @GetMapping("/api/arPersonalSelf/summary")
    @ResponseBody
    public ResponseEntity<List<ArPersonalSelfDto>> getArPersonalSelfSummary(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        ArPersonalSelfDto params = new ArPersonalSelfDto();
        params.setStartDate(startDate);
        params.setEndDate(endDate);
        return ResponseEntity.ok(arPersonalSelfService.getSummaryList(params));
    }

    @GetMapping("/api/arPersonalSelf/detail")
    @ResponseBody
    public ResponseEntity<List<ArPersonalSelfDetailDto>> getArPersonalSelfDetail(
            @RequestParam String personId,
            @RequestParam String itemNo,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        ArPersonalSelfDetailDto params = new ArPersonalSelfDetailDto();
        params.setPersonId(personId);
        params.setItemNo(itemNo);
        params.setStartDate(startDate);
        params.setEndDate(endDate);
        return ResponseEntity.ok(arPersonalSelfService.getDetailList(params));
    }

    @GetMapping("/viewOtApplyPersonalSelfList")
    public String viewOtApplyPersonalSelfList() {
        return "ess/viewDept/viewOtApplyPersonalSelfList";
    }

    @GetMapping("/api/otApplyPersonalSelf/items")
    @ResponseBody
    public ResponseEntity<List<OtApplyPersonalSelfDto>> getOtApplyPersonalSelfItems() {
        return ResponseEntity.ok(otApplyPersonalSelfService.getItemList());
    }

    @GetMapping("/api/otApplyPersonalSelf/summary")
    @ResponseBody
    public ResponseEntity<List<OtApplyPersonalSelfDto>> getOtApplyPersonalSelfSummary(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        OtApplyPersonalSelfDto params = new OtApplyPersonalSelfDto();
        params.setStartDate(startDate);
        params.setEndDate(endDate);
        return ResponseEntity.ok(otApplyPersonalSelfService.getSummaryList(params));
    }

    @GetMapping("/api/otApplyPersonalSelf/detail")
    @ResponseBody
    public ResponseEntity<List<OtApplyPersonalSelfDetailDto>> getOtApplyPersonalSelfDetail(
            @RequestParam String personId,
            @RequestParam String itemNo,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        OtApplyPersonalSelfDetailDto params = new OtApplyPersonalSelfDetailDto();
        params.setPersonId(personId);
        params.setItemNo(itemNo);
        params.setStartDate(startDate);
        params.setEndDate(endDate);
        return ResponseEntity.ok(otApplyPersonalSelfService.getDetailList(params));
    }

    @GetMapping("/yearUseInfo")
    public String viewYearUseInfo() {
        return "ess/viewDept/yearUseInfo";
    }

    @GetMapping("/api/yearUseInfo/vacationRows")
    @ResponseBody
    public ResponseEntity<List<YearUseVacationDto>> getYearUseVacationRows(
            @RequestParam(required = false) String year) {
        return ResponseEntity.ok(yearUseInfoService.getVacationRows(year));
    }

    @GetMapping("/api/yearUseInfo/leaveUsage")
    @ResponseBody
    public ResponseEntity<List<YearUseLeaveUsageDto>> getYearUseLeaveUsage(
            @RequestParam(required = false) String year) {
        return ResponseEntity.ok(yearUseInfoService.getLeaveUsageList(year));
    }

    @GetMapping("/viewArPersonalList")
    public String viewArPersonalList() {
        return "ess/viewDept/viewArPersonalList";
    }

    @GetMapping("/viewOtApplyPersonalList")
    public String viewOtApplyPersonalList() {
        return "ess/viewDept/viewOtApplyPersonalList";
    }

    @GetMapping("/api/arPersonalList/items")
    @ResponseBody
    public ResponseEntity<List<ArPersonalListDto>> getArPersonalListItems(@RequestParam(required = false) String itemGroup) {
        ArPersonalListDto params = new ArPersonalListDto();
        params.setItemGroup(itemGroup);
        return ResponseEntity.ok(arPersonalListService.getItemList(params));
    }

    @GetMapping("/api/arPersonalList/detail")
    @ResponseBody
    public ResponseEntity<List<ArPersonalListDetailDto>> getArPersonalListDetail(
            @RequestParam String personId,
            @RequestParam String itemId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        ArPersonalListDetailDto params = new ArPersonalListDetailDto();
        params.setPersonId(personId);
        params.setItemId(itemId);
        params.setStartDate(startDate);
        params.setEndDate(endDate);
        return ResponseEntity.ok(arPersonalListService.getDetailList(params));
    }

    @GetMapping("/ManageCountInfoList")
    public String viewManageCountInfoList() {
        return "ess/viewDept/ManageCountInfoList";
    }

    @GetMapping("/api/manageCountInfo/summary")
    @ResponseBody
    public ResponseEntity<ManageCountInfoSummaryDto> getManageCountInfoSummary(ManageCountInfoEmpDto params) {
        return ResponseEntity.ok(manageCountInfoService.getSummary(params));
    }

    @GetMapping("/api/manageCountInfo/list")
    @ResponseBody
    public DataTablesResponse<ManageCountInfoEmpDto> getManageCountInfoList(ManageCountInfoEmpDto params) {
        return manageCountInfoService.getPageList(params);
    }

    @GetMapping("/viewEntryInfoList")
    public String viewEntryInfoList() {
        return "ess/viewDept/viewEntryInfoList";
    }

    @GetMapping("/api/entryInfoList/list")
    @ResponseBody
    public DataTablesResponse<EssEntryInfoListDto> getEntryInfoList(EssEntryInfoListDto dto) {
        return essEntryInfoListService.getPageList(dto);
    }

    @GetMapping("/api/empProfile/currentUser")
    @ResponseBody
    public ResponseEntity<Map<String, String>> getCurrentUserPersonId(HttpSession session) {
        String personId = session.getAttribute("adminID") != null ? session.getAttribute("adminID").toString() : "";
        Map<String, String> result = new HashMap<>();
        result.put("personId", personId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/api/empProfile/info")
    @ResponseBody
    public ResponseEntity<EssPersonalInfoDto> getEmpProfileInfo(@RequestParam String personId) {
        return ResponseEntity.ok(essPersonalInfoService.getMyInfo(personId));
    }

    @GetMapping("/api/empProfile/education")
    @ResponseBody
    public ResponseEntity<List<HrEducation>> getEmpProfileEducation(@RequestParam String personId) {
        return ResponseEntity.ok(hrEducationService.searchEducation(null, personId, null, null));
    }

    @GetMapping("/api/empProfile/address")
    @ResponseBody
    public ResponseEntity<List<HrAddressMatters>> getEmpProfileAddress(@RequestParam String personId) {
        return ResponseEntity.ok(essPersonalInfoService.getMyAddresses(personId));
    }

    @GetMapping("/api/empProfile/family")
    @ResponseBody
    public ResponseEntity<List<HrFamily>> getEmpProfileFamily(@RequestParam String personId) {
        return ResponseEntity.ok(essPersonalInfoService.getMyFamilies(personId));
    }

    @GetMapping("/api/empProfile/emergency")
    @ResponseBody
    public ResponseEntity<List<HrEmergencyAddress>> getEmpProfileEmergency(@RequestParam String personId) {
        return ResponseEntity.ok(essPersonalInfoService.getMyEmergencies(personId));
    }

    @GetMapping("/api/arPersonalList/summary")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getArPersonalListSummary(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String deptNos,
            @RequestParam(required = false) String empTypeCode,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String itemGroup) {
        ArPersonalListDto params = new ArPersonalListDto();
        params.setKeyword(keyword);
        params.setDeptNos(deptNos);
        params.setEmpTypeCode(empTypeCode);
        params.setStartDate(startDate);
        params.setEndDate(endDate);
        params.setItemGroup(itemGroup);
        return ResponseEntity.ok(arPersonalListService.getSummaryList(params));
    }

    // ==================== Hồ sơ nhân viên (viewPersonalInfoEss) ====================

    /**
     * Mở giao diện Hồ sơ nhân viên (quản lý/HR xem và cập nhật hồ sơ của nhân viên khác)
     */
    @GetMapping("/viewPersonalInfoEss")
    public String viewPersonalInfoEss() {
        return "ess/viewDept/viewPersonalInfoEss";
    }

    /**
     * API: Lấy thông tin hồ sơ. Nếu không truyền personId, mặc định lấy theo nhân viên đang đăng nhập
     * (PERSON_ID lưu trong session, tham chiếu từ SY_USER khi đăng nhập).
     */
    @GetMapping("/api/personalInfoEss/profile")
    @ResponseBody
    public ResponseEntity<EssPersonalInfoDto> getPersonalInfoEssProfile(
            @RequestParam(required = false) String personId, HttpSession session) {
        String pid = (personId != null && !personId.trim().isEmpty())
                ? personId
                : (String) session.getAttribute("adminID");
        return ResponseEntity.ok(essPersonalInfoService.getMyInfo(pid));
    }

    @GetMapping("/api/personalInfoEss/contract")
    @ResponseBody
    public ResponseEntity<List<HrContract>> getPersonalInfoEssContract(@RequestParam String personId) {
        return ResponseEntity.ok(hrContractService.getContractsByPersonId(personId));
    }

    @GetMapping("/api/personalInfoEss/workExperience")
    @ResponseBody
    public ResponseEntity<List<HrWorkExperience>> getPersonalInfoEssWorkExperience(@RequestParam String personId) {
        return ResponseEntity.ok(hrWorkExperienceService.getByPersonId(personId));
    }

    @GetMapping("/api/personalInfoEss/qualification")
    @ResponseBody
    public ResponseEntity<List<HrQualification>> getPersonalInfoEssQualification(@RequestParam String personId) {
        return ResponseEntity.ok(hrQualificationService.getByPersonId(personId));
    }

    @GetMapping("/api/personalInfoEss/reward")
    @ResponseBody
    public ResponseEntity<List<HrReward>> getPersonalInfoEssReward(@RequestParam String personId) {
        return ResponseEntity.ok(hrRewardService.getByPersonId(personId));
    }

    @GetMapping("/api/personalInfoEss/punishment")
    @ResponseBody
    public ResponseEntity<List<HrPunishment>> getPersonalInfoEssPunishment(@RequestParam String personId) {
        return ResponseEntity.ok(hrPunishmentService.getByPersonId(personId));
    }

    @GetMapping("/api/personalInfoEss/evsObject")
    @ResponseBody
    public ResponseEntity<List<EvsObjectDto>> getPersonalInfoEssEvsObject(@RequestParam String personId) {
        return ResponseEntity.ok(evsObjectService.getByPersonId(personId));
    }

    @GetMapping("/api/personalInfoEss/address")
    @ResponseBody
    public ResponseEntity<List<HrAddressMatters>> getPersonalInfoEssAddress(@RequestParam String personId) {
        return ResponseEntity.ok(essPersonalInfoService.getMyAddresses(personId));
    }

    @GetMapping("/api/personalInfoEss/family")
    @ResponseBody
    public ResponseEntity<List<HrFamily>> getPersonalInfoEssFamily(@RequestParam String personId) {
        return ResponseEntity.ok(essPersonalInfoService.getMyFamilies(personId));
    }

    @GetMapping("/api/personalInfoEss/emergency")
    @ResponseBody
    public ResponseEntity<List<HrEmergencyAddress>> getPersonalInfoEssEmergency(@RequestParam String personId) {
        return ResponseEntity.ok(essPersonalInfoService.getMyEmergencies(personId));
    }

    @GetMapping("/api/personalInfoEss/education")
    @ResponseBody
    public ResponseEntity<List<HrEducation>> getPersonalInfoEssEducation(@RequestParam String personId) {
        return ResponseEntity.ok(hrEducationService.searchEducation(null, personId, null, null));
    }

    @GetMapping("/api/personalInfoEss/specialMatter")
    @ResponseBody
    public ResponseEntity<List<HrSpecialMatter>> getPersonalInfoEssSpecialMatter(@RequestParam String personId) {
        return ResponseEntity.ok(hrSpecialMatterMapper.searchByPersonId(personId));
    }

    /**
     * API: Gửi yêu cầu thay đổi thông tin cá nhân của nhân viên được chọn (lưu vào HR_PERSONAL_INFO_APPLY, chờ duyệt)
     */
    @PostMapping("/api/personalInfoEss/savePersonal")
    @ResponseBody
    public ResponseEntity<?> savePersonalInfoEssPersonal(@RequestBody HrPersonalInfoApplyDto dto) {
        try {
            if (dto.getPersonId() == null || dto.getPersonId().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Thiếu personId"));
            }
            String personNo = essPersonalInfoService.savePersonalApply(dto, null);
            return ResponseEntity.ok(Collections.singletonMap("applyNo", personNo));
        } catch (Exception e) {
            log.error("Lỗi gửi yêu cầu thay đổi thông tin cá nhân (viewDept) personId={}", dto.getPersonId(), e);
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Lỗi hệ thống"));
        }
    }

    /**
     * API: Gửi yêu cầu thêm mới/cập nhật địa chỉ (lưu vào HR_ADDRESS_MATTERS_APPLY, chờ duyệt)
     */
    @PostMapping("/api/personalInfoEss/saveAddress")
    @ResponseBody
    public ResponseEntity<?> savePersonalInfoEssAddress(@RequestBody HrAddressMattersApplyDto dto) {
        try {
            if (dto.getPersonId() == null || dto.getPersonId().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Thiếu personId"));
            }
            String addressNo = essPersonalInfoService.saveAddressApply(dto, null);
            return ResponseEntity.ok(Collections.singletonMap("addressNo", addressNo));
        } catch (Exception e) {
            log.error("Lỗi lưu địa chỉ (viewDept) personId={}", dto.getPersonId(), e);
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Lỗi hệ thống"));
        }
    }

    /**
     * API: Gửi yêu cầu thêm mới/cập nhật thông tin gia đình (lưu vào HR_FAMILY_APPLY, chờ duyệt)
     */
    @PostMapping("/api/personalInfoEss/saveFamily")
    @ResponseBody
    public ResponseEntity<?> savePersonalInfoEssFamily(@RequestBody HrFamilyApplyDto dto) {
        try {
            if (dto.getPersonId() == null || dto.getPersonId().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Thiếu personId"));
            }
            String applyNo = essPersonalInfoService.saveFamilyApply(dto, null);
            return ResponseEntity.ok(Collections.singletonMap("applyNo", applyNo));
        } catch (Exception e) {
            log.error("Lỗi lưu thông tin gia đình (viewDept) personId={}", dto.getPersonId(), e);
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Lỗi hệ thống"));
        }
    }

    /**
     * API: Gửi yêu cầu thêm mới/cập nhật người liên hệ khẩn cấp (lưu vào HR_EMERGENCY_ADDRESS_APPLY, chờ duyệt)
     */
    @PostMapping("/api/personalInfoEss/saveEmergency")
    @ResponseBody
    public ResponseEntity<?> savePersonalInfoEssEmergency(@RequestBody HrEmergencyAddressApplyDto dto) {
        try {
            if (dto.getPersonId() == null || dto.getPersonId().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Thiếu personId"));
            }
            String applyNo = essPersonalInfoService.saveEmergencyApply(dto, null);
            return ResponseEntity.ok(Collections.singletonMap("applyNo", applyNo));
        } catch (Exception e) {
            log.error("Lỗi lưu liên hệ khẩn cấp (viewDept) personId={}", dto.getPersonId(), e);
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Lỗi hệ thống"));
        }
    }

    /**
     * API: Gửi yêu cầu thêm mới/cập nhật học vấn (lưu vào HR_EDUCATION_APPLY, chờ duyệt)
     */
    @PostMapping("/api/personalInfoEss/saveEducation")
    @ResponseBody
    public ResponseEntity<?> savePersonalInfoEssEducation(@RequestBody HrEducationApplyDto dto) {
        try {
            if (dto.getPersonId() == null || dto.getPersonId().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Thiếu personId"));
            }
            String applyNo = essPersonalInfoService.saveEducationApply(dto, null);
            return ResponseEntity.ok(Collections.singletonMap("applyNo", applyNo));
        } catch (Exception e) {
            log.error("Lỗi lưu học vấn (viewDept) personId={}", dto.getPersonId(), e);
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Lỗi hệ thống"));
        }
    }

    /**
     * API: Thêm mới hạng mục đặc biệt. Ghi trực tiếp vào HR_SPECIAL_MATTER (không qua workflow duyệt
     * vì hệ thống chưa có bảng HR_SPECIAL_MATTER_APPLY).
     */
    @PostMapping("/api/personalInfoEss/saveSpecialMatter")
    @ResponseBody
    public ResponseEntity<?> savePersonalInfoEssSpecialMatter(@RequestBody HrSpecialMatter matter) {
        try {
            if (matter.getPersonId() == null || matter.getPersonId().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Thiếu personId"));
            }
            matter.setActivity(1);
            boolean success = hrSpecialMatterService.addSpecialMatter(matter);
            if (success) {
                return ResponseEntity.ok(Collections.singletonMap("message", "Thêm mới thành công"));
            }
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Thêm mới thất bại"));
        } catch (Exception e) {
            log.error("Lỗi lưu hạng mục đặc biệt personId={}", matter.getPersonId(), e);
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Lỗi hệ thống"));
        }
    }
}
