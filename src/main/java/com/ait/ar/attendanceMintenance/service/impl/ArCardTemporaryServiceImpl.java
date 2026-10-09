package com.ait.ar.attendanceMintenance.service.impl;

import com.ait.ar.attendanceMintenance.dto.ArCardTemporaryDto;
import com.ait.ar.attendanceMintenance.dto.ArCardTemporarySaveRequest;
import com.ait.ar.attendanceMintenance.mapper.ArCardTemporaryMapper;
import com.ait.ar.attendanceMintenance.service.ArCardTemporaryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Thẻ chấm công tạm thời - port từ ArCardRecordSerImp#getArCardTemporaryList,
 * #getArCardTemporaryInfo, #addArCardTemporaryInfo, #updateArCardTemporaryInfo
 * và ArCardRecordDaoImpl tương ứng của dự án cũ.
 */
@Service
public class ArCardTemporaryServiceImpl implements ArCardTemporaryService {

    private static final Logger log = LoggerFactory.getLogger(ArCardTemporaryServiceImpl.class);

    @Autowired
    private ArCardTemporaryMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public List<ArCardTemporaryDto> getList(ArCardTemporaryDto params) {
        ArCardTemporaryDto safeParams = params == null ? new ArCardTemporaryDto() : params;
        log.info("getList arCardTemporary keyword={}, activity={}", safeParams.getKeyword(), safeParams.getFilterActivity());
        try {
            return mapper.selectArCardTemporaryList(safeParams);
        } catch (Exception e) {
            log.error("Failed to load arCardTemporary list", e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ArCardTemporaryDto getInfo(Long recordNo) {
        log.info("getInfo arCardTemporary recordNo={}", recordNo);
        try {
            return mapper.selectArCardTemporaryInfo(recordNo);
        } catch (Exception e) {
            log.error("Failed to load arCardTemporary recordNo={}", recordNo, e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int add(ArCardTemporarySaveRequest request) {
        if (request.getPersonId() == null || request.getPersonId().trim().isEmpty()) {
            throw new IllegalArgumentException("personId is required");
        }
        log.info("add arCardTemporary personId={}, cardNo={}", request.getPersonId(), request.getCardNo());
        try {
            // Giống bản cũ (ArCardRecordDaoImpl#addArCardTemporaryInfo): thẻ cũ -> không sử dụng.
            int deactivated = mapper.deactivateByPersonId(request.getPersonId());
            int inserted = mapper.insertArCardTemporary(request);
            log.info("add arCardTemporary deactivated={}, inserted={}", deactivated, inserted);
            if (inserted == 0) {
                throw new IllegalStateException("Employee not found: " + request.getPersonId());
            }
            return inserted;
        } catch (Exception e) {
            log.error("Failed to add arCardTemporary personId={}", request.getPersonId(), e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int update(ArCardTemporarySaveRequest request) {
        if (request.getRecordNo() == null) {
            throw new IllegalArgumentException("recordNo is required");
        }
        log.info("update arCardTemporary recordNo={}, activity={}", request.getRecordNo(), request.getActivity());
        try {
            int updated = mapper.updateArCardTemporary(request.getRecordNo(), request.getActivity());
            log.info("update arCardTemporary updated={}", updated);
            return updated;
        } catch (Exception e) {
            log.error("Failed to update arCardTemporary recordNo={}", request.getRecordNo(), e);
            throw e;
        }
    }
}
