package com.ait.ess.infoApplyAttendance.service.impl;

import com.ait.ar.attendanceMintenance.mapper.EssLeaveApplyMapper;
import com.ait.ar.attendanceMintenance.service.EssLeaveApplyService;
import com.ait.ess.infoApplyAttendance.dto.EssApplyAttBatchDto;
import com.ait.ess.infoApplyAttendance.dto.EssApplyAttBatchSaveDto;
import com.ait.ess.infoApplyAttendance.mapper.EssApplyAttBatchMapper;
import com.ait.ess.infoApplyAttendance.service.EssApplyAttBatchService;
import com.ait.sy.syAffirm.dto.SyAffirmEmailDto;
import com.ait.sy.syAffirm.service.SyAffirmEmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Port logic từ ApplyAttendanceCtroller / InfoApplyLeaveDaoImpl (Hanwha_HAE):
 * saveAttApplyInfoByAnyApproverForBatch, delAttendanceApplyInfoForBatch,
 * getAttendanceInformation, getLeaveDateSST, getAffirmorByApplyNoList,
 * viewAffirmorByPersonIdListForCode.
 * Việc ghi đơn + dây chuyền duyệt tái sử dụng EssLeaveApplyService#saveLeaveApply.
 */
@Service
public class EssApplyAttBatchServiceImpl implements EssApplyAttBatchService {

    private static final Logger log = LoggerFactory.getLogger(EssApplyAttBatchServiceImpl.class);

    private static final String APPLY_TYPE_NO = "21";
    private static final String APPROV_TYPE_APPROVAL = "1";
    private static final List<String> NOT_DELETABLE_FLAGS = Arrays.asList("14014309", "14014310");
    private static final List<String> FEMALE_SEX_CODES = Arrays.asList("1325", "14013823");
    private static final List<String> MALE_SEX_CODES = Arrays.asList("1326", "14013822");
    /** Oracle giới hạn 1000 phần tử trong mệnh đề IN */
    private static final int IN_CHUNK_SIZE = 900;

    @Autowired
    private EssApplyAttBatchMapper mapper;

    @Autowired
    private EssLeaveApplyMapper leaveApplyMapper;

    @Autowired
    private EssLeaveApplyService leaveApplyService;

    @Autowired
    private SyAffirmEmailService affirmEmailService;

    @Override
    public List<EssApplyAttBatchDto> getList(EssApplyAttBatchDto params) {
        log.info("getList keyword={} deptNo={} start={} end={}", params.getKeyword(), params.getDeptNo(),
                params.getStartDate(), params.getEndDate());
        try {
            List<EssApplyAttBatchDto> list = mapper.selectList(params);
            return list != null ? list : Collections.emptyList();
        } catch (Exception e) {
            log.error("getList error", e);
            throw e;
        }
    }

    @Override
    public Map<String, List<SyAffirmEmailDto>> getAffirmorsByApplyNos(List<String> applyNos) {
        Map<String, List<SyAffirmEmailDto>> result = new LinkedHashMap<>();
        if (applyNos == null || applyNos.isEmpty()) {
            return result;
        }
        log.info("getAffirmorsByApplyNos size={}", applyNos.size());
        try {
            for (int i = 0; i < applyNos.size(); i += IN_CHUNK_SIZE) {
                List<String> chunk = applyNos.subList(i, Math.min(i + IN_CHUNK_SIZE, applyNos.size()));
                List<SyAffirmEmailDto> rows = mapper.selectAffirmorByApplyNos(chunk);
                if (rows == null) continue;
                for (SyAffirmEmailDto row : rows) {
                    result.computeIfAbsent(row.getApplyNo(), k -> new ArrayList<>()).add(row);
                }
            }
            return result;
        } catch (Exception e) {
            log.error("getAffirmorsByApplyNos error", e);
            throw e;
        }
    }

    @Override
    public List<SyAffirmEmailDto> getDefaultAffirmors(String personId, String leaveTypeCode, String applyLength) {
        log.info("getDefaultAffirmors personId={} leaveTypeCode={} applyLength={}", personId, leaveTypeCode, applyLength);
        if (isBlank(personId)) {
            return Collections.emptyList();
        }
        try {
            List<SyAffirmEmailDto> list = affirmEmailService.findAffirmorList(APPLY_TYPE_NO, personId,
                    trim(leaveTypeCode), isBlank(applyLength) ? "0" : applyLength.trim());
            if (list == null) {
                return Collections.emptyList();
            }
            for (SyAffirmEmailDto dto : list) {
                if (isBlank(dto.getAffirmPersonId())) {
                    dto.setAffirmPersonId(dto.getAffirmorId());
                }
                if (isBlank(dto.getAffirmType())) {
                    dto.setAffirmType(APPROV_TYPE_APPROVAL);
                }
            }
            return list;
        } catch (Exception e) {
            // Hàm PL/SQL lỗi không chặn người dùng - họ vẫn có thể tự thêm người duyệt
            log.error("getDefaultAffirmors error personId={}", personId, e);
            return Collections.emptyList();
        }
    }

