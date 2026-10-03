package com.ait.edu.trainEducation.service;

import com.ait.edu.trainEducation.model.EduTrainArchive;
import com.ait.edu.trainEducation.model.EduTrainArchiveQuery;
import com.ait.exception.BusinessException;

import java.io.IOException;
import java.util.List;

/**
 * Hồ sơ đào tạo (/edu/traineducation/trainArchives) - port từ
 * TrainEducationCtroller.trainArchives (Hanwha_HTSV).
 */
public interface EduTrainArchivesService {

    String ERR_INVALID_DATE = "EDU_ARCHIVES_INVALID_DATE";

    List<EduTrainArchive> findList(EduTrainArchiveQuery query) throws BusinessException;

    byte[] export(EduTrainArchiveQuery query) throws BusinessException, IOException;
}
