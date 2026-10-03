package com.ait.edu.trainEducation.mapper;

import com.ait.edu.trainEducation.model.EduTrainAgreement;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * Mapper cho bảng EDU_TRAIN_AGREEMENT (Hợp đồng đào tạo).
 */
@Mapper
public interface EduTrainAgreementMapper {

    List<EduTrainAgreement> findList(@Param("deptNo") String deptNo,
            @Param("keyword") String keyword,
            @Param("conStartDate") String conStartDate,
            @Param("conEndDate") String conEndDate);

    EduTrainAgreement findByAgreeNo(@Param("agreeNo") String agreeNo);

    String nextAgreeNo();

    /** Phần số lớn nhất của AGREE_ID dạng "TRA######". */
    Integer findMaxAgreeSeq();

    int insert(EduTrainAgreement entity);

    /** Chỉ cập nhật các trường có trên form sửa (không ghi đè các trường nhập từ Excel). */
    int update(EduTrainAgreement entity);

    int softDelete(@Param("agreeNo") String agreeNo);
}