    @Override
    public EssApplyAttBatchDto getEmpAttendanceInfo(String personId, String applyDate) {
        log.info("getEmpAttendanceInfo personId={} applyDate={}", personId, applyDate);
        if (isBlank(personId) || isBlank(applyDate)) {
            return new EssApplyAttBatchDto();
        }
        try {
            EssApplyAttBatchDto dto = mapper.selectEmpAttendanceInfo(personId.trim(), applyDate.trim());
            return dto != null ? dto : new EssApplyAttBatchDto();
        } catch (Exception e) {
            log.error("getEmpAttendanceInfo error personId={}", personId, e);
            throw e;
        }
    }

    @Override
    public EssApplyAttBatchDto calcLeaveLength(String personId, String fromTime, String toTime, String leaveTypeCode) {
        log.info("calcLeaveLength personId={} from={} to={} type={}", personId, fromTime, toTime, leaveTypeCode);
        if (isBlank(personId) || isBlank(fromTime) || isBlank(toTime)) {
            return new EssApplyAttBatchDto();
        }
        try {
            EssApplyAttBatchDto dto = mapper.selectLeaveLength(personId.trim(), fromTime.trim(), toTime.trim(),
                    trim(leaveTypeCode));
            return dto != null ? dto : new EssApplyAttBatchDto();
        } catch (Exception e) {
            log.error("calcLeaveLength error personId={}", personId, e);
            throw e;
        }
    }

