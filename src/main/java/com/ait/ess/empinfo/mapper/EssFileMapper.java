package com.ait.ess.empinfo.mapper;

import com.ait.ess.empinfo.dto.EssFileDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface EssFileMapper {

    int insertEssFile(EssFileDto dto);

    List<EssFileDto> selectFilesByApplyNo(@Param("applyNo") String applyNo);

    EssFileDto selectByFileNo(@Param("fileNo") String fileNo);

    /**
     * Lấy file đính kèm của một bản ghi học vấn đã duyệt (EDUC_NO), thông qua
     * các yêu cầu sửa đổi (HR_EDUCATION_APPLY.UPDATE_EDUC_NO) đã từng gửi kèm file cho bản ghi này.
     */
    List<EssFileDto> selectFilesByEducNo(@Param("educNo") Long educNo);

    /**
     * Lấy file đính kèm của một bản ghi chứng chỉ đã duyệt (QUAL_NO), thông qua
     * các yêu cầu sửa đổi (HR_QUALIFICATION_APPLY.UPDATE_QUAL_NO) đã từng gửi kèm file cho bản ghi này.
     */
    List<EssFileDto> selectFilesByQualNo(@Param("qualNo") Long qualNo);

    /**
     * Lấy file đính kèm của một bản ghi kinh nghiệm làm việc đã duyệt (WORK_EXPER_NO), thông qua
     * các yêu cầu sửa đổi (HR_WORK_EXPERIENCE_APPLY.UPDATE_WORK_EXPER_NO) đã từng gửi kèm file cho bản ghi này.
     */
    List<EssFileDto> selectFilesByWorkExpNo(@Param("workExpNo") Long workExpNo);

    /**
     * Lấy file đính kèm của thông tin cá nhân (HR_PERSONAL_INFO), theo PERSON_ID.
     * PERSON_ID luôn ổn định qua các lần gửi yêu cầu (không như EDUC_NO/QUAL_NO/WORK_EXPER_NO
     * khi thêm mới), nên có thể lấy toàn bộ file đã từng gửi kèm.
     */
    List<EssFileDto> selectFilesByPersonId(@Param("personId") String personId);
}
