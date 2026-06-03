package com.ait.ar.attendanceMintenance.service.impl;

import com.ait.ar.attendanceMintenance.dto.EssLeaveApplyDto;
import com.ait.ar.attendanceMintenance.dto.EssLeaveApplyImportTempDto;
import com.ait.sy.syAffirm.dto.SyAffirmEmailDto;
import com.ait.sy.syAffirm.mapper.SyAffirmEmailMapper;
import com.ait.ar.attendanceMintenance.mapper.EssLeaveApplyMapper;
import com.ait.ar.attendanceMintenance.service.EssLeaveApplyService;
import com.ait.ess.empinfo.dto.EssPersonalInfoDto;
import com.ait.ess.empinfo.mapper.EssPersonalInfoMapper;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class EssLeaveApplyServiceImpl implements EssLeaveApplyService {

    private static final Logger log = LoggerFactory.getLogger(EssLeaveApplyServiceImpl.class);

    private static final String APPLY_TYPE_NO = "21";
    //private static final String APPLY_TYPE_NO = "31";
    private static final String APPLY_AFFIRM_FLAG = "14014306";

    @Autowired
    private EssLeaveApplyMapper essLeaveApplymapper;

    @Autowired
    private SyAffirmEmailMapper affirmorMapper;

    @Autowired
    private EssPersonalInfoMapper essPersonalInfoMapper;

    @Override
    public List<EssLeaveApplyDto> getList(EssLeaveApplyDto dto) {
        return essLeaveApplymapper.selectList(dto);
    }

    @Override
    public List<EssLeaveApplyImportTempDto> getImportTempList(String errorOnly) {
        return essLeaveApplymapper.selectImportTempList(toTrimmedString(errorOnly));
    }

    @Override
    @Transactional
    public String importTempToOfficial() {
        Map<String, Object> params = new HashMap<>();
        params.put("message", "");
        essLeaveApplymapper.callImportAttendanceTemp(params);

        String message = toTrimmedString(params.get("message"));
        if (isProcedureErrorMessage(message)) {
            throw new IllegalStateException(message);
        }
        return message;
    }

    @Override
    public Map<String, Object> getLeaveApplyDetail(String applyNo, String applyType) {
        String resolvedApplyNo = toTrimmedString(applyNo);
        if (resolvedApplyNo.isEmpty()) {
            Map<String, Object> empty = new HashMap<>();
            empty.put("leaveInfo", null);
            empty.put("employeeInfo", null);
            empty.put("approvalList", Collections.emptyList());
            return empty;
        }

        EssLeaveApplyDto leaveInfo = essLeaveApplymapper.selectLeaveApplyInfo(resolvedApplyNo);

        String resolvedApplyType = toTrimmedString(applyType);
        if (resolvedApplyType.isEmpty() && leaveInfo != null) {
            resolvedApplyType = toTrimmedString(leaveInfo.getLeaveTypeCode());
        }

        List<SyAffirmEmailDto> approvalList = essLeaveApplymapper.selectApprovalInfo(resolvedApplyNo,
                resolvedApplyType);

        Map<String, Object> result = new HashMap<>();
        result.put("leaveInfo", leaveInfo);
        result.put("employeeInfo", leaveInfo);
        result.put("approvalList", approvalList == null ? Collections.emptyList() : approvalList);
        return result;
    }

    @Override
    @Transactional
    public void saveLeaveApply(Map<String, Object> params) {

        Object applyNoObj = params.get("applyNo");
        boolean isNew = applyNoObj == null || applyNoObj.toString().trim().isEmpty()
                || applyNoObj.toString().equals("0");
        String personId = toTrimmedString(params.get("personId"));
        String applyNo = "";

        if (personId.isEmpty()) {
            throw new IllegalArgumentException("personId is required");
        }
        params.put("personId", personId);
        params.put("applyTypeNo", APPLY_TYPE_NO);

        // Kiểm tra xung đột thời gian trước khi lưu.
        // Bỏ qua record có AFFIRM_FLAG IN ('14014309','14014310') hoặc CONFIRM_FLAG = 0.
        String currentApplyNo = applyNoObj != null ? applyNoObj.toString().trim() : "";
        checkTimeConflict(params, currentApplyNo);
        checkLeaveClash(params);

        // 1. Insert/Update thủ tục Leave Apply
        if (isNew) {
            applyNo = essLeaveApplymapper.getNextApplySeq().toString();
            params.put("applyNo", applyNo);
            essLeaveApplymapper.insertLeaveApply(params);
        } else {
            applyNo = applyNoObj.toString();
            essLeaveApplymapper.updateLeaveApply(params);
        }

        String lastName = "";
        if (params.get("leaveFromTime").toString().equals(params.get("leaveToTime").toString())) {
            lastName = "Apply(" + params.get("localName") + ")[Date：" + params.get("leaveFromTime") + "]";
        } else {
            lastName = "Apply(" + params.get("localName") + ")[Date：" + params.get("leaveFromTime") + " ~ "
                    + params.get("leaveToTime") + "]";
        }

        EssPersonalInfoDto empInfo = essPersonalInfoMapper.findMyInfo(personId);
        String applyPersonInfo;
        if (empInfo != null) {
            applyPersonInfo = safeString(empInfo.getLocalName()) + " / "
                    + safeString(empInfo.getPostGradeName()) + " / "
                    + safeString(empInfo.getDeptName());
        } else {
            applyPersonInfo = safeString(params.get("localName")) + " (" + safeString(params.get("empId")) + ")";
        }

        // 2. Cập nhật tiến trình phê duyệt (xóa cũ)
        params.put("message", "");
        essLeaveApplymapper.callDeleteLeaveConfirm(params); // call delete procedure
        essLeaveApplymapper.deleteArApplyResult(applyNo);

        // 3. Insert duyệt mức 0 (Người tạo)
        SyAffirmEmailDto affirmor0 = new SyAffirmEmailDto();
        affirmor0.setAffirmType("4");
        affirmor0.setAffirmLevel("0");
        affirmor0.setAffirmPersonId(personId);
        affirmor0.setApplyType(params.get("leaveTypeCode").toString());
        affirmor0.setApplyTypeCode(APPLY_TYPE_NO);
        affirmor0.setApplyAffirmFlag("14014306");
        affirmor0.setApplyFlag("0");
        affirmor0.setLastName(lastName);
        affirmor0.setApplyPersonInfo(applyPersonInfo);
        affirmor0.setApplyNo(applyNo);

        affirmorMapper.delete(applyNo);
        affirmorMapper.insert(affirmor0);

        // 4. Insert các mức duyệt tiếp theo
        // 1. Chuẩn bị tham số truyền vào Mapper
        Map<String, Object> affirmorParams = new HashMap<>();
        affirmorParams.put("applyTypeNo", params.get("applyTypeNo"));
        affirmorParams.put("personId", personId);
        affirmorParams.put("applyTypeCode", params.get("leaveTypeCode"));
        affirmorParams.put("applyLength", params.get("applyLength"));
        affirmorParams.put("lang", "vi");

        // 2. Thực thi gọi hàm Oracle qua MyBatis.
        // Sau khi chạy xong, MyBatis tự động đẩy kết quả vào key "resultList" trong params.
        affirmorMapper.getAffirmorList(affirmorParams);

        // 3. Ép kiểu an toàn và lấy danh sách kết quả từ tham số OUT
        // các trường lấy ra lần lượt là empId, localName, positionNo, positionName, deptName, postionname, affirmorId, affirmLevel
        @SuppressWarnings("unchecked")
        List<SyAffirmEmailDto> affirmorList = (List<SyAffirmEmailDto>) affirmorParams.get("resultList");
        if (affirmorList != null) {
            for (SyAffirmEmailDto affirmor : affirmorList) {
                affirmor.setAffirmType("1");
                affirmor.setApplyNo(applyNo);
                affirmor.setApplyType(params.get("leaveTypeCode").toString());
                affirmor.setApplyTypeCode("21");
                affirmor.setApplyAffirmFlag("14014306");
                affirmor.setApplyFlag("0");
                affirmor.setAffirmPersonId(affirmor.getAffirmorId());
                affirmor.setLastName(lastName);
                affirmor.setApplyPersonInfo(applyPersonInfo);
                affirmorMapper.insert(affirmor);
            }
        }
    }

    @Override
    public Map<String, Object> calculateLeaveLength(String fromDateTime, String toDateTime, String leaveTypeCode) {
        Map<String, Object> result = essLeaveApplymapper.selectLeaveLength(
                toTrimmedString(fromDateTime),
                toTrimmedString(toDateTime),
                toTrimmedString(leaveTypeCode));
        return result != null ? result : new HashMap<>();
    }

    @Override
    public List<EssLeaveApplyDto> getMyLeaveApplyList(EssLeaveApplyDto dto) {
        return essLeaveApplymapper.selectMyLeaveApplyList(dto);
    }

    @Override
    @Transactional
    public int cancelMyLeaveApplyList(List<String> applyNos) {
        if (applyNos == null || applyNos.isEmpty()) return 0;
        log.info("cancelMyLeaveApplyList checking lock for applyNos={}", applyNos);
        int lockedByDetail = essLeaveApplymapper.countLockedByArDetailHtsv(applyNos);
        int lockedByDept   = essLeaveApplymapper.countLockedByArDeptManage(applyNos);
        if (lockedByDetail > 0 || lockedByDept > 0) {
            throw new IllegalStateException("Đơn nghỉ phép này đã bị khóa, không thể hủy bỏ!");
        }
        return essLeaveApplymapper.cancelMyLeaveApplyList(applyNos);
    }

    @Override
    public Map<String, Object> getMyVacationInfo(String personId) {
        if (personId == null || personId.trim().isEmpty()) {
            return new HashMap<>();
        }
        Map<String, Object> result = essLeaveApplymapper.selectMyVacationInfo(personId.trim());
        return result != null ? result : new HashMap<>();
    }

    @Override
    public Map<String, Object> calcLeaveLengthForPerson(String personId, String fromTime, String toTime, String leaveTypeCode) {
        log.info("calcLeaveLengthForPerson personId={} from={} to={} type={}", personId, fromTime, toTime, leaveTypeCode);
        try {
            Map<String, Object> result = essLeaveApplymapper.selectLeaveLengthForPerson(
                    toTrimmedString(personId),
                    toTrimmedString(fromTime),
                    toTrimmedString(toTime),
                    toTrimmedString(leaveTypeCode));
            return result != null ? result : new HashMap<>();
        } catch (Exception e) {
            log.error("calcLeaveLengthForPerson error personId={}", personId, e);
            return new HashMap<>();
        }
    }

    @Override
    public Map<String, Object> getEmpDefaultInfo(String personId) {
        log.info("getEmpDefaultInfo personId={}", personId);
        try {
            Map<String, Object> result = essLeaveApplymapper.selectEmpDefaultInfo(toTrimmedString(personId));
            return result != null ? result : new HashMap<>();
        } catch (Exception e) {
            log.error("getEmpDefaultInfo error personId={}", personId, e);
            return new HashMap<>();
        }
    }

    @Override
    @Transactional
    public void cancelLeaveApplyByApplyNo(String applyNo) {
        String trimmedApplyNo = toTrimmedString(applyNo);
        if (trimmedApplyNo.isEmpty()) {
            throw new IllegalArgumentException("applyNo is required");
        }
        log.info("cancelLeaveApplyByApplyNo applyNo={}", trimmedApplyNo);

        // 1. Cập nhật ACTIVITY=1, AFFIRM_FLAG=14014310
        Map<String, Object> updateParams = new HashMap<>();
        updateParams.put("applyNo", trimmedApplyNo);
        essLeaveApplymapper.updateCancelLeaveApply(updateParams);

        // 2. Gọi PKG_AFFIRM_EMAIL.PR_DELETE_LEAVE_CONFIRM
        Map<String, Object> deleteParams = new HashMap<>();
        deleteParams.put("applyNo", trimmedApplyNo);
        deleteParams.put("message", "");
        essLeaveApplymapper.callDeleteLeaveConfirm(deleteParams);
        String deleteMsg = toTrimmedString(deleteParams.get("message"));
        if (isProcedureErrorMessage(deleteMsg)) {
            throw new IllegalStateException(deleteMsg);
        }

        // 3. Lấy APPLY_NO, APPLY_TYPE, APPLY_FLAG từ SY_AFFIRM_EMAIL
        Map<String, Object> affirmInfo = essLeaveApplymapper.selectAffirmEmailForCancel(trimmedApplyNo);

        // 4. Gọi PKG_AFFIRM_EMAIL.PR_AFFIRM_CANCEL
        if (affirmInfo != null) {
            Map<String, Object> cancelParams = new HashMap<>();
            cancelParams.put("applyNo", toTrimmedString(affirmInfo.get("APPLY_NO")));
            cancelParams.put("applyType", toTrimmedString(affirmInfo.get("APPLY_TYPE")));
            cancelParams.put("applyFlag", toTrimmedString(affirmInfo.get("APPLY_FLAG")));
            cancelParams.put("message", "");
            essLeaveApplymapper.callAffirmCancel(cancelParams);
            String cancelMsg = toTrimmedString(cancelParams.get("message"));
            if (isProcedureErrorMessage(cancelMsg)) {
                throw new IllegalStateException(cancelMsg);
            }
        } else {
            log.warn("cancelLeaveApplyByApplyNo: no affirm email record found for applyNo={}", trimmedApplyNo);
        }
    }

    @Override
    @Transactional
    public void resubmitLeaveApply(Map<String, Object> params) {
        String oldApplyNo = toTrimmedString(params.get("applyNo"));
        if (oldApplyNo.isEmpty()) {
            throw new IllegalArgumentException("applyNo là bắt buộc để tạo lại đơn");
        }
        log.info("resubmitLeaveApply oldApplyNo={}", oldApplyNo);

        // 1. Xóa đơn cũ khỏi ESS_LEAVE_APPLY_TB
        essLeaveApplymapper.deleteLeaveApplyByApplyNo(oldApplyNo);

        // 2. Xóa SY_AFFIRM_EMAIL liên quan đến đơn cũ
        affirmorMapper.delete(oldApplyNo);

        // 3. Xóa AR_APPLY_RESULT liên quan đến đơn cũ
        essLeaveApplymapper.deleteArApplyResult(oldApplyNo);

        // 4. Tạo mới đơn với thông tin đã chỉnh sửa
        params.put("applyNo", "");
        saveLeaveApply(params);
    }

    private void checkLeaveClash(Map<String, Object> params) {
        String personId = toTrimmedString(params.get("personId"));
        String fromTime = toTrimmedString(params.get("leaveFromTime"));
        String toTime   = toTrimmedString(params.get("leaveToTime"));
        log.info("checkLeaveClash personId={} from={} to={}", personId, fromTime, toTime);
        try {
            Integer result = essLeaveApplymapper.selectLeaveClash(personId, fromTime, toTime);
            if (result == null) return;
            if (result > 0) {
                throw new IllegalStateException("Trùng với chấm công trước đó, xin kiểm tra thời gian này đã xin phép hay chưa!");
            } else if (result == -1) {
                throw new IllegalStateException("Ngày công đã chốt, xin kiểm tra lại!");
            } else if (result == -2) {
                throw new IllegalStateException("Thời gian đã khóa, xin kiểm tra lại!");
            }
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            log.error("checkLeaveClash error personId={}", personId, e);
            throw new IllegalStateException("Lỗi kiểm tra xung đột chấm công: " + e.getMessage());
        }
    }

    private void checkTimeConflict(Map<String, Object> params, String currentApplyNo) {
        Map<String, Object> conflictParams = new HashMap<>();
        conflictParams.put("personId", params.get("personId"));
        conflictParams.put("leaveFromTime", params.get("leaveFromTime"));
        conflictParams.put("leaveToTime", params.get("leaveToTime"));
        conflictParams.put("applyNo", currentApplyNo != null ? currentApplyNo : "");
        int conflictCount = essLeaveApplymapper.countConflictLeaveApply(conflictParams);
        if (conflictCount > 0) {
            throw new IllegalStateException("Thời gian nghỉ phép bị xung đột với đơn đã tồn tại.");
        }
    }

    private String toTrimmedString(Object value) {
        return value == null ? "" : value.toString().trim();
    }

    private boolean isProcedureErrorMessage(String message) {
        if (message == null || message.isBlank()) {
            return false;
        }
        String normalized = message.toLowerCase(Locale.ROOT);
        return normalized.contains("ora-")
                || normalized.contains("error")
                || normalized.contains("loi");
    }

    private String safeString(Object value) {
        return value == null ? "" : value.toString().trim();
    }
}