    @Override
    public String checkLeaveSex(String personId, String leaveTypeCode) {
        log.info("checkLeaveSex personId={} leaveTypeCode={}", personId, leaveTypeCode);
        String type = trim(leaveTypeCode);
        if (isBlank(personId) || !Arrays.asList("16415", "482", "27", "28").contains(type)) {
            return null;
        }
        try {
            String sexCode = trim(mapper.selectSexCode(personId.trim()));
            boolean female = FEMALE_SEX_CODES.contains(sexCode);
            boolean male = MALE_SEX_CODES.contains(sexCode);
            switch (type) {
                case "16415":
                    return female ? null : "alert.message.BURUJIAJINXIANNVSHISHENQING.b";
                case "482":
                    return female ? null : "alert.message.CHANQIANJIANCHAJIAJINXIANNVSHISHENQING.b";
                case "27":
                    return female ? null : "alert.message.CHANJIAJINXIANNVSHISHENQING.b";
                case "28":
                    return male ? null : "alert.message.PEICHANJIAJINXIANNANSHISHENQING.b";
                default:
                    return null;
            }
        } catch (Exception e) {
            log.error("checkLeaveSex error personId={}", personId, e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> saveBatch(List<EssApplyAttBatchSaveDto> items) {
        log.info("saveBatch size={}", items == null ? 0 : items.size());
        List<String> savedApplyNos = new ArrayList<>();
        List<String> misDocIds = new ArrayList<>();
        if (items == null || items.isEmpty()) {
            throw new BusinessException("ar.alert.message.viewardetail.choosetoadd", null);
        }
        try {
            for (EssApplyAttBatchSaveDto item : items) {
                String name = trim(item.getLocalName());

                // Kiểm tra giới tính theo loại nghỉ (getLeaveDateSST)
                String sexError = checkLeaveSex(item.getPersonId(), item.getLeaveTypeCode());
                if (sexError != null) {
                    throw new BusinessException(sexError, name);
                }
                // Thời lượng không được nhỏ hơn MIN_VALUE của loại nghỉ (AR_ITEM_PARAM)
                checkMinValue(item, name);

                String applyNo = trim(item.getApplyNo());
                if (!applyNo.isEmpty()) {
                    // Đơn cũ đã gửi EagleOffice -> hủy phê duyệt cũ sau khi commit
                    String misDocId = mapper.selectSentMisDocId(applyNo);
                    if (!isBlank(misDocId)) {
                        misDocIds.add(misDocId);
                    }
                }

                Map<String, Object> params = item.toSaveParams();
                leaveApplyService.saveLeaveApply(params);
                savedApplyNos.add(trim(params.get("applyNo")));
            }
        } catch (BusinessException e) {
            log.warn("saveBatch business error: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("saveBatch error", e);
            throw e;
        }
        Map<String, Object> result = new HashMap<>();
        result.put("applyNos", savedApplyNos);
        result.put("misDocIds", misDocIds);
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> deleteBatch(List<String> applyNos) {
        log.info("deleteBatch applyNos={}", applyNos);
        if (applyNos == null || applyNos.isEmpty()) {
            throw new BusinessException("alert.message.ess.affirmApply.chooseApplyRecordFirstForBatch", null);
        }
        List<String> misDocIds = new ArrayList<>();
        try {
            for (String rawApplyNo : applyNos) {
                String applyNo = trim(rawApplyNo);
                if (applyNo.isEmpty()) continue;
                EssApplyAttBatchDto apply = mapper.selectApplyForDelete(applyNo);
                if (apply == null) {
                    log.warn("deleteBatch: applyNo={} not found or inactive", applyNo);
                    continue;
                }
                if (NOT_DELETABLE_FLAGS.contains(trim(apply.getAffirmFlag()))) {
                    throw new BusinessException("alert.message.delete_fail", null);
                }
                // Không cho xóa khi chứa ngày công đã chốt / thời gian đã khóa
                Integer clash = leaveApplyMapper.selectLeaveClash(applyNo, apply.getPersonId(),
                        apply.getFromDate() + " " + apply.getFromTime(),
                        apply.getToDate() + " " + apply.getToTime());
                if (clash != null && clash == -1) {
                    throw new BusinessException("ar.viewApplyAttenanceManagentInfoList.BAOHANKAOQINGUANBIDESHIJIAN.b", null);
                }
                if (clash != null && clash == -2) {
                    throw new BusinessException("ar.viewArOvertimeManaget_fast.Include_apply_closed.b", null);
                }

                String misDocId = mapper.selectSentMisDocId(applyNo);
                if (!isBlank(misDocId)) {
                    misDocIds.add(misDocId);
                }

                Map<String, Object> confirmParams = new HashMap<>();
                confirmParams.put("applyNo", applyNo);
                confirmParams.put("message", "");
                leaveApplyMapper.callDeleteLeaveConfirm(confirmParams);
                // Phải chạy trước khi ACTIVITY = 0 vì câu lệnh lọc EL.ACTIVITY = '1'
                mapper.insertArShiftChange(applyNo);
                mapper.deactivateLeaveApply(applyNo);
                leaveApplyMapper.deleteArApplyResult(applyNo);

                Map<String, Object> affirmInfo = leaveApplyMapper.selectAffirmEmailForCancel(applyNo);
                if (affirmInfo != null) {
                    Map<String, Object> cancelParams = new HashMap<>();
                    cancelParams.put("applyNo", trim(affirmInfo.get("APPLY_NO")));
                    cancelParams.put("applyType", trim(affirmInfo.get("APPLY_TYPE")));
                    cancelParams.put("applyFlag", trim(affirmInfo.get("APPLY_FLAG")));
                    cancelParams.put("message", "");
                    leaveApplyMapper.callAffirmCancel(cancelParams);
                }
            }
        } catch (BusinessException e) {
            log.warn("deleteBatch business error: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("deleteBatch error", e);
            throw e;
        }
        Map<String, Object> result = new HashMap<>();
        result.put("misDocIds", misDocIds);
        return result;
    }

    /** Port đoạn so sánh MIN_VALUE trong InfoApplyLeaveDaoImpl#saveAttApplyInfoByAnyApproverForBatch */
    private void checkMinValue(EssApplyAttBatchSaveDto item, String name) {
        Map<String, Object> itemParam = mapper.selectLeaveItemMinValue(item.getLeaveTypeCode());
        if (itemParam == null || isBlank(trim(itemParam.get("MIN_VALUE")))) {
            return;
        }
        float minValue;
        float applyLength;
        try {
            minValue = Float.parseFloat(trim(itemParam.get("MIN_VALUE")));
            applyLength = Float.parseFloat(isBlank(item.getApplyLength()) ? "0" : item.getApplyLength().trim());
        } catch (NumberFormatException e) {
            log.warn("checkMinValue: invalid number min={} length={}", itemParam.get("MIN_VALUE"), item.getApplyLength());
            return;
        }
        String unit = trim(itemParam.get("UNIT"));
        if ("DAY".equals(unit)) {
            minValue = minValue * 8;
        } else if ("MINUTE".equals(unit)) {
            minValue = minValue / 60;
        }
        if (applyLength < minValue) {
            throw new BusinessException("alert.message.ess.infoApply.applyTimeCanNotLessThanMinValue", name);
        }
    }

    private static boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private static String trim(Object value) {
        return value == null ? "" : value.toString().trim();
    }
}
