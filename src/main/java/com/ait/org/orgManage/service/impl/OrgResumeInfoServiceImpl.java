package com.ait.org.orgManage.service.impl;

import com.ait.org.orgManage.mapper.OrgResumeInfoMapper;
import com.ait.org.orgManage.model.OrgResumeInfo;
import com.ait.org.orgManage.service.OrgResumeInfoService;
import com.ait.sy.sys.dto.DataTablesRequest;
import com.ait.sy.sys.dto.DataTablesResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Service
public class OrgResumeInfoServiceImpl implements OrgResumeInfoService {
    private static final Logger log = LoggerFactory.getLogger(OrgResumeInfoServiceImpl.class);

    @Autowired
    private OrgResumeInfoMapper orgResumeInfoMapper;
    private static final Map<String, String> ORDERABLE_COLUMNS = Map.of(
            "no", "NO",
            "changeDate", "CHANGE_DATE",
            "resumeName", "RESUME_NAME",
            "isCurrentOrg", "IS_CURRENT_ORG",
            "changeReason", "CHANGE_REASON",
            "activity", "ACTIVITY",
            "createdBy", "CREATED_BY",
            "createDate", "CREATE_DATE");

    @Override
    public DataTablesResponse<OrgResumeInfo> getResumeListForDataTables(DataTablesRequest request) {
        DataTablesResponse<OrgResumeInfo> response = new DataTablesResponse<>();
        response.setDraw(request.getDraw());

        // Set offset and limit
        request.setOffset(request.getStart());
        request.setLimit(request.getLength());

        applySafeSorting(request);

        int totalRecords = orgResumeInfoMapper.countResumeListForDataTables(request);
        response.setRecordsTotal(totalRecords);
        response.setRecordsFiltered(totalRecords); // Assuming simple filtering for now

        if (totalRecords > 0) {
            List<OrgResumeInfo> data = orgResumeInfoMapper.getResumeListForDataTables(request);
            response.setData(data);
        } else {
            response.setData(List.of());
        }

        return response;
    }

    private void applySafeSorting(DataTablesRequest request) {
        request.setOrderColumn("CHANGE_DATE");
        request.setOrderDir("DESC");

        if (request.getOrder() == null || request.getOrder().length == 0 ||
                request.getColumns() == null || request.getColumns().length == 0) {
            return;
        }

        DataTablesRequest.Order order = request.getOrder()[0];
        int requestedColumnIndex = order.getColumn();
        if (requestedColumnIndex < 0 || requestedColumnIndex >= request.getColumns().length) {
            return;
        }

        DataTablesRequest.Column requestedColumn = request.getColumns()[requestedColumnIndex];
        if (requestedColumn == null) {
            return;
        }

        String safeColumn = ORDERABLE_COLUMNS.get(requestedColumn.getData());
        if (safeColumn != null) {
            request.setOrderColumn(safeColumn);
        }

        String requestedDirection = order.getDir();
        if ("asc".equalsIgnoreCase(requestedDirection)) {
            request.setOrderDir("ASC");
        } else if ("desc".equalsIgnoreCase(requestedDirection)) {
            request.setOrderDir("DESC");
        }
    }

    @Override
    public OrgResumeInfo getResumeByNo(String no) {
        return orgResumeInfoMapper.getResumeByNo(no);
    }

    @Override
    @Transactional
    public boolean addResume(OrgResumeInfo info) {
        // Auto-generate NO
        String nextNo = generateNextNo();
        info.setNo(nextNo);

        // Default values if needed
        if (info.getActivity() == null) {
            info.setActivity("14013948"); // Default from requirement image
        }
        if (info.getIsCurrentOrg() == null) {
            info.setIsCurrentOrg("N");
        }

        return orgResumeInfoMapper.insertResume(info) > 0;
    }

    @Override
    @Transactional
    public boolean updateResume(OrgResumeInfo info) {
        return orgResumeInfoMapper.updateResume(info) > 0;
    }

    @Override
    @Transactional
    public boolean deleteResume(String no) {
        return orgResumeInfoMapper.deleteResume(no) > 0;
    }

    @Override
    public List<OrgResumeInfo> getResumeListForExport(DataTablesRequest request) {
        return orgResumeInfoMapper.getResumeListForExport(request);
    }

    @Override
    public synchronized String generateNextNo() {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
        String prefix = sdf.format(new Date());

        String maxNo = orgResumeInfoMapper.getMaxNoByDate(prefix);

        if (maxNo == null) {
            return prefix + "0001";
        }

        try {
            String suffix = maxNo.substring(8); // Get the random part (XXXX) - verify length
            // If prefix length is 8, 8 is the start index.
            // If existing no is YYYYMMDDXXXX (12 chars), suffix is last 4.
            if (maxNo.length() >= 12) {
                suffix = maxNo.substring(maxNo.length() - 4);
            } else {
                return prefix + "0001"; // Fallback
            }

            int seq = Integer.parseInt(suffix);
            seq++;
            return prefix + String.format("%04d", seq);
        } catch (Exception e) {
            log.warn("Failed to generate next resume number from maxNo={}", maxNo, e);
            // Fallback strategy or throw error
            return prefix + String.format("%04d", System.currentTimeMillis() % 10000);
        }
    }

    @Override
    public String validateResume(OrgResumeInfo info) {
        if (info.getChangeDate() == null) {
            return "Ngày thay đổi không được để trống";
        }
        if (info.getResumeName() == null || info.getResumeName().trim().isEmpty()) {
            return "Tên thay đổi không được để trống";
        }
        return null;
    }

    @Override
    public List<OrgResumeInfo> getResumeListForDropdown() {
        return orgResumeInfoMapper.getResumeListForDropdown();
    }

    @Override
    @Transactional
    public String executeResumeProcess(String resumeNo, List<String> types) {
        if (types == null || types.isEmpty()) {
            return "Vui lòng chọn ít nhất một bước thực hiện";
        }

        // Define correct order
        // Sao chép tổ chức cũ - copyOrg
        // Tự động tạo ra quyết định - scfl
        // Tạo ra nội dung thay đổi - sczz
        // Hình thành tổ chức mới - qdzz
        List<String> orderedTypes = List.of("copyOrg", "scfl", "sczz", "qdzz");

        // Sort input types based on predefined order
        List<String> sortedTypes = new ArrayList<>();
        for (String type : orderedTypes) {
            if (types.contains(type)) {
                sortedTypes.add(type);
            }
        }

        StringBuilder resultMessage = new StringBuilder();

        for (String type : sortedTypes) {
            java.util.Map<String, Object> params = new java.util.HashMap<>();
            params.put("resumeNo", resumeNo);
            params.put("type", type);
            params.put("message", null); // OUT param

            try {
                orgResumeInfoMapper.callProcessExecute(params);
                String message = (String) params.get("message");

                // Log or handle message if needed
                if (message != null && !message.trim().isEmpty() && !message.equalsIgnoreCase("SUCCESS")) {
                    // Decide if we stop or continue. Usually if procedure handles transaction it
                    // might rollback itself or through exception.
                    // If simply returning a message, we might just append it.
                    // Assuming exception triggers rollback via @Transactional
                    resultMessage.append("Bước ").append(type).append(": ").append(message).append("; ");
                }
            } catch (Exception e) {
                log.error("Failed to execute resume process step type={} resumeNo={}", type, resumeNo, e);
                throw new RuntimeException("Loi khi thuc hien buoc " + type + ".", e);
            }
        }

        if (resultMessage.length() > 0) {
            return resultMessage.toString();
        }

        return "Thực hiện thành công";
    }
}



