package com.ait.edu.trainEducation.service;

import com.ait.edu.trainEducation.model.EduTrainAgreement;
import com.ait.exception.BusinessException;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

/**
 * Service Hợp đồng đào tạo (EDU_TRAIN_AGREEMENT): CRUD, import/xuất Excel.
 * File đính kèm qua EduCommonService.
 */
public interface EduTrainAgreementService {

    String ERR_NOT_FOUND = "EDU_TRAIN_AGREEMENT_NOT_FOUND";
    /** Chưa chọn nhân viên (bản gốc: "请先选择一个人!"). */
    String ERR_NO_PERSON = "EDU_TRAIN_AGREEMENT_NO_PERSON";

    /** Danh sách kèm file đính kèm của từng hợp đồng. */
    List<EduTrainAgreement> findList(String deptNo, String keyword, String conStartDate, String conEndDate);

    EduTrainAgreement getDetail(String agreeNo);

    /** Thêm mới, trả về AGREE_NO để client upload file đính kèm. */
    String add(EduTrainAgreement entity) throws BusinessException;

    void update(EduTrainAgreement entity) throws BusinessException;

    void delete(String agreeNo) throws BusinessException;

    /** Import Excel theo file mẫu. Có lỗi thì không ghi gì và trả về danh sách lỗi theo dòng. */
    List<String> importExcel(InputStream in) throws IOException;

    /** File mẫu import (.xlsx) - cùng cấu trúc cột với file xuất. */
    byte[] buildTemplate() throws IOException;

    /** Xuất danh sách theo điều kiện tìm kiếm ra .xlsx. */
    byte[] export(String deptNo, String keyword, String conStartDate, String conEndDate) throws IOException;
}
