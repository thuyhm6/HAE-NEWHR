package com.ait.edu.trainEducation.service.impl;

import com.ait.edu.trainEducation.mapper.EduCommonMapper;
import com.ait.edu.trainEducation.model.EduDeptNode;
import com.ait.edu.trainEducation.model.EduEmployeeLookup;
import com.ait.edu.trainEducation.model.EduFile;
import com.ait.edu.trainEducation.service.EduCommonService;
import com.ait.ess.empinfo.dto.EssFileDto;
import com.ait.ess.empinfo.mapper.EssFileMapper;
import com.ait.exception.BusinessException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class EduCommonServiceImpl implements EduCommonService {
    private static final Logger log = LoggerFactory.getLogger(EduCommonServiceImpl.class);

    /** Chỉ cho phép thao tác file thuộc các màn đào tạo. */
    private static final Set<String> ALLOWED_FILE_TYPES = new HashSet<>(
            Arrays.asList(FILE_TYPE_PLAN, FILE_TYPE_ORGAN, FILE_TYPE_AGREEMENT, FILE_TYPE_RESULT, FILE_TYPE_COST));

    /** Oracle giới hạn 1000 phần tử trong mệnh đề IN. */
    private static final int IN_CLAUSE_LIMIT = 900;

    @Value("${app.file.upload.path:D:/source/VHR/HAE_HR/resources/fileUpload}")
    private String fileUploadPath;

    @Autowired
    private EduCommonMapper eduCommonMapper;

    /** Tái sử dụng câu insert ESS_FILE có sẵn của module ESS. */
    @Autowired
    private EssFileMapper essFileMapper;

    @Override
    @Transactional(readOnly = true)
    public List<EduDeptNode> getDeptTree() {
        log.info("Lay cay phong ban toan cong ty cho module dao tao");
        try {
            return eduCommonMapper.findDeptTree();
        } catch (Exception e) {
            log.error("Loi khi lay cay phong ban", e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<EduEmployeeLookup> findEmployees(String keyword, List<String> deptNos, String deptRoot, String orderBy) {
        log.info("Tim nhan vien, keyword={}, deptNos={}, deptRoot={}", keyword, deptNos, deptRoot);
        try {
            return eduCommonMapper.findEmployees(trim(keyword), deptNos, trim(deptRoot), orderBy);
        } catch (Exception e) {
            log.error("Loi khi tim nhan vien", e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public EduEmployeeLookup findEmployeeByEmpid(String empid) {
        log.info("Tim nhan vien theo empid={}", empid);
        try {
            return eduCommonMapper.findEmployeeByEmpid(empid);
        } catch (Exception e) {
            log.error("Loi khi tim nhan vien theo empid={}", empid, e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<EduFile> getFiles(String applyType, String applyNo) {
        log.info("Lay file dinh kem, applyType={}, applyNo={}", applyType, applyNo);
        if (applyNo == null || applyNo.isEmpty()) {
            return Collections.emptyList();
        }
        try {
            return eduCommonMapper.findFiles(applyType, Collections.singletonList(applyNo));
        } catch (Exception e) {
            log.error("Loi khi lay file dinh kem, applyType={}, applyNo={}", applyType, applyNo, e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, List<EduFile>> getFilesGrouped(String applyType, List<String> applyNos) {
        Map<String, List<EduFile>> result = new LinkedHashMap<>();
        if (applyNos == null || applyNos.isEmpty()) {
            return result;
        }
        try {
            for (int i = 0; i < applyNos.size(); i += IN_CLAUSE_LIMIT) {
                List<String> chunk = applyNos.subList(i, Math.min(i + IN_CLAUSE_LIMIT, applyNos.size()));
                for (EduFile f : eduCommonMapper.findFiles(applyType, chunk)) {
                    result.computeIfAbsent(f.getApplyNo(), k -> new ArrayList<>()).add(f);
                }
            }
            return result;
        } catch (Exception e) {
            log.error("Loi khi lay file dinh kem theo danh sach, applyType={}", applyType, e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public List<EduFile> uploadFiles(String applyType, String applyNo, List<MultipartFile> files) throws BusinessException {
        log.info("Upload file dinh kem, applyType={}, applyNo={}, count={}", applyType, applyNo,
                files == null ? 0 : files.size());
        checkFileType(applyType);
        if (applyNo == null || applyNo.trim().isEmpty()) {
            throw new BusinessException("INVALID_INPUT", "Thiếu mã bản ghi để đính kèm file.");
        }
        try {
            if (files != null) {
                for (MultipartFile file : files) {
                    if (file != null && !file.isEmpty()) {
                        saveFile(file, applyNo, applyType);
                    }
                }
            }
            return getFiles(applyType, applyNo);
        } catch (IOException e) {
            log.error("Loi khi luu file dinh kem, applyType={}, applyNo={}", applyType, applyNo, e);
            throw new BusinessException("FILE_UPLOAD_FAILED", "Không thể lưu file đính kèm.", e);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteFile(String fileNo) throws BusinessException {
        log.info("Xoa file dinh kem, fileNo={}", fileNo);
        EduFile file = eduCommonMapper.findFileByNo(fileNo);
        if (file == null) {
            throw new BusinessException(ERR_FILE_NOT_FOUND, "Không tìm thấy file.");
        }
        checkFileType(file.getApplyType());
        try {
            eduCommonMapper.softDeleteFile(fileNo);
        } catch (Exception e) {
            log.error("Loi khi xoa file dinh kem, fileNo={}", fileNo, e);
            throw e;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteFilesByApply(String applyType, String applyNo) {
        log.info("Xoa toan bo file dinh kem, applyType={}, applyNo={}", applyType, applyNo);
        try {
            eduCommonMapper.softDeleteFilesByApply(applyType, applyNo);
        } catch (Exception e) {
            log.error("Loi khi xoa file dinh kem, applyType={}, applyNo={}", applyType, applyNo, e);
            throw e;
        }
    }

    private void checkFileType(String applyType) throws BusinessException {
        if (applyType == null || !ALLOWED_FILE_TYPES.contains(applyType)) {
            throw new BusinessException(ERR_FILE_TYPE, "Loại file đính kèm không hợp lệ.");
        }
    }

    /**
     * Lưu file vào thư mục upload (tên UUID) và ghi ESS_FILE - cùng quy ước với
     * EssPersonalInfoServiceImpl#saveFile (hàm đó private nên không gọi lại được),
     * để API download /ess/empinfo/api/files/download/{fileNo} đọc được file.
     */
    private void saveFile(MultipartFile file, String applyNo, String applyType) throws IOException {
        Path uploadDir = Paths.get(fileUploadPath);
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }
        String rawName = file.getOriginalFilename();
        String originalName = StringUtils.cleanPath(rawName != null ? rawName : "file");
        String ext = "";
        int dotIdx = originalName.lastIndexOf('.');
        if (dotIdx >= 0) {
            ext = originalName.substring(dotIdx);
        }
        String storedName = UUID.randomUUID().toString() + ext;
        Files.copy(file.getInputStream(), uploadDir.resolve(storedName), StandardCopyOption.REPLACE_EXISTING);
        log.info("Da luu file dinh kem: {} -> {}", originalName, storedName);

        EssFileDto dto = new EssFileDto();
        dto.setApplyNo(applyNo);
        dto.setApplyType(applyType);
        dto.setFileUrl(storedName);
        dto.setFileName(originalName);
        essFileMapper.insertEssFile(dto);
    }

    private static String trim(String value) {
        if (value == null) {
            return null;
        }
        String t = value.trim();
        return t.isEmpty() ? null : t;
    }
}
