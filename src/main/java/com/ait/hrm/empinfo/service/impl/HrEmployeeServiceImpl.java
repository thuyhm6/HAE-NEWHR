package com.ait.hrm.empinfo.service.impl;

import com.ait.hrm.empinfo.dto.EmpMonthlyStatsDto;
import com.ait.hrm.empinfo.dto.EmployeeSearchResponse;
import com.ait.hrm.empinfo.mapper.HrEmployeeMapper;
import com.ait.hrm.empinfo.model.HrEmployee;
import com.ait.hrm.empinfo.service.HrEmployeeService;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class HrEmployeeServiceImpl implements HrEmployeeService {

    private static final Logger log = LoggerFactory.getLogger(HrEmployeeServiceImpl.class);

    @Autowired
    private HrEmployeeMapper hrEmployeeMapper;

    @Override
    public HrEmployee findByPersonId(String personId) {
        try {
            if (personId == null || personId.trim().isEmpty()) {
                return null;
            }
            return hrEmployeeMapper.findByPersonId(personId.trim());
        } catch (Exception e) {
            log.error("Error finding employee by personId={}", personId, e);
            return null;
        }
    }

    @Override
    public HrEmployee findByEmpId(String empId) {
        try {
            if (empId == null || empId.trim().isEmpty()) {
                return null;
            }
            return hrEmployeeMapper.findByEmpId(empId.trim());
        } catch (Exception e) {
            log.error("Error finding employee by empId={}", empId, e);
            return null;
        }
    }

    @Override
    public List<HrEmployee> findByDeptNo(String deptNo) {
        try {
            if (deptNo == null || deptNo.trim().isEmpty()) {
                return List.of();
            }
            return hrEmployeeMapper.findByDeptNo(deptNo.trim());
        } catch (Exception e) {
            log.error("Error finding employees by deptNo={}", deptNo, e);
            return List.of();
        }
    }

    @Override
    public List<HrEmployee> findByCpnyId(String cpnyId) {
        try {
            if (cpnyId == null || cpnyId.trim().isEmpty()) {
                return List.of();
            }
            return hrEmployeeMapper.findByCpnyId(cpnyId.trim());
        } catch (Exception e) {
            log.error("Error finding employees by cpnyId={}", cpnyId, e);
            return List.of();
        }
    }

    @Override
    public boolean existsAndActiveByPersonId(String personId) {
        try {
            if (personId == null || personId.trim().isEmpty()) {
                return false;
            }
            return hrEmployeeMapper.existsAndActiveByPersonId(personId.trim());
        } catch (Exception e) {
            log.error("Error checking employee active status personId={}", personId, e);
            return false;
        }
    }

    @Override
    public boolean existsDeptNo(String deptNo) {
        try {
            if (deptNo == null || deptNo.trim().isEmpty()) {
                return false;
            }
            return hrEmployeeMapper.existsDeptNo(deptNo.trim());
        } catch (Exception e) {
            log.error("Error checking deptNo existence deptNo={}", deptNo, e);
            return false;
        }
    }

    @Override
    public List<HrEmployee> findAll() {
        try {
            return hrEmployeeMapper.findAll();
        } catch (Exception e) {
            log.error("Error finding all employees", e);
            return List.of();
        }
    }

    @Override
    public List<HrEmployee> findAllWithPagination(int page, int size) {
        try {
            if (page < 1) {
                page = 1;
            }
            if (size < 1) {
                size = 10;
            }

            int offset = (page - 1) * size;
            return hrEmployeeMapper.getEmployeesWithPagination(offset, size);
        } catch (Exception e) {
            log.error("Error finding employees with pagination page={} size={}", page, size, e);
            return List.of();
        }
    }

    @Override
    public int countAll() {
        try {
            return findAll().size();
        } catch (Exception e) {
            log.error("Error counting employees", e);
            return 0;
        }
    }

    @Override
    public List<HrEmployee> searchByKeyword(String keyword) {
        try {
            if (keyword == null || keyword.trim().isEmpty()) {
                return findAll();
            }
            return hrEmployeeMapper.searchByKeyword(keyword.trim());
        } catch (Exception e) {
            log.error("Error searching employees by keyword", e);
            return List.of();
        }
    }

    @Override
    public HrEmployee getEmployeeByPersonId(String personId) {
        HrEmployee employee = findByPersonId(personId);
        if (employee == null) {
            log.debug("Employee not found by personId={}", personId);
        }
        return employee;
    }

    @Override
    public HrEmployee getEmployeeByEmpId(String empId) {
        HrEmployee employee = findByEmpId(empId);
        if (employee == null) {
            log.debug("Employee not found by empId={}", empId);
        }
        return employee;
    }

    @Override
    public boolean existsByPersonId(String personId) {
        return getEmployeeByPersonId(personId) != null;
    }

    @Override
    public boolean existsByEmpId(String empId) {
        return getEmployeeByEmpId(empId) != null;
    }

    @Override
    public List<EmployeeSearchResponse> searchEmployees(String empId, String localName, String deptNo, String keyword,
            List<String> deptCodes, String empOffice) {
        try {
            return hrEmployeeMapper.searchEmployees(empId, localName, deptNo, keyword, deptCodes, empOffice);
        } catch (Exception e) {
            log.error("Error searching employees empId={} deptNo={} keyword={} empOffice={}", empId, deptNo, keyword, empOffice, e);
            return new ArrayList<>();
        }
    }

    @Override
    public List<EmpMonthlyStatsDto> getEmpMonthlyStats(int year) {
        try {
            return hrEmployeeMapper.selectEmpMonthlyStats(year);
        } catch (Exception e) {
            log.error("Error getting emp monthly stats year={}", year, e);
            return List.of();
        }
    }
}
