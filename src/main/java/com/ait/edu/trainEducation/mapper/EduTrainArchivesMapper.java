package com.ait.edu.trainEducation.mapper;

import com.ait.edu.trainEducation.model.EduTrainArchive;
import com.ait.edu.trainEducation.model.EduTrainArchiveQuery;

import org.apache.ibatis.annotations.Mapper;

import java.util.List;

/**
 * Mapper hồ sơ đào tạo (EDU_FREE_EMPLOYEE + EDU_BASIC_INFORMATION + ... và
 * bảng dữ liệu cũ EDU_TRAIN_BASIC_HISTORY).
 */
@Mapper
public interface EduTrainArchivesMapper {

    List<EduTrainArchive> findList(EduTrainArchiveQuery query);

    List<EduTrainArchive> findHistory(EduTrainArchiveQuery query);
}
