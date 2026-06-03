package com.ait.org.orgManage.mapper;

import com.ait.org.orgManage.model.OrgResumeInfo;
import com.ait.sy.sys.dto.DataTablesRequest;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface OrgResumeInfoMapper {
    List<OrgResumeInfo> getResumeListForDataTables(DataTablesRequest request);

    int countResumeListForDataTables(DataTablesRequest request);

    OrgResumeInfo getResumeByNo(@Param("no") String no);

    int insertResume(OrgResumeInfo info);

    int updateResume(OrgResumeInfo info);

    int deleteResume(@Param("no") String no);

    String getMaxNoByDate(@Param("prefix") String prefix);

    List<OrgResumeInfo> getResumeListForExport(DataTablesRequest request);

    List<OrgResumeInfo> getResumeListForDropdown();

    void callProcessExecute(Map<String, Object> params);
}
