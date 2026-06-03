package com.ait.sy.sys.service;

import com.ait.sy.basicMaintenance.model.HrCompany;
import com.ait.sy.basicMaintenance.model.SyCode;
import com.ait.sy.sys.model.SyGlobalName;

import java.util.List;
import java.util.Map;

/**
 * Service xử lý đa ngôn ngữ
 */
public interface MultilingualService {

    // ========== SY_GLOBAL_NAME - Đa ngôn ngữ ==========

    /**
     * Lấy nội dung đa ngôn ngữ theo mã số và ngôn ngữ
     */
    String getContent(String no, String language);

    /**
     * Lấy tất cả nội dung đa ngôn ngữ theo mã số
     */
    Map<String, String> getContentsByNo(String no);

    /**
     * Lấy tất cả nội dung đa ngôn ngữ theo ngôn ngữ
     */
    List<SyGlobalName> getContentsByLanguage(String language);

    /**
     * Lưu nội dung đa ngôn ngữ
     */
    void saveContent(String no, String language, String content);

    /**
     * Cập nhật nội dung đa ngôn ngữ
     */
    void updateContent(String no, String language, String content);

    /**
     * Xóa nội dung đa ngôn ngữ
     */
    void deleteContent(String no, String language);

    /**
     * Lấy danh sách ngôn ngữ có sẵn
     */
    List<String> getAvailableLanguages();

    /**
     * Lấy danh sách mã số có đa ngôn ngữ
     */
    List<String> getAvailableNos();

    // ========== SY_CODE - Mã code phân cấp ==========

    /**
     * Lấy tất cả mã code
     */
    List<SyCode> getAllCodes();

    /**
     * Lấy mã code theo CODE_NO
     */
    SyCode getCodeByCodeNo(String codeNo);

    /**
     * Lấy mã code theo nhóm
     */
    List<SyCode> getCodesByGroup(String groupCode);

    /**
     * Lấy mã code con theo mã code cha
     */
    List<SyCode> getChildCodes(String parentCodeNo);

    /**
     * Lấy cây phân cấp mã code
     */
    List<SyCode> getCodeTree(String rootCodeNo);

    /**
     * Lưu mã code
     */
    void saveCode(SyCode syCode);

    /**
     * Cập nhật mã code
     */
    void updateCode(SyCode syCode);

    /**
     * Xóa mã code
     */
    void deleteCode(String codeNo);

    // ========== HR_COMPANY - Thông tin công ty ==========

    /**
     * Lấy tất cả công ty
     */
    List<HrCompany> getAllCompanies();

    /**
     * Lấy công ty theo CPNY_ID
     */
    HrCompany getCompanyById(String cpnyId);

    /**
     * Lấy công ty theo CPNY_NO
     */
    HrCompany getCompanyByNo(String cpnyNo);

    /**
     * Tìm kiếm công ty
     */
    List<HrCompany> searchCompanies(String keyword);

    /**
     * Lưu công ty
     */
    void saveCompany(HrCompany hrCompany);

    /**
     * Cập nhật công ty
     */
    void updateCompany(HrCompany hrCompany);

    /**
     * Xóa công ty
     */
    void deleteCompany(String cpnyId);

    // ========== SY_CODE_PARAM - Liên kết CODE và COMPANY ==========

    /**
     * Lấy danh sách công ty theo CODE_NO
     */
    List<String> getCompanyIdsByCodeNo(String codeNo);

    /**
     * Lấy danh sách CODE_NO theo CPNY_ID
     */
    List<String> getCodeNosByCompanyId(String cpnyId);

    /**
     * Liên kết CODE và COMPANY
     */
    void linkCodeAndCompany(String codeNo, String cpnyId);

    /**
     * Hủy liên kết CODE và COMPANY
     */
    void unlinkCodeAndCompany(String codeNo, String cpnyId);

    // ========== UTILITY METHODS ==========

    /**
     * Lấy nội dung đa ngôn ngữ với fallback
     * Nếu không tìm thấy ngôn ngữ yêu cầu, sẽ fallback về ngôn ngữ mặc định
     */
    String getContentWithFallback(String no, String language, String defaultLanguage);

    /**
     * Lấy tất cả nội dung đa ngôn ngữ cho một danh sách mã số
     */
    Map<String, Map<String, String>> getBulkContents(List<String> nos, String language);

    /**
     * Kiểm tra ngôn ngữ có được hỗ trợ không
     */
    boolean isLanguageSupported(String language);

    /**
     * Lấy ngôn ngữ mặc định
     */
    String getDefaultLanguage();
}
