package com.ait.hrm.empinfo.service;

import java.util.List;

import com.ait.hrm.empinfo.model.HrQualification;

public interface HrQualificationService {

    /**
     * Tìm kiếm chứng chỉ
     */
    List<HrQualification> searchQualification(String empId, String localName, String qualName);

    List<HrQualification> getByPersonId(String personId);

    /**
     * Lưu thông tin (Thêm mới hoặc Cập nhật)
     * qualNo có giá trị -> Update, null/empty -> Insert
     */
    boolean saveQualification(HrQualification info, boolean isNew);

    /**
     * Xóa chứng chỉ
     */
    boolean deleteQualification(Long qualNo);

    /**
     * Lấy chi tiết
     */
    HrQualification getById(Long qualNo);
}
