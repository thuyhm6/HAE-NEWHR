package com.ait.edu.trainEducation.service.impl;

import com.ait.edu.trainEducation.mapper.EduBasicInfoMapper;
import com.ait.edu.trainEducation.mapper.EduCommonMapper;
import com.ait.edu.trainEducation.mapper.EduPlanManagerMapper;
import com.ait.edu.trainEducation.model.EduBasicInformation;
import com.ait.edu.trainEducation.model.EduBasicPlanOption;
import com.ait.edu.trainEducation.model.EduEmployeeLookup;
import com.ait.edu.trainEducation.model.EduFreeEmployee;
import com.ait.edu.trainEducation.model.EduPerson;
import com.ait.edu.trainEducation.model.EduPlanManager;
import com.ait.edu.trainEducation.service.EduBasicInfoService;
import com.ait.edu.trainEducation.service.EduPlanManagerService;
import com.ait.exception.BusinessException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class EduBasicInfoServiceImpl implements EduBasicInfoService {
    private static final Logger log = LoggerFactory.getLogger(EduBasicInfoServiceImpl.class);

    static final String FLAG_ACT = "1";
    static final String FLAG_FREE = "2";
    static final String FLAG_APPLY = "3";

    /** Oracle giới hạn 1000 phần tử trong mệnh đề IN. */
    private static final int IN_CLAUSE_LIMIT = 900;

    @Autowired
    private EduBasicInfoMapper eduBasicInfoMapper;

    @Autowired
    private EduPlanManagerMapper eduPlanManagerMapper;

    @Autowired
    private EduPlanManagerService eduPlanManagerService;

    @Autowired
    private EduCommonMapper eduCommonMapper;

    @Override
    @Transactional(readOnly = true)
    public List<EduBasicInformation> findList(String courseName, String startDate, String endDate) {
        log.info("Tim danh sach thong tin dao tao co ban, courseName={}, startDate={}, endDate={}", courseName, startDate, endDate);
        try {
            return eduBasicInfoMapper.findList(trimToNull(courseName), trimToNull(startDate), trimToNull(endDate));
        } catch (Exception e) {
            log.error("Loi khi tim danh sach thong tin dao tao co ban", e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public EduBasicInformation getDetail(String basicNo) {
        log.info("Lay chi tiet thong tin dao tao co ban, basicNo={}", basicNo);
        try {
            EduBasicInformation info = eduBasicInfoMapper.findById(basicNo);
            if (info == null) {
                return null;
            }
            List<EduPerson> act = new ArrayList<>();
            List<EduPerson> free = new ArrayList<>();
            List<EduPerson> apply = new ArrayList<>();
            for (EduFreeEmployee f : eduBasicInfoMapper.findFreeEmployees(basicNo)) {
                EduPerson p = new EduPerson(f.getEmpid(), f.getLocalName(), f.getDeptName());
                if (FLAG_ACT.equals(f.getFlag())) {
                    act.add(p);
                } else if (FLAG_FREE.equals(f.getFlag())) {
                    free.add(p);
                } else if (FLAG_APPLY.equals(f.getFlag())) {
                    apply.add(p);
                }
            }
            info.setActEmployees(act);
            info.setFreeEmployees(free);
            info.setApplyEmployees(apply);
            info.setFinalStudents(eduBasicInfoMapper.findFinalStudents(basicNo));
            return info;
        } catch (Exception e) {
            log.error("Loi khi lay chi tiet thong tin dao tao co ban, basicNo={}", basicNo, e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<EduBasicPlanOption> findAvailablePlans() {
        log.info("Lay danh sach ke hoach chua lap khoa");
        try {
            return eduBasicInfoMapper.findAvailablePlans();
        } catch (Exception e) {
            log.error("Loi khi lay danh sach ke hoach chua lap khoa", e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public EduBasicInformation getPlanPrefill(String planNo) throws BusinessException {
        log.info("Lay du lieu ke hoach de lap khoa, planNo={}", planNo);
        try {
            EduPlanManager plan = eduPlanManagerService.getDetail(planNo);
            if (plan == null) {
                throw new BusinessException(ERR_NO_PLAN, "Không tìm thấy kế hoạch đào tạo.");
            }
            EduBasicInformation b = new EduBasicInformation();
            b.setPlanNo(plan.getPlanNo());
            b.setPeriodTime(plan.getPeriodTime());
            b.setTrainTypeCode(plan.getTrainTypeCode());
            b.setTrainTypeCodeName(plan.getTrainTypeCodeName());
            b.setCourseNameCode(plan.getCourseNameCode());
            b.setTrainFormCode(plan.getTrainFormCode());
            b.setTrainFormCodeName(plan.getTrainFormCodeName());
            b.setTrainAddress(plan.getTrainAddress());
            b.setImpleStartDate(plan.getPlanStartdate());
            b.setImpleEndDate(plan.getPlanEnddate());
            b.setImpleClassHour(plan.getClassHour());
            b.setImpleClassUnit(plan.getClassUnit());
            // Giảng viên của kế hoạch; mặc định giảng viên đánh giá = toàn bộ giảng viên
            b.setComTeacherEmpid(plan.getTeacherEmpid());
            b.setComTeacherName(plan.getTeacherDisplay());
            b.setEvaTeacherEmpid(plan.getTeacherEmpid());
            b.setEvaTeacherName(plan.getTeacherDisplay());
            String empids = plan.getDesEmployee();
            String names = plan.getDesEmployeeName();
            if (!isNotEmpty(empids) && isNotEmpty(plan.getDesDepartment())) {
                // Kế hoạch chỉ chỉ định phòng ban -> lấy toàn bộ NV của các phòng ban đó
                List<String> deptNos = splitCsv(plan.getDesDepartment());
                List<EduEmployeeLookup> emps = eduCommonMapper.findEmployees(null, deptNos, null, "L");
                empids = emps.stream().map(EduEmployeeLookup::getEmpid).collect(Collectors.joining(","));
                names = emps.stream().map(EduEmployeeLookup::getLocalName).collect(Collectors.joining(","));
            }
            b.setPlanEmployeeEmpid(empids);
            b.setPlanEmployeeName(names);
            return b;
        } catch (BusinessException e) {
            log.warn("Lay du lieu ke hoach that bai: {}", e.getUserMessage());
            throw e;
        } catch (Exception e) {
            log.error("Loi khi lay du lieu ke hoach, planNo={}", planNo, e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public String add(EduBasicInformation entity) throws BusinessException {
        log.info("Them moi thong tin dao tao co ban, planNo={}", entity.getPlanNo());
        try {
            if (!isNotEmpty(entity.getPlanNo())) {
                throw new BusinessException(ERR_NO_PLAN, "Vui lòng chọn Chương trình đào tạo.");
            }
            // Lấy lại thông tin cố định từ kế hoạch, không tin dữ liệu client
            EduPlanManager plan = eduPlanManagerMapper.findByPlanNo(entity.getPlanNo());
            if (plan == null) {
                throw new BusinessException(ERR_NO_PLAN, "Không tìm thấy kế hoạch đào tạo.");
            }
            entity.setTrainTypeCode(plan.getTrainTypeCode());
            entity.setCourseNameCode(plan.getCourseNameCode());
            entity.setTrainFormCode(plan.getTrainFormCode());
            entity.setTrainAddress(plan.getTrainAddress());
            entity.setPeriodTime(plan.getPeriodTime());
            normalize(entity);

            String basicNo = eduBasicInfoMapper.nextBasicNo();
            entity.setBasicNo(basicNo);
            eduBasicInfoMapper.markPlanUsed(entity.getPlanNo());
            eduBasicInfoMapper.insert(entity);

            for (EduPerson p : safe(entity.getFinalStudents())) {
                eduBasicInfoMapper.insertFinalStudent(basicNo, p.getEmpid(), p.getName());
            }
            // Học viên tự chọn (FLAG 2) và chỉ định (FLAG 1): ghi học viên + dòng kết quả đào tạo
            // + dòng đánh giá giảng viên cho từng giảng viên (giống addTrainBasicInformationInfo bản gốc)
            List<EduPerson> teachers = pair(entity.getComTeacherEmpid(), entity.getComTeacherName());
            addStudents(basicNo, safe(entity.getFreeEmployees()), FLAG_FREE, teachers);
            addStudents(basicNo, safe(entity.getActEmployees()), FLAG_ACT, teachers);
            eduBasicInfoMapper.insertCostManager(basicNo);
            log.info("Them moi thong tin dao tao co ban thanh cong, basicNo={}", basicNo);
            return basicNo;
        } catch (BusinessException e) {
            log.warn("Them moi thong tin dao tao co ban that bai: {}", e.getUserMessage());
            throw e;
        } catch (Exception e) {
            log.error("Loi khi them moi thong tin dao tao co ban", e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void update(EduBasicInformation entity) throws BusinessException {
        String basicNo = entity.getBasicNo();
        log.info("Cap nhat thong tin dao tao co ban, basicNo={}", basicNo);
        try {
            EduBasicInformation old = eduBasicInfoMapper.findById(basicNo);
            if (old == null) {
                throw new BusinessException(ERR_NOT_FOUND, "Không tìm thấy dữ liệu cần cập nhật.");
            }
            normalize(entity);
            eduBasicInfoMapper.update(entity);

            // Đồng bộ học viên chỉ định / tự chọn theo chênh lệch trước - sau (giống bản gốc)
            List<EduFreeEmployee> current = eduBasicInfoMapper.findFreeEmployees(basicNo);
            syncStudents(basicNo, current, safe(entity.getFreeEmployees()), FLAG_FREE);
            syncStudents(basicNo, current, safe(entity.getActEmployees()), FLAG_ACT);

            // Nhân viên thực tế: xóa hết rồi ghi lại
            eduBasicInfoMapper.deleteFinalStudents(basicNo);
            for (EduPerson p : safe(entity.getFinalStudents())) {
                eduBasicInfoMapper.insertFinalStudent(basicNo, p.getEmpid(), p.getName());
            }
            // Đánh giá giảng viên: dựng lại theo Nhân viên thực tế x Giảng viên (giống bản gốc)
            eduBasicInfoMapper.deleteTeacherChecks(basicNo);
            List<EduPerson> teachers = pair(old.getComTeacherEmpid(), old.getComTeacherName());
            for (EduPerson stu : safe(entity.getFinalStudents())) {
                for (EduPerson tea : teachers) {
                    eduBasicInfoMapper.insertTeacherCheck(basicNo, tea.getEmpid(), tea.getName(), stu.getEmpid(), stu.getName());
                }
            }
        } catch (BusinessException e) {
            log.warn("Cap nhat thong tin dao tao co ban that bai: {}", e.getUserMessage());
            throw e;
        } catch (Exception e) {
            log.error("Loi khi cap nhat thong tin dao tao co ban, basicNo={}", basicNo, e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void delete(String basicNo) throws BusinessException {
        log.info("Xoa thong tin dao tao co ban, basicNo={}", basicNo);
        try {
            if (eduBasicInfoMapper.findById(basicNo) == null) {
                throw new BusinessException(ERR_NOT_FOUND, "Không tìm thấy dữ liệu cần xóa.");
            }
            // Giống deleteTrainBasicInformation bản gốc: trả kế hoạch về ACTIVITY = 1 rồi xóa dây chuyền
            eduBasicInfoMapper.releasePlanByBasic(basicNo);
            eduPlanManagerMapper.softDeleteBasicInformation(basicNo);
            eduPlanManagerMapper.deleteFreeEmployee(basicNo);
            eduPlanManagerMapper.deleteStudentCheck(basicNo);
            eduPlanManagerMapper.deleteTeacherCheck(basicNo);
            eduPlanManagerMapper.deleteTrainResult(basicNo);
            eduPlanManagerMapper.deleteCostManager(basicNo);
            eduPlanManagerMapper.deleteFinalStudent(basicNo);
            eduPlanManagerMapper.deleteTrainMakerByBasicNo(basicNo);
            eduPlanManagerMapper.deleteStudentApply(basicNo);
        } catch (BusinessException e) {
            log.warn("Xoa thong tin dao tao co ban that bai: {}", e.getUserMessage());
            throw e;
        } catch (Exception e) {
            log.error("Loi khi xoa thong tin dao tao co ban, basicNo={}", basicNo, e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<EduPerson> findEmployeesByEmpids(List<String> empids) {
        log.info("Tim NV theo danh sach ma, count={}", empids == null ? 0 : empids.size());
        try {
            return chunked(empids, eduBasicInfoMapper::findEmployeesByEmpids);
        } catch (Exception e) {
            log.error("Loi khi tim NV theo danh sach ma", e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<EduPerson> findTeachersByEmpids(List<String> empids) {
        log.info("Tim giang vien theo danh sach ma, count={}", empids == null ? 0 : empids.size());
        try {
            return chunked(empids, eduBasicInfoMapper::findTeachersByEmpids);
        } catch (Exception e) {
            log.error("Loi khi tim giang vien theo danh sach ma", e);
            throw e;
        }
    }

    private void addStudents(String basicNo, List<EduPerson> students, String flag, List<EduPerson> teachers) {
        for (EduPerson s : students) {
            eduBasicInfoMapper.insertFreeEmployee(basicNo, s.getEmpid(), s.getName(), flag);
            eduBasicInfoMapper.insertTrainResult(basicNo, s.getEmpid(), s.getName());
            for (EduPerson t : teachers) {
                eduBasicInfoMapper.insertTeacherCheck(basicNo, t.getEmpid(), t.getName(), s.getEmpid(), s.getName());
            }
        }
    }

    /**
     * Đồng bộ học viên theo FLAG: người bị bỏ -> xóa học viên + đánh giá học viên (+ kết quả đào tạo);
     * người mới -> thêm học viên (+ dòng kết quả đào tạo để học viên đánh giá được khóa học).
     */
    private void syncStudents(String basicNo, List<EduFreeEmployee> current, List<EduPerson> wanted, String flag) {
        Set<String> wantedIds = wanted.stream().map(EduPerson::getEmpid).collect(Collectors.toSet());
        Set<String> currentIds = current.stream().filter(c -> flag.equals(c.getFlag()))
                .map(EduFreeEmployee::getEmpid).collect(Collectors.toSet());
        for (String empid : currentIds) {
            if (!wantedIds.contains(empid)) {
                eduBasicInfoMapper.deleteFreeEmployee(basicNo, empid);
                eduBasicInfoMapper.deleteStudentCheckByStudent(basicNo, empid);
                boolean stillStudent = current.stream()
                        .anyMatch(c -> empid.equals(c.getEmpid()) && !flag.equals(c.getFlag()));
                if (!stillStudent) {
                    eduBasicInfoMapper.deleteTrainResultByStudent(basicNo, empid);
                }
            }
        }
        for (EduPerson p : wanted) {
            if (!currentIds.contains(p.getEmpid())) {
                eduBasicInfoMapper.insertFreeEmployee(basicNo, p.getEmpid(), p.getName(), flag);
                if (eduBasicInfoMapper.countTrainResult(basicNo, p.getEmpid()) == 0) {
                    eduBasicInfoMapper.insertTrainResult(basicNo, p.getEmpid(), p.getName());
                }
            }
        }
    }

    private void normalize(EduBasicInformation entity) {
        entity.setTrainContent(trimToNull(entity.getTrainContent()));
        entity.setDesDepartment(trimToNull(entity.getDesDepartment()));
        entity.setActEmployees(dedupe(entity.getActEmployees()));
        entity.setFreeEmployees(dedupe(entity.getFreeEmployees()));
        entity.setFinalStudents(dedupe(entity.getFinalStudents()));
    }

    private static List<EduPerson> dedupe(List<EduPerson> list) {
        Map<String, EduPerson> map = new LinkedHashMap<>();
        for (EduPerson p : safe(list)) {
            if (p != null && isNotEmpty(p.getEmpid())) {
                map.putIfAbsent(p.getEmpid().trim(), new EduPerson(p.getEmpid().trim(), p.getName()));
            }
        }
        return new ArrayList<>(map.values());
    }

    /** Ghép 2 chuỗi mã / tên phân cách dấu phẩy thành danh sách người. */
    private static List<EduPerson> pair(String empids, String names) {
        List<String> ids = splitCsv(empids);
        String[] ns = names == null ? new String[0] : names.split(",");
        List<EduPerson> result = new ArrayList<>();
        for (int i = 0; i < ids.size(); i++) {
            result.add(new EduPerson(ids.get(i), i < ns.length ? ns[i].trim() : ids.get(i)));
        }
        return result;
    }

    private static List<EduPerson> chunked(List<String> empids, java.util.function.Function<List<String>, List<EduPerson>> fn) {
        List<EduPerson> result = new ArrayList<>();
        if (empids == null || empids.isEmpty()) {
            return result;
        }
        for (int i = 0; i < empids.size(); i += IN_CLAUSE_LIMIT) {
            result.addAll(fn.apply(empids.subList(i, Math.min(i + IN_CLAUSE_LIMIT, empids.size()))));
        }
        return result;
    }

    private static List<String> splitCsv(String csv) {
        if (csv == null || csv.trim().isEmpty()) {
            return Collections.emptyList();
        }
        return Arrays.stream(csv.split(",")).map(String::trim).filter(s -> !s.isEmpty()).collect(Collectors.toList());
    }

    private static <T> List<T> safe(List<T> list) {
        return list == null ? Collections.emptyList() : list;
    }

    private static boolean isNotEmpty(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String t = value.trim();
        return t.isEmpty() ? null : t;
    }
}
