package com.ait.ess.infoApply.service.impl;

import com.ait.ar.attendanceMintenance.dto.ArOvertimeManagentDto;
import com.ait.ar.attendanceMintenance.service.ArOvertimeManagentService;
import com.ait.ess.infoApply.dto.EssSstApplyDto;
import com.ait.ess.infoApply.mapper.EssSstApplyMapper;
import com.ait.ess.infoApply.service.EssSstApplyService;
import com.ait.ess.infoApplyAttendance.dto.EssApplyAttBatchSaveDto;
import com.ait.ess.infoApplyAttendance.service.EssApplyAttBatchService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Port logic từ InfoApplyCtroller / InfoApplySerImpl / InfoApplyLeaveSerImpl (Hanwha_HAE):
 * getOtShiftTime, getOtLength, addSSTOvertimeApply, addOtOverApply, addLeaveApplySST.
 * Việc ghi đơn + dây chuyền duyệt tái sử dụng ArOvertimeManagentService và EssApplyAttBatchService.
 */
@Service
public class EssSstApplyServiceImpl implements EssSstApplyService {

    private static final Logger log = LoggerFactory.getLogger(EssSstApplyServiceImpl.class);

    private static final String CHECK_OK = "OK";

    @Autowired
    private EssSstApplyMapper mapper;

    @Autowired
    private ArOvertimeManagentService overtimeService;

    @Autowired
    private EssApplyAttBatchService applyAttBatchService;

    @Override
    public EssSstApplyDto getOtShiftTime(String applyDate) {
        log.info("getOtShiftTime applyDate={}", applyDate);
        if (isBlank(applyDate)) {
            return new EssSstApplyDto();
        }
        try {
            EssSstApplyDto dto = mapper.selectOtShiftTime(applyDate.trim());
            return dto != null ? dto : new EssSstApplyDto();
        } catch (Exception e) {
            log.error("getOtShiftTime error applyDate={}", applyDate, e);
            throw e;
        }
    }

    @Override
    public EssSstApplyDto getOtLength(String applyDate, String otTypeCode, String otFromTime, String otToTime,
                                      String deductYn) {
        log.info("getOtLength applyDate={} type={} from={} to={} deduct={}", applyDate, otTypeCode, otFromTime,
                otToTime, deductYn);
        if (isBlank(applyDate) || isBlank(otFromTime) || isBlank(otToTime)) {
            return new EssSstApplyDto();
        }
        try {
            EssSstApplyDto dto = mapper.selectOtLength(applyDate.trim(), trim(otTypeCode), otFromTime.trim(),
                    otToTime.trim(), isBlank(deductYn) ? "0" : deductYn.trim());
            return dto != null ? dto : new EssSstApplyDto();
        } catch (Exception e) {
            log.error("getOtLength error applyDate={}", applyDate, e);
            throw e;
        }
    }

    @Override
    public Integer checkOtClash(String otFromTime, String otToTime, String offsetYn, boolean over) {
        log.info("checkOtClash from={} to={} offset={} over={}", otFromTime, otToTime, offsetYn, over);
        if (isBlank(otFromTime) || isBlank(otToTime)) {
            return 0;
        }
        try {
            Integer flag = mapper.selectOtClash(otFromTime.trim(), otToTime.trim(),
                    isBlank(offsetYn) ? "0" : offsetYn.trim(), over);
            return flag != null ? flag : 0;
        } catch (Exception e) {
            log.error("checkOtClash error from={} to={}", otFromTime, otToTime, e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public String saveOvertime(ArOvertimeManagentDto dto, boolean over) {
        log.info("saveOvertime over={} applyOtDate={} from={} to={}", over, dto.getApplyOtDate(), dto.getOtFromTime(),
                dto.getOtToTime());
        try {
            // getOtCheckSST: hàm PL/SQL chỉ nhận giờ HH24:MI (tách từ YYYY-MM-DD HH24:MI)
            String result = runCheck(() -> mapper.selectCheckOtTime(dto.getApplyOtDate(),
                    timePart(dto.getOtFromTime()), timePart(dto.getOtToTime()), dto.getOtTypeCode()), "CHECK_OT_TIME");
            if (result != null && !CHECK_OK.equals(result)) {
                throw new CheckException(result);
            }
            dto.setApplyNo("");
            if (over) {
                overtimeService.saveOver(dto);
            } else {
                overtimeService.save(dto);
            }
            return trim(dto.getApplyNo());
        } catch (CheckException e) {
            log.warn("saveOvertime check failed: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("saveOvertime error", e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public String saveLeave(EssApplyAttBatchSaveDto item) {
        log.info("saveLeave type={} from={} to={}", item.getLeaveTypeCode(), item.getLeaveFromTime(),
                item.getLeaveToTime());
        try {
            String result = runCheck(() -> mapper.selectCheckLeaveTime(item.getLeaveFromTime(), item.getLeaveToTime(),
                    item.getLeaveTypeCode()), "CHECK_LEAVE_TIME");
            if (result != null && !CHECK_OK.equals(result)) {
                throw new CheckException(result);
            }
            item.setApplyNo("");
            Map<String, Object> saved = applyAttBatchService.saveBatch(Collections.singletonList(item));
            Object applyNos = saved.get("applyNos");
            if (applyNos instanceof List && !((List<?>) applyNos).isEmpty()) {
                return String.valueOf(((List<?>) applyNos).get(0));
            }
            return "";
        } catch (CheckException e) {
            log.warn("saveLeave check failed: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("saveLeave error", e);
            throw e;
        }
    }

    /**
     * Hàm CHECK_*_{cpnyId} là hàm riêng theo công ty ở bản cũ. Nếu DB hiện tại không có hàm này
     * (ORA-00904) thì chỉ ghi log cảnh báo và bỏ qua, các kiểm tra trùng/khóa công khác vẫn chạy
     * trong ArOvertimeManagentService / EssLeaveApplyService.
     */
    private String runCheck(java.util.function.Supplier<String> check, String name) {
        try {
            String result = check.get();
            return result == null ? null : result.trim();
        } catch (DataAccessException e) {
            log.warn("{} skipped: {}", name, e.getMostSpecificCause().getMessage());
            return null;
        }
    }

    /** 'YYYY-MM-DD HH24:MI' -> 'HH24:MI' */
    private static String timePart(String dateTime) {
        String value = trim(dateTime);
        int idx = value.indexOf(' ');
        return idx > -1 ? value.substring(idx + 1) : value;
    }

    private static boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private static String trim(Object value) {
        return value == null ? "" : value.toString().trim();
    }
}
