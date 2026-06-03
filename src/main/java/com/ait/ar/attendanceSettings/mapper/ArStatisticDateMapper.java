package com.ait.ar.attendanceSettings.mapper;

import com.ait.ar.attendanceSettings.dto.ArStatisticDateDto;
import com.ait.ar.attendanceSettings.model.ArStatisticDate;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface ArStatisticDateMapper {

    /**
     * Lấy danh sách thống kê chu kỳ
     * 
     * @param statNo Khoảng mã để tìm kiếm (tuỳ chọn)
     * @return Danh sách
     */
    List<ArStatisticDateDto> findAll(@Param("statNo") String statNo);

    /**
     * Lấy thông số chu kỳ theo statNo
     * 
     * @param statNo
     * @return Bản ghi
     */
    ArStatisticDate selectByStatNo(@Param("statNo") String statNo);

    /**
     * Thêm mới
     */
    void insert(ArStatisticDate param);

    /**
     * Cập nhật
     */
    void update(ArStatisticDate param);

    /**
     * Xóa
     */
    void delete(@Param("statNo") String statNo);
}
