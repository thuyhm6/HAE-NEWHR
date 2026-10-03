package com.ait.edu.trainEducation.service.impl;

import com.ait.edu.trainEducation.mapper.EduSystemManagerMapper;
import com.ait.edu.trainEducation.model.EduSystemManager;
import com.ait.edu.trainEducation.service.EduSystemManagerService;
import com.ait.exception.BusinessException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EduSystemManagerServiceImpl implements EduSystemManagerService {
    private static final Logger log = LoggerFactory.getLogger(EduSystemManagerServiceImpl.class);

    /** Độ dài phần số của TRAIN_TYPE_NO (VD: SVP000001). */
    private static final int TRAIN_TYPE_NO_DIGITS = 6;

    /** Tiền tố TRAIN_TYPE_NO theo Chương trình đào tạo - giữ nguyên như bản gốc (TrainEducationSerImpl#addSystemManagerInfo). */
    private static final Map<String, String> TRAIN_TYPE_NO_PREFIX = new HashMap<>();
    static {
        TRAIN_TYPE_NO_PREFIX.put("14014481", "SVP");
        TRAIN_TYPE_NO_PREFIX.put("14014482", "SLP");
        TRAIN_TYPE_NO_PREFIX.put("14014483", "SEP");
        TRAIN_TYPE_NO_PREFIX.put("14014484", "SGP");
    }

    @Autowired
    private EduSystemManagerMapper eduSystemManagerMapper;

    @Override
    @Transactional(readOnly = true)
    public List<EduSystemManager> findList(String trainDiffCode, String trainTypeCode) {
        log.info("Tim danh sach he thong dao tao, trainDiffCode={}, trainTypeCode={}", trainDiffCode, trainTypeCode);
        try {
            return eduSystemManagerMapper.findList(trainDiffCode, trainTypeCode);
        } catch (Exception e) {
            log.error("Loi khi tim danh sach he thong dao tao", e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public EduSystemManager getDetail(String sysmanaNo) {
        log.info("Lay chi tiet he thong dao tao, sysmanaNo={}", sysmanaNo);
        try {
            return eduSystemManagerMapper.findBySysmanaNo(sysmanaNo);
        } catch (Exception e) {
            log.error("Loi khi lay chi tiet he thong dao tao, sysmanaNo={}", sysmanaNo, e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public String add(EduSystemManager entity) throws BusinessException {
        log.info("Them moi he thong dao tao, trainDiffCode={}, trainTypeCode={}",
                entity.getTrainDiffCode(), entity.getTrainTypeCode());
        try {
            if (eduSystemManagerMapper.countActiveByTrainTypeCode(entity.getTrainTypeCode()) > 0) {
                throw new BusinessException(ERR_DUPLICATE, "Loại hình đào tạo không được trùng lặp!");
            }
            String trainTypeNo = buildNextTrainTypeNo(entity.getTrainDiffCode());
            entity.setTrainTypeNo(trainTypeNo);
            entity.setRemark(trimToNull(entity.getRemark()));
            eduSystemManagerMapper.insert(entity);
            log.info("Them moi he thong dao tao thanh cong, trainTypeNo={}", trainTypeNo);
            return trainTypeNo;
        } catch (BusinessException e) {
            log.warn("Them moi he thong dao tao that bai: {}", e.getUserMessage());
            throw e;
        } catch (Exception e) {
            log.error("Loi khi them moi he thong dao tao", e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void update(EduSystemManager entity) throws BusinessException {
        log.info("Cap nhat he thong dao tao, sysmanaNo={}", entity.getSysmanaNo());
        try {
            entity.setRemark(trimToNull(entity.getRemark()));
            int rows = eduSystemManagerMapper.updateRemark(entity);
            if (rows == 0) {
                throw new BusinessException(ERR_NOT_FOUND, "Không tìm thấy dữ liệu cần cập nhật.");
            }
        } catch (BusinessException e) {
            log.warn("Cap nhat he thong dao tao that bai: {}", e.getUserMessage());
            throw e;
        } catch (Exception e) {
            log.error("Loi khi cap nhat he thong dao tao, sysmanaNo={}", entity.getSysmanaNo(), e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void delete(String sysmanaNo) throws BusinessException {
        log.info("Xoa he thong dao tao, sysmanaNo={}", sysmanaNo);
        try {
            int rows = eduSystemManagerMapper.softDelete(sysmanaNo);
            if (rows == 0) {
                throw new BusinessException(ERR_NOT_FOUND, "Không tìm thấy dữ liệu cần xóa.");
            }
        } catch (BusinessException e) {
            log.warn("Xoa he thong dao tao that bai: {}", e.getUserMessage());
            throw e;
        } catch (Exception e) {
            log.error("Loi khi xoa he thong dao tao, sysmanaNo={}", sysmanaNo, e);
            throw e;
        }
    }

    /**
     * Sinh TRAIN_TYPE_NO = tiền tố (theo TRAIN_DIFF_CODE) + số thứ tự 6 chữ số.
     * Số thứ tự = phần số của MAX(TRAIN_TYPE_NO) cùng Chương trình đào tạo + 1.
     */
    private String buildNextTrainTypeNo(String trainDiffCode) {
        String prefix = TRAIN_TYPE_NO_PREFIX.getOrDefault(trainDiffCode, "");
        String maxNo = eduSystemManagerMapper.findMaxTrainTypeNo(trainDiffCode);
        int next = 1;
        if (maxNo != null && !maxNo.isEmpty()) {
            String digits = maxNo.replaceAll("\\D", "");
            if (!digits.isEmpty()) {
                next = Integer.parseInt(digits) + 1;
            }
        }
        return prefix + String.format("%0" + TRAIN_TYPE_NO_DIGITS + "d", next);
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
