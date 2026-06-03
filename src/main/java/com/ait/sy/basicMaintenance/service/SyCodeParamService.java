package com.ait.sy.basicMaintenance.service;

import java.util.List;

import com.ait.sy.basicMaintenance.dto.SyCodeParamDto;

public interface SyCodeParamService {
    List<SyCodeParamDto> getList(String parentCode, String cpnyId);

    void save(SyCodeParamDto dto);

    void update(SyCodeParamDto dto);

    void delete(String codeNo, String cpnyId);

    void deleteByParamNo(String paramNo);
}
