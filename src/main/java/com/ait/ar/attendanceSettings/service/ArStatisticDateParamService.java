package com.ait.ar.attendanceSettings.service;

import java.util.List;

import com.ait.ar.attendanceSettings.model.ArStatisticDateParam;

public interface ArStatisticDateParamService {

    /**
     * Lấy danh sách thông số khoảng chấm công có tìm kiếm
     */
    List<ArStatisticDateParam> getCycleParams(String cpnyId, String statNo);

    /**
     * Lấy chi tiết thông số
     */
    ArStatisticDateParam getCycleParamById(String paramNo);

    /**
     * Truyền dữ liệu và lưu lại thông số
     */
    void saveCycleParam(ArStatisticDateParam param);

    /**
     * Xóa thông số
     */
    void deleteCycleParam(String paramNo);
}
