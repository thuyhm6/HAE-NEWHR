package com.ait.ar.attendanceSettings.mapper;

import com.ait.ar.attendanceSettings.dto.ArItemParamDto;
import com.ait.ar.attendanceSettings.model.ArItemParam;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface ArItemParamMapper {

    /**
     * Lấy danh sách tham số
     */
    List<ArItemParamDto> findAll(@Param("itemNo") String itemNo);

    /**
     * Lấy 1 bản ghi
     */
    ArItemParam selectByParamNo(@Param("arParamNo") String arParamNo);

    /**
     * Thêm mới
     */
    void insert(ArItemParam param);

    /**
     * Cập nhật
     */
    void update(ArItemParam param);

    /**
     * Xóa
     */
    void delete(@Param("arParamNo") String arParamNo);

    /**
     * Lấy sequence ID
     */
    String getNextParamNoSeq();

    List<ArItemParamDto> selectArItemOptions(@Param("type") String type);
}
