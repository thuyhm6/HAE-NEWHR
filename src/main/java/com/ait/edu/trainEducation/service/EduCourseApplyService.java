package com.ait.edu.trainEducation.service;

import com.ait.edu.trainEducation.model.EduApplyCourse;
import com.ait.edu.trainEducation.model.EduApplyFlagRequest;
import com.ait.edu.trainEducation.model.EduApplyMaker;
import com.ait.edu.trainEducation.model.EduApplyQuery;
import com.ait.edu.trainEducation.model.EduApplyRecord;
import com.ait.edu.trainEducation.model.EduApplyRequest;
import com.ait.exception.BusinessException;

import java.util.List;

/**
 * Đăng ký khóa đào tạo và quy trình phê duyệt / xác nhận - port từ TrainEducationCtroller
 * (courseApply, courseMaker, courseConfirm, makerSituation, makerSituationHUB - Hanwha_HTSV).
 */
public interface EduCourseApplyService {

    String ERR_NO_EMPLOYEE = "EDU_APPLY_NO_EMPLOYEE";
    String ERR_NOT_APPLICABLE = "EDU_APPLY_NOT_APPLICABLE";
    String ERR_NOT_FOUND = "EDU_APPLY_NOT_FOUND";
    String ERR_INVALID_STATE = "EDU_APPLY_INVALID_STATE";

    // ===== Đăng ký =====
    List<EduApplyCourse> findApplyCourses(String courseName, String startDate, String endDate);

    List<EduApplyMaker> findDefaultMakers();

    List<EduApplyMaker> findMakerCandidates(String keyword, String deptNo);

    /** Đăng ký các khóa đã chọn; trả về số đơn đã tạo. */
    int apply(EduApplyRequest request) throws BusinessException;

    // ===== Phê duyệt =====
    List<EduApplyRecord> findMakerRecords(EduApplyQuery query);

    /** Trả về số đơn được cập nhật. */
    int updateMakerFlag(EduApplyFlagRequest request) throws BusinessException;

    // ===== Xác nhận =====
    List<EduApplyRecord> findConfirmRecords(EduApplyQuery query);

    int updateConfirmFlag(EduApplyFlagRequest request) throws BusinessException;

    // ===== Tình hình đăng ký =====
    /** hub = true: makerSituationHUB (toàn bộ đơn); false: makerSituation (theo quyền). */
    List<EduApplyRecord> findSituationRecords(EduApplyQuery query, boolean hub);

    boolean isSituationManager();

    /** Hủy đơn chưa được phê duyệt (cancelApply bản gốc). */
    void cancelApply(String applyNo) throws BusinessException;
}
