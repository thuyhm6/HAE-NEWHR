package com.ait.ar.attendanceMintenance.mapper;

import com.ait.ar.attendanceMintenance.dto.ArCardTemporaryDto;
import com.ait.ar.attendanceMintenance.dto.ArCardTemporarySaveRequest;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ArCardTemporaryMapper {

    List<ArCardTemporaryDto> selectArCardTemporaryList(ArCardTemporaryDto params);

    ArCardTemporaryDto selectArCardTemporaryInfo(@Param("recordNo") Long recordNo);

    /** Vô hiệu hóa các thẻ tạm cũ của nhân viên trước khi thêm thẻ mới (deleteArCardTemporary bản cũ). */
    int deactivateByPersonId(@Param("personId") String personId);

    int insertArCardTemporary(ArCardTemporarySaveRequest request);

    int updateArCardTemporary(@Param("recordNo") Long recordNo, @Param("activity") String activity);
}
