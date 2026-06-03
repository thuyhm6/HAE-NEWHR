package com.ait.hrm.contract.mapper;

import com.ait.hrm.contract.model.HrContract;
import com.ait.sy.sys.dto.DataTablesRequest;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * Mapper interface for HR Contract operations
 * Maps to hr_contract table
 */
@Mapper
public interface HrContractMapper {

    /**
     * Get all contracts
     */
    List<HrContract> getAllContracts();

    /**
     * Get contracts with pagination
     */
    List<HrContract> getContractsWithPagination(@Param("offset") int offset, @Param("limit") int limit);

    /**
     * Count total contracts
     */
    int countContracts();

    /**
     * Search contracts by keyword
     */
    List<HrContract> searchContracts(@Param("keyword") String keyword);

    /**
     * Search contracts with multiple conditions (for export)
     */
    List<HrContract> searchContractsWithConditions(DataTablesRequest request);

    /**
     * Get contract by contract number
     */
    HrContract getContractByContractNo(@Param("contractNo") String contractNo);

    /**
     * Update contract
     */
    int updateContract(HrContract contract);

    /**
     * Add new contract
     */
    int addContract(HrContract contract);

    /**
     * Delete contract
     */
    int deleteContract(@Param("contractNo") String contractNo);

    /**
     * DataTables server-side processing - Get contracts with search and sort
     */
    List<HrContract> getContractsForDataTables(DataTablesRequest request);

    /**
     * DataTables server-side processing - Count contracts after filtering
     */
    int countContractsForDataTables(DataTablesRequest request);

    /**
     * Count contracts expiring within the next number of days
     */
    int countExpiringContracts(@Param("days") int days);
}
