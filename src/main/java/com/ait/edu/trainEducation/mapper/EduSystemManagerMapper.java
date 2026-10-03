package com.ait.edu.trainEducation.mapper;

import com.ait.edu.trainEducation.model.EduSystemManager;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * Mapper cho bảng EDU_SYSTEM_MANAGER (Hệ thống đào tạo).
 */
@Mapper
public interface EduSystemManagerMapper {

    List<EduSystemManager> findList(@Param("trainDiffCode") String trainDiffCode,
            @Param("trainTypeCode") String trainTypeCode);

    EduSystemManager findBySysmanaNo(@Param("sysmanaNo") String sysmanaNo);

    /** MAX(TRAIN_TYPE_NO) đang hoạt động theo Chương trình đào tạo - dùng sinh mã loại hình kế tiếp. */
    String findMaxTrainTypeNo(@Param("trainDiffCode") String trainDiffCode);

    /** Đếm số bản ghi đang hoạt động trùng Loại hình (thay cho unique key UK_EDU_SYSTEM_MANAGER bản gốc). */
    int countActiveByTrainTypeCode(@Param("trainTypeCode") String trainTypeCode);

    int insert(EduSystemManager entity);

    int updateRemark(EduSystemManager entity);

    /** Xóa mềm: ACTIVITY = '0' (giữ nguyên như bản gốc). */
    int softDelete(@Param("sysmanaNo") String sysmanaNo);
}
