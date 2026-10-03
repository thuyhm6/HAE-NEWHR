package com.ait.edu.trainEducation.service;

import com.ait.edu.trainEducation.model.EduSystemManager;
import com.ait.exception.BusinessException;

import java.util.List;

/**
 * Service Hệ thống đào tạo (EDU_SYSTEM_MANAGER).
 */
public interface EduSystemManagerService {

    /** Mã lỗi khi thêm trùng Loại hình đào tạo. */
    String ERR_DUPLICATE = "EDU_SYSTEM_MANAGER_DUPLICATE";
    /** Mã lỗi khi không tìm thấy bản ghi. */
    String ERR_NOT_FOUND = "EDU_SYSTEM_MANAGER_NOT_FOUND";

    List<EduSystemManager> findList(String trainDiffCode, String trainTypeCode);

    EduSystemManager getDetail(String sysmanaNo);

    /** Thêm mới, tự sinh TRAIN_TYPE_NO. Trả về mã loại hình đã sinh. */
    String add(EduSystemManager entity) throws BusinessException;

    /** Chỉ cho sửa Ghi chú (giữ nguyên như bản gốc). */
    void update(EduSystemManager entity) throws BusinessException;

    void delete(String sysmanaNo) throws BusinessException;
}
