package com.ait.edu.trainEducation.mapper;

import com.ait.edu.trainEducation.model.EduTrainOrgan;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * Mapper cho bảng EDU_TRAIN_ORGAN (Đơn vị đào tạo).
 */
@Mapper
public interface EduTrainOrganMapper {

    List<EduTrainOrgan> findList(@Param("organName") String organName, @Param("address") String address);

    EduTrainOrgan findByOrganNo(@Param("organNo") String organNo);

    String nextOrganNo();

    int insert(EduTrainOrgan entity);

    int update(EduTrainOrgan entity);

    int softDelete(@Param("organNo") String organNo);
}
