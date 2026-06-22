package com.ait.ess.empinfo.service;

import com.ait.ess.empinfo.dto.EssApplyInfoDto;
import com.ait.ess.empinfo.dto.EssFileDto;
import com.ait.ess.empinfo.dto.EssPersonalInfoDto;
import com.ait.ess.empinfo.dto.HrAddressMattersApplyDto;
import com.ait.ess.empinfo.dto.HrEmergencyAddressApplyDto;
import com.ait.ess.empinfo.dto.HrFamilyApplyDto;
import com.ait.ess.empinfo.dto.HrPersonalInfoApplyDto;
import com.ait.ess.empinfo.dto.HrEducationApplyDto;
import com.ait.ess.empinfo.dto.HrQualificationApplyDto;
import com.ait.ess.empinfo.dto.HrWorkExperienceApplyDto;
import com.ait.hrm.empinfo.model.HrAddressMatters;
import com.ait.hrm.empinfo.model.HrEmergencyAddress;
import com.ait.hrm.empinfo.model.HrFamily;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Service cho tính năng Xem thông tin cá nhân (ESS)
 */
public interface EssPersonalInfoService {

    EssPersonalInfoDto getMyInfo(String personId);

    List<HrAddressMatters> getMyAddresses(String personId);

    List<HrFamily> getMyFamilies(String personId);

    List<HrEmergencyAddress> getMyEmergencies(String personId);

    /**
     * Lưu yêu cầu thay đổi thông tin cá nhân vào HR_PERSONAL_INFO_APPLY.
     * Nếu có file đính kèm, lưu file vào disk và ghi vào ESS_FILE.
     */
    String savePersonalApply(HrPersonalInfoApplyDto dto, List<MultipartFile> files) throws Exception;

    /**
     * Lưu yêu cầu thay đổi địa chỉ vào HR_ADDRESS_MATTERS_APPLY.
     * Nếu có file đính kèm, lưu file vào disk và ghi vào ESS_FILE liên kết qua APPLY_NO.
     */
    String saveAddressApply(HrAddressMattersApplyDto dto, List<MultipartFile> files) throws Exception;

    /**
     * Lưu yêu cầu thay đổi thông tin gia đình vào HR_FAMILY_APPLY.
     * Nếu có file đính kèm, lưu file vào disk và ghi vào ESS_FILE liên kết qua APPLY_NO.
     */
    String saveFamilyApply(HrFamilyApplyDto dto, List<MultipartFile> files) throws Exception;

    /**
     * Lưu yêu cầu thay đổi người liên hệ khẩn cấp vào HR_EMERGENCY_ADDRESS_APPLY.
     * Nếu có file đính kèm, lưu file vào disk và ghi vào ESS_FILE liên kết qua APPLY_NO.
     */
    String saveEmergencyApply(HrEmergencyAddressApplyDto dto, List<MultipartFile> files) throws Exception;

    /**
     * Lưu yêu cầu thêm mới/cập nhật kinh nghiệm làm việc vào HR_WORK_EXPERIENCE_APPLY.
     * Nếu có file đính kèm, lưu file vào disk và ghi vào ESS_FILE liên kết qua APPLY_NO.
     */
    String saveWorkExperienceApply(HrWorkExperienceApplyDto dto, List<MultipartFile> files) throws Exception;

    /**
     * Lưu yêu cầu thêm mới/cập nhật trình độ học vấn vào HR_EDUCATION_APPLY.
     * Nếu có file đính kèm, lưu file vào disk và ghi vào ESS_FILE liên kết qua APPLY_NO.
     */
    String saveEducationApply(HrEducationApplyDto dto, List<MultipartFile> files) throws Exception;

    /**
     * Lưu yêu cầu thêm mới/cập nhật chứng chỉ vào HR_QUALIFICATION_APPLY.
     * Nếu có file đính kèm, lưu file vào disk và ghi vào ESS_FILE liên kết qua APPLY_NO.
     */
    String saveQualificationApply(HrQualificationApplyDto dto, List<MultipartFile> files) throws Exception;

    List<EssFileDto> getFilesByApplyNo(String applyNo);

    /**
     * Lấy chi tiết một apply theo applyNo và applyTableType
     */
    Object getApplyDetail(String applyNo, String applyTableType);

    /**
     * Đếm tổng số bản ghi apply của nhân viên (UNION ALL 7 bảng apply)
     */
    int countMyApplyList(EssApplyInfoDto dto);

    /**
     * Lấy danh sách phân trang các apply của nhân viên
     */
    List<EssApplyInfoDto> getMyApplyListPage(EssApplyInfoDto dto);
}
