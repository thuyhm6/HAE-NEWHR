package com.ait.ess.infoApply.service.impl;

import com.ait.ar.attendanceMintenance.dto.ArOvertimeManagentDto;
import com.ait.ar.attendanceMintenance.mapper.ArOvertimeManagentMapper;
import com.ait.ar.attendanceMintenance.service.ArOvertimeManagentService;
import com.ait.ess.infoApply.dto.EssOtBatchApproverDto;
import com.ait.ess.infoApply.mapper.EssOtBatchApproverMapper;
import com.ait.ess.infoApply.service.EssOtBatchApproverService;
import com.ait.sy.syAffirm.dto.SyAffirmEmailDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Port logic từ InfoApplyCtroller / InfoApplyDaoImpl (Hanwha_HAE):
 * viewApplyOtLBatchByAnyApproverList, viewApplyOTBatchInfoHAE, getValidateInfo,
 * saveOtApplyByAnyApproverForBatch, saveOTApplyInfoForBatchHAE,
 * delOtApplyAffirmForBatch, delOtOverApplyAffirmForBatch.
 * Ghi đơn + dây chuyền duyệt tái sử dụng ArOvertimeManagentService (save/saveOver),
 * hủy tiến trình duyệt tái sử dụng các procedure trong ArOvertimeManagentMapper.
 */
@Service
public class EssOtBatchApproverServiceImpl implements EssOtBatchApproverService {

    private static final Logger log = LoggerFactory.getLogger(EssOtBatchApproverServiceImpl.class);

    @Autowired
    private EssOtBatchApproverMapper mapper;

    @Autowired
    private ArOvertimeManagentMapper overtimeMapper;

    @Autowired
    private ArOvertimeManagentService overtimeService;

    @Override
    public List<EssOtBatchApproverDto> getList(EssOtBatchApproverDto params) {
        log.info("getList over={} keyword={} deptNo={} start={} end={}", params.isOver(), params.getKeyword(),
                params.getDeptNo(), params.getStartDate(), params.getEndDate());
        try {
            List<EssOtBatchApproverDto> list = mapper.selectList(params);
            return list != null ? list : Collections.emptyList();
        } catch (Exception e) {
            log.error("getList error", e);
            throw e;
        }
    }

    @Override
    public EssOtBatchApproverDto getValidateInfo(String personId, String applyOtDate, String otFromTime,
                                                 String otToTime, String deductYn) {
        log.info("getValidateInfo personId={} date={} from={} to={} deduct={}", personId, applyOtDate,
                otFromTime, otToTime, deductYn);
        if (isBlank(personId) || isBlank(applyOtDate)) {
            return new EssOtBatchApproverDto();
        }
        try {
            EssOtBatchApproverDto result = mapper.selectValidateInfo(personId.trim(), applyOtDate.trim(),
                    trim(otFromTime), trim(otToTime), isBlank(deductYn) ? "0" : deductYn.trim());
            return result != null ? result : new EssOtBatchApproverDto();
        } catch (Exception e) {
            log.error("getValidateInfo error personId={} date={}", personId, applyOtDate, e);
            throw e;
        }
    }

    @Override
    public EssOtBatchApproverDto getRowInfo(String personId, String applyOtDate) {
        log.info("getRowInfo personId={} date={}", personId, applyOtDate);
        if (isBlank(personId) || isBlank(applyOtDate)) {
            return new EssOtBatchApproverDto();
        }
        try {
            EssOtBatchApproverDto result = mapper.selectRowInfo(personId.trim(), applyOtDate.trim());
            return result != null ? result : new EssOtBatchApproverDto();
        } catch (Exception e) {
            log.error("getRowInfo error personId={} date={}", personId, applyOtDate, e);
            throw e;
        }
    }

    @Override
    public EssOtBatchApproverDto getDayDefault(String applyOtDate) {
        log.info("getDayDefault date={}", applyOtDate);
        if (isBlank(applyOtDate)) {
            return new EssOtBatchApproverDto();
        }
        try {
            EssOtBatchApproverDto result = mapper.selectDayDefault(applyOtDate.trim());
            return result != null ? result : new EssOtBatchApproverDto();
        } catch (Exception e) {
            log.error("getDayDefault error date={}", applyOtDate, e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public List<String> save(List<ArOvertimeManagentDto> items, boolean over) {
        log.info("save over={} size={}", over, items == null ? 0 : items.size());
        if (items == null || items.isEmpty()) {
            throw new IllegalArgumentException("Không có dữ liệu để lưu.");
        }
        try {
            for (ArOvertimeManagentDto item : items) {
                boolean hasApprover = item.getApprovers() != null && item.getApprovers().stream()
                        .anyMatch(a -> a != null && !isBlank(a.get("personId") == null ? null : a.get("personId").toString()));
                if (!hasApprover) {
                    // saveOtApplyByAnyApproverForBatch (bản cũ): không có người duyệt thì không cho lưu
                    throw new IllegalArgumentException(trim(item.getLocalName()) + " You Can't Apply Without the Approver");
                }
            }
            if (over) {
                overtimeService.saveBatchOver(items);
            } else {
                overtimeService.saveBatch(items);
            }
            List<String> applyNos = new ArrayList<>();
            for (ArOvertimeManagentDto item : items) {
                if (!isBlank(item.getApplyNo())) {
                    applyNos.add(item.getApplyNo());
                }
            }
            return applyNos;
        } catch (RuntimeException e) {
            log.error("save error over={}", over, e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int delete(List<String> applyNos, boolean over) {
        log.info("delete over={} applyNos={}", over, applyNos);
        if (applyNos == null || applyNos.isEmpty()) {
            throw new IllegalArgumentException("Danh sách đơn tăng ca không hợp lệ.");
        }
        try {
            int count = 0;
            for (String applyNo : applyNos) {
                if (isBlank(applyNo)) {
                    continue;
                }
                String no = applyNo.trim();
                // 1. PR_DELETE_OT_CONFIRM
                Map<String, Object> deleteParams = new HashMap<>();
                deleteParams.put("applyNo", no);
                deleteParams.put("message", "");
                overtimeMapper.callDeleteOtConfirm(deleteParams);
                checkProcedureMessage(deleteParams.get("message"));
                // 2. Vô hiệu đơn + xóa kết quả chấm công liên quan
                mapper.deactivateApply(no, over);
                overtimeMapper.deleteApplyResultByApplyNo(no);
                // 3. PR_AFFIRM_CANCEL
                SyAffirmEmailDto affirmEmail = overtimeMapper.selectCancelAffirmEmail(no);
                if (affirmEmail != null) {
                    Map<String, Object> cancelParams = new HashMap<>();
                    cancelParams.put("applyNo", affirmEmail.getApplyNo());
                    cancelParams.put("applyType", affirmEmail.getApplyType());
                    cancelParams.put("applyFlag", affirmEmail.getApplyFlag());
                    cancelParams.put("message", "");
                    overtimeMapper.callAffirmCancel(cancelParams);
                    checkProcedureMessage(cancelParams.get("message"));
                }
                count++;
            }
            return count;
        } catch (RuntimeException e) {
            log.error("delete error over={} applyNos={}", over, applyNos, e);
            throw e;
        }
    }

    private void checkProcedureMessage(Object message) {
        String msg = message == null ? "" : message.toString().trim();
        if (msg.isEmpty()) {
            return;
        }
        String normalized = msg.toLowerCase(Locale.ROOT);
        if (normalized.contains("ora-") || normalized.contains("error")) {
            throw new IllegalStateException(msg);
        }
    }

    private static boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private static String trim(String value) {
        return value == null ? "" : value.trim();
    }
}
