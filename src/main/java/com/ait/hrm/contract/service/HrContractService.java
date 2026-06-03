package com.ait.hrm.contract.service;

import com.ait.hrm.contract.model.HrContract;
import com.ait.sy.sys.dto.DataTablesRequest;
import com.ait.sy.sys.dto.DataTablesResponse;

import java.util.List;

/**
 * Service interface cho HrContract
 */
public interface HrContractService {

    /**
     * Get all contracts
     */
    List<HrContract> getAllContracts();

    /**
     * Get contracts with pagination
     */
    List<HrContract> getContractsWithPagination(int page, int size);

    /**
     * Count total contracts
     */
    int countContracts();

    /**
     * Search contracts by keyword
     */
    List<HrContract> searchContracts(String keyword);

    /**
     * Get contract by contract number
     */
    HrContract getContractByContractNo(String contractNo);

    /**
     * Get contracts with search and pagination
     */
    List<HrContract> getContractsWithSearchAndPagination(String keyword, int page, int size);

    /**
     * Add new contract
     */
    boolean addContract(HrContract contract);

    /**
     * Update contract
     */
    boolean updateContract(HrContract contract);

    /**
     * Delete contract
     */
    boolean deleteContract(String contractNo);

    /**
     * Get contracts for export with conditions
     */
    List<HrContract> getContractsForExport(DataTablesRequest request);

    /**
     * DataTables server-side processing - Get contracts for DataTables
     */
    DataTablesResponse<HrContract> getContractsForDataTables(DataTablesRequest request);

    /**
     * Validate contract data
     */
    String validateContract(HrContract contract);

    /**
     * Check if contract number exists
     */
    boolean isContractNoExists(String contractNo);

    /**
     * Count contracts expiring within the next number of days
     */
    int countExpiringContracts(int days);
}
