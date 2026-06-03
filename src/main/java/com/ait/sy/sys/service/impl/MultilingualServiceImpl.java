package com.ait.sy.sys.service.impl;

import com.ait.sy.basicMaintenance.mapper.HrCompanyMapper;
import com.ait.sy.basicMaintenance.mapper.SyCodeMapper;
import com.ait.sy.basicMaintenance.mapper.SyCodeParamMapper;
import com.ait.sy.basicMaintenance.model.HrCompany;
import com.ait.sy.basicMaintenance.model.SyCode;
import com.ait.sy.basicMaintenance.model.SyCodeParam;
import com.ait.sy.sys.mapper.SyGlobalNameMapper;
import com.ait.sy.sys.model.SyGlobalName;
import com.ait.sy.sys.service.MultilingualService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Implementation của MultilingualService
 */
@Service
@Transactional
public class MultilingualServiceImpl implements MultilingualService {

    @Autowired
    private SyGlobalNameMapper syGlobalNameMapper;

    @Autowired
    private SyCodeMapper syCodeMapper;

    @Autowired
    private HrCompanyMapper hrCompanyMapper;

    @Autowired
    private SyCodeParamMapper syCodeParamMapper;

    // ========== SY_GLOBAL_NAME - Đa ngôn ngữ ==========

    @Override
    public String getContent(String no, String language) {
        return syGlobalNameMapper.getContentByNoAndLanguage(no, language);
    }

    @Override
    public Map<String, String> getContentsByNo(String no) {
        List<SyGlobalName> contents = syGlobalNameMapper.getContentsByNo(no);
        return contents.stream()
                .collect(Collectors.toMap(
                        SyGlobalName::getLanguage,
                        SyGlobalName::getContent,
                        (existing, replacement) -> replacement));
    }

    @Override
    public List<SyGlobalName> getContentsByLanguage(String language) {
        return syGlobalNameMapper.findByLanguage(language);
    }

    @Override
    public void saveContent(String no, String language, String content) {
        SyGlobalName syGlobalName = new SyGlobalName(no, language, content);
        syGlobalNameMapper.insert(syGlobalName);
    }

    @Override
    public void updateContent(String no, String language, String content) {
        SyGlobalName existing = syGlobalNameMapper.findByNoAndLanguage(no, language);
        if (existing != null) {
            existing.setContent(content);
            existing.setUpdateDate(LocalDateTime.now());
            syGlobalNameMapper.update(existing);
        } else {
            // Nếu không tồn tại, tạo mới
            saveContent(no, language, content);
        }
    }

    @Override
    public void deleteContent(String no, String language) {
        syGlobalNameMapper.deleteByNoAndLanguage(no, language);
    }

    @Override
    public List<String> getAvailableLanguages() {
        return syGlobalNameMapper.getAvailableLanguages();
    }

    @Override
    public List<String> getAvailableNos() {
        return syGlobalNameMapper.getDistinctNos();
    }

    // ========== SY_CODE - Mã code phân cấp ==========

    @Override
    public List<SyCode> getAllCodes() {
        return syCodeMapper.findAll();
    }

    @Override
    public SyCode getCodeByCodeNo(String codeNo) {
        return syCodeMapper.findByCodeNo(codeNo);
    }

    @Override
    public List<SyCode> getCodesByGroup(String groupCode) {
        return syCodeMapper.findByGroupCode(groupCode);
    }

    @Override
    public List<SyCode> getChildCodes(String parentCodeNo) {
        return syCodeMapper.findByParentCodeNo(parentCodeNo);
    }

    @Override
    public List<SyCode> getCodeTree(String rootCodeNo) {
        return syCodeMapper.findCodeTree(rootCodeNo);
    }

    @Override
    public void saveCode(SyCode syCode) {
        syCodeMapper.insert(syCode);
    }

    @Override
    public void updateCode(SyCode syCode) {
        syCodeMapper.update(syCode);
    }

    @Override
    public void deleteCode(String codeNo) {
        syCodeMapper.deleteByCodeNo(codeNo);
    }

    // ========== HR_COMPANY - Thông tin công ty ==========

    @Override
    public List<HrCompany> getAllCompanies() {
        return hrCompanyMapper.findAll();
    }

    @Override
    public HrCompany getCompanyById(String cpnyId) {
        return hrCompanyMapper.findByCpnyId(cpnyId);
    }

    @Override
    public HrCompany getCompanyByNo(String cpnyNo) {
        return hrCompanyMapper.findByCpnyNo(cpnyNo);
    }

    @Override
    public List<HrCompany> searchCompanies(String keyword) {
        return hrCompanyMapper.searchCompanies(keyword);
    }

    @Override
    public void saveCompany(HrCompany hrCompany) {
        hrCompanyMapper.insert(hrCompany);
    }

    @Override
    public void updateCompany(HrCompany hrCompany) {
        hrCompanyMapper.update(hrCompany);
    }

    @Override
    public void deleteCompany(String cpnyId) {
        hrCompanyMapper.deleteByCpnyId(cpnyId);
    }

    // ========== SY_CODE_PARAM - Liên kết CODE và COMPANY ==========

    @Override
    public List<String> getCompanyIdsByCodeNo(String codeNo) {
        return syCodeParamMapper.getCpnyIdsByCodeNo(codeNo);
    }

    @Override
    public List<String> getCodeNosByCompanyId(String cpnyId) {
        return syCodeParamMapper.getCodeNosByCpnyId(cpnyId);
    }

    @Override
    public void linkCodeAndCompany(String codeNo, String cpnyId) {
        if (!syCodeParamMapper.existsByCodeNoAndCpnyId(codeNo, cpnyId)) {
            SyCodeParam syCodeParam = new SyCodeParam(null, codeNo, cpnyId);
            syCodeParamMapper.insert(syCodeParam);
        }
    }

    @Override
    public void unlinkCodeAndCompany(String codeNo, String cpnyId) {
        syCodeParamMapper.deleteByCodeNoAndCpnyId(codeNo, cpnyId);
    }

    // ========== UTILITY METHODS ==========

    @Override
    public String getContentWithFallback(String no, String language, String defaultLanguage) {
        String content = getContent(no, language);
        if (content == null && !language.equals(defaultLanguage)) {
            content = getContent(no, defaultLanguage);
        }
        return content;
    }

    @Override
    public Map<String, Map<String, String>> getBulkContents(List<String> nos, String language) {
        Map<String, Map<String, String>> result = new HashMap<>();
        for (String no : nos) {
            result.put(no, getContentsByNo(no));
        }
        return result;
    }

    @Override
    public boolean isLanguageSupported(String language) {
        List<String> availableLanguages = getAvailableLanguages();
        return availableLanguages.contains(language);
    }

    @Override
    public String getDefaultLanguage() {
        return "vi"; // Tiếng Việt là ngôn ngữ mặc định
    }
}
