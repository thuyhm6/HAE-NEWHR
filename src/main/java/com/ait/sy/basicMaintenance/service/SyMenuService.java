package com.ait.sy.basicMaintenance.service;

import java.util.List;

import com.ait.sy.basicMaintenance.dto.SyMenuDto;

public interface SyMenuService {
    List<SyMenuDto> findAll(String keyword);

    void save(SyMenuDto dto);

    void delete(String menuNo);

    byte[] exportExcel();
}
