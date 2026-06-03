package com.ait.evs.manage.service.impl;

import com.ait.evs.manage.dto.EvsResultEmpDto;
import com.ait.evs.manage.mapper.EvsResultEmpMapper;
import com.ait.evs.manage.service.EvsResultEmpService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EvsResultEmpServiceImpl implements EvsResultEmpService {

    private static final Logger log = LoggerFactory.getLogger(EvsResultEmpServiceImpl.class);

    @Autowired
    private EvsResultEmpMapper evsResultEmpMapper;

    @Override
    public List<EvsResultEmpDto> getList(EvsResultEmpDto params) {
        log.debug("getList params={}", params);
        try {
            return evsResultEmpMapper.selectList(params);
        } catch (Exception e) {
            log.error("getList error: {}", e.getMessage(), e);
            throw e;
        }
    }
}
