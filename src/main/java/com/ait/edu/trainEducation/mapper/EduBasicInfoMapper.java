package com.ait.edu.trainEducation.mapper;

import com.ait.edu.trainEducation.model.EduBasicInformation;
import com.ait.edu.trainEducation.model.EduBasicPlanOption;
import com.ait.edu.trainEducation.model.EduFreeEmployee;
import com.ait.edu.trainEducation.model.EduPerson;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * Mapper cho EDU_BASIC_INFORMATION (Thông tin đào tạo cơ bản) và các bảng con
 * được ghi khi lập / sửa khóa: EDU_FREE_EMPLOYEE, EDU_FINAL_STUDENT, EDU_TRAIN_RESULT,
 * EDU_TEACHER_CHECK, EDU_COST_MANAGER.
 */
@Mapper
public interface EduBasicInfoMapper {

    List<EduBasicInformation> findList(@Param("courseName") String courseName,
            @Param("startDate") String startDate,
            @Param("endDate") String endDate);

    EduBasicInformation findById(@Param("basicNo") String basicNo);

    String nextBasicNo();

    int insert(EduBasicInformation entity);

    int update(EduBasicInformation entity);

    /** Kế hoạch chưa lập khóa (ACTIVITY = 1). */
    List<EduBasicPlanOption> findAvailablePlans();

    /** Đánh dấu kế hoạch đã lập khóa: ACTIVITY 1 -> 2 (changePlanManagerActivity bản gốc). */
    int markPlanUsed(@Param("planNo") String planNo);

    /** Trả kế hoạch về chưa lập khóa khi xóa khóa: ACTIVITY 2 -> 1 (changePlanManagerActivityDel bản gốc). */
    int releasePlanByBasic(@Param("basicNo") String basicNo);

    // ===== Học viên =====
    List<EduFreeEmployee> findFreeEmployees(@Param("basicNo") String basicNo);

    int insertFreeEmployee(@Param("basicNo") String basicNo, @Param("empid") String empid,
            @Param("localName") String localName, @Param("flag") String flag);

    int deleteFreeEmployee(@Param("basicNo") String basicNo, @Param("empid") String empid);

    int deleteStudentCheckByStudent(@Param("basicNo") String basicNo, @Param("empid") String empid);

    // ===== Kết quả đào tạo / Đánh giá giảng viên =====
    int countTrainResult(@Param("basicNo") String basicNo, @Param("empid") String empid);

    int insertTrainResult(@Param("basicNo") String basicNo, @Param("empid") String empid,
            @Param("localName") String localName);

    int deleteTrainResultByStudent(@Param("basicNo") String basicNo, @Param("empid") String empid);

    int insertTeacherCheck(@Param("basicNo") String basicNo, @Param("teaEmpid") String teaEmpid,
            @Param("teaName") String teaName, @Param("stuEmpid") String stuEmpid, @Param("stuName") String stuName);

    int deleteTeacherChecks(@Param("basicNo") String basicNo);

    // ===== Nhân viên thực tế =====
    List<EduPerson> findFinalStudents(@Param("basicNo") String basicNo);

    int insertFinalStudent(@Param("basicNo") String basicNo, @Param("empid") String empid, @Param("name") String name);

    int deleteFinalStudents(@Param("basicNo") String basicNo);

    // ===== Chi phí =====
    int insertCostManager(@Param("basicNo") String basicNo);

    // ===== Tra cứu cho popup =====
    /** NV theo danh sách mã (planEmployee / finalstudent bản gốc). */
    List<EduPerson> findEmployeesByEmpids(@Param("empids") List<String> empids);

    /** Giảng viên đang hoạt động theo danh sách mã (commonTeacher bản gốc). */
    List<EduPerson> findTeachersByEmpids(@Param("empids") List<String> empids);
}
