package com.ait.hrm.recruitManage.service;

import com.ait.hrm.recruitManage.dto.HrEmployeeRecruitDto;
import com.ait.hrm.recruitManage.dto.HrEducationRecruitDto;
import com.ait.hrm.recruitManage.dto.HrWorkExperienceRecruitDto;
import com.ait.hrm.recruitManage.dto.HrFamilyRecruitDto;
import com.ait.hrm.recruitManage.dto.HrExpInsideBatchDto;
import com.ait.hrm.recruitManage.dto.HrRecruitBatchDto;
import com.ait.sy.sys.dto.DataTablesResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface HrRecruitManageService {

    DataTablesResponse<HrEmployeeRecruitDto> getEmployeeList(HrEmployeeRecruitDto dto);

    HrEmployeeRecruitDto getEmployeeById(String personId);

    Map<String, Object> saveEmployee(HrEmployeeRecruitDto dto);

    // Education
    List<HrEducationRecruitDto> getEducationList(String personId);

    Map<String, Object> saveEducation(HrEducationRecruitDto dto);

    Map<String, Object> deleteEducation(Long seq);

    // Work experience
    List<HrWorkExperienceRecruitDto> getWorkExpList(String personId);

    Map<String, Object> saveWorkExp(HrWorkExperienceRecruitDto dto);

    Map<String, Object> deleteWorkExp(Long seq);

    // Family
    List<HrFamilyRecruitDto> getFamilyList(String personId);

    Map<String, Object> saveFamily(HrFamilyRecruitDto dto);

    Map<String, Object> deleteFamily(Long seq);

    // Execute (confirm/cancel)
    Map<String, Object> executeRecruit(String personIds, String type);

    // Quyết định hàng loạt
    List<HrExpInsideBatchDto> getRegisterList();
    Map<String, Object> saveRegister(HrExpInsideBatchDto dto);
    DataTablesResponse<HrExpInsideBatchDto> getBatchList(HrExpInsideBatchDto dto);
    Map<String, Object> updateBatchItem(HrExpInsideBatchDto dto);
    Map<String, Object> deleteBatchItem(String seq);
    Map<String, Object> importBatchExcel(MultipartFile file, String registerSeq);

    // Nhận việc hàng loạt (Recruit Batch)
    List<HrRecruitBatchDto> getRblRegisterList();
    Map<String, Object> saveRblRegister(HrRecruitBatchDto dto);
    DataTablesResponse<HrRecruitBatchDto> getRblBatchList(HrRecruitBatchDto dto);
    Map<String, Object> updateRblBatchItem(HrRecruitBatchDto dto);
    Map<String, Object> deleteRblBatchItem(String seq);
    Map<String, Object> importRblBatchExcel(MultipartFile file, String registerSeq);
}
