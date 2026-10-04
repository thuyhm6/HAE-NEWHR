package com.ait.ess.infoApplyAttendance.service.impl;

import com.ait.ar.attendanceMintenance.dto.EssLeaveApplyDto;
import com.ait.ar.attendanceMintenance.mapper.ArAttendanceSearchMapper;
import com.ait.ess.empinfo.dto.EssPersonalInfoDto;
import com.ait.ess.empinfo.mapper.EssPersonalInfoMapper;
import com.ait.ess.infoApplyAttendance.dto.EssAttendanceExForBatchDto;
import com.ait.ess.infoApplyAttendance.mapper.EssAttendanceExForBatchMapper;
import com.ait.ess.infoApplyAttendance.service.EssAttendanceExForBatchService;
import com.ait.sy.syAffirm.dto.SyAffirmEmailDto;
import com.ait.sy.syAffirm.mapper.SyAffirmEmailMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EssAttendanceExForBatchServiceImpl implements EssAttendanceExForBatchService {

    private static final Logger log = LoggerFactory.getLogger(EssAttendanceExForBatchServiceImpl.class);

    private static final DateTimeFormatter DD_MM_YYYY_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final String APPLY_TYPE_NO = "218197";
    private static final String APPLY_AFFIRM_FLAG = "14014306";

    @Autowired
    private EssAttendanceExForBatchMapper mapper;

    @Autowired
    private SyAffirmEmailMapper affirmorMapper;

    @Autowired
    private ArAttendanceSearchMapper arAttendanceSearchMapper;

    @Autowired
    private EssPersonalInfoMapper essPersonalInfoMapper;

    @Override
    public List<EssAttendanceExForBatchDto> getAttendanceExForBatchList(EssAttendanceExForBatchDto params) {
        EssAttendanceExForBatchDto safeParams = params == null ? new EssAttendanceExForBatchDto() : params;

        String fromDate = safeString(safeParams.getFromDate());
        String toDate = safeString(safeParams.getToDate());
        if (fromDate.isEmpty() || toDate.isEmpty()) {
            LocalDate today = LocalDate.now();
            LocalDate monday = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            LocalDate sunday = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
            if (fromDate.isEmpty()) {
                safeParams.setFromDate(monday.format(DD_MM_YYYY_FORMAT));
            }
            if (toDate.isEmpty()) {
                safeParams.setToDate(sunday.format(DD_MM_YYYY_FORMAT));
            }
        }
        return mapper.selectAttendanceExForBatchList(safeParams);
    }

    @Override
    public List<EssAttendanceExForBatchDto> getCheckAttendanceExForBatchList(EssAttendanceExForBatchDto params) {
        EssAttendanceExForBatchDto safeParams = params == null ? new EssAttendanceExForBatchDto() : params;

        String fromDate = safeString(safeParams.getFromDate());
        String toDate = safeString(safeParams.getToDate());
        if (fromDate.isEmpty() || toDate.isEmpty()) {
            LocalDate today = LocalDate.now();
            LocalDate firstDayOfMonth = today.with(TemporalAdjusters.firstDayOfMonth());
            LocalDate lastDayOfMonth = today.with(TemporalAdjusters.lastDayOfMonth());
            if (fromDate.isEmpty()) {
                safeParams.setFromDate(firstDayOfMonth.format(DD_MM_YYYY_FORMAT));
            }
            if (toDate.isEmpty()) {
                safeParams.setToDate(lastDayOfMonth.format(DD_MM_YYYY_FORMAT));
            }
        }
        return mapper.selectCheckAttendanceExForBatchList(safeParams);
    }

    @Override
    public Map<String, Object> getCardApplyDetail(String applyNo, String applyType) {
        String resolvedApplyNo = safeString(applyNo);
        if (resolvedApplyNo.isEmpty()) {
            Map<String, Object> empty = new HashMap<>();
            empty.put("leaveInfo", null);
            empty.put("employeeInfo", null);
            empty.put("approvalList", Collections.emptyList());
            return empty;
        }

        EssLeaveApplyDto cardInfo = mapper.selectCardApplyInfo(resolvedApplyNo);

        String resolvedApplyType = safeString(applyType);
        if (resolvedApplyType.isEmpty() && cardInfo != null) {
            resolvedApplyType = safeString(cardInfo.getLeaveTypeCode());
        }

        List<SyAffirmEmailDto> approvalList = mapper.selectCardApprovalInfo(resolvedApplyNo, resolvedApplyType);

        Map<String, Object> result = new HashMap<>();
        result.put("leaveInfo", cardInfo);
        result.put("employeeInfo", cardInfo);
        result.put("approvalList", approvalList == null ? Collections.emptyList() : approvalList);
        return result;
    }

    @Override
    @Transactional
    public int applyAttendanceExForBatch(List<EssAttendanceExForBatchDto> selectedRows) {
        return applyRows(selectedRows, null);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int applyAbnormalByAnyApprover(List<EssAttendanceExForBatchDto> selectedRows,
                                          List<Map<String, Object>> approvers) {
        log.info("applyAbnormalByAnyApprover rows={} approvers={}",
                selectedRows == null ? 0 : selectedRows.size(), approvers == null ? 0 : approvers.size());
        boolean hasApprover = approvers != null
                && approvers.stream().anyMatch(a -> a != null && !safeString(toStr(a.get("personId"))).isEmpty());
        if (!hasApprover) {
            throw new IllegalArgumentException("Xin thiết lập người duyệt");
        }
        try {
            return applyRows(selectedRows, approvers);
        } catch (RuntimeException e) {
            log.error("applyAbnormalByAnyApprover error", e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int applyAttendanceExWithRowApprovers(List<EssAttendanceExForBatchDto> selectedRows) {
        log.info("applyAttendanceExWithRowApprovers rows={}", selectedRows == null ? 0 : selectedRows.size());
        if (selectedRows == null || selectedRows.isEmpty()) {
            throw new IllegalArgumentException("Không có dữ liệu để xin phép.");
        }
        // saveAttenanceExBatchInfo (bản cũ): dòng không có người duyệt thì không cho xin phép
        for (EssAttendanceExForBatchDto row : selectedRows) {
            if (row == null) {
                continue;
            }
            List<Map<String, Object>> approvers = row.getApprovers();
            boolean hasApprover = approvers != null
                    && approvers.stream().anyMatch(a -> a != null && !safeString(toStr(a.get("personId"))).isEmpty());
            if (!hasApprover) {
                throw new IllegalArgumentException(safeString(row.getLocalName()) + " You Can't Apply Without the Approver");
            }
        }
        try {
            return applyRows(selectedRows, null);
        } catch (RuntimeException e) {
            log.error("applyAttendanceExWithRowApprovers error", e);
            throw e;
        }
    }

    /**
     * Xử lý từng dòng xin phép chấm công bất thường.
     * Dây chuyền duyệt: manualApprovers (dùng chung mọi dòng) -> approvers của từng dòng
     * -> rỗng thì lấy dây chuyền duyệt tự động (GET_AFFIRMOR_LIST_IMPROVE).
     */
    private int applyRows(List<EssAttendanceExForBatchDto> selectedRows, List<Map<String, Object>> manualApprovers) {
        if (selectedRows == null || selectedRows.isEmpty()) {
            throw new IllegalArgumentException("Không có dữ liệu để xin phép.");
        }

        int successCount = 0;
        for (EssAttendanceExForBatchDto row : selectedRows) {
            if (row == null) {
                continue;
            }

            String personId = safeString(row.getPersonId());
            String itemNo = safeString(row.getItemNo());
            String applyNo = safeString(row.getApplyNo());
            String arDateStr = safeString(row.getArDateStr());
            String fromDateTime = safeString(row.getFromDateTime());
            String toDateTime = safeString(row.getToDateTime());

            if (personId.isEmpty() || itemNo.isEmpty() || arDateStr.isEmpty()
                    || fromDateTime.isEmpty() || toDateTime.isEmpty()) {
                throw new IllegalArgumentException("Thiếu dữ liệu bắt buộc của dòng xin phép.");
            }

            Integer clashResult = mapper.checkAttExClash(personId, arDateStr);
            if (clashResult != null) {
                if (clashResult == 1) {
                    throw new IllegalStateException("Ngày công đã chốt, xin kiểm tra lại!");
                } else if (clashResult == -2) {
                    throw new IllegalStateException("Thời gian đã khóa, xin kiểm tra lại!");
                }
            }

            if (applyNo == null) {
                throw new IllegalStateException("Không lấy được APPLY_NO.");
            }
            //'Khi làm bất thường thì xóa luôn dữ liệu bất thường đi applyNo chính là pkNo'
            String pkNo = applyNo;
            arAttendanceSearchMapper.deleteArDetail(pkNo); 

            row.setApplyNo(String.valueOf(applyNo));
            row.setPersonId(personId);
            row.setItemNo(itemNo);
            row.setArDateStr(arDateStr);
            row.setFromDateTime(fromDateTime);
            row.setToDateTime(toDateTime);
            row.setWorkHour(safeString(row.getWorkHour()));
            row.setRemark(safeString(row.getRemark()));
            mapper.insertCardApply(row);
            insertApprovalFlow(row, manualApprovers != null ? manualApprovers : row.getApprovers());
            successCount++;
        }
        return successCount;
    }

    private void insertApprovalFlow(EssAttendanceExForBatchDto row, List<Map<String, Object>> manualApprovers) {
        String applyNo = safeString(row.getApplyNo());
        String personId = safeString(row.getPersonId());
        String itemNo = safeString(row.getItemNo());
        String fromDateTime = safeString(row.getFromDateTime());
        String toDateTime = safeString(row.getToDateTime());

        String personName = safeString(row.getLocalName());
        if (personName.isEmpty()) {
            personName = safeString(row.getEmpId());
        }
        String lastName;
        if (fromDateTime.equals(toDateTime)) {
            lastName = "Abnormal Attendance Application(" + personName + ")[Date：" + fromDateTime + "]";
        } else {
            lastName = "Abnormal Attendance Application(" + personName + ")[Date：" + fromDateTime + " ~ " + toDateTime + "]";
        }

        EssPersonalInfoDto empInfo = essPersonalInfoMapper.findMyInfo(personId);
        String applyPersonInfo;
        if (empInfo != null) {
            applyPersonInfo = safeString(empInfo.getLocalName()) + " / "
                    + safeString(empInfo.getPostGradeName()) + " / "
                    + safeString(empInfo.getDeptName());
        } else {
            applyPersonInfo = safeString(row.getLocalName()) + " (" + safeString(row.getEmpId()) + ")";
        }

        //Insert duyệt mức 0 (Người tạo)
        SyAffirmEmailDto affirmor0 = new SyAffirmEmailDto();
        affirmor0.setAffirmType("4");
        affirmor0.setAffirmLevel("0");
        affirmor0.setAffirmPersonId(personId);
        affirmor0.setApplyNo(applyNo);
        affirmor0.setApplyType(itemNo);
        affirmor0.setApplyTypeCode(APPLY_TYPE_NO);
        affirmor0.setApplyAffirmFlag(APPLY_AFFIRM_FLAG);
        affirmor0.setApplyFlag("1");
        affirmor0.setLastName(lastName);
        affirmor0.setApplyPersonInfo(applyPersonInfo);

        affirmorMapper.delete(applyNo);
        affirmorMapper.insert(affirmor0);

        // Dây chuyền duyệt do người dùng tự chọn (viewAbnormalApplyByAnyApprover)
        if (manualApprovers != null && !manualApprovers.isEmpty()) {
            int level = 1;
            for (Map<String, Object> approver : manualApprovers) {
                if (approver == null) {
                    continue;
                }
                String approverPersonId = safeString(toStr(approver.get("personId")));
                if (approverPersonId.isEmpty()) {
                    continue;
                }
                String approvType = safeString(toStr(approver.get("approvType")));
                SyAffirmEmailDto affirmor = new SyAffirmEmailDto();
                affirmor.setAffirmType(approvType.isEmpty() ? "1" : approvType);
                affirmor.setAffirmLevel(String.valueOf(level++));
                affirmor.setAffirmPersonId(approverPersonId);
                affirmor.setApplyNo(applyNo);
                affirmor.setApplyType(itemNo);
                affirmor.setApplyTypeCode(APPLY_TYPE_NO);
                affirmor.setApplyAffirmFlag(APPLY_AFFIRM_FLAG);
                affirmor.setApplyFlag("1");
                affirmor.setLastName(lastName);
                affirmor.setApplyPersonInfo(applyPersonInfo);
                affirmorMapper.insert(affirmor);
            }
            return;
        }

        //Insert các mức duyệt tiếp theo
        // 1. Chuẩn bị tham số truyền vào Mapper
        Map<String, Object> affirmorParams = new HashMap<>();
        affirmorParams.put("applyTypeNo", APPLY_TYPE_NO);
        affirmorParams.put("personId", personId);
        affirmorParams.put("applyTypeCode", itemNo);
        affirmorParams.put("applyLength", safeString(row.getWorkHour()));
        affirmorParams.put("lang", "vi");
        // 2. Thực thi gọi hàm Oracle qua MyBatis.
        // Sau khi chạy xong, MyBatis tự động đẩy kết quả vào key "resultList" trong params.
        affirmorMapper.getAffirmorList(affirmorParams);

        // 3. Ép kiểu an toàn và lấy danh sách kết quả từ tham số OUT
        // các trường lấy ra lần lượt là empId, localName, positionNo, positionName, deptName, postionname, affirmorId, affirmLevel
        @SuppressWarnings("unchecked")
        List<SyAffirmEmailDto> affirmorList = (List<SyAffirmEmailDto>) affirmorParams.get("resultList");
        if (affirmorList == null || affirmorList.isEmpty()) {
            return;
        }

        for (SyAffirmEmailDto affirmor : affirmorList) {
            if (affirmor == null) {
                continue;
            }
            affirmor.setAffirmType("1");
            affirmor.setApplyNo(applyNo);
            affirmor.setApplyType(itemNo);
            affirmor.setApplyTypeCode(APPLY_TYPE_NO);
            affirmor.setApplyAffirmFlag(APPLY_AFFIRM_FLAG);
            affirmor.setApplyFlag("1");
            affirmor.setAffirmPersonId(affirmor.getAffirmorId());
            affirmor.setLastName(lastName);
            affirmor.setApplyPersonInfo(applyPersonInfo);
            affirmorMapper.insert(affirmor);
        }
    }

    private String safeString(String value) {
        return value == null ? "" : value.trim();
    }

    private String toStr(Object value) {
        return value == null ? null : value.toString();
    }
}
