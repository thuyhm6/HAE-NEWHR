package com.ait.hrm.empinfo.service.impl;

import com.ait.hrm.empinfo.mapper.HrSpecialMatterMapper;
import com.ait.hrm.empinfo.model.HrSpecialMatter;
import com.ait.hrm.empinfo.service.HrSpecialMatterService;
import com.ait.sy.sys.dto.DataTablesRequest;
import com.ait.sy.sys.dto.DataTablesResponse;
import com.ait.util.DataTablesSearchUtil;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class HrSpecialMatterServiceImpl implements HrSpecialMatterService {

    private static final Logger log = LoggerFactory.getLogger(HrSpecialMatterServiceImpl.class);

    @Autowired
    private HrSpecialMatterMapper hrSpecialMatterMapper;

    @Override
    public List<HrSpecialMatter> getAllFemaleEmployees() {
        return hrSpecialMatterMapper.getFemaleEmployeesList();
    }

    @Override
    public List<HrSpecialMatter> getFemaleEmployeesWithPagination(int page, int size) {
        int offset = (page - 1) * size;
        return hrSpecialMatterMapper.getFemaleEmployeesListWithPagination(offset, size);
    }

    @Override
    public int countFemaleEmployees() {
        return hrSpecialMatterMapper.countFemaleEmployees();
    }

    @Override
    public List<HrSpecialMatter> searchFemaleEmployees(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllFemaleEmployees();
        }
        return hrSpecialMatterMapper.searchFemaleEmployees(keyword.trim());
    }

    @Override
    public HrSpecialMatter getSpecialMatterById(String specialNo) {
        return hrSpecialMatterMapper.getSpecialMatterById(specialNo);
    }

    @Override
    public List<HrSpecialMatter> getFemaleEmployeesWithSearchAndPagination(String keyword, int page, int size) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getFemaleEmployeesWithPagination(page, size);
        }
        return hrSpecialMatterMapper.searchFemaleEmployees(keyword.trim());
    }

    @Override
    public List<HrSpecialMatter> searchFemaleEmployeesWithConditions(
            String localName,
            String empId,
            String deptNo,
            String position,
            String createDateFrom,
            String createDateTo,
            String activity,
            String otFlag) {
        return hrSpecialMatterMapper.searchFemaleEmployeesWithConditions(
                localName, empId, deptNo, position, createDateFrom, createDateTo, activity, otFlag);
    }

    @Override
    public List<HrSpecialMatter> searchFemaleEmployeesWithDataTablesRequest(DataTablesRequest request) {
        Map<String, Object> searchParams = request.getSearchParams();
        if (searchParams == null) {
            searchParams = new HashMap<>();
        }

        String searchValue = request.getSearch() != null ? request.getSearch().getValue() : "";
        String orderColumn = "createDate";
        String orderDir = "desc";

        String localName = (String) searchParams.get("localName");
        String empId = (String) searchParams.get("empId");
        String deptNo = (String) searchParams.get("deptNo");
        String position = (String) searchParams.get("position");
        String createDateFrom = (String) searchParams.get("createDateFrom");
        String createDateTo = (String) searchParams.get("createDateTo");
        String activity = (String) searchParams.get("activity");
        String otFlag = (String) searchParams.get("otFlag");

        return hrSpecialMatterMapper.getFemaleEmployeesForDataTablesWithSearchParams(
                searchValue,
                orderColumn,
                orderDir,
                request.getStart(),
                request.getLength(),
                localName,
                empId,
                deptNo,
                position,
                createDateFrom,
                createDateTo,
                activity,
                otFlag);
    }

    @Override
    public boolean updateSpecialMatter(HrSpecialMatter employee) {
        try {
            employee.setUpdateDate(LocalDateTime.now());
            int result = hrSpecialMatterMapper.updateSpecialMatter(employee);
            return result > 0;
        } catch (Exception e) {
            log.error("Failed to update special matter specialNo={}", employee.getSpecialNo(), e);
            return false;
        }
    }

    @Override
    public boolean addSpecialMatter(HrSpecialMatter employee) {
        try {
            if (employee.getPersonId() == null || employee.getPersonId().trim().isEmpty()) {
                employee.setPersonId(employee.getEmpId());
            }

            LocalDateTime now = LocalDateTime.now();
            employee.setCreateDate(now);
            employee.setUpdateDate(now);

            int result = hrSpecialMatterMapper.addSpecialMatter(employee);
            return result > 0;
        } catch (Exception e) {
            log.error("Failed to add special matter empId={}", employee.getEmpId(), e);
            return false;
        }
    }

    @Override
    public boolean deleteSpecialMatter(String specialNo) {
        try {
            int result = hrSpecialMatterMapper.deleteSpecialMatter(specialNo);
            return result > 0;
        } catch (Exception e) {
            log.error("Failed to delete special matter specialNo={}", specialNo, e);
            return false;
        }
    }

    @Override
    public DataTablesResponse<HrSpecialMatter> getFemaleEmployeesForDataTables(DataTablesRequest request) {
        try {
            String searchValue = request.getSearch() != null ? request.getSearch().getValue() : "";
            String orderColumn = "createDate";
            String orderDir = "desc";

            String[] columnMapping = {
                "", "empId", "localName", "deptNo", "position", "specialNo",
                "activity", "createDate", "startDate", "endDate", "otFlag", "actions"
            };

            if (request.getOrder() != null && request.getOrder().length > 0) {
                int columnIndex = request.getOrder()[0].getColumn();
                if (columnIndex < columnMapping.length) {
                    orderColumn = columnMapping[columnIndex];
                }
                orderDir = request.getOrder()[0].getDir();
            }

            DataTablesSearchUtil.addSearchParam(request, "searchValue", searchValue);
            DataTablesSearchUtil.addSearchParam(request, "orderColumn", orderColumn);
            DataTablesSearchUtil.addSearchParam(request, "orderDir", orderDir);
            DataTablesSearchUtil.addSearchParam(request, "offset", request.getStart());
            DataTablesSearchUtil.addSearchParam(request, "limit", request.getLength());

            Map<String, Object> searchParams = request.getSearchParams();
            if (searchParams == null) {
                searchParams = new HashMap<>();
                request.setSearchParams(searchParams);
            }

            String localName = (String) searchParams.get("localName");
            String empId = (String) searchParams.get("empId");
            String deptNo = (String) searchParams.get("deptNo");
            String position = (String) searchParams.get("position");
            String createDateFrom = (String) searchParams.get("createDateFrom");
            String createDateTo = (String) searchParams.get("createDateTo");
            String activity = (String) searchParams.get("activity");
            String otFlag = (String) searchParams.get("otFlag");

            List<HrSpecialMatter> data = hrSpecialMatterMapper.getFemaleEmployeesForDataTablesWithSearchParams(
                    searchValue,
                    orderColumn,
                    orderDir,
                    request.getStart(),
                    request.getLength(),
                    localName,
                    empId,
                    deptNo,
                    position,
                    createDateFrom,
                    createDateTo,
                    activity,
                    otFlag);

            long totalRecords = hrSpecialMatterMapper.countFemaleEmployees();
            long filteredRecords = hrSpecialMatterMapper.countFemaleEmployeesForDataTablesWithSearchParams(
                    searchValue,
                    localName,
                    empId,
                    deptNo,
                    position,
                    createDateFrom,
                    createDateTo,
                    activity,
                    otFlag);

            return new DataTablesResponse<>(request.getDraw(), totalRecords, filteredRecords, data);
        } catch (Exception e) {
            log.error("Failed to process special matter data tables request", e);
            return new DataTablesResponse<>(request.getDraw(), "Khong the tai du lieu. Vui long thu lai.");
        }
    }
}
