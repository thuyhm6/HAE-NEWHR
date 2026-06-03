package com.ait.org.orgManage.service;

import com.ait.org.orgManage.model.OrgResumeInfo;
import com.ait.sy.sys.dto.DataTablesRequest;
import com.ait.sy.sys.dto.DataTablesResponse;

import java.util.List;

public interface OrgResumeInfoService {
    DataTablesResponse<OrgResumeInfo> getResumeListForDataTables(DataTablesRequest request);

    OrgResumeInfo getResumeByNo(String no);

    boolean addResume(OrgResumeInfo info);

    boolean updateResume(OrgResumeInfo info);

    boolean deleteResume(String no);

    List<OrgResumeInfo> getResumeListForExport(DataTablesRequest request);

    String generateNextNo();

    String validateResume(OrgResumeInfo info);

    List<OrgResumeInfo> getResumeListForDropdown();

    // Order: copyOrg -> scfl -> sczz -> qdzz
    String executeResumeProcess(String resumeNo, List<String> types);
}
