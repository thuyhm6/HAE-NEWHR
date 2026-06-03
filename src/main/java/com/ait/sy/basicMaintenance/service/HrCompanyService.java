package com.ait.sy.basicMaintenance.service;

import java.util.List;

import com.ait.sy.basicMaintenance.dto.HrCompanyDto;

public interface HrCompanyService {

    List<HrCompanyDto> searchCompany(String keyword);

    void saveCompany(HrCompanyDto dto);

    void deleteCompany(String cpnyNo);

    byte[] exportExcel();
}
