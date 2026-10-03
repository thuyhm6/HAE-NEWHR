package com.ait.edu.trainEducation.service;

import com.ait.edu.trainEducation.model.EduTrainOrgan;
import com.ait.exception.BusinessException;

import java.util.List;

/**
 * Service Đơn vị đào tạo (EDU_TRAIN_ORGAN). File hợp đồng đính kèm qua EduCommonService.
 */
public interface EduTrainOrganService {

    String ERR_NOT_FOUND = "EDU_TRAIN_ORGAN_NOT_FOUND";

    /** Danh sách kèm file hợp đồng của từng đơn vị (cột "Hợp đồng" bản gốc). */
    List<EduTrainOrgan> findList(String organName, String address);

    EduTrainOrgan getDetail(String organNo);

    /** Thêm mới, trả về ORGAN_NO để client upload file đính kèm. */
    String add(EduTrainOrgan entity) throws BusinessException;

    void update(EduTrainOrgan entity) throws BusinessException;

    void delete(String organNo) throws BusinessException;
}
