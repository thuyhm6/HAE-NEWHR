package com.ait.hrm.empinfo.service;

import java.util.List;

import com.ait.hrm.empinfo.model.HrWorkExperience;

public interface HrWorkExperienceService {

    /**
     * Lấy danh sách kinh nghiệm theo personId
     */
    List<HrWorkExperience> getByPersonId(String personId);

    /**
     * Tìm kiếm thông tin
     */
    List<HrWorkExperience> searchWorkExperience(String empId, String localName, String companyName);

    /**
     * Lưu thông tin (Thêm mới hoặc Cập nhật)
     * workExpNo có giá trị -> Update, null/empty -> Insert
     */
    boolean saveWorkExperience(HrWorkExperience info, boolean isNew);

    /**
     * Xóa thông tin
     */
    boolean deleteWorkExperience(Long workExpNo);

    /**
     * Lấy chi tiết
     */
    HrWorkExperience getById(Long workExpNo);
}
