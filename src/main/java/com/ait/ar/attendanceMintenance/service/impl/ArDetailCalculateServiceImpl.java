package com.ait.ar.attendanceMintenance.service.impl;

import com.ait.ar.attendanceMintenance.dto.ArDetailCalculateDto;
import com.ait.ar.attendanceMintenance.mapper.ArDetailCalculateMapper;
import com.ait.ar.attendanceMintenance.service.ArDetailCalculateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ArDetailCalculateServiceImpl implements ArDetailCalculateService {

    @Autowired
    private ArDetailCalculateMapper arDetailCalculateMapper;

    @Override
    @Transactional
    public ArDetailCalculateDto runDetailCalculate(ArDetailCalculateDto params) {
        ArDetailCalculateDto safeParams = params == null ? new ArDetailCalculateDto() : params;

        String caltype = safeString(safeParams.getCaltype()).toUpperCase();
        safeParams.setCaltype(caltype);
        safeParams.setFromDate(normalizeDate(safeParams.getFromDate()));
        safeParams.setToDate(normalizeDate(safeParams.getToDate()));

        if ("EMP".equals(caltype)) {
            safeParams.setDeptId("");
            safeParams.setSonDeptFlag("N");
            safeParams.setPersonId(safeString(safeParams.getPersonId()));
        } else {
            safeParams.setDeptId(safeString(safeParams.getDeptId()));
            safeParams.setSonDeptFlag("Y".equalsIgnoreCase(safeString(safeParams.getSonDeptFlag())) ? "Y" : "N");
            safeParams.setPersonId(safeString(safeParams.getPersonId()));
        }

        arDetailCalculateMapper.callDetailCalculateProcedure(safeParams);
        return safeParams;
    }

    private String safeString(String value) {
        return value == null ? "" : value.trim();
    }

    private String normalizeDate(String value) {
        return safeString(value).replace('-', '/');
    }
}
