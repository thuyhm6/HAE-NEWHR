package com.ait.sy.basicMaintenance.service;

import java.util.List;

import com.ait.sy.basicMaintenance.dto.SyMenuParamDto;

public interface SyMenuParamService {
    List<SyMenuParamDto> findByParentMenuAndCpny(String parentMenuNo, String cpnyId);

    void save(SyMenuParamDto dto);

    void delete(String cpnyId, String menuNo);

    // exportExcel if needed? User requested "full func export excel".
    byte[] exportExcel(String parentMenuNo, String cpnyId);
}
