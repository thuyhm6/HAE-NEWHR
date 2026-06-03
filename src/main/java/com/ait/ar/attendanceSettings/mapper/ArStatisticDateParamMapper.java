package com.ait.ar.attendanceSettings.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.ait.ar.attendanceSettings.model.ArStatisticDateParam;

import java.util.List;

@Mapper
public interface ArStatisticDateParamMapper {

    /**
     * Lấy danh sách thông số khoảng chấm công có tìm kiếm
     */
    List<ArStatisticDateParam> selectCycleParams(@Param("cpnyId") String cpnyId, @Param("statNo") String statNo);

    /**
     * Lấy chi tiết thông số
     */
    ArStatisticDateParam selectCycleParamById(@Param("paramNo") String paramNo);

    /**
     * Thêm mới thông số
     */
    int insertCycleParam(ArStatisticDateParam param);

    /**
     * Cập nhật thông số
     */
    int updateCycleParam(ArStatisticDateParam param);

    /**
     * Xóa thông số
     */
    int deleteCycleParam(@Param("paramNo") String paramNo);
}
