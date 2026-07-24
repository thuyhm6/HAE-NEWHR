package com.ait.evs.manage.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.ait.evs.manage.dto.EvsObjectDto;

import java.util.List;

@Mapper
public interface EvsObjectMapper {

    /**
     * Lấy danh sách thông tin đánh giá theo personId
     */
    List<EvsObjectDto> getByPersonId(@Param("personId") String personId);
}
