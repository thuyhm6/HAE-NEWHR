package com.ait.hrm.contract.service.impl;

import com.ait.hrm.contract.mapper.HrContractMapper;
import com.ait.hrm.contract.model.HrContract;
import com.ait.hrm.contract.service.HrContractService;
import com.ait.sy.sys.dto.DataTablesRequest;
import com.ait.sy.sys.dto.DataTablesResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Service implementation cho HrContract
 */
@Service
@Transactional(readOnly = true)
public class HrContractServiceImpl implements HrContractService {

    private static final Logger logger = LoggerFactory.getLogger(HrContractServiceImpl.class);

    @Autowired
    private HrContractMapper hrContractMapper;

    @Override
    public List<HrContract> getAllContracts() {
        return hrContractMapper.getAllContracts();
    }

    @Override
    public List<HrContract> getContractsWithPagination(int page, int size) {
        int offset = (page - 1) * size;
        return hrContractMapper.getContractsWithPagination(offset, size);
    }

    @Override
    public int countContracts() {
        return hrContractMapper.countContracts();
    }

    @Override
    public List<HrContract> searchContracts(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllContracts();
        }
        return hrContractMapper.searchContracts(keyword.trim());
    }

    @Override
    public HrContract getContractByContractNo(String contractNo) {
        return hrContractMapper.getContractByContractNo(contractNo);
    }

    @Override
    public List<HrContract> getContractsWithSearchAndPagination(String keyword, int page, int size) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getContractsWithPagination(page, size);
        }
        return searchContracts(keyword);
    }

    @Override
    @Transactional
    public boolean addContract(HrContract contract) {
        try {
            // Set audit fields
            contract.setCreateDate(LocalDateTime.now());
            contract.setUpdateDate(LocalDateTime.now());
            contract.setActivity("ACTIVE");
            contract.setOrderno(1);

            // Generate contract number if not provided
            if (contract.getContractNo() == null || contract.getContractNo().trim().isEmpty()) {
                contract.setContractNo(generateContractNo());
            }

            int result = hrContractMapper.addContract(contract);
            return result > 0;
        } catch (Exception e) {
            logger.error("Error adding contract", e);
            return false;
        }
    }

    @Override
    @Transactional
    public boolean updateContract(HrContract contract) {
        try {
            // Set audit fields
            contract.setUpdateDate(LocalDateTime.now());

            int result = hrContractMapper.updateContract(contract);
            return result > 0;
        } catch (Exception e) {
            logger.error("Error updating contract", e);
            return false;
        }
    }

    @Override
    @Transactional
    public boolean deleteContract(String contractNo) {
        try {
            int result = hrContractMapper.deleteContract(contractNo);
            return result > 0;
        } catch (Exception e) {
            logger.error("Error deleting contract contractNo={}", contractNo, e);
            return false;
        }
    }

    @Override
    public List<HrContract> getContractsForExport(DataTablesRequest request) {
        try {
            return hrContractMapper.searchContractsWithConditions(request);
        } catch (Exception e) {
            logger.error("Failed to get contracts for export", e);
            return new ArrayList<>();
        }
    }

    /**
     * Generate contract number automatically
     */
    private String generateContractNo() {
        // Generate contract number: CT + timestamp
        return "CT" + System.currentTimeMillis();
    }

    @Override
    public DataTablesResponse<HrContract> getContractsForDataTables(DataTablesRequest request) {
        try {

            // Get search value
            String searchValue = request.getSearch() != null ? request.getSearch().getValue() : "";

            // Get order information
            String orderColumn = "createDate";
            String orderDir = "desc";

            // Map column names to database fields
            String[] columnMapping = { "", "contractNo", "personId", "contractName", "contractType",
                    "startContractDate", "endContractDate", "deptno", "workPosition",
                    "salary", "activity", "createDate", "actions" };

            if (request.getOrder() != null && request.getOrder().length > 0) {
                int columnIndex = request.getOrder()[0].getColumn();
                if (columnIndex < columnMapping.length) {
                    orderColumn = columnMapping[columnIndex];
                }
                orderDir = request.getOrder()[0].getDir();
            }


            // Set order and search parameters
            request.setOrderColumn(orderColumn);
            request.setOrderDir(orderDir);
            request.setSearchValue(searchValue);
            request.setOffset(request.getStart());
            request.setLimit(request.getLength());

            // Get data

            List<HrContract> contracts = hrContractMapper.getContractsForDataTables(request);

            // Get total count
            int totalRecords = hrContractMapper.countContractsForDataTables(request);

            // Create response
            DataTablesResponse<HrContract> response = new DataTablesResponse<>();
            response.setDraw(request.getDraw());
            response.setRecordsTotal(totalRecords);
            response.setRecordsFiltered(totalRecords);
            response.setData(contracts);

            return response;

        } catch (Exception e) {
            logger.error("Failed to process contracts DataTables request", e);

            DataTablesResponse<HrContract> errorResponse = new DataTablesResponse<>();
            errorResponse.setDraw(request.getDraw());
            errorResponse.setError("Loi he thong khi xu ly du lieu hop dong.");
            return errorResponse;
        }
    }

    @Override
    public String validateContract(HrContract contract) {
        if (contract == null) {
            return "Dữ liệu hợp đồng không hợp lệ";
        }

        if (contract.getContractNo() == null || contract.getContractNo().trim().isEmpty()) {
            return "Số hợp đồng không được để trống";
        }

        if (contract.getPersonId() == null || contract.getPersonId().trim().isEmpty()) {
            return "Mã nhân viên không được để trống";
        }

        if (contract.getContractName() == null || contract.getContractName().trim().isEmpty()) {
            return "Tên hợp đồng không được để trống";
        }

        if (contract.getStartContractDate() != null && contract.getEndContractDate() != null) {
            if (contract.getStartContractDate().isAfter(contract.getEndContractDate())) {
                return "Ngày bắt đầu không được sau ngày kết thúc";
            }
        }

        if (contract.getSalary() != null && contract.getSalary().compareTo(BigDecimal.ZERO) < 0) {
            return "Lương không được âm";
        }

        return null; // No validation errors
    }

    @Override
    public boolean isContractNoExists(String contractNo) {
        try {
            HrContract existingContract = hrContractMapper.getContractByContractNo(contractNo);
            return existingContract != null;
        } catch (Exception e) {
            logger.error("Failed to check contract existence contractNo={}", contractNo, e);
            return false;
        }
    }

    @Override
    public int countExpiringContracts(int days) {
        return hrContractMapper.countExpiringContracts(days);
    }
}
