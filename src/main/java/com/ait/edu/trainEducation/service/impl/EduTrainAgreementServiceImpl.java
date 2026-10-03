package com.ait.edu.trainEducation.service.impl;

import com.ait.edu.trainEducation.mapper.EduCommonMapper;
import com.ait.edu.trainEducation.mapper.EduTrainAgreementMapper;
import com.ait.edu.trainEducation.model.EduEmployeeLookup;
import com.ait.edu.trainEducation.model.EduFile;
import com.ait.edu.trainEducation.model.EduTrainAgreement;
import com.ait.edu.trainEducation.service.EduCommonService;
import com.ait.edu.trainEducation.service.EduTrainAgreementService;
import com.ait.edu.trainEducation.util.EduExcelHelper;
import com.ait.edu.trainEducation.util.EduImportValidator;
import com.ait.exception.BusinessException;
import com.ait.util.I18nUtil;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class EduTrainAgreementServiceImpl implements EduTrainAgreementService {
    private static final Logger log = LoggerFactory.getLogger(EduTrainAgreementServiceImpl.class);

    private static final String AGREE_ID_PREFIX = "TRA";
    private static final int AGREE_ID_DIGITS = 6;

    /**
     * Cấu trúc cột file Excel (giữ đúng thứ tự CELL0..CELL28 của importTrainAgreement /
     * trainAgreeImportDemoLoad bản gốc) - key i18n làm tiêu đề cột.
     */
    private static final List<String> COLUMN_KEYS = Arrays.asList(
            "edu.trainAgreement.XIEYIMINGCHENG.a",          // 0  AGREE_NAME (*)
            "edu.trainAgreement.XIEYIRENSHEHAO.a",          // 1  EMPID (*)
            "edu.trainAgreement.XIEYIRENXINGMING.a",        // 2  LOCAL_NAME
            "edu.trainAgreement.XIEYIRENBUMEN.a",           // 3  Phòng ban (chỉ hiển thị)
            "edu.trainAgreement.YANXIUKAISHIRI.a",          // 4  STUDY_START_DATE
            "edu.trainAgreement.YANXIUJIESHURI.a",          // 5  STUDY_END_DATE
            "edu.trainAgreement.YANXIUTIANSHU.a",           // 6  STUDY_DAY
            "edu.trainAgreement.excel.serviceYear",         // 7  SERVICE_YEAR
            "edu.trainAgreement.excel.conStart",            // 8  CON_START_DATE
            "edu.trainAgreement.excel.conEnd",              // 9  CON_END_DATE
            "edu.trainAgreement.excel.serStart",            // 10 SER_START_DATE
            "edu.trainAgreement.excel.serEnd",              // 11 SER_END_DATE
            "edu.trainAgreement.DANGYUEHUILV.a",            // 12 EXCHANGE_RATE
            "edu.trainAgreement.HUQIANFEI.a",               // 13 HQ_FREE
            "edu.trainAgreement.CHUGUOFANGYIFEI.a",         // 14 CGFY_FREE
            "edu.trainAgreement.JIPIAOFEI.a",               // 15 JP_FREE
            "edu.trainAgreement.ZHUFANGBUZHU.a",            // 16 ZFBZ_FREE
            "edu.trainAgreement.CHUGUOBUZHU.a",             // 17 CGBZ_FREE
            "edu.trainAgreement.CHUGUOBUZHUSHIJI.a",        // 18 CGBZ_FREE_FACT
            "edu.trainAgreement.SHANGYEBAOXIANFEI.a",       // 19 SYBX_FREE
            "edu.trainAgreement.YANXIUGONGZI.a",            // 20 YX_PAY
            "edu.trainAgreement.JIAOTONGFEI.a",             // 21 JT_FREE
            "edu.trainAgreement.TONGXINFEI.a",              // 22 TX_FREE
            "edu.trainAgreement.XIEYIZONGFEIYONG.a",        // 23 TOTAL_FEE
            "edu.trainAgreement.XIEYIQIANDINGRIQI.a",       // 24 AGREE_START_DATE
            "edu.trainAgreement.excel.agreeEnd",            // 25 AGREE_END_DATE
            "display.pa.ecc.expectresigndate",              // 26 LEFT_DATE
            "edu.trainAgreement.SHIJIZHIFU.a",              // 27 FACT_PAY
            "ar.viewarcardrecord.title.beizhu");            // 28 REMARK

    private static final List<Integer> DATE_COLUMNS = Arrays.asList(4, 5, 8, 9, 10, 11, 24, 25, 26);
    private static final List<Integer> NUMBER_COLUMNS = Arrays.asList(6, 7, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 27);

    @Autowired
    private EduTrainAgreementMapper eduTrainAgreementMapper;

    @Autowired
    private EduCommonMapper eduCommonMapper;

    @Autowired
    private EduCommonService eduCommonService;

    @Override
    @Transactional(readOnly = true)
    public List<EduTrainAgreement> findList(String deptNo, String keyword, String conStartDate, String conEndDate) {
        log.info("Tim danh sach hop dong dao tao, deptNo={}, keyword={}, conStartDate={}, conEndDate={}",
                deptNo, keyword, conStartDate, conEndDate);
        try {
            List<EduTrainAgreement> list = eduTrainAgreementMapper.findList(trimToNull(deptNo), trimToNull(keyword),
                    trimToNull(conStartDate), trimToNull(conEndDate));
            Map<String, List<EduFile>> files = eduCommonService.getFilesGrouped(EduCommonService.FILE_TYPE_AGREEMENT,
                    list.stream().map(EduTrainAgreement::getAgreeNo).collect(Collectors.toList()));
            list.forEach(a -> a.setFiles(files.getOrDefault(a.getAgreeNo(), Collections.emptyList())));
            return list;
        } catch (Exception e) {
            log.error("Loi khi tim danh sach hop dong dao tao", e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public EduTrainAgreement getDetail(String agreeNo) {
        log.info("Lay chi tiet hop dong dao tao, agreeNo={}", agreeNo);
        try {
            EduTrainAgreement a = eduTrainAgreementMapper.findByAgreeNo(agreeNo);
            if (a != null) {
                a.setFiles(eduCommonService.getFiles(EduCommonService.FILE_TYPE_AGREEMENT, agreeNo));
            }
            return a;
        } catch (Exception e) {
            log.error("Loi khi lay chi tiet hop dong dao tao, agreeNo={}", agreeNo, e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public String add(EduTrainAgreement entity) throws BusinessException {
        log.info("Them moi hop dong dao tao, empid={}, agreeName={}", entity.getEmpid(), entity.getAgreeName());
        try {
            fillEmployee(entity);
            normalize(entity);
            entity.setAgreeNo(eduTrainAgreementMapper.nextAgreeNo());
            entity.setAgreeId(buildAgreeId(nextAgreeSeq()));
            eduTrainAgreementMapper.insert(entity);
            log.info("Them moi hop dong dao tao thanh cong, agreeNo={}, agreeId={}", entity.getAgreeNo(), entity.getAgreeId());
            return entity.getAgreeNo();
        } catch (BusinessException e) {
            log.warn("Them moi hop dong dao tao that bai: {}", e.getUserMessage());
            throw e;
        } catch (Exception e) {
            log.error("Loi khi them moi hop dong dao tao", e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void update(EduTrainAgreement entity) throws BusinessException {
        log.info("Cap nhat hop dong dao tao, agreeNo={}", entity.getAgreeNo());
        try {
            fillEmployee(entity);
            normalize(entity);
            if (eduTrainAgreementMapper.update(entity) == 0) {
                throw new BusinessException(ERR_NOT_FOUND, "Không tìm thấy dữ liệu cần cập nhật.");
            }
        } catch (BusinessException e) {
            log.warn("Cap nhat hop dong dao tao that bai: {}", e.getUserMessage());
            throw e;
        } catch (Exception e) {
            log.error("Loi khi cap nhat hop dong dao tao, agreeNo={}", entity.getAgreeNo(), e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void delete(String agreeNo) throws BusinessException {
        log.info("Xoa hop dong dao tao, agreeNo={}", agreeNo);
        try {
            if (eduTrainAgreementMapper.softDelete(agreeNo) == 0) {
                throw new BusinessException(ERR_NOT_FOUND, "Không tìm thấy dữ liệu cần xóa.");
            }
        } catch (BusinessException e) {
            log.warn("Xoa hop dong dao tao that bai: {}", e.getUserMessage());
            throw e;
        } catch (Exception e) {
            log.error("Loi khi xoa hop dong dao tao, agreeNo={}", agreeNo, e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public List<String> importExcel(InputStream in) throws IOException {
        log.info("Import hop dong dao tao tu Excel");
        try {
            List<String[]> rows = EduExcelHelper.read(in, COLUMN_KEYS.size());
            List<String> errors = new ArrayList<>();
            if (rows.isEmpty()) {
                errors.add(I18nUtil.getMessage("edu.import.msg.noData"));
                return errors;
            }
            List<EduTrainAgreement> items = new ArrayList<>();
            for (String[] r : rows) {
                String row = r[0];
                // r[i + 1] = giá trị cột i
                EduImportValidator.required(errors, row, r[1], COLUMN_KEYS.get(0));
                EduEmployeeLookup emp = null;
                if (EduImportValidator.required(errors, row, r[2], COLUMN_KEYS.get(1))) {
                    emp = eduCommonMapper.findEmployeeByEmpid(r[2]);
                    if (emp == null) {
                        errors.add(EduImportValidator.msg(row, "edu.import.msg.empNotFound", r[2]));
                    }
                }
                for (Integer c : DATE_COLUMNS) {
                    EduImportValidator.date(errors, row, r[c + 1], COLUMN_KEYS.get(c));
                }
                for (Integer c : NUMBER_COLUMNS) {
                    EduImportValidator.number(errors, row, r[c + 1], COLUMN_KEYS.get(c));
                }
                if (emp != null) {
                    items.add(toEntity(r, emp));
                }
            }
            if (!errors.isEmpty()) {
                log.warn("Import hop dong dao tao co {} loi", errors.size());
                return errors;
            }
            int seq = nextAgreeSeq();
            for (EduTrainAgreement a : items) {
                a.setAgreeNo(eduTrainAgreementMapper.nextAgreeNo());
                a.setAgreeId(buildAgreeId(seq++));
                eduTrainAgreementMapper.insert(a);
            }
            log.info("Import hop dong dao tao thanh cong {} dong", items.size());
            return errors;
        } catch (IOException e) {
            log.error("Loi doc file import hop dong dao tao", e);
            throw e;
        } catch (Exception e) {
            log.error("Loi khi import hop dong dao tao", e);
            throw e;
        }
    }

    @Override
    public byte[] buildTemplate() throws IOException {
        log.info("Tao file mau import hop dong dao tao");
        try {
            // Dòng mẫu giữ nguyên trainAgreeImportDemoLoad(flag=load) bản gốc
            List<Object> sample = Arrays.<Object>asList("Training agreement XXX", "20000013", "Name", "HR Part",
                    "01/01/2018", "30/01/2018", "90", "2", "01/01/2018", "30/01/2018", "01/01/2018", "30/01/2018",
                    "12", "100", "100", "100", "100", "100", "100", "100", "100", "100", "100", "1000",
                    "01/01/2018", "30/01/2018", "01/01/2019", "60", "Remark");
            return EduExcelHelper.write("trainAgreement", buildHeaders(), Collections.singletonList(sample));
        } catch (IOException e) {
            log.error("Loi khi tao file mau hop dong dao tao", e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] export(String deptNo, String keyword, String conStartDate, String conEndDate) throws IOException {
        log.info("Xuat Excel hop dong dao tao, deptNo={}, keyword={}", deptNo, keyword);
        try {
            List<EduTrainAgreement> list = eduTrainAgreementMapper.findList(trimToNull(deptNo), trimToNull(keyword),
                    trimToNull(conStartDate), trimToNull(conEndDate));
            List<List<Object>> rows = new ArrayList<>();
            for (EduTrainAgreement a : list) {
                rows.add(Arrays.<Object>asList(a.getAgreeName(), a.getEmpid(), a.getLocalName(), a.getDepartName(),
                        a.getStudyStartDate(), a.getStudyEndDate(), a.getStudyDay(), a.getServiceYear(),
                        a.getConStartDate(), a.getConEndDate(), a.getSerStartDate(), a.getSerEndDate(),
                        a.getExchangeRate(), a.getHqFree(), a.getCgfyFree(), a.getJpFree(), a.getZfbzFree(),
                        a.getCgbzFree(), a.getCgbzFreeFact(), a.getSybxFree(), a.getYxPay(), a.getJtFree(),
                        a.getTxFree(), a.getTotalFee(), a.getAgreeStartDate(), a.getAgreeEndDate(),
                        a.getLeftDate(), a.getFactPay(), a.getRemark()));
            }
            return EduExcelHelper.write("trainAgreement", buildHeaders(), rows);
        } catch (IOException e) {
            log.error("Loi khi xuat Excel hop dong dao tao", e);
            throw e;
        }
    }

    private List<String> buildHeaders() {
        List<String> headers = new ArrayList<>();
        for (int i = 0; i < COLUMN_KEYS.size(); i++) {
            String label = I18nUtil.getMessage(COLUMN_KEYS.get(i));
            headers.add(i <= 1 ? label + " (*)" : label);
        }
        return headers;
    }

    private EduTrainAgreement toEntity(String[] r, EduEmployeeLookup emp) {
        EduTrainAgreement a = new EduTrainAgreement();
        a.setAgreeName(r[1]);
        a.setEmpid(emp.getEmpid());
        a.setPersonId(emp.getPersonId());
        a.setLocalName(emp.getLocalName());
        a.setStudyStartDate(blankToNull(r[5]));
        a.setStudyEndDate(blankToNull(r[6]));
        a.setStudyDay(EduImportValidator.normalizeNumber(r[7]));
        a.setServiceYear(EduImportValidator.normalizeNumber(r[8]));
        a.setConStartDate(blankToNull(r[9]));
        a.setConEndDate(blankToNull(r[10]));
        a.setSerStartDate(blankToNull(r[11]));
        a.setSerEndDate(blankToNull(r[12]));
        a.setExchangeRate(EduImportValidator.normalizeNumber(r[13]));
        a.setHqFree(EduImportValidator.normalizeNumber(r[14]));
        a.setCgfyFree(EduImportValidator.normalizeNumber(r[15]));
        a.setJpFree(EduImportValidator.normalizeNumber(r[16]));
        a.setZfbzFree(EduImportValidator.normalizeNumber(r[17]));
        a.setCgbzFree(EduImportValidator.normalizeNumber(r[18]));
        a.setCgbzFreeFact(EduImportValidator.normalizeNumber(r[19]));
        a.setSybxFree(EduImportValidator.normalizeNumber(r[20]));
        a.setYxPay(EduImportValidator.normalizeNumber(r[21]));
        a.setJtFree(EduImportValidator.normalizeNumber(r[22]));
        a.setTxFree(EduImportValidator.normalizeNumber(r[23]));
        a.setTotalFee(EduImportValidator.normalizeNumber(r[24]));
        a.setAgreeStartDate(blankToNull(r[25]));
        a.setAgreeEndDate(blankToNull(r[26]));
        a.setLeftDate(blankToNull(r[27]));
        a.setFactPay(EduImportValidator.normalizeNumber(r[28]));
        a.setRemark(blankToNull(r[29]));
        return a;
    }

    /** Lấy PERSON_ID / họ tên từ HR_EMPLOYEE theo EMPID đã chọn. */
    private void fillEmployee(EduTrainAgreement entity) throws BusinessException {
        EduEmployeeLookup emp = trimToNull(entity.getEmpid()) == null ? null
                : eduCommonMapper.findEmployeeByEmpid(entity.getEmpid().trim());
        if (emp == null) {
            throw new BusinessException(ERR_NO_PERSON, "Vui lòng chọn 1 người!");
        }
        entity.setEmpid(emp.getEmpid());
        entity.setPersonId(emp.getPersonId());
        entity.setLocalName(emp.getLocalName());
    }

    private void normalize(EduTrainAgreement entity) {
        entity.setAgreeName(entity.getAgreeName().trim());
        entity.setRemark(trimToNull(entity.getRemark()));
    }

    private int nextAgreeSeq() {
        Integer max = eduTrainAgreementMapper.findMaxAgreeSeq();
        return max == null ? 1 : max + 1;
    }

    private static String buildAgreeId(int seq) {
        return AGREE_ID_PREFIX + String.format("%0" + AGREE_ID_DIGITS + "d", seq);
    }

    private static String blankToNull(String value) {
        return value == null || value.isEmpty() ? null : value;
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String t = value.trim();
        return t.isEmpty() ? null : t;
    }
}
