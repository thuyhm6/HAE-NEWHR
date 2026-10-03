package com.ait.edu.trainEducation.service;

import com.ait.edu.trainEducation.model.EduTrainCost;
import com.ait.exception.BusinessException;

import java.io.IOException;
import java.util.List;

/**
 * Service Chi phí đào tạo (EDU_COST_MANAGER). File đính kèm qua EduCommonService.
 */
public interface EduTrainCostService {

    String ERR_NOT_FOUND = "EDU_TRAIN_COST_NOT_FOUND";

    List<EduTrainCost> findList(String courseName, String startDate, String endDate);

    EduTrainCost getDetail(String costNo);

    void update(EduTrainCost entity) throws BusinessException;

    void delete(String costNo) throws BusinessException;

    byte[] exportList(String courseName, String startDate, String endDate) throws IOException;

    byte[] exportDetail(String costNo) throws IOException, BusinessException;
}
