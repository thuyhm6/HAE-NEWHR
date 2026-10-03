package com.ait.pa.workManagement.service.impl;

import com.ait.pa.workManagement.dto.PaArDetailDto;
import com.ait.pa.workManagement.dto.PaItemDifSummaryDto;
import com.ait.pa.workManagement.dto.PaMonthChainDto;
import com.ait.pa.workManagement.dto.PaPayItemOptionDto;
import com.ait.pa.workManagement.dto.PaResultConfirmSummaryDto;
import com.ait.pa.workManagement.dto.PaSalaryCheckAmountDto;
import com.ait.pa.workManagement.dto.PaSalaryCheckEmpDto;
import com.ait.pa.workManagement.dto.PaSalaryCheckQueryDto;
import com.ait.pa.workManagement.dto.PaSalaryDetailInfoDto;
import com.ait.pa.workManagement.mapper.PaSalaryCheckMapper;
import com.ait.pa.workManagement.service.PaSalaryCheckService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@Service
public class PaSalaryCheckServiceImpl implements PaSalaryCheckService {

    private static final Logger log = LoggerFactory.getLogger(PaSalaryCheckServiceImpl.class);

    /** ITEM_ID là tên cột PA_SUMMARY_HAE được nối thẳng vào SQL -> chỉ cho phép ký tự an toàn */
    private static final Pattern ITEM_ID_PATTERN = Pattern.compile("^[A-Za-z0-9_]{1,30}$");

    @Autowired
    private PaSalaryCheckMapper mapper;

    // ── NV tham gia tính lương ────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getMonthPersonCount(PaSalaryCheckQueryDto query) {
        log.info("Lấy NV tham gia tính lương, salaryDistinNo={}, payDatePro={}, payDate={}",
                query.getSalaryDistinNo(), query.getPayDatePro(), query.getPayDate());
        Map<String, Object> result = new LinkedHashMap<>();
        if (!hasMonthCompareParams(query)) {
            result.put("countList", Collections.emptyList());
            result.put("increaseList", Collections.emptyList());
            result.put("decreaseList", Collections.emptyList());
            return result;
        }
        try {
            result.put("countList", mapper.selectMonthPersonCountList(query));
            result.put("increaseList", mapper.selectMonthPersonIncreaseList(query));
            result.put("decreaseList", mapper.selectMonthPersonDecreaseList(query));
            return result;
        } catch (Exception e) {
            log.error("Lỗi khi lấy NV tham gia tính lương salaryDistinNo={}, payDate={}",
                    query.getSalaryDistinNo(), query.getPayDate(), e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaSalaryCheckEmpDto> getMonthPersonChangeEmpList(PaSalaryCheckQueryDto query) {
        log.info("Lấy danh sách NV tăng/giảm, changeFlag={}, changeType={}, payDate={}",
                query.getChangeFlag(), query.getChangeType(), query.getPayDate());
        if (!hasMonthCompareParams(query) || isBlank(query.getChangeType())) {
            return Collections.emptyList();
        }
        try {
            return mapper.selectMonthPersonChangeEmpList(query);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách NV tăng/giảm changeFlag={}, changeType={}",
                    query.getChangeFlag(), query.getChangeType(), e);
            throw e;
        }
    }

    // ── Các khoản chi trả ─────────────────────────────────────────────────────

    /** Procedure ghi dữ liệu tạm PA_MONTH_DIF_ITEM_TEMP trước khi đọc nên cần transaction ghi */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public List<PaMonthChainDto> getMonthChainList(PaSalaryCheckQueryDto query) {
        log.info("Lấy các khoản chi trả, salaryDistinNo={}, payDatePro={}, payDate={}",
                query.getSalaryDistinNo(), query.getPayDatePro(), query.getPayDate());
        if (!hasMonthCompareParams(query)) {
            return Collections.emptyList();
        }
        try {
            mapper.callMonthChainProc(query);
            return mapper.selectMonthChainList(query);
        } catch (Exception e) {
            log.error("Lỗi khi lấy các khoản chi trả salaryDistinNo={}, payDate={}",
                    query.getSalaryDistinNo(), query.getPayDate(), e);
            throw e;
        }
    }

    // ── Quyết định thực hiện ──────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<PaSalaryCheckEmpDto> getVerificationList(PaSalaryCheckQueryDto query) {
        log.info("Lấy quyết định thực hiện, payScheduleNo={}, key={}", query.getPayScheduleNo(), query.getKey());
        if (isBlank(query.getPayScheduleNo())) {
            return Collections.emptyList();
        }
        try {
            return mapper.selectVerificationList(query);
        } catch (Exception e) {
            log.error("Lỗi khi lấy quyết định thực hiện payScheduleNo={}", query.getPayScheduleNo(), e);
            throw e;
        }
    }

