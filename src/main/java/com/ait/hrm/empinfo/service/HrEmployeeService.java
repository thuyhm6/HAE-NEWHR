package com.ait.hrm.empinfo.service;

import com.ait.hrm.empinfo.dto.EmpMonthlyStatsDto;
import com.ait.hrm.empinfo.dto.EmployeeSearchResponse;
import com.ait.hrm.empinfo.model.HrEmployee;

import java.util.List;

/**
 * Service interface cho HrEmployee
 */
public interface HrEmployeeService {

    /**
     * Tìm nhân viên theo personId
     * 
     * @param personId ID cá nhân
     * @return HrEmployee object hoặc null
     */
    HrEmployee findByPersonId(String personId);

    /**
     * Tìm nhân viên theo empId
     * 
     * @param empId Mã nhân viên
     * @return HrEmployee object hoặc null
     */
    HrEmployee findByEmpId(String empId);

    /**
     * Tìm nhân viên theo deptNo
     * 
     * @param deptNo Mã phòng ban
     * @return List<HrEmployee>
     */
    List<HrEmployee> findByDeptNo(String deptNo);

    /**
     * Tìm nhân viên theo cpnyId
     * 
     * @param cpnyId ID công ty
     * @return List<HrEmployee>
     */
    List<HrEmployee> findByCpnyId(String cpnyId);

    /**
     * Kiểm tra nhân viên có tồn tại và hoạt động không
     * 
     * @param personId ID cá nhân
     * @return true nếu tồn tại và hoạt động
     */
    boolean existsAndActiveByPersonId(String personId);

    /**
     * Kiểm tra deptNo có tồn tại trong bảng hr_employee không
     * 
     * @param deptNo Mã phòng ban
     * @return true nếu tồn tại
     */
    boolean existsDeptNo(String deptNo);

    /**
     * Lấy tất cả nhân viên
     * 
     * @return List<HrEmployee>
     */
    List<HrEmployee> findAll();

    /**
     * Tìm kiếm nhân viên từ HR_Employee
     * 
     * @param empId       Mã nhân viên
     * @param localName   Tên nhân viên
     * @param deptNo      Mã phòng ban
     * @return List<EmployeeSearchResponse>
     */
    List<EmployeeSearchResponse> searchEmployees(String empId, String localName, String deptNo, String keyword,
            List<String> deptCodes, String empOffice);
    

    /**
     * Lấy danh sách nhân viên với phân trang
     * 
     * @param page Số trang (bắt đầu từ 1)
     * @param size Kích thước trang
     * @return List<HrEmployee>
     */
    List<HrEmployee> findAllWithPagination(int page, int size);

    /**
     * Đếm tổng số nhân viên
     * 
     * @return Số lượng nhân viên
     */
    int countAll();

    /**
     * Tìm kiếm nhân viên theo từ khóa
     * 
     * @param keyword Từ khóa tìm kiếm
     * @return List<HrEmployee>
     */
    List<HrEmployee> searchByKeyword(String keyword);

    /**
     * Lấy thông tin nhân viên theo personId với validation
     * 
     * @param personId ID cá nhân
     * @return HrEmployee object hoặc null nếu không tìm thấy
     */
    HrEmployee getEmployeeByPersonId(String personId);

    /**
     * Lấy thông tin nhân viên theo empId với validation
     * 
     * @param empId Mã nhân viên
     * @return HrEmployee object hoặc null nếu không tìm thấy
     */
    HrEmployee getEmployeeByEmpId(String empId);

    /**
     * Kiểm tra nhân viên có tồn tại không (không quan tâm trạng thái)
     * 
     * @param personId ID cá nhân
     * @return true nếu tồn tại
     */
    boolean existsByPersonId(String personId);

    /**
     * Kiểm tra mã nhân viên có tồn tại không
     * 
     * @param empId Mã nhân viên
     * @return true nếu tồn tại
     */
    boolean existsByEmpId(String empId);

    List<EmpMonthlyStatsDto> getEmpMonthlyStats(int year);
}
