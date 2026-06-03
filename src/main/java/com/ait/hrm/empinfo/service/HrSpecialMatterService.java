package com.ait.hrm.empinfo.service;

import com.ait.hrm.empinfo.model.HrSpecialMatter;
import com.ait.sy.sys.dto.DataTablesRequest;
import com.ait.sy.sys.dto.DataTablesResponse;

import java.util.List;

/**
 * Service interface cho HrSpecialMatter
 */
public interface HrSpecialMatterService {

    /**
     * Lấy danh sách tất cả nhân viên nữ
     */
    List<HrSpecialMatter> getAllFemaleEmployees();

    /**
     * Lấy danh sách nhân viên nữ với phân trang
     */
    List<HrSpecialMatter> getFemaleEmployeesWithPagination(int page, int size);

    /**
     * Đếm tổng số nhân viên nữ
     */
    int countFemaleEmployees();

    /**
     * Tìm kiếm nhân viên nữ theo từ khóa
     */
    List<HrSpecialMatter> searchFemaleEmployees(String keyword);

    /**
     * Lấy thông tin chi tiết của một nhân viên nữ
     */
    HrSpecialMatter getSpecialMatterById(String specialNo);

    /**
     * Lấy danh sách nhân viên nữ với phân trang và tìm kiếm
     */
    List<HrSpecialMatter> getFemaleEmployeesWithSearchAndPagination(String keyword, int page, int size);

    /**
     * Tìm kiếm nhân viên nữ với nhiều điều kiện (cho export)
     */
    List<HrSpecialMatter> searchFemaleEmployeesWithConditions(
            String localName, String empId, String deptNo, String position,
            String createDateFrom, String createDateTo, String activity, String otFlag);

    /**
     * Tìm kiếm nhân viên nữ với DataTablesRequest (generic search)
     */
    List<HrSpecialMatter> searchFemaleEmployeesWithDataTablesRequest(DataTablesRequest request);

    /**
     * Cập nhật thông tin nhân viên nữ
     */
    boolean updateSpecialMatter(HrSpecialMatter employee);

    /**
     * Thêm mới nhân viên nữ
     */
    boolean addSpecialMatter(HrSpecialMatter employee);

    /**
     * Xóa nhân viên nữ
     */
    boolean deleteSpecialMatter(String specialNo);

    /**
     * DataTables server-side processing - Lấy dữ liệu cho DataTables (optimized
     * with generic search)
     */
    DataTablesResponse<HrSpecialMatter> getFemaleEmployeesForDataTables(DataTablesRequest request);
}