    // ── Chi tiết lương / Kiểm tra cá nhân ─────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PaSalaryCheckEmpDto getPaDetailEmpInfo(PaSalaryCheckQueryDto query) {
        log.info("Lấy thông tin NV chi tiết lương, payScheduleNo={}, personId={}",
                query.getPayScheduleNo(), query.getPersonId());
        if (isBlank(query.getPayScheduleNo()) || isBlank(query.getPersonId())) {
            return null;
        }
        try {
            return mapper.selectPaDetailEmpInfo(query);
        } catch (Exception e) {
            log.error("Lỗi khi lấy thông tin NV chi tiết lương personId={}", query.getPersonId(), e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public List<PaSalaryDetailInfoDto> getSalaryDetailInfoList(PaSalaryCheckQueryDto query) {
        log.info("Lấy chi tiết hạng mục lương, payScheduleNo={}, personId={}",
                query.getPayScheduleNo(), query.getPersonId());
        if (isBlank(query.getPayScheduleNo()) || isBlank(query.getPersonId())) {
            return Collections.emptyList();
        }
        try {
            mapper.callSalaryDetailProc(query);
            return mapper.selectSalaryDetailInfoList(query);
        } catch (Exception e) {
            log.error("Lỗi khi lấy chi tiết hạng mục lương payScheduleNo={}, personId={}",
                    query.getPayScheduleNo(), query.getPersonId(), e);
            throw e;
        }
    }

    // ── Đối chiếu hạng mục ────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<PaPayItemOptionDto> getPayItemOptions() {
        log.info("Lấy danh sách hạng mục lương đối chiếu (PA_ITEM_INPUT IS_USE = 4)");
        try {
            return mapper.selectPayItemOptions(new PaSalaryCheckQueryDto());
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách hạng mục lương đối chiếu", e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaSalaryCheckEmpDto> getItemCountList(PaSalaryCheckQueryDto query) {
        log.info("Lấy đối chiếu hạng mục, payScheduleNo={}, itemId={}", query.getPayScheduleNo(), query.getItemId());
        if (isBlank(query.getPayScheduleNo()) || isBlank(query.getItemId())) {
            return Collections.emptyList();
        }
        try {
            validateItemId(query.getItemId());
            return mapper.selectItemCountList(query);
        } catch (Exception e) {
            log.error("Lỗi khi lấy đối chiếu hạng mục payScheduleNo={}, itemId={}",
                    query.getPayScheduleNo(), query.getItemId(), e);
            throw e;
        }
    }

    // ── Chênh lệch hạng mục ───────────────────────────────────────────────────

    @Override
    @Transactional(rollbackFor = Exception.class)
    public List<PaItemDifSummaryDto> getItemDifSummaryList(PaSalaryCheckQueryDto query) {
        log.info("Lấy tổng hợp chênh lệch hạng mục, salaryDistinNo={}, payDate={}, itemType={}, pageType={}",
                query.getSalaryDistinNo(), query.getPayDate(), query.getItemType(), query.getPageType());
        if (!hasItemDifParams(query)) {
            return Collections.emptyList();
        }
        try {
            mapper.callMonthDifItemProc(query);
            return mapper.selectItemDifSummaryList(query);
        } catch (Exception e) {
            log.error("Lỗi khi lấy tổng hợp chênh lệch hạng mục payDate={}, itemType={}",
                    query.getPayDate(), query.getItemType(), e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public List<PaSalaryCheckEmpDto> getItemDifEmpList(PaSalaryCheckQueryDto query, boolean callProc) {
        log.info("Lấy NV chênh lệch hạng mục, payDate={}, itemType={}, itemId={}, monthDif={}, pageType={}, selectType={}, callProc={}",
                query.getPayDate(), query.getItemType(), query.getItemId(), query.getMonthDif(),
                query.getPageType(), query.getSelectType(), callProc);
        if (isBlank(query.getPayDate()) || isBlank(query.getItemType()) || isBlank(query.getPageType())) {
            return Collections.emptyList();
        }
        try {
            if (callProc) {
                if (!hasItemDifParams(query)) {
                    return Collections.emptyList();
                }
                mapper.callMonthDifItemProc(query);
            }
            return mapper.selectItemDifEmpList(query);
        } catch (Exception e) {
            log.error("Lỗi khi lấy NV chênh lệch hạng mục payDate={}, itemId={}", query.getPayDate(), query.getItemId(), e);
            throw e;
        }
    }

    // ── Đối chiếu kết quả ─────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PaResultConfirmSummaryDto getResultConfirmSummary(PaSalaryCheckQueryDto query) {
        log.info("Lấy biến động chi tiết, salaryDistinNo={}, payDatePro={}, payDate={}",
                query.getSalaryDistinNo(), query.getPayDatePro(), query.getPayDate());
        if (!hasMonthCompareParams(query)) {
            return null;
        }
        try {
            List<PaResultConfirmSummaryDto> list = mapper.selectResultConfirmSummary(query);
            return list.isEmpty() ? null : list.get(0);
        } catch (Exception e) {
            log.error("Lỗi khi lấy biến động chi tiết payDate={}", query.getPayDate(), e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaSalaryCheckEmpDto> getOvertimeList(PaSalaryCheckQueryDto query) {
        log.info("Lấy thống kê tăng ca, salaryDistinNo={}, payDate={}, deptNo={}",
                query.getSalaryDistinNo(), query.getPayDate(), query.getDeptNo());
        if (isBlank(query.getPayDate()) || isBlank(query.getSalaryDistinNo())) {
            return Collections.emptyList();
        }
        try {
            return mapper.selectOvertimeList(query);
        } catch (Exception e) {
            log.error("Lỗi khi lấy thống kê tăng ca payDate={}", query.getPayDate(), e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaArDetailDto> getArDetailList(PaSalaryCheckQueryDto query) {
        log.info("Lấy chi tiết tăng ca, personId={}, {} - {}", query.getPersonId(), query.getArStartDate(), query.getArEndDate());
        if (isBlank(query.getPersonId())) {
            return Collections.emptyList();
        }
        try {
            return mapper.selectArDetailList(query);
        } catch (Exception e) {
            log.error("Lỗi khi lấy chi tiết tăng ca personId={}", query.getPersonId(), e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaSalaryCheckAmountDto> getInsuranceList(PaSalaryCheckQueryDto query) {
        log.info("Lấy chi tiết bảo hiểm, salaryDistinNo={}, payDate={}, deptNo={}",
                query.getSalaryDistinNo(), query.getPayDate(), query.getDeptNo());
        if (isBlank(query.getPayDate()) || isBlank(query.getSalaryDistinNo())) {
            return Collections.emptyList();
        }
        try {
            return mapper.selectInsuranceList(query);
        } catch (Exception e) {
            log.error("Lỗi khi lấy chi tiết bảo hiểm payDate={}", query.getPayDate(), e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaSalaryCheckAmountDto> getTaxList(PaSalaryCheckQueryDto query) {
        log.info("Lấy thuế, salaryDistinNo={}, payDate={}, deptNo={}",
                query.getSalaryDistinNo(), query.getPayDate(), query.getDeptNo());
        if (isBlank(query.getPayDate()) || isBlank(query.getSalaryDistinNo())) {
            return Collections.emptyList();
        }
        try {
            return mapper.selectTaxList(query);
        } catch (Exception e) {
            log.error("Lỗi khi lấy thuế payDate={}", query.getPayDate(), e);
            throw e;
        }
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    /** ITEM_ID phải đúng định dạng tên cột và thuộc danh sách hạng mục được cấu hình (IS_USE = 4) */
    private void validateItemId(String itemId) {
        boolean valid = ITEM_ID_PATTERN.matcher(itemId).matches()
                && mapper.selectPayItemOptions(new PaSalaryCheckQueryDto()).stream()
                        .anyMatch(o -> itemId.equalsIgnoreCase(o.getItemId()));
        if (!valid) {
            throw new IllegalArgumentException("Hạng mục lương không hợp lệ: " + itemId);
        }
    }

    private static boolean hasMonthCompareParams(PaSalaryCheckQueryDto query) {
        return !isBlank(query.getSalaryDistinNo()) && !isBlank(query.getPayDate()) && !isBlank(query.getPayDatePro());
    }

    private static boolean hasItemDifParams(PaSalaryCheckQueryDto query) {
        return !isBlank(query.getSalaryDistinNo()) && !isBlank(query.getPayDate())
                && !isBlank(query.getItemType()) && !isBlank(query.getPageType());
    }

    private static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
