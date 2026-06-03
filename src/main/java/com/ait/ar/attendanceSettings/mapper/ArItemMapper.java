package com.ait.ar.attendanceSettings.mapper;

import com.ait.ar.attendanceSettings.dto.ArItemDto;
import com.ait.ar.attendanceSettings.model.ArItem;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface ArItemMapper {

    /**
     * Lấy danh sách hạng mục
     */
    List<ArItemDto> findAll(@Param("itemNo") String itemNo);

    /**
     * Lấy thông số hạng mục theo itemNo
     */
    ArItem selectByItemNo(@Param("itemNo") String itemNo);

    /**
     * Thêm mới
     */
    void insert(ArItem item);

    /**
     * Cập nhật
     */
    void update(ArItem item);

    /**
     * Xóa
     */
    void delete(@Param("itemNo") String itemNo);
}
