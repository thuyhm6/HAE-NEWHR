package com.ait.hrm.recruitManage.mapper;

import com.ait.hrm.recruitManage.dto.HrEmployeeRecruitDto;
import com.ait.hrm.recruitManage.dto.HrEducationRecruitDto;
import com.ait.hrm.recruitManage.dto.HrWorkExperienceRecruitDto;
import com.ait.hrm.recruitManage.dto.HrFamilyRecruitDto;
import com.ait.hrm.recruitManage.dto.HrRecruitExecuteDto;
import com.ait.hrm.recruitManage.dto.HrExpInsideBatchDto;
import com.ait.hrm.recruitManage.dto.HrRecruitBatchDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface HrRecruitManageMapper {

    // ── HR_EMPLOYEE_RECRUIT ──────────────────────────────────────────────────

    int countList(HrEmployeeRecruitDto dto);

    List<HrEmployeeRecruitDto> selectListPage(HrEmployeeRecruitDto dto);

    HrEmployeeRecruitDto selectEmployeeById(@Param("personId") String personId);

    int insertEmployee(HrEmployeeRecruitDto dto);

    int updateEmployee(HrEmployeeRecruitDto dto);

    // ── HR_EDUCATION_RECRUIT ─────────────────────────────────────────────────

    List<HrEducationRecruitDto> selectEducationList(@Param("personId") String personId);

    HrEducationRecruitDto selectEducationById(@Param("seq") Long seq);

    int insertEducation(HrEducationRecruitDto dto);

    int updateEducation(HrEducationRecruitDto dto);

    int deleteEducation(@Param("seq") Long seq);

    // ── HR_WORK_EXPERIENCE_RECRUIT ───────────────────────────────────────────

    List<HrWorkExperienceRecruitDto> selectWorkExpList(@Param("personId") String personId);

    HrWorkExperienceRecruitDto selectWorkExpById(@Param("seq") Long seq);

    int insertWorkExp(HrWorkExperienceRecruitDto dto);

    int updateWorkExp(HrWorkExperienceRecruitDto dto);

    int deleteWorkExp(@Param("seq") Long seq);

    // ── HR_FAMILY_RECRUIT ────────────────────────────────────────────────────

    List<HrFamilyRecruitDto> selectFamilyList(@Param("personId") String personId);

    HrFamilyRecruitDto selectFamilyById(@Param("seq") Long seq);

    int insertFamily(HrFamilyRecruitDto dto);

    int updateFamily(HrFamilyRecruitDto dto);

    int deleteFamily(@Param("seq") Long seq);

    // ── Stored procedure ─────────────────────────────────────────────────────

    void callRecruitExecute(HrRecruitExecuteDto dto);

    // ── HR_RECRUIT_REGISTER_INFO (REGISTER_TYPE='80000057') ──────────────────
    List<HrExpInsideBatchDto> selectRegisterList(HrExpInsideBatchDto dto);
    void insertRegister(HrExpInsideBatchDto dto);

    // ── HR_EXPERIENCE_INSIDE_BATCH ───────────────────────────────────────────
    int countBatchList(HrExpInsideBatchDto dto);
    int countUnprocessedBatch(HrExpInsideBatchDto dto);
    List<HrExpInsideBatchDto> selectBatchListPage(HrExpInsideBatchDto dto);
    void insertBatchItem(HrExpInsideBatchDto dto);
    void updateBatchItem(HrExpInsideBatchDto dto);
    void deleteBatchItem(@Param("seq") String seq);
    String selectPersonIdByEmpId(@Param("empId") String empId);

    HrExpInsideBatchDto selectCurrentEmpByEmpId(@Param("empId") String empId);

    // ── HR_RECRUIT_REGISTER_INFO (REGISTER_TYPE='14014410') ──────────────────
    List<HrRecruitBatchDto> selectRblRegisterList(HrRecruitBatchDto dto);
    void insertRblRegister(HrRecruitBatchDto dto);

    // ── HR_EMPLOYEE_RECRUIT_BATCH ────────────────────────────────────────────
    int countRblBatchList(HrRecruitBatchDto dto);
    int countUnprocessedRblBatch(HrRecruitBatchDto dto);
    List<HrRecruitBatchDto> selectRblBatchListPage(HrRecruitBatchDto dto);
    void insertRblBatchItem(HrRecruitBatchDto dto);
    void updateRblBatchItem(HrRecruitBatchDto dto);
    void deleteRblBatchItem(@Param("seq") String seq);

    // ── Check EMPID tồn tại trước khi Xác nhận ───────────────────────────────
    List<String> selectEmpIdsByPersonIds(@Param("personIds") List<String> personIds);
    List<String> selectEmpIdsByRegisterSeq(@Param("registerSeq") String registerSeq);
    List<String> selectExistingEmpIds(@Param("empIds") List<String> empIds);
}
