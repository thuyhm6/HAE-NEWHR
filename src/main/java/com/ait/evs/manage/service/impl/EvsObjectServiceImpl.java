package com.ait.evs.manage.service.impl;

import com.ait.evs.manage.dto.EvsObjectDto;
import com.ait.evs.manage.mapper.EvsObjectMapper;
import com.ait.evs.manage.service.EvsObjectService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EvsObjectServiceImpl implements EvsObjectService {

    private static final Logger log = LoggerFactory.getLogger(EvsObjectServiceImpl.class);

    @Autowired
    private EvsObjectMapper evsObjectMapper;

    @Override
    public List<EvsObjectDto> getByPersonId(String personId) {
        log.info("Lấy danh sách thông tin đánh giá theo personId={}", personId);
        try {
            return evsObjectMapper.getByPersonId(personId);
        } catch (Exception e) {
            log.error("Lỗi lấy danh sách thông tin đánh giá personId={}", personId, e);
            throw e;
        }
    }
}
