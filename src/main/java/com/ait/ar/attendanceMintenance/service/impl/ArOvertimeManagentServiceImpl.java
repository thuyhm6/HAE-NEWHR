package com.ait.ar.attendanceMintenance.service.impl;

import com.ait.ar.attendanceMintenance.dto.ArOvertimeImportTempDto;
import com.ait.ar.attendanceMintenance.dto.ArOvertimeManagentDto;
import com.ait.ar.attendanceMintenance.mapper.ArOvertimeManagentMapper;
import com.ait.ar.attendanceMintenance.service.ArOvertimeManagentService;
import com.ait.ess.empinfo.dto.EssPersonalInfoDto;
import com.ait.ess.empinfo.mapper.EssPersonalInfoMapper;
import com.ait.sy.syAffirm.dto.SyAffirmEmailDto;
import com.ait.sy.syAffirm.mapper.SyAffirmEmailMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class ArOvertimeManagentServiceImpl implements ArOvertimeManagentService {

    private static final Logger log = LoggerFactory.getLogger(ArOvertimeManagentServiceImpl.class);
    private static final String OT_TYPE_NO = "31";
    private static final String APPLY_AFFIRM_FLAG = "14014306";
    private static final DateTimeFormatter DATE_TIME_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    @Autowired
    private ArOvertimeManagentMapper mapper;

    @Autowired
    private SyAffirmEmailMapper affirmEmailMapper;

    @Autowired
    private EssPersonalInfoMapper essPersonalInfoMapper;

    @Override
    public List<ArOvertimeManagentDto> getList(ArOvertimeManagentDto dto) {
        ArOvertimeManagentDto safeDto = dto == null ? new ArOvertimeManagentDto() : dto;
        return mapper.selectList(safeDto);
    }

    @Override
    public Map<String, Object> getDetail(String applyNo, String applyType) {
        String resolvedApplyNo = safeString(applyNo);
        if (resolvedApplyNo.isEmpty()) {
            Map<String, Object> empty = new HashMap<>();
            empty.put("otInfo", null);
            empty.put("employeeInfo", null);
            empty.put("approvalList", Collections.emptyList());
            return empty;
        }

        ArOvertimeManagentDto otInfo = mapper.selectDetail(resolvedApplyNo);
        String resolvedApplyType = safeString(applyType);
        if (resolvedApplyType.isEmpty() && otInfo != null) {
            resolvedApplyType = safeString(otInfo.getOtTypeCode());
        }

        List<SyAffirmEmailDto> approvalList = mapper.selectApprovalInfo(resolvedApplyNo, resolvedApplyType);

        Map<String, Object> result = new HashMap<>();
        result.put("otInfo", otInfo);
        result.put("employeeInfo", otInfo);
        result.put("approvalList", approvalList == null ? Collections.emptyList() : approvalList);
        return result;
    }

    @Override
    public ArOvertimeManagentDto getDefaultOtInfo(ArOvertimeManagentDto dto) {
        ArOvertimeManagentDto safeDto = dto == null ? new ArOvertimeManagentDto() : dto;
        normalizeDefaultOtRequest(safeDto);
        if (!canResolveDefaultOtInfo(safeDto)) {
            return new ArOvertimeManagentDto();
        }

        ArOvertimeManagentDto resolvedDto = mapper.selectDefaultOtInfo(safeDto);
        if (resolvedDto == null) {
            resolvedDto = new ArOvertimeManagentDto();
        }
        resolvedDto.setPersonId(safeDto.getPersonId());
        resolvedDto.setApplyOtDate(safeDto.getApplyOtDate());
        resolvedDto.setOtFromTime(safeDto.getOtFromTime());
        resolvedDto.setOtToTime(safeDto.getOtToTime());
        resolvedDto.setDeductYn(safeDto.getDeductYn());
        return resolvedDto;
    }

    @Override
    public ArOvertimeManagentDto getAutoFillOtInfo(ArOvertimeManagentDto dto) {
        ArOvertimeManagentDto safeDto = dto == null ? new ArOvertimeManagentDto() : dto;
        String personId = safeString(safeDto.getPersonId());
        String applyOtDate = normalizeDate(safeString(safeDto.getApplyOtDate()));
        if (personId.isEmpty() || applyOtDate.isEmpty()) {
            return new ArOvertimeManagentDto();
        }
        safeDto.setPersonId(personId);
        safeDto.setApplyOtDate(applyOtDate);
        safeDto.setDeductYn(defaultString(safeDto.getDeductYn(), "0"));
        try {
            ArOvertimeManagentDto result = mapper.selectAutoFillOtInfo(safeDto);
            return result != null ? result : new ArOvertimeManagentDto();
        } catch (Exception e) {
            log.warn("Auto-fill OT info failed for person={}, date={}: {}", personId, applyOtDate, e.getMessage());
            return new ArOvertimeManagentDto();
        }
    }

    @Override
    public List<ArOvertimeImportTempDto> getImportTempList(String errorOnly) {
        return mapper.selectImportTempList(safeString(errorOnly));
    }

    @Override
    @Transactional
    public String importTempToOfficial() {
        Map<String, Object> params = new HashMap<>();
        params.put("message", "");
        mapper.callImportOtTemp(params);

        String message = safeString(params.get("message"));
        if (isProcedureErrorMessage(message)) {
            throw new IllegalStateException(message);
        }
        return message;
    }

    @Override
    @Transactional
    public void save(ArOvertimeManagentDto dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Dữ liệu tăng ca không hợp lệ.");
        }

        String personId = safeString(dto.getPersonId());
        String applyOtDate = normalizeDate(dto.getApplyOtDate());
        String otFromTime = safeString(dto.getOtFromTime());
        String otToTime = safeString(dto.getOtToTime());
        dto.setDeductYn(defaultString(dto.getDeductYn(), "0"));
        ArOvertimeManagentDto defaultOtInfo = getDefaultOtInfo(dto);
        String otTypeCode = safeString(dto.getOtTypeCode());
        if (otTypeCode.isEmpty()) {
            otTypeCode = safeString(defaultOtInfo.getOtTypeCode());
        }

        if (personId.isEmpty()) {
            throw new IllegalArgumentException("Chưa chọn nhân viên.");
        }
        if (applyOtDate.isEmpty()) {
            throw new IllegalArgumentException("Chưa chọn ngày tăng ca.");
        }
        if (otFromTime.isEmpty() || otToTime.isEmpty()) {
            throw new IllegalArgumentException("Chưa nhập giờ tăng ca.");
        }
        if (otTypeCode.isEmpty()) {
            throw new IllegalArgumentException("Chưa chọn loại tăng ca.");
        }

        dto.setPersonId(personId);
        dto.setApplyOtDate(applyOtDate);
        dto.setOtFromTime(otFromTime);
        dto.setOtToTime(otToTime);
        dto.setOtTypeCode(otTypeCode);
        if (safeString(dto.getOtApplyHour()).isEmpty() && !safeString(defaultOtInfo.getOtApplyHour()).isEmpty()) {
            dto.setOtApplyHour(defaultOtInfo.getOtApplyHour());
        }
        dto.setOtTypeNo(OT_TYPE_NO);
        dto.setAffirmFlag(APPLY_AFFIRM_FLAG);
        dto.setOtApplyHour(dto.getOtApplyHour());

        // Kiểm tra giới hạn giờ tăng ca trong tháng và năm
        validateOtHourLimits(personId, applyOtDate, dto.getOtApplyHour());

        // Kiểm tra trùng/chồng chéo với đơn tăng ca khác
        int overlapCount = mapper.countOverlapOt(dto);
        if (overlapCount > 0) {
            throw new IllegalArgumentException("Trùng với đơn tăng ca khác của nhân viên này vào cùng ngày, xin kiểm tra lại!");
        }

        // Kiểm tra điều kiện tăng ca qua hàm AR_GET_OT_CLASH
        int clashResult = mapper.checkOtClash(dto);
        if (clashResult > 0) {
            throw new IllegalArgumentException("Trùng với tăng ca trước đó, xin kiểm tra thời gian này đã xin phép hay chưa!");
        } else if (clashResult == -1) {
            throw new IllegalArgumentException("Ngày công đã chốt, xin kiểm tra lại!");
        } else if (clashResult == -2) {
            throw new IllegalArgumentException("Thời gian đã khóa, xin kiểm tra lại!");
        } else if (clashResult == -3) {
            throw new IllegalArgumentException("Bạn đã tăng ca quá thời gian quy định trong tháng, xin liên hệ phòng nhân sự!");
        } else if (clashResult == -4) {
            throw new IllegalArgumentException("Đang trong thời gian mang thai hoặc nuôi con nhỏ. Không thể tăng ca!");
        }

        // 1. Insert/Update thủ tục Leave Apply
        boolean isNew = safeString(dto.getApplyNo()).isEmpty() || "0".equals(safeString(dto.getApplyNo()));
        String applyNo;
        if (isNew) {
            applyNo = String.valueOf(mapper.getNextApplySeq());
            dto.setApplyNo(applyNo);
            mapper.insertOvertimeApply(dto);
        } else {
            applyNo = safeString(dto.getApplyNo());
            mapper.updateOvertimeApply(dto);
        }

        // 2. Cập nhật tiến trình phê duyệt (xóa cũ)
        Map<String, Object> deleteParams = new HashMap<>();
        deleteParams.put("applyNo", applyNo);
        deleteParams.put("message", "");
        mapper.callDeleteOtConfirm(deleteParams);

        String lastName = buildLastName(dto);
        EssPersonalInfoDto empInfo = essPersonalInfoMapper.findMyInfo(personId);
        String applyPersonInfo;
        if (empInfo != null) {
            applyPersonInfo = safeString(empInfo.getLocalName()) + " / "
                    + safeString(empInfo.getPostGradeName()) + " / "
                    + safeString(empInfo.getDeptName());
        } else {
            applyPersonInfo = safeString(dto.getLocalName()) + " (" + safeString(dto.getEmpId()) + ")";
        }

        // 3. Insert duyệt mức 0 (Người tạo)
        SyAffirmEmailDto affirmor0 = new SyAffirmEmailDto();
        affirmor0.setAffirmType("4");
        affirmor0.setAffirmLevel("0");
        affirmor0.setAffirmPersonId(personId);
        affirmor0.setApplyNo(applyNo);
        affirmor0.setApplyType(otTypeCode);
        affirmor0.setApplyTypeCode(OT_TYPE_NO);
        affirmor0.setApplyAffirmFlag(APPLY_AFFIRM_FLAG);
        affirmor0.setApplyFlag("0");
        affirmor0.setLastName(lastName);
        affirmor0.setApplyPersonInfo(applyPersonInfo);
        affirmEmailMapper.delete(applyNo);
        affirmEmailMapper.insert(affirmor0);

        // Insert các mức duyệt tiếp theo
        // 1. Chuẩn bị tham số truyền vào Mapper
        Map<String, Object> affirmorParams = new HashMap<>();
        affirmorParams.put("applyTypeNo", OT_TYPE_NO);
        affirmorParams.put("personId", personId);
        affirmorParams.put("applyTypeCode", otTypeCode);
        affirmorParams.put("applyLength", dto.getOtApplyHour());
        affirmorParams.put("lang", "vi");
        // 2. Thực thi gọi hàm Oracle qua MyBatis.
        // Sau khi chạy xong, MyBatis tự động đẩy kết quả vào key "resultList" trong
        // params.
        affirmEmailMapper.getAffirmorList(affirmorParams);

        // 3. Ép kiểu an toàn và lấy danh sách kết quả từ tham số OUT
        // các trường lấy ra lần lượt là empId, localName, positionNo, positionName,
        // deptName, postionname, affirmorId, affirmLevel
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
            affirmor.setApplyType(otTypeCode);
            affirmor.setApplyTypeCode(OT_TYPE_NO);
            affirmor.setApplyAffirmFlag(APPLY_AFFIRM_FLAG);
            affirmor.setApplyFlag("0");
            affirmor.setAffirmPersonId(affirmor.getAffirmorId());
            affirmor.setLastName(lastName);
            affirmor.setApplyPersonInfo(applyPersonInfo);
            affirmEmailMapper.insert(affirmor);
        }
    }

    @Override
    @Transactional
    public void cancelOvertimeApply(String applyNo) {
        String resolvedApplyNo = safeString(applyNo);
        if (resolvedApplyNo.isEmpty()) {
            throw new IllegalArgumentException("Mã đơn tăng ca không hợp lệ.");
        }

        // 1. Cập nhật ACTIVITY = 1, AFFIRM_FLAG = 14014310
        mapper.cancelOvertimeApply(resolvedApplyNo);

        // 2. Gọi PKG_AFFIRM_EMAIL.PR_DELETE_OT_CONFIRM
        Map<String, Object> deleteParams = new HashMap<>();
        deleteParams.put("applyNo", resolvedApplyNo);
        deleteParams.put("message", "");
        mapper.callDeleteOtConfirm(deleteParams);

        String deleteMsg = safeString(deleteParams.get("message"));
        if (isProcedureErrorMessage(deleteMsg)) {
            throw new IllegalStateException(deleteMsg);
        }

        // 3. Lấy APPLY_NO, APPLY_TYPE, APPLY_FLAG từ SY_AFFIRM_EMAIL
        SyAffirmEmailDto affirmEmail = mapper.selectCancelAffirmEmail(resolvedApplyNo);
        if (affirmEmail == null) {
            return;
        }

        // 4. Gọi PKG_AFFIRM_EMAIL.PR_AFFIRM_CANCEL
        Map<String, Object> cancelParams = new HashMap<>();
        cancelParams.put("applyNo", affirmEmail.getApplyNo());
        cancelParams.put("applyType", affirmEmail.getApplyType());
        cancelParams.put("applyFlag", affirmEmail.getApplyFlag());
        cancelParams.put("message", "");
        mapper.callAffirmCancel(cancelParams);

        String cancelMsg = safeString(cancelParams.get("message"));
        if (isProcedureErrorMessage(cancelMsg)) {
            throw new IllegalStateException(cancelMsg);
        }
    }

    @Override
    @Transactional
    public Map<String, Object> cancelBatchOvertimeApply(List<String> applyNos) {
        if (applyNos == null || applyNos.isEmpty()) {
            throw new IllegalArgumentException("Danh sách đơn tăng ca không hợp lệ.");
        }
        int count = 0;
        for (String applyNo : applyNos) {
            cancelOvertimeApply(applyNo);
            count++;
        }
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("count", count);
        return result;
    }

    @Override
    @Transactional
    public void resubmitOvertimeApply(ArOvertimeManagentDto dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Dữ liệu tăng ca không hợp lệ.");
        }
        String applyNo = safeString(dto.getApplyNo());
        if (applyNo.isEmpty()) {
            throw new IllegalArgumentException("Mã đơn tăng ca không hợp lệ.");
        }

        // Xóa dữ liệu liên quan theo đúng thứ tự khóa ngoại
        mapper.deleteApplyResultByApplyNo(applyNo);
        affirmEmailMapper.delete(applyNo);
        mapper.deleteOvertimeApplyByApplyNo(applyNo);

        // Tạo mới với applyNo rỗng để save() tự cấp số mới
        dto.setApplyNo("");
        save(dto);
    }

    @Override
    @Transactional
    public void saveBatch(List<ArOvertimeManagentDto> dtos) {
        if (dtos == null || dtos.isEmpty()) return;

        // Gom nhóm theo personId → yearMonth để tính tổng giờ batch
        Map<String, Map<String, Double>> personMonthHours = new LinkedHashMap<>();
        Map<String, Map<String, String>> personMonthDate = new LinkedHashMap<>();
        Map<String, Map<String, Double>> personYearHours = new LinkedHashMap<>();
        Map<String, Map<String, String>> personYearDate = new LinkedHashMap<>();

        for (ArOvertimeManagentDto dto : dtos) {
            String personId = safeString(dto.getPersonId());
            String date = normalizeDate(safeString(dto.getApplyOtDate()));
            if (personId.isEmpty() || date.length() < 7) continue;

            double hours = parseHours(dto.getOtApplyHour());
            String yearMonth = date.substring(0, 7);
            String year = date.substring(0, 4);

            personMonthHours.computeIfAbsent(personId, k -> new LinkedHashMap<>()).merge(yearMonth, hours, Double::sum);
            personMonthDate.computeIfAbsent(personId, k -> new LinkedHashMap<>()).putIfAbsent(yearMonth, date);
            personYearHours.computeIfAbsent(personId, k -> new LinkedHashMap<>()).merge(year, hours, Double::sum);
            personYearDate.computeIfAbsent(personId, k -> new LinkedHashMap<>()).putIfAbsent(year, date);
        }

        // Kiểm tra giới hạn tháng (40h)
        for (Map.Entry<String, Map<String, Double>> personEntry : personMonthHours.entrySet()) {
            String personId = personEntry.getKey();
            for (Map.Entry<String, Double> monthEntry : personEntry.getValue().entrySet()) {
                double batchHours = monthEntry.getValue();
                String sampleDate = personMonthDate.get(personId).get(monthEntry.getKey());
                ArOvertimeManagentDto totals = getOtTotals(personId, sampleDate);
                if (batchHours + parseHours(totals.getOtTotalMonth()) > 40.0) {
                    throw new IllegalArgumentException("Tổng số giờ tăng ca trong tháng vượt quá 40h, xin kiểm tra lại!");
                }
            }
        }

        // Kiểm tra giới hạn năm (300h)
        for (Map.Entry<String, Map<String, Double>> personEntry : personYearHours.entrySet()) {
            String personId = personEntry.getKey();
            for (Map.Entry<String, Double> yearEntry : personEntry.getValue().entrySet()) {
                double batchHours = yearEntry.getValue();
                String sampleDate = personYearDate.get(personId).get(yearEntry.getKey());
                ArOvertimeManagentDto totals = getOtTotals(personId, sampleDate);
                if (batchHours + parseHours(totals.getOtTotalYear()) > 300.0) {
                    throw new IllegalArgumentException("Tổng số giờ tăng ca trong năm vượt quá 300h, xin kiểm tra lại!");
                }
            }
        }

        for (ArOvertimeManagentDto dto : dtos) {
            save(dto);
        }
    }

    @Override
    public ArOvertimeManagentDto getOtTotals(String personId, String applyOtDate) {
        String safePersonId = safeString(personId);
        String safeDate = normalizeDate(safeString(applyOtDate));
        if (safePersonId.isEmpty() || safeDate.isEmpty()) {
            return new ArOvertimeManagentDto();
        }
        try {
            ArOvertimeManagentDto dto = new ArOvertimeManagentDto();
            dto.setPersonId(safePersonId);
            dto.setApplyOtDate(safeDate);
            ArOvertimeManagentDto result = mapper.selectOtTotals(dto);
            return result != null ? result : new ArOvertimeManagentDto();
        } catch (Exception e) {
            log.warn("Lấy tổng tăng ca thất bại person={}, date={}: {}", safePersonId, safeDate, e.getMessage());
            return new ArOvertimeManagentDto();
        }
    }

    private String buildLastName(ArOvertimeManagentDto dto) {
        String localName = safeString(dto.getLocalName());
        String labelName = localName.isEmpty() ? safeString(dto.getEmpId()) : localName;
        String fromDateTime = dto.getOtFromTime();
        String toDateTime = dto.getOtToTime();
        return "OverTime Apply(" + labelName + ")[Date: " + fromDateTime + " ~ " + toDateTime + "]";
    }

    private void normalizeDefaultOtRequest(ArOvertimeManagentDto dto) {
        dto.setPersonId(safeString(dto.getPersonId()));
        dto.setApplyOtDate(normalizeDate(dto.getApplyOtDate()));
        dto.setOtFromTime(safeString(dto.getOtFromTime()));
        dto.setOtToTime(safeString(dto.getOtToTime()));
        dto.setDeductYn(defaultString(dto.getDeductYn(), "0"));
    }

    private boolean canResolveDefaultOtInfo(ArOvertimeManagentDto dto) {
        return !safeString(dto.getPersonId()).isEmpty()
                && !safeString(dto.getApplyOtDate()).isEmpty()
                && !safeString(dto.getOtFromTime()).isEmpty()
                && !safeString(dto.getOtToTime()).isEmpty();
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

    private String normalizeDate(String value) {
        return safeString(value).replace('.', '-').replace('/', '-');
    }

    private String defaultString(String value, String defaultValue) {
        String safeValue = safeString(value);
        return safeValue.isEmpty() ? defaultValue : safeValue;
    }

    private String safeString(Object value) {
        return value == null ? "" : value.toString().trim();
    }

    private double parseHours(String hours) {
        try {
            return Double.parseDouble(safeString(hours));
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }

    private void validateOtHourLimits(String personId, String applyOtDate, String otApplyHour) {
        double currentHours = parseHours(otApplyHour);
        ArOvertimeManagentDto totals = getOtTotals(personId, applyOtDate);
        if (currentHours + parseHours(totals.getOtTotalMonth()) > 40.0) {
            throw new IllegalArgumentException("Tổng số giờ tăng ca trong tháng vượt quá 40h, xin kiểm tra lại!");
        }
        if (currentHours + parseHours(totals.getOtTotalYear()) > 300.0) {
            throw new IllegalArgumentException("Tổng số giờ tăng ca trong năm vượt quá 300h, xin kiểm tra lại!");
        }
    }
}
