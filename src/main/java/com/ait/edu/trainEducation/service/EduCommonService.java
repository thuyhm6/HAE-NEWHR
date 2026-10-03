package com.ait.edu.trainEducation.service;

import com.ait.edu.trainEducation.model.EduDeptNode;
import com.ait.edu.trainEducation.model.EduEmployeeLookup;
import com.ait.edu.trainEducation.model.EduFile;
import com.ait.exception.BusinessException;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * Service dùng chung cho module đào tạo: cây phòng ban, tìm nhân viên,
 * file đính kèm (ESS_FILE).
 */
public interface EduCommonService {

    /** APPLY_TYPE file đính kèm - giữ nguyên giá trị bản gốc để đọc được file cũ. */
    String FILE_TYPE_PLAN = "eduPlanManager";
    String FILE_TYPE_ORGAN = "eduTrainOrgan";
    String FILE_TYPE_AGREEMENT = "eduTrainAgreement";
    /** Báo cáo đào tạo (APPLY_NO = BASIC_NO) - màn Kết quả đào tạo. */
    String FILE_TYPE_RESULT = "eduTrainResult";
    String FILE_TYPE_COST = "eduCostManager";

    String ERR_FILE_TYPE = "EDU_FILE_TYPE_INVALID";
    String ERR_FILE_NOT_FOUND = "EDU_FILE_NOT_FOUND";

    List<EduDeptNode> getDeptTree();

    List<EduEmployeeLookup> findEmployees(String keyword, List<String> deptNos, String deptRoot, String orderBy);

    EduEmployeeLookup findEmployeeByEmpid(String empid);

    List<EduFile> getFiles(String applyType, String applyNo);

    /** Lấy file của nhiều bản ghi, gom theo APPLY_NO (dùng cho cột đính kèm ở danh sách). */
    Map<String, List<EduFile>> getFilesGrouped(String applyType, List<String> applyNos);

    List<EduFile> uploadFiles(String applyType, String applyNo, List<MultipartFile> files) throws BusinessException;

    void deleteFile(String fileNo) throws BusinessException;

    void deleteFilesByApply(String applyType, String applyNo);
}
