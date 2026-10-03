package com.ait.edu.trainEducation.mapper;

import com.ait.edu.trainEducation.model.EduApplyCourse;
import com.ait.edu.trainEducation.model.EduApplyMaker;
import com.ait.edu.trainEducation.model.EduApplyQuery;
import com.ait.edu.trainEducation.model.EduApplyRecord;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * Mapper đăng ký khóa đào tạo (EDU_STUDENT_APPLY) + phê duyệt / xác nhận (EDU_TRAIN_MAKER).
 * Port từ courseApply / courseMaker / courseConfirm / makerSituation (sqlTrainEducation.xml - Hanwha_HTSV).
 */
@Mapper
public interface EduCourseApplyMapper {

    // ===== Đăng ký khóa (courseApply) =====
    List<EduApplyCourse> findApplyCourses(@Param("empid") String empid, @Param("personId") String personId,
            @Param("courseName") String courseName, @Param("startDate") String startDate,
            @Param("endDate") String endDate);

    /** 1 nếu khóa còn mở đăng ký, nhân viên được chỉ định và chưa đăng ký. */
    int countApplicable(@Param("basicNo") String basicNo, @Param("empid") String empid,
            @Param("personId") String personId);

    List<EduApplyMaker> findDefaultMakers(@Param("personId") String personId);

    List<EduApplyMaker> findMakerCandidates(@Param("keyword") String keyword, @Param("deptNo") String deptNo);

    String nextApplyNo();

    int insertApply(@Param("applyNo") String applyNo, @Param("basicNo") String basicNo,
            @Param("stuPersonId") String stuPersonId, @Param("stuLocalName") String stuLocalName,
            @Param("applyTask") String applyTask);

    int insertMaker(@Param("applyNo") String applyNo, @Param("makerPersonId") String makerPersonId,
            @Param("makerLocalName") String makerLocalName, @Param("makerLevel") String makerLevel);

    // ===== Phê duyệt (courseMaker) =====
    List<EduApplyRecord> findMakerRecords(EduApplyQuery query);

    int updateMakerFlag(@Param("applyNo") String applyNo, @Param("flag") String flag,
            @Param("makerPersonId") String makerPersonId);

    // ===== Xác nhận (courseConfirm) =====
    List<EduApplyRecord> findConfirmRecords(EduApplyQuery query);

    /** Dòng người phê duyệt cuối (MAKER_LEVEL > 0) của đơn. */
    EduApplyRecord findFinalMaker(@Param("applyNo") String applyNo);

    int updateConfirmFlag(@Param("applyNo") String applyNo, @Param("flag") String flag);

    int countFreeEmployee(@Param("basicNo") String basicNo, @Param("empid") String empid, @Param("flag") String flag);

    int deleteFreeEmployeeByFlag(@Param("basicNo") String basicNo, @Param("empid") String empid,
            @Param("flag") String flag);

    int countTeacherCheck(@Param("basicNo") String basicNo, @Param("teaEmpid") String teaEmpid,
            @Param("stuEmpid") String stuEmpid);

    int deleteTeacherCheckByStudent(@Param("basicNo") String basicNo, @Param("empid") String empid);

    // ===== Tình hình đăng ký (makerSituation / makerSituationHUB) =====
    List<EduApplyRecord> findSituationRecords(EduApplyQuery query);

    int deleteMakers(@Param("applyNo") String applyNo);

    int deleteApply(@Param("applyNo") String applyNo);
}
