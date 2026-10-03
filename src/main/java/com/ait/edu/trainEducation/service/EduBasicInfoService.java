package com.ait.edu.trainEducation.service;

import com.ait.edu.trainEducation.model.EduBasicInformation;
import com.ait.edu.trainEducation.model.EduBasicPlanOption;
import com.ait.edu.trainEducation.model.EduPerson;
import com.ait.exception.BusinessException;

import java.util.List;

/**
 * Service Thông tin đào tạo cơ bản (EDU_BASIC_INFORMATION) - lập khóa đào tạo từ kế hoạch.
 */
public interface EduBasicInfoService {

    String ERR_NOT_FOUND = "EDU_BASIC_INFO_NOT_FOUND";
    /** Chưa chọn kế hoạch (bản gốc: "* không được để trống!"). */
    String ERR_NO_PLAN = "EDU_BASIC_INFO_NO_PLAN";

    List<EduBasicInformation> findList(String courseName, String startDate, String endDate);

    /** Chi tiết khóa kèm danh sách NV chỉ định / tự chọn / đã duyệt / thực tế. */
    EduBasicInformation getDetail(String basicNo);

    List<EduBasicPlanOption> findAvailablePlans();

    /**
     * Dữ liệu điền sẵn khi chọn kế hoạch (queryAllPlan bản gốc): giảng viên, NV chỉ định
     * (không chỉ định thì lấy toàn bộ NV của phòng ban chỉ định).
     */
    EduBasicInformation getPlanPrefill(String planNo) throws BusinessException;

    String add(EduBasicInformation entity) throws BusinessException;

    void update(EduBasicInformation entity) throws BusinessException;

    /** Xóa khóa + toàn bộ dữ liệu phát sinh, trả kế hoạch về trạng thái chưa lập khóa. */
    void delete(String basicNo) throws BusinessException;

    List<EduPerson> findEmployeesByEmpids(List<String> empids);

    List<EduPerson> findTeachersByEmpids(List<String> empids);
}
