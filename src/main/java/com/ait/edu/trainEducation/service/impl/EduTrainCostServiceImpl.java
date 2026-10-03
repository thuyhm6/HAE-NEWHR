package com.ait.edu.trainEducation.service.impl;

import com.ait.edu.trainEducation.mapper.EduTrainCostMapper;
import com.ait.edu.trainEducation.model.EduTrainCost;
import com.ait.edu.trainEducation.service.EduCommonService;
import com.ait.edu.trainEducation.service.EduTrainCostService;
import com.ait.edu.trainEducation.util.EduExcelHelper;
import com.ait.exception.BusinessException;
import com.ait.util.I18nUtil;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EduTrainCostServiceImpl implements EduTrainCostService {
    private static final Logger log = LoggerFactory.getLogger(EduTrainCostServiceImpl.class);

    @Autowired
    private EduTrainCostMapper eduTrainCostMapper;

    @Autowired
    private EduCommonService eduCommonService;

    @Override
    @Transactional(readOnly = true)
    public List<EduTrainCost> findList(String courseName, String startDate, String endDate) {
        log.info("Tim danh sach chi phi dao tao, courseName={}, startDate={}, endDate={}", courseName, startDate, endDate);
        try {
            return eduTrainCostMapper.findList(trimToNull(courseName), trimToNull(startDate), trimToNull(endDate));
        } catch (Exception e) {
            log.error("Loi khi tim danh sach chi phi dao tao", e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public EduTrainCost getDetail(String costNo) {
        log.info("Lay chi tiet chi phi dao tao, costNo={}", costNo);
        try {
            EduTrainCost cost = eduTrainCostMapper.findByCostNo(costNo);
            if (cost != null) {
                cost.setFiles(eduCommonService.getFiles(EduCommonService.FILE_TYPE_COST, costNo));
            }
            return cost;
        } catch (Exception e) {
            log.error("Loi khi lay chi tiet chi phi dao tao, costNo={}", costNo, e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void update(EduTrainCost entity) throws BusinessException {
        log.info("Cap nhat chi phi dao tao, costNo={}", entity.getCostNo());
        try {
            entity.setRemark(trimToNull(entity.getRemark()));
            if (eduTrainCostMapper.update(entity) == 0) {
                throw new BusinessException(ERR_NOT_FOUND, "Không tìm thấy dữ liệu cần cập nhật.");
            }
        } catch (BusinessException e) {
            log.warn("Cap nhat chi phi dao tao that bai: {}", e.getUserMessage());
            throw e;
        } catch (Exception e) {
            log.error("Loi khi cap nhat chi phi dao tao, costNo={}", entity.getCostNo(), e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void delete(String costNo) throws BusinessException {
        log.info("Xoa chi phi dao tao, costNo={}", costNo);
        try {
            if (eduTrainCostMapper.delete(costNo) == 0) {
                throw new BusinessException(ERR_NOT_FOUND, "Không tìm thấy dữ liệu cần xóa.");
            }
        } catch (BusinessException e) {
            log.warn("Xoa chi phi dao tao that bai: {}", e.getUserMessage());
            throw e;
        } catch (Exception e) {
            log.error("Loi khi xoa chi phi dao tao, costNo={}", costNo, e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportList(String courseName, String startDate, String endDate) throws IOException {
        log.info("Xuat Excel danh sach chi phi dao tao");
        List<String> headers = Arrays.asList(label("edu.systemManager.PEIXUNLEIXING.a"),
                label("edu.trainCostMANAGER.PEIXUNMINGCHENGQICI.a"), label("edu.trainCostMANAGER.YUJIFEIYONG.a"),
                label("edu.trainCostMANAGER.FEIYONGHEJI.a"), label("edu.trainCostMANAGER.RENJUNFEIYONG.a"),
                label("edu.trainBasicInformation.PEIXUNSHISHIQIJIAN.a"));
        List<List<Object>> rows = findList(courseName, startDate, endDate).stream()
                .map(c -> Arrays.<Object>asList(c.getTrainTypeCodeName(), courseLabel(c), c.getBudget(),
                        c.getAllCost(), c.getAvgCost(), period(c)))
                .collect(Collectors.toList());
        return EduExcelHelper.write("trainCost", headers, rows);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportDetail(String costNo) throws IOException, BusinessException {
        log.info("Xuat Excel chi tiet chi phi dao tao, costNo={}", costNo);
        EduTrainCost c = eduTrainCostMapper.findByCostNo(costNo);
        if (c == null) {
            throw new BusinessException(ERR_NOT_FOUND, "Không tìm thấy dữ liệu.");
        }
        List<String> headers = new ArrayList<>(Arrays.asList(label("edu.trainCostMANAGER.PEIXUNMINGCHENGQICI.a"),
                label("edu.trainBasicInformation.PEIXUNSHISHIQIJIAN.a"), label("edu.trainCostMANAGER.JIANGSHIFEI.a"),
                label("edu.trainCostMANAGER.JIAOCAIFEI.a"), label("edu.trainCostMANAGER.CHANGDIFEI.a"),
                label("edu.trainCostMANAGER.CANYINFEI.a"), label("edu.trainCostMANAGER.ZHUSUFEI.a"),
                label("edu.trainAgreement.JIAOTONGFEI.a"), label("edu.trainCostMANAGER.QIANZHENGJIXIANGGUANFEIYONG.a"),
                label("edu.trainCostMANAGER.QITAFEIYONG.a"), label("edu.trainCostMANAGER.FEIYONGHEJI.a"),
                label("edu.trainCostMANAGER.FEIYONGHEJIRENJUN.a"), label("ar.viewarcardrecord.title.beizhu")));
        List<Object> row = Arrays.<Object>asList(courseLabel(c), period(c), c.getTeacherCost(), c.getMaterialCost(),
                c.getFieldCost(), c.getFoodCost(), c.getStayCost(), c.getTrafficCost(), c.getVisaCost(), c.getOtherCost(),
                c.getAllCost(), c.getAvgCost(), c.getRemark());
        return EduExcelHelper.write("trainCost", headers, Collections.singletonList(row));
    }

    private static String courseLabel(EduTrainCost c) {
        String period = c.getPeriodTime() == null ? "" : " (" + I18nUtil.getMessage("edu.planManager.periodLabel", new Object[] { c.getPeriodTime() }) + ")";
        return (c.getCourseNameCode() == null ? "" : c.getCourseNameCode()) + period;
    }

    private static String period(EduTrainCost c) {
        return (c.getImpleStartDate() == null ? "" : c.getImpleStartDate()) + "~" + (c.getImpleEndDate() == null ? "" : c.getImpleEndDate());
    }

    private static String label(String key) {
        return I18nUtil.getMessage(key);
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String t = value.trim();
        return t.isEmpty() ? null : t;
    }
}
