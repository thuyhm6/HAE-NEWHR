package com.ait.edu.trainEducation.service.impl;

import com.ait.edu.trainEducation.mapper.EduBasicInfoMapper;
import com.ait.edu.trainEducation.mapper.EduCourseApplyMapper;
import com.ait.edu.trainEducation.model.EduApplyCourse;
import com.ait.edu.trainEducation.model.EduApplyFlagRequest;
import com.ait.edu.trainEducation.model.EduApplyMaker;
import com.ait.edu.trainEducation.model.EduApplyQuery;
import com.ait.edu.trainEducation.model.EduApplyRecord;
import com.ait.edu.trainEducation.model.EduApplyRequest;
import com.ait.edu.trainEducation.model.EduBasicInformation;
import com.ait.edu.trainEducation.service.EduCourseApplyService;
import com.ait.edu.trainEducation.util.EduCurrentUser;
import com.ait.exception.BusinessException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class EduCourseApplyServiceImpl implements EduCourseApplyService {
    private static final Logger log = LoggerFactory.getLogger(EduCourseApplyServiceImpl.class);

    private static final DateTimeFormatter DMY = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    /** FLAG của EDU_FREE_EMPLOYEE: 1 = nhân viên chỉ định, 3 = học viên đăng ký đã được xác nhận. */
    private static final String FREE_FLAG_DESIGNATED = "1";
    private static final String FREE_FLAG_APPLIED = "3";

    private static final String FLAG_PENDING = "1";
    private static final String FLAG_PASSED = "2";

    @Autowired
    private EduCourseApplyMapper eduCourseApplyMapper;

    /** Tái sử dụng thao tác học viên / phiếu kết quả / đánh giá giảng viên của màn Thông tin cơ bản. */
    @Autowired
    private EduBasicInfoMapper eduBasicInfoMapper;

    // ================= Đăng ký =================

    @Override
    @Transactional(readOnly = true)
    public List<EduApplyCourse> findApplyCourses(String courseName, String startDate, String endDate) {
        String empid = EduCurrentUser.empid();
        String personId = EduCurrentUser.personId();
        log.info("Tim khoa dao tao co the dang ky, empid={}, courseName={}", empid, courseName);
        if (empid == null || personId == null) {
            return Collections.emptyList();
        }
        try {
            return eduCourseApplyMapper.findApplyCourses(empid, personId, trimToNull(courseName),
                    trimToNull(startDate), trimToNull(endDate));
        } catch (Exception e) {
            log.error("Loi khi tim khoa dao tao co the dang ky", e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<EduApplyMaker> findDefaultMakers() {
        String personId = EduCurrentUser.personId();
        log.info("Lay nguoi phe duyet mac dinh, personId={}", personId);
        if (personId == null) {
            return Collections.emptyList();
        }
        try {
            return eduCourseApplyMapper.findDefaultMakers(personId);
        } catch (Exception e) {
            log.error("Loi khi lay nguoi phe duyet mac dinh", e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<EduApplyMaker> findMakerCandidates(String keyword, String deptNo) {
        log.info("Tim nguoi phe duyet, keyword={}, deptNo={}", keyword, deptNo);
        try {
            return eduCourseApplyMapper.findMakerCandidates(trimToNull(keyword), trimToNull(deptNo));
        } catch (Exception e) {
            log.error("Loi khi tim nguoi phe duyet", e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int apply(EduApplyRequest request) throws BusinessException {
        String empid = EduCurrentUser.empid();
        String personId = EduCurrentUser.personId();
        log.info("Dang ky khoa dao tao, empid={}, items={}, makers={}", empid,
                request.getItems().size(), request.getMakers().size());
        try {
            if (empid == null || personId == null) {
                throw new BusinessException(ERR_NO_EMPLOYEE, "Tài khoản đăng nhập không gắn với nhân viên.");
            }
            // Bỏ người phê duyệt trùng, giữ thứ tự cấp
            Map<String, EduApplyMaker> makers = new LinkedHashMap<>();
            request.getMakers().forEach(m -> makers.putIfAbsent(m.getPersonId().trim(), m));
            List<EduApplyMaker> makerList = new ArrayList<>(makers.values());
            String finalLevel = String.valueOf(makerList.size());

            Map<String, String> items = new LinkedHashMap<>();
            request.getItems().forEach(i -> items.putIfAbsent(i.getBasicNo().trim(), trimToNull(i.getApplyTask())));

            int created = 0;
            for (Map.Entry<String, String> item : items.entrySet()) {
                if (eduCourseApplyMapper.countApplicable(item.getKey(), empid, personId) == 0) {
                    throw new BusinessException(ERR_NOT_APPLICABLE,
                            "Khóa đào tạo không còn mở đăng ký hoặc đã được đăng ký: " + item.getKey());
                }
                String applyNo = eduCourseApplyMapper.nextApplyNo();
                eduCourseApplyMapper.insertApply(applyNo, item.getKey(), personId, EduCurrentUser.name(), item.getValue());
                for (int i = 0; i < makerList.size(); i++) {
                    EduApplyMaker m = makerList.get(i);
                    // Bản gốc: chỉ người phê duyệt cuối có MAKER_LEVEL = số cấp, các cấp trước = 0
                    String level = i == makerList.size() - 1 ? finalLevel : "0";
                    eduCourseApplyMapper.insertMaker(applyNo, m.getPersonId().trim(), m.getLocalName(), level);
                }
                created++;
            }
            return created;
        } catch (BusinessException e) {
            log.warn("Dang ky khoa dao tao that bai: {}", e.getUserMessage());
            throw e;
        } catch (Exception e) {
            log.error("Loi khi dang ky khoa dao tao, empid={}", empid, e);
            throw e;
        }
    }

    // ================= Phê duyệt =================

    @Override
    @Transactional(readOnly = true)
    public List<EduApplyRecord> findMakerRecords(EduApplyQuery query) {
        EduApplyQuery q = normalize(query, false);
        q.setMakerPersonId(EduCurrentUser.personId());
        log.info("Tim don can phe duyet, makerPersonId={}", q.getMakerPersonId());
        if (q.getMakerPersonId() == null) {
            return Collections.emptyList();
        }
        try {
            return eduCourseApplyMapper.findMakerRecords(q);
        } catch (Exception e) {
            log.error("Loi khi tim don can phe duyet", e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int updateMakerFlag(EduApplyFlagRequest request) throws BusinessException {
        String personId = EduCurrentUser.personId();
        log.info("Cap nhat phe duyet, personId={}, applyNos={}, flag={}", personId, request.getApplyNos(), request.getFlag());
        try {
            if (personId == null) {
                throw new BusinessException(ERR_NO_EMPLOYEE, "Tài khoản đăng nhập không gắn với nhân viên.");
            }
            int updated = 0;
            for (String applyNo : distinct(request.getApplyNos())) {
                if (eduCourseApplyMapper.updateMakerFlag(applyNo, request.getFlag(), personId) > 0) {
                    updated++;
                }
            }
            if (updated == 0) {
                throw new BusinessException(ERR_INVALID_STATE, "Không có đơn nào được cập nhật (đơn đã xác nhận hoặc không thuộc quyền phê duyệt).");
            }
            return updated;
        } catch (BusinessException e) {
            log.warn("Cap nhat phe duyet that bai: {}", e.getUserMessage());
            throw e;
        } catch (Exception e) {
            log.error("Loi khi cap nhat phe duyet", e);
            throw e;
        }
    }

    // ================= Xác nhận =================

    @Override
    @Transactional(readOnly = true)
    public List<EduApplyRecord> findConfirmRecords(EduApplyQuery query) {
        EduApplyQuery q = normalize(query, true);
        log.info("Tim don can xac nhan, query={}", q);
        try {
            return eduCourseApplyMapper.findConfirmRecords(q);
        } catch (Exception e) {
            log.error("Loi khi tim don can xac nhan", e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int updateConfirmFlag(EduApplyFlagRequest request) throws BusinessException {
        String flag = request.getFlag();
        log.info("Cap nhat xac nhan, applyNos={}, flag={}", request.getApplyNos(), flag);
        try {
            int updated = 0;
            for (String applyNo : distinct(request.getApplyNos())) {
                EduApplyRecord r = eduCourseApplyMapper.findFinalMaker(applyNo);
                if (r == null) {
                    throw new BusinessException(ERR_NOT_FOUND, "Không tìm thấy đơn đăng ký: " + applyNo);
                }
                // Bản gốc chỉ cho xác nhận đơn đã được phê duyệt
                if (!FLAG_PASSED.equals(r.getApplyFlag())) {
                    throw new BusinessException(ERR_INVALID_STATE, "Đơn chưa được phê duyệt: " + r.getStuLocalName());
                }
                eduCourseApplyMapper.updateConfirmFlag(applyNo, flag);
                if (FLAG_PASSED.equals(flag)) {
                    addStudent(r);
                } else {
                    removeStudent(r);
                }
                updated++;
            }
            return updated;
        } catch (BusinessException e) {
            log.warn("Cap nhat xac nhan that bai: {}", e.getUserMessage());
            throw e;
        } catch (Exception e) {
            log.error("Loi khi cap nhat xac nhan", e);
            throw e;
        }
    }

    /**
     * Xác nhận: thêm học viên (FLAG 3) vào khóa, phiếu kết quả và phiếu đánh giá từng giảng viên.
     * Bản gốc insert rồi xóa bản trùng; ở đây kiểm tra tồn tại trước khi insert.
     */
    private void addStudent(EduApplyRecord r) {
        String basicNo = r.getBasicNo();
        String empid = r.getEmpid();
        String name = r.getStuLocalName();
        if (eduCourseApplyMapper.countFreeEmployee(basicNo, empid, FREE_FLAG_APPLIED) == 0) {
            eduBasicInfoMapper.insertFreeEmployee(basicNo, empid, name, FREE_FLAG_APPLIED);
        }
        eduCourseApplyMapper.deleteFreeEmployeeByFlag(basicNo, empid, FREE_FLAG_DESIGNATED);
        if (eduBasicInfoMapper.countTrainResult(basicNo, empid) == 0) {
            eduBasicInfoMapper.insertTrainResult(basicNo, empid, name);
        }
        EduBasicInformation basic = eduBasicInfoMapper.findById(basicNo);
        if (basic == null) {
            return;
        }
        List<String> teaEmpids = splitCsv(basic.getComTeacherEmpid());
        List<String> teaNames = splitCsv(basic.getComTeacherName());
        for (int i = 0; i < teaEmpids.size(); i++) {
            String teaEmpid = teaEmpids.get(i);
            if (eduCourseApplyMapper.countTeacherCheck(basicNo, teaEmpid, empid) == 0) {
                String teaName = i < teaNames.size() ? teaNames.get(i) : null;
                eduBasicInfoMapper.insertTeacherCheck(basicNo, teaEmpid, teaName, empid, name);
            }
        }
    }

    /** Từ chối / chờ xác nhận: gỡ học viên FLAG 3 cùng phiếu kết quả và đánh giá giảng viên. */
    private void removeStudent(EduApplyRecord r) {
        eduCourseApplyMapper.deleteFreeEmployeeByFlag(r.getBasicNo(), r.getEmpid(), FREE_FLAG_APPLIED);
        eduBasicInfoMapper.deleteTrainResultByStudent(r.getBasicNo(), r.getEmpid());
        eduCourseApplyMapper.deleteTeacherCheckByStudent(r.getBasicNo(), r.getEmpid());
    }

    // ================= Tình hình đăng ký =================

    @Override
    @Transactional(readOnly = true)
    public List<EduApplyRecord> findSituationRecords(EduApplyQuery query, boolean hub) {
        EduApplyQuery q = normalize(query, true);
        if (!hub) {
            if (isSituationManager()) {
                q.setPlannedOnly(true);
            } else {
                // Nhân viên thường chỉ xem đơn của chính mình
                q.setStuPersonId(EduCurrentUser.personId());
                q.setKeyword(null);
                q.setDeptNo(null);
                if (q.getStuPersonId() == null) {
                    return Collections.emptyList();
                }
            }
        }
        log.info("Tim tinh hinh dang ky, hub={}, query={}", hub, q);
        try {
            return eduCourseApplyMapper.findSituationRecords(q);
        } catch (Exception e) {
            log.error("Loi khi tim tinh hinh dang ky", e);
            throw e;
        }
    }

    @Override
    public boolean isSituationManager() {
        return EduCurrentUser.isSituationManager();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void cancelApply(String applyNo) throws BusinessException {
        log.info("Huy don dang ky, applyNo={}", applyNo);
        try {
            EduApplyRecord r = eduCourseApplyMapper.findFinalMaker(applyNo);
            if (r == null) {
                throw new BusinessException(ERR_NOT_FOUND, "Không tìm thấy đơn đăng ký.");
            }
            // Bản gốc chỉ hiện nút Hủy khi đơn chưa phê duyệt - kiểm tra lại ở server
            if (!FLAG_PENDING.equals(r.getApplyFlag())) {
                throw new BusinessException(ERR_INVALID_STATE, "Chỉ hủy được đơn chưa phê duyệt.");
            }
            eduCourseApplyMapper.deleteMakers(applyNo);
            eduCourseApplyMapper.deleteApply(applyNo);
        } catch (BusinessException e) {
            log.warn("Huy don dang ky that bai: {}", e.getUserMessage());
            throw e;
        } catch (Exception e) {
            log.error("Loi khi huy don dang ky, applyNo={}", applyNo, e);
            throw e;
        }
    }

    // ================= Tiện ích =================

    /** defaultMonth = true: ngày trống -> đầu/cuối tháng hiện tại (courseConfirm / makerSituation bản gốc). */
    private static EduApplyQuery normalize(EduApplyQuery query, boolean defaultMonth) {
        EduApplyQuery q = query == null ? new EduApplyQuery() : query;
        q.setDeptNo(trimToNull(q.getDeptNo()));
        q.setKeyword(trimToNull(q.getKeyword()));
        q.setCourseName(trimToNull(q.getCourseName()));
        q.setStartDate(trimToNull(q.getStartDate()));
        q.setEndDate(trimToNull(q.getEndDate()));
        q.setFlag(trimToNull(q.getFlag()));
        q.setMakerPersonId(null);
        q.setStuPersonId(null);
        q.setPlannedOnly(false);
        if (defaultMonth) {
            LocalDate today = LocalDate.now();
            if (q.getStartDate() == null) {
                q.setStartDate(today.withDayOfMonth(1).format(DMY));
            }
            if (q.getEndDate() == null) {
                q.setEndDate(today.withDayOfMonth(today.lengthOfMonth()).format(DMY));
            }
        }
        return q;
    }

    private static List<String> distinct(List<String> values) {
        return new ArrayList<>(values.stream().filter(v -> v != null && !v.trim().isEmpty()).map(String::trim)
                .collect(Collectors.toCollection(LinkedHashSet::new)));
    }

    private static List<String> splitCsv(String csv) {
        if (csv == null) {
            return Collections.emptyList();
        }
        return Arrays.stream(csv.split(",")).map(String::trim).filter(s -> !s.isEmpty()).collect(Collectors.toList());
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String t = value.trim();
        return t.isEmpty() ? null : t;
    }
}
