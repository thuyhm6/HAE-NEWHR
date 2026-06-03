package com.ait.ess.viewDept.service.impl;

import com.ait.ess.viewDept.dto.ArPersonalListDetailDto;
import com.ait.ess.viewDept.dto.ArPersonalListDto;
import com.ait.ess.viewDept.mapper.ArPersonalListMapper;
import com.ait.ess.viewDept.service.ArPersonalListService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class ArPersonalListServiceImpl implements ArPersonalListService {

    private static final Logger log = LoggerFactory.getLogger(ArPersonalListServiceImpl.class);

    @Autowired
    private ArPersonalListMapper mapper;

    @Override
    public List<ArPersonalListDto> getItemList(ArPersonalListDto params) {
        try {
            return mapper.selectItemList(params);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách loại chấm công (AR_ITEM): {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public List<Map<String, Object>> getSummaryList(ArPersonalListDto params) {
        try {
            // Lấy danh sách ITEM_ID active để build SELECT động
            List<String> itemIds = mapper.selectActiveItemIds(params);
            log.debug("Danh sách ITEM_ID active từ AR_ITEM: {}", itemIds);
            params.setItemIds(itemIds);
            return mapper.selectSummaryList(params);
        } catch (Exception e) {
            log.error("Lỗi khi lấy tổng hợp tình hình chấm công: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public List<ArPersonalListDetailDto> getDetailList(ArPersonalListDetailDto params) {
        try {
            return mapper.selectDetailList(params);
        } catch (Exception e) {
            log.error("Lỗi khi lấy chi tiết chấm công (personId={}, itemId={}): {}",
                    params.getPersonId(), params.getItemId(), e.getMessage(), e);
            throw e;
        }
    }
}
