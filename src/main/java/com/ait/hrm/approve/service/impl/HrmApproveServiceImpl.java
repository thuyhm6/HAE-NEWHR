package com.ait.hrm.approve.service.impl;

import com.ait.ess.empinfo.service.EssPersonalInfoService;
import com.ait.hrm.approve.dto.HrmApproveApplyDto;
import com.ait.hrm.approve.mapper.HrmApproveMapper;
import com.ait.hrm.approve.service.HrmApproveService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class HrmApproveServiceImpl implements HrmApproveService {

    @Autowired
    private HrmApproveMapper hrmApproveMapper;

    @Autowired
    private EssPersonalInfoService essPersonalInfoService;

    @Override
    public int countApplyList(HrmApproveApplyDto dto) {
        try {
            return hrmApproveMapper.countApplyList(dto);
        } catch (Exception e) {
            log.error("Lỗi đếm danh sách apply cho manager", e);
            return 0;
        }
    }

    @Override
    public List<HrmApproveApplyDto> getApplyListPage(HrmApproveApplyDto dto) {
        try {
            return hrmApproveMapper.selectApplyListPage(dto);
        } catch (Exception e) {
            log.error("Lỗi lấy danh sách apply phân trang cho manager", e);
            return List.of();
        }
    }

    @Override
    public Object getApplyDetail(String applyNo, String applyTableType) {
        try {
            return essPersonalInfoService.getApplyDetail(applyNo, applyTableType);
        } catch (Exception e) {
            log.error("Lỗi lấy chi tiết apply applyNo={} type={}", applyNo, applyTableType, e);
            return null;
        }
    }

    @Override
    public Map<String, Object> getOriginalData(String applyNo, String applyTableType) {
        try {
            switch (applyTableType) {
                case "PERSONAL":     return hrmApproveMapper.getOriginalPersonal(applyNo);
                case "ADDRESS":      return hrmApproveMapper.getOriginalAddress(applyNo);
                case "FAMILY":       return hrmApproveMapper.getOriginalFamily(applyNo);
                case "EMERGENCY":    return hrmApproveMapper.getOriginalEmergency(applyNo);
                case "WORK_EXP":     return hrmApproveMapper.getOriginalWorkExp(applyNo);
                case "EDUCATION":    return hrmApproveMapper.getOriginalEducation(applyNo);
                case "QUALIFICATION":return hrmApproveMapper.getOriginalQualification(applyNo);
                default:
                    log.warn("Loại apply không xác định: {}", applyTableType);
                    return null;
            }
        } catch (Exception e) {
            log.error("Lỗi lấy dữ liệu gốc applyNo={} type={}", applyNo, applyTableType, e);
            return null;
        }
    }

    @Override
    @Transactional
    public void approve(String applyNo, String applyTableType) {
        log.info("Phê duyệt apply applyNo={} type={}", applyNo, applyTableType);
        try {
            // 1. Sao chép dữ liệu từ bảng apply vào bảng chính
            int copyCount = copyDataToMainTable(applyNo, applyTableType);
            log.debug("Đã sao chép {} bản ghi vào bảng chính, applyNo={}", copyCount, applyNo);

            // 2. Cập nhật ACTIVITY=2 (đã duyệt) trong bảng apply
            int updateCount = updateApplyActivity(applyNo, applyTableType, 2);
            log.info("Phê duyệt thành công applyNo={} type={}, updated={}", applyNo, applyTableType, updateCount);
        } catch (Exception e) {
            log.error("Lỗi phê duyệt applyNo={} type={}", applyNo, applyTableType, e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void reject(String applyNo, String applyTableType) {
        log.info("Từ chối apply applyNo={} type={}", applyNo, applyTableType);
        try {
            int updateCount = updateApplyActivity(applyNo, applyTableType, 3);
            log.info("Từ chối thành công applyNo={} type={}, updated={}", applyNo, applyTableType, updateCount);
        } catch (Exception e) {
            log.error("Lỗi từ chối applyNo={} type={}", applyNo, applyTableType, e);
            throw e;
        }
    }

    private int copyDataToMainTable(String applyNo, String applyTableType) {
        switch (applyTableType) {
            case "PERSONAL":     return hrmApproveMapper.approvePersonalInfo(applyNo);
            case "ADDRESS":      return hrmApproveMapper.approveAddress(applyNo);
            case "FAMILY":       return hrmApproveMapper.approveFamily(applyNo);
            case "EMERGENCY":    return hrmApproveMapper.approveEmergency(applyNo);
            case "WORK_EXP":     return hrmApproveMapper.approveWorkExp(applyNo);
            case "EDUCATION":    return hrmApproveMapper.approveEducation(applyNo);
            case "QUALIFICATION":return hrmApproveMapper.approveQualification(applyNo);
            default:
                log.warn("Loại apply không xác định khi copy sang bảng chính: {}", applyTableType);
                return 0;
        }
    }

    private int updateApplyActivity(String applyNo, String applyTableType, int activity) {
        switch (applyTableType) {
            case "PERSONAL":     return hrmApproveMapper.updatePersonalApplyActivity(applyNo, activity);
            case "ADDRESS":      return hrmApproveMapper.updateAddressApplyActivity(applyNo, activity);
            case "FAMILY":       return hrmApproveMapper.updateFamilyApplyActivity(applyNo, activity);
            case "EMERGENCY":    return hrmApproveMapper.updateEmergencyApplyActivity(applyNo, activity);
            case "WORK_EXP":     return hrmApproveMapper.updateWorkExpApplyActivity(applyNo, activity);
            case "EDUCATION":    return hrmApproveMapper.updateEducationApplyActivity(applyNo, activity);
            case "QUALIFICATION":return hrmApproveMapper.updateQualificationApplyActivity(applyNo, activity);
            default:
                log.warn("Loại apply không xác định khi cập nhật activity: {}", applyTableType);
                return 0;
        }
    }
}
