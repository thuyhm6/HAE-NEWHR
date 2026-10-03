package com.ait.edu.trainEducation.service.impl;

import com.ait.edu.trainEducation.mapper.EduTrainOrganMapper;
import com.ait.edu.trainEducation.model.EduFile;
import com.ait.edu.trainEducation.model.EduTrainOrgan;
import com.ait.edu.trainEducation.service.EduCommonService;
import com.ait.edu.trainEducation.service.EduTrainOrganService;
import com.ait.exception.BusinessException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class EduTrainOrganServiceImpl implements EduTrainOrganService {
    private static final Logger log = LoggerFactory.getLogger(EduTrainOrganServiceImpl.class);

    @Autowired
    private EduTrainOrganMapper eduTrainOrganMapper;

    @Autowired
    private EduCommonService eduCommonService;

    @Override
    @Transactional(readOnly = true)
    public List<EduTrainOrgan> findList(String organName, String address) {
        log.info("Tim danh sach don vi dao tao, organName={}, address={}", organName, address);
        try {
            List<EduTrainOrgan> list = eduTrainOrganMapper.findList(trimToNull(organName), trimToNull(address));
            Map<String, List<EduFile>> files = eduCommonService.getFilesGrouped(EduCommonService.FILE_TYPE_ORGAN,
                    list.stream().map(EduTrainOrgan::getOrganNo).collect(Collectors.toList()));
            list.forEach(o -> o.setFiles(files.getOrDefault(o.getOrganNo(), Collections.emptyList())));
            return list;
        } catch (Exception e) {
            log.error("Loi khi tim danh sach don vi dao tao", e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public EduTrainOrgan getDetail(String organNo) {
        log.info("Lay chi tiet don vi dao tao, organNo={}", organNo);
        try {
            EduTrainOrgan organ = eduTrainOrganMapper.findByOrganNo(organNo);
            if (organ != null) {
                organ.setFiles(eduCommonService.getFiles(EduCommonService.FILE_TYPE_ORGAN, organNo));
            }
            return organ;
        } catch (Exception e) {
            log.error("Loi khi lay chi tiet don vi dao tao, organNo={}", organNo, e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public String add(EduTrainOrgan entity) throws BusinessException {
        log.info("Them moi don vi dao tao, organName={}", entity.getOrganName());
        try {
            entity.setOrganName(entity.getOrganName().trim());
            entity.setOrganNo(eduTrainOrganMapper.nextOrganNo());
            eduTrainOrganMapper.insert(entity);
            log.info("Them moi don vi dao tao thanh cong, organNo={}", entity.getOrganNo());
            return entity.getOrganNo();
        } catch (Exception e) {
            log.error("Loi khi them moi don vi dao tao", e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void update(EduTrainOrgan entity) throws BusinessException {
        log.info("Cap nhat don vi dao tao, organNo={}", entity.getOrganNo());
        try {
            entity.setOrganName(entity.getOrganName().trim());
            if (eduTrainOrganMapper.update(entity) == 0) {
                throw new BusinessException(ERR_NOT_FOUND, "Không tìm thấy dữ liệu cần cập nhật.");
            }
        } catch (BusinessException e) {
            log.warn("Cap nhat don vi dao tao that bai: {}", e.getUserMessage());
            throw e;
        } catch (Exception e) {
            log.error("Loi khi cap nhat don vi dao tao, organNo={}", entity.getOrganNo(), e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void delete(String organNo) throws BusinessException {
        log.info("Xoa don vi dao tao, organNo={}", organNo);
        try {
            if (eduTrainOrganMapper.softDelete(organNo) == 0) {
                throw new BusinessException(ERR_NOT_FOUND, "Không tìm thấy dữ liệu cần xóa.");
            }
        } catch (BusinessException e) {
            log.warn("Xoa don vi dao tao that bai: {}", e.getUserMessage());
            throw e;
        } catch (Exception e) {
            log.error("Loi khi xoa don vi dao tao, organNo={}", organNo, e);
            throw e;
        }
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String t = value.trim();
        return t.isEmpty() ? null : t;
    }
}
