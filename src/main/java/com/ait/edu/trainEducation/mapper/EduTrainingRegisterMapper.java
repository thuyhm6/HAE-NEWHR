package com.ait.edu.trainEducation.mapper;

import com.ait.edu.trainEducation.model.EduTrainingRegister;
import com.ait.edu.trainEducation.model.EduTrainingRegisterRequest;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * Mapper đăng ký đào tạo bên ngoài (EDU_TRAINING_REGISTER).
 */
@Mapper
public interface EduTrainingRegisterMapper {

    /** Đơn của người đăng nhập (#{adminID}), lọc theo loại đào tạo. */
    List<EduTrainingRegister> findMyList(@Param("trainingType") String trainingType);

    /** ESS_APPLY_SEQ - dùng chung dãy số APPLY_NO với các đơn ESS (getEssApplySeq bản gốc). */
    Long nextApplyNo();

    int insert(@Param("applyNo") String applyNo, @Param("affirmFlag") String affirmFlag,
            @Param("r") EduTrainingRegisterRequest request);
}
