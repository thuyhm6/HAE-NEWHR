package com.ait.edu.trainEducation.mapper;

import com.ait.edu.trainEducation.model.EduTrainCost;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * Mapper cho bảng EDU_COST_MANAGER (Chi phí đào tạo).
 */
@Mapper
public interface EduTrainCostMapper {

    List<EduTrainCost> findList(@Param("courseName") String courseName,
            @Param("startDate") String startDate,
            @Param("endDate") String endDate);

    EduTrainCost findByCostNo(@Param("costNo") String costNo);

    int update(EduTrainCost entity);

    int delete(@Param("costNo") String costNo);
}
