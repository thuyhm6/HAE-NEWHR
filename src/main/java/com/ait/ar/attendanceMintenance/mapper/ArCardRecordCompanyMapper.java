package com.ait.ar.attendanceMintenance.mapper;

import com.ait.ar.attendanceMintenance.dto.ArCardRecordCompanyDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ArCardRecordCompanyMapper {

    int countList(ArCardRecordCompanyDto dto);

    List<ArCardRecordCompanyDto> selectListPage(ArCardRecordCompanyDto dto);

    List<ArCardRecordCompanyDto> selectListAll(ArCardRecordCompanyDto dto);

    /** Insert nếu chưa tồn tại (CARD_NO + R_TIME). Trả về 1 nếu đã insert, 0 nếu trùng. */
    int insertFromDevice(ArCardRecordCompanyDto dto);
}
