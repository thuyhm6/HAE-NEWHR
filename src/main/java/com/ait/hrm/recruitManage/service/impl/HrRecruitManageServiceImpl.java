package com.ait.hrm.recruitManage.service.impl;

import com.ait.hrm.recruitManage.dto.HrEmployeeRecruitDto;
import com.ait.hrm.recruitManage.dto.HrEducationRecruitDto;
import com.ait.hrm.recruitManage.dto.HrWorkExperienceRecruitDto;
import com.ait.hrm.recruitManage.dto.HrFamilyRecruitDto;
import com.ait.hrm.recruitManage.dto.HrRecruitExecuteDto;
import com.ait.hrm.recruitManage.dto.HrExpInsideBatchDto;
import com.ait.hrm.recruitManage.dto.HrRecruitBatchDto;
import com.ait.hrm.recruitManage.mapper.HrRecruitManageMapper;
import com.ait.hrm.recruitManage.service.HrRecruitManageService;
import com.ait.sy.sys.dto.DataTablesResponse;
import com.ait.sy.sys.service.HrAuthenticationService.HrUserInfo;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.text.SimpleDateFormat;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpSession;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class HrRecruitManageServiceImpl implements HrRecruitManageService {

    private static final Logger log = LoggerFactory.getLogger(HrRecruitManageServiceImpl.class);

    @Autowired
    private HrRecruitManageMapper mapper;

    @Override
    public DataTablesResponse<HrEmployeeRecruitDto> getEmployeeList(HrEmployeeRecruitDto dto) {
        try {
            int total = mapper.countList(dto);
            List<HrEmployeeRecruitDto> list = mapper.selectListPage(dto);
            return new DataTablesResponse<>(dto.getDraw(), total, total, list);
        } catch (Exception e) {
            log.error("Lỗi lấy danh sách nhân viên tuyển dụng", e);
            return new DataTablesResponse<>(dto.getDraw(), "Lỗi truy vấn dữ liệu");
        }
    }

    @Override
    public HrEmployeeRecruitDto getEmployeeById(String personId) {
        try {
            return mapper.selectEmployeeById(personId);
        } catch (Exception e) {
            log.error("Lỗi lấy thông tin nhân viên personId={}", personId, e);
            return null;
        }
    }

    @Override
    @Transactional
    public Map<String, Object> saveEmployee(HrEmployeeRecruitDto dto) {
        Map<String, Object> result = new HashMap<>();
        try {
            if (dto.getPersonId() == null || dto.getPersonId().isEmpty()) {
                mapper.insertEmployee(dto);
                result.put("success", true);
                result.put("personId", dto.getPersonId());
                result.put("message", "Thêm mới thành công");
            } else {
                mapper.updateEmployee(dto);
                result.put("success", true);
                result.put("personId", dto.getPersonId());
                result.put("message", "Cập nhật thành công");
            }
        } catch (Exception e) {
            log.error("Lỗi lưu thông tin nhân viên tuyển dụng", e);
            result.put("success", false);
            result.put("message", "Lỗi lưu dữ liệu: " + e.getMessage());
        }
        return result;
    }

    // ── Education ────────────────────────────────────────────────────────────

    @Override
    public List<HrEducationRecruitDto> getEducationList(String personId) {
        try {
            return mapper.selectEducationList(personId);
        } catch (Exception e) {
            log.error("Lỗi lấy danh sách giáo dục personId={}", personId, e);
            return List.of();
        }
    }

    @Override
    @Transactional
    public Map<String, Object> saveEducation(HrEducationRecruitDto dto) {
        Map<String, Object> result = new HashMap<>();
        try {
            if (dto.getSeq() == null) {
                mapper.insertEducation(dto);
            } else {
                mapper.updateEducation(dto);
            }
            result.put("success", true);
            result.put("message", "Lưu thành công");
        } catch (Exception e) {
            log.error("Lỗi lưu thông tin giáo dục", e);
            result.put("success", false);
            result.put("message", "Lỗi: " + e.getMessage());
        }
        return result;
    }

    @Override
    @Transactional
    public Map<String, Object> deleteEducation(Long seq) {
        Map<String, Object> result = new HashMap<>();
        try {
            mapper.deleteEducation(seq);
            result.put("success", true);
        } catch (Exception e) {
            log.error("Lỗi xóa giáo dục seq={}", seq, e);
            result.put("success", false);
            result.put("message", e.getMessage());
        }
        return result;
    }

    // ── Work Experience ──────────────────────────────────────────────────────

    @Override
    public List<HrWorkExperienceRecruitDto> getWorkExpList(String personId) {
        try {
            return mapper.selectWorkExpList(personId);
        } catch (Exception e) {
            log.error("Lỗi lấy quá trình làm việc personId={}", personId, e);
            return List.of();
        }
    }

    @Override
    @Transactional
    public Map<String, Object> saveWorkExp(HrWorkExperienceRecruitDto dto) {
        Map<String, Object> result = new HashMap<>();
        try {
            if (dto.getSeq() == null) {
                mapper.insertWorkExp(dto);
            } else {
                mapper.updateWorkExp(dto);
            }
            result.put("success", true);
            result.put("message", "Lưu thành công");
        } catch (Exception e) {
            log.error("Lỗi lưu quá trình làm việc", e);
            result.put("success", false);
            result.put("message", "Lỗi: " + e.getMessage());
        }
        return result;
    }

    @Override
    @Transactional
    public Map<String, Object> deleteWorkExp(Long seq) {
        Map<String, Object> result = new HashMap<>();
        try {
            mapper.deleteWorkExp(seq);
            result.put("success", true);
        } catch (Exception e) {
            log.error("Lỗi xóa quá trình làm việc seq={}", seq, e);
            result.put("success", false);
            result.put("message", e.getMessage());
        }
        return result;
    }

    // ── Family ───────────────────────────────────────────────────────────────

    @Override
    public List<HrFamilyRecruitDto> getFamilyList(String personId) {
        try {
            return mapper.selectFamilyList(personId);
        } catch (Exception e) {
            log.error("Lỗi lấy thông tin gia đình personId={}", personId, e);
            return List.of();
        }
    }

    @Override
    @Transactional
    public Map<String, Object> saveFamily(HrFamilyRecruitDto dto) {
        Map<String, Object> result = new HashMap<>();
        try {
            if (dto.getSeq() == null) {
                mapper.insertFamily(dto);
            } else {
                mapper.updateFamily(dto);
            }
            result.put("success", true);
            result.put("message", "Lưu thành công");
        } catch (Exception e) {
            log.error("Lỗi lưu thông tin gia đình", e);
            result.put("success", false);
            result.put("message", "Lỗi: " + e.getMessage());
        }
        return result;
    }

    @Override
    @Transactional
    public Map<String, Object> deleteFamily(Long seq) {
        Map<String, Object> result = new HashMap<>();
        try {
            mapper.deleteFamily(seq);
            result.put("success", true);
        } catch (Exception e) {
            log.error("Lỗi xóa thông tin gia đình seq={}", seq, e);
            result.put("success", false);
            result.put("message", e.getMessage());
        }
        return result;
    }

    // ── Execute ──────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public Map<String, Object> executeRecruit(String personIds, String type) {
        Map<String, Object> result = new HashMap<>();
        try {
            if ("CONFIRM".equals(type) || "CONFIRM_BATCH".equals(type)) {
                List<String> empIds;
                if ("CONFIRM_BATCH".equals(type)) {
                    empIds = mapper.selectEmpIdsByRegisterSeq(personIds);
                } else {
                    empIds = mapper.selectEmpIdsByPersonIds(Arrays.asList(personIds.split(",")));
                }
                if (empIds != null && !empIds.isEmpty()) {
                    List<String> existingIds = mapper.selectExistingEmpIds(empIds);
                    if (existingIds != null && !existingIds.isEmpty()) {
                        result.put("success", false);
                        result.put("message", "Mã nhân viên đã tồn tại trong hệ thống: " + String.join(", ", existingIds));
                        return result;
                    }
                }
            }
            HrUserInfo user = getCurrentUser();
            HrRecruitExecuteDto dto = new HrRecruitExecuteDto();
            dto.setPersonIds(personIds);
            dto.setType(type);
            if (user != null) {
                dto.setAdminID(user.getUsername());
                dto.setAdminIP(getClientIp());
                dto.setCpnyId(user.getCpnyId());
            }
            mapper.callRecruitExecute(dto);
            String msg = dto.getMessage();
            if (msg != null && msg.startsWith("ERR")) {
                result.put("success", false);
                result.put("message", msg);
            } else {
                result.put("success", true);
                result.put("message", msg != null ? msg : "Thực hiện thành công");
            }
        } catch (Exception e) {
            log.error("Lỗi thực hiện recruit execute type={}", type, e);
            result.put("success", false);
            result.put("message", "Lỗi: " + e.getMessage());
        }
        return result;
    }

    // ── Quyết định hàng loạt ─────────────────────────────────────────────────

    @Override
    public List<HrExpInsideBatchDto> getRegisterList() {
        try {
            return mapper.selectRegisterList(new HrExpInsideBatchDto());
        } catch (Exception e) {
            log.error("Lỗi lấy danh sách đăng ký hàng loạt", e);
            return new ArrayList<>();
        }
    }

    @Override
    @Transactional
    public Map<String, Object> saveRegister(HrExpInsideBatchDto dto) {
        Map<String, Object> result = new HashMap<>();
        try {
            mapper.insertRegister(dto);
            result.put("success", true);
            result.put("registerSeq", dto.getRegisterSeq());
            result.put("registerDate", dto.getRegisterDate());
        } catch (Exception e) {
            log.error("Lỗi lưu đăng ký hàng loạt", e);
            result.put("success", false);
            result.put("message", e.getMessage());
        }
        return result;
    }

    @Override
    public DataTablesResponse<HrExpInsideBatchDto> getBatchList(HrExpInsideBatchDto dto) {
        try {
            int total = mapper.countBatchList(dto);
            List<HrExpInsideBatchDto> list = mapper.selectBatchListPage(dto);
            DataTablesResponse<HrExpInsideBatchDto> response = new DataTablesResponse<>(dto.getDraw(), total, total, list);
            int unprocessed = mapper.countUnprocessedBatch(dto);
            response.setAllProcessed(total > 0 && unprocessed == 0);
            return response;
        } catch (Exception e) {
            log.error("Lỗi lấy danh sách quyết định hàng loạt registerSeq={}", dto.getRegisterSeq(), e);
            return new DataTablesResponse<>(dto.getDraw(), "Lỗi truy vấn dữ liệu");
        }
    }

    @Override
    @Transactional
    public Map<String, Object> updateBatchItem(HrExpInsideBatchDto dto) {
        Map<String, Object> result = new HashMap<>();
        try {
            mapper.updateBatchItem(dto);
            result.put("success", true);
        } catch (Exception e) {
            log.error("Lỗi cập nhật quyết định hàng loạt seq={}", dto.getSeq(), e);
            result.put("success", false);
            result.put("message", e.getMessage());
        }
        return result;
    }

    @Override
    @Transactional
    public Map<String, Object> deleteBatchItem(String seq) {
        Map<String, Object> result = new HashMap<>();
        try {
            mapper.deleteBatchItem(seq);
            result.put("success", true);
        } catch (Exception e) {
            log.error("Lỗi xóa quyết định hàng loạt seq={}", seq, e);
            result.put("success", false);
            result.put("message", e.getMessage());
        }
        return result;
    }

    @Override
    @Transactional
    public Map<String, Object> importBatchExcel(MultipartFile file, String registerSeq) {
        Map<String, Object> result = new HashMap<>();
        int successCount = 0;
        int errorCount = 0;
        StringBuilder errors = new StringBuilder();
        try (Workbook wb = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = wb.getSheetAt(0);
            // Bỏ qua 1 dòng đầu (header)
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                String empId = getCellStr(row, 0); // Col A
                if (empId == null || empId.isEmpty()) continue;
                try {
                    HrExpInsideBatchDto dto = new HrExpInsideBatchDto();
                    dto.setRegisterSeq(registerSeq);
                    dto.setEmpId(empId);
                    dto.setLocalName(getCellStr(row, 1));          // Col B
                    dto.setStartDate(getCellStr(row, 2));          // Col C
                    dto.setTransCode(getCellStr(row, 4));          // Col E
                    dto.setDeptno(getCellStr(row, 6));             // Col G
                    dto.setPostFamily(getCellStr(row, 8));         // Col I
                    dto.setNewPostGradeNo(getCellStr(row, 10));    // Col K
                    dto.setPositionNo(getCellStr(row, 12));        // Col M
                    dto.setEmpTypeCode(getCellStr(row, 14));       // Col O
                    dto.setMainBusiness(getCellStr(row, 16));      // Col Q
                    dto.setCostCenter(getCellStr(row, 18));        // Col S
                    dto.setRemarks(getCellStr(row, 19));           // Col T
                    dto.setLineId(String.valueOf(i - 1));
                    // Nếu có ô trống, lấy giá trị hiện tại từ HR_EMPLOYEE để bổ sung
                    fillBlankFromEmployee(dto, empId);
                    String personId = mapper.selectPersonIdByEmpId(empId);
                    dto.setPersonId(personId);
                    mapper.insertBatchItem(dto);
                    successCount++;
                } catch (Exception ex) {
                    errorCount++;
                    errors.append("Dòng ").append(i + 1).append(": ").append(ex.getMessage()).append("; ");
                    log.warn("Lỗi import dòng {} empId={}", i + 1, empId, ex);
                }
            }
            result.put("success", true);
            result.put("successCount", successCount);
            result.put("errorCount", errorCount);
            if (errors.length() > 0) result.put("errors", errors.toString());
        } catch (Exception e) {
            log.error("Lỗi đọc file Excel import batch", e);
            result.put("success", false);
            result.put("message", "Lỗi đọc file: " + e.getMessage());
        }
        return result;
    }

    private String getCellStr(Row row, int col) {
        Cell cell = row.getCell(col, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (cell == null) return null;

        CellType type = cell.getCellType();
        // Nếu cell là công thức, lấy kiểu kết quả đã được cache (giá trị hiển thị)
        if (type == CellType.FORMULA) {
            type = cell.getCachedFormulaResultType();
        }

        if (type == CellType.NUMERIC) {
            if (DateUtil.isCellDateFormatted(cell)) {
                return new SimpleDateFormat("yyyy/MM/dd").format(cell.getDateCellValue());
            }
            // Fallback: DataFormatter xử lý các định dạng date tùy chỉnh mà DateUtil không nhận ra (vd: YYYY-MM-DD)
            DataFormatter df = new DataFormatter();
            String formatted = df.formatCellValue(cell).trim();
            if (formatted.matches("\\d{4}[/-]\\d{1,2}[/-]\\d{1,2}")) {
                return formatted.replace("-", "/");
            }
            if (formatted.matches("\\d{1,2}[/-]\\d{1,2}[/-]\\d{4}")) {
                String[] parts = formatted.replace("/", "-").split("-");
                return parts[2] + "/" + parts[1] + "/" + parts[0];
            }
            double d = cell.getNumericCellValue();
            return (d == Math.floor(d)) ? String.valueOf((long) d) : String.valueOf(d);
        } else if (type == CellType.STRING) {
            String val = cell.getStringCellValue().trim();
            return val.isEmpty() ? null : val;
        } else if (type == CellType.BOOLEAN) {
            return String.valueOf(cell.getBooleanCellValue());
        }
        return null;
    }

    private void fillBlankFromEmployee(HrExpInsideBatchDto dto, String empId) {
        boolean hasBlank = dto.getLocalName() == null || dto.getDeptno() == null
                || dto.getPostFamily() == null || dto.getNewPostGradeNo() == null
                || dto.getPositionNo() == null || dto.getEmpTypeCode() == null
                || dto.getMainBusiness() == null || dto.getCostCenter() == null;
        if (!hasBlank) return;

        HrExpInsideBatchDto emp = mapper.selectCurrentEmpByEmpId(empId);
        if (emp == null) return;

        if (dto.getLocalName()      == null) dto.setLocalName(emp.getLocalName());
        if (dto.getDeptno()         == null) dto.setDeptno(emp.getDeptno());
        if (dto.getPostFamily()     == null) dto.setPostFamily(emp.getPostFamily());
        if (dto.getNewPostGradeNo() == null) dto.setNewPostGradeNo(emp.getNewPostGradeNo());
        if (dto.getPositionNo()     == null) dto.setPositionNo(emp.getPositionNo());
        if (dto.getEmpTypeCode()    == null) dto.setEmpTypeCode(emp.getEmpTypeCode());
        if (dto.getMainBusiness()   == null) dto.setMainBusiness(emp.getMainBusiness());
        if (dto.getCostCenter()     == null) dto.setCostCenter(emp.getCostCenter());
    }

    private HrUserInfo getCurrentUser() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpSession session = attrs.getRequest().getSession(false);
                if (session != null) {
                    return (HrUserInfo) session.getAttribute("currentHrUser");
                }
            }
        } catch (Exception e) {
            log.warn("Không lấy được thông tin user hiện tại", e);
        }
        return null;
    }

    // ── Nhận việc hàng loạt (Recruit Batch) ──────────────────────────────────

    @Override
    public List<HrRecruitBatchDto> getRblRegisterList() {
        try {
            return mapper.selectRblRegisterList(new HrRecruitBatchDto());
        } catch (Exception e) {
            log.error("Lỗi lấy danh sách đăng ký nhận việc hàng loạt", e);
            return new ArrayList<>();
        }
    }

    @Override
    @Transactional
    public Map<String, Object> saveRblRegister(HrRecruitBatchDto dto) {
        Map<String, Object> result = new HashMap<>();
        try {
            mapper.insertRblRegister(dto);
            result.put("success", true);
            result.put("registerSeq", dto.getRegisterSeq());
            result.put("registerDate", dto.getRegisterDate());
        } catch (Exception e) {
            log.error("Lỗi lưu đăng ký nhận việc hàng loạt", e);
            result.put("success", false);
            result.put("message", e.getMessage());
        }
        return result;
    }

    @Override
    public DataTablesResponse<HrRecruitBatchDto> getRblBatchList(HrRecruitBatchDto dto) {
        try {
            int total = mapper.countRblBatchList(dto);
            List<HrRecruitBatchDto> list = mapper.selectRblBatchListPage(dto);
            DataTablesResponse<HrRecruitBatchDto> response = new DataTablesResponse<>(dto.getDraw(), total, total, list);
            int unprocessed = mapper.countUnprocessedRblBatch(dto);
            response.setAllProcessed(total > 0 && unprocessed == 0);
            return response;
        } catch (Exception e) {
            log.error("Lỗi lấy danh sách nhận việc hàng loạt registerSeq={}", dto.getRegisterSeq(), e);
            return new DataTablesResponse<>(dto.getDraw(), "Lỗi truy vấn dữ liệu");
        }
    }

    @Override
    @Transactional
    public Map<String, Object> updateRblBatchItem(HrRecruitBatchDto dto) {
        Map<String, Object> result = new HashMap<>();
        try {
            mapper.updateRblBatchItem(dto);
            result.put("success", true);
        } catch (Exception e) {
            log.error("Lỗi cập nhật nhận việc hàng loạt seq={}", dto.getSeq(), e);
            result.put("success", false);
            result.put("message", e.getMessage());
        }
        return result;
    }

    @Override
    @Transactional
    public Map<String, Object> deleteRblBatchItem(String seq) {
        Map<String, Object> result = new HashMap<>();
        try {
            mapper.deleteRblBatchItem(seq);
            result.put("success", true);
        } catch (Exception e) {
            log.error("Lỗi xóa nhận việc hàng loạt seq={}", seq, e);
            result.put("success", false);
            result.put("message", e.getMessage());
        }
        return result;
    }

    @Override
    @Transactional
    public Map<String, Object> importRblBatchExcel(MultipartFile file, String registerSeq) {
        Map<String, Object> result = new HashMap<>();
        int successCount = 0;
        int errorCount = 0;
        StringBuilder errors = new StringBuilder();
        try (Workbook wb = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = wb.getSheetAt(0);
            // Bỏ qua dòng đầu (header)
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                String empId = getCellStr(row, 0); // Col A
                if (empId == null || empId.isEmpty()) continue;
                try {
                    HrRecruitBatchDto dto = new HrRecruitBatchDto();
                    dto.setRegisterSeq(registerSeq);
                    dto.setEmpId(empId);
                    dto.setVietnamName(getCellStr(row, 1));       // Col B
                    dto.setEnglishName(getCellStr(row, 2));       // Col C
                    dto.setDob(getCellStr(row, 3));               // Col D
                    dto.setDateStarted(getCellStr(row, 4));       // Col E
                    dto.setEndProbationDate(getCellStr(row, 5));  // Col F
                    // Col G (6) = tên JOIN_TYPE, bỏ qua
                    dto.setJoinType(getCellStr(row, 7));          // Col H
                    // Col I (8) = tên JOIN_DETAIL_TYPE, bỏ qua
                    dto.setJoinDetailType(getCellStr(row, 9));    // Col J
                    // Col K (10) = tên DEPTNO, bỏ qua
                    dto.setDeptno(getCellStr(row, 11));           // Col L
                    // Col M (12) = tên POST_GRADE_NO, bỏ qua
                    dto.setPostGradeNo(getCellStr(row, 13));      // Col N
                    // Col O (14) = tên MAIN_BUSINESS, bỏ qua
                    dto.setMainBusiness(getCellStr(row, 15));     // Col P
                    // Col Q (16) = tên POST_FAMILY, bỏ qua
                    dto.setPostFamily(getCellStr(row, 17));       // Col R
                    // Col S (18) = tên EMP_TYPE_CODE, bỏ qua
                    dto.setEmpTypeCode(getCellStr(row, 19));      // Col T
                    // Col U (20) = tên POSITION_NO, bỏ qua
                    dto.setPositionNo(getCellStr(row, 21));       // Col V
                    // Col W (22) = tên COST_CENTER, bỏ qua
                    dto.setCostCenter(getCellStr(row, 23));       // Col X
                    // Col Y (24) = tên FINAL_DEGREE_CODE, bỏ qua
                    dto.setFinalDegreeCode(getCellStr(row, 25)); // Col Z
                    dto.setEndDate(getCellStr(row, 26));          // Col AA
                    dto.setInstitutionName(getCellStr(row, 27)); // Col AB
                    dto.setSubjectName(getCellStr(row, 28));      // Col AC
                    dto.setIdcardNo(getCellStr(row, 29));         // Col AD
                    dto.setIdcardSDate(getCellStr(row, 30));      // Col AE
                    dto.setIssuingAuthority(getCellStr(row, 31)); // Col AF
                    // Col AG (32) = tên SEXCODE, bỏ qua
                    dto.setSexcode(getCellStr(row, 33));          // Col AH
                    // Col AI (34) = tên NATIONALITY_CODE, bỏ qua
                    dto.setNationalityCode(getCellStr(row, 35)); // Col AJ
                    // Col AK (36) = tên NATION_CODE, bỏ qua
                    dto.setNationCode(getCellStr(row, 37));       // Col AL
                    // Col AM (38) = tên MARITAL_STATUS_CODE, bỏ qua
                    dto.setMaritalStatusCode(getCellStr(row, 39)); // Col AN
                    dto.setEmailSecond(getCellStr(row, 40));      // Col AO
                    dto.setHomePhone(getCellStr(row, 41));        // Col AP
                    dto.setTelephone(getCellStr(row, 42));        // Col AQ
                    dto.setAddressContent(getCellStr(row, 43));   // Col AR
                    dto.setRegPlace(getCellStr(row, 44));         // Col AS
                    dto.setLineId(String.valueOf(i - 1));
                    mapper.insertRblBatchItem(dto);
                    successCount++;
                } catch (Exception ex) {
                    errorCount++;
                    errors.append("Dòng ").append(i + 1).append(": ").append(ex.getMessage()).append("; ");
                    log.warn("Lỗi import nhận việc dòng {} empId={}", i + 1, empId, ex);
                }
            }
            result.put("success", true);
            result.put("successCount", successCount);
            result.put("errorCount", errorCount);
            if (errors.length() > 0) result.put("errors", errors.toString());
        } catch (Exception e) {
            log.error("Lỗi đọc file Excel import nhận việc hàng loạt", e);
            result.put("success", false);
            result.put("message", "Lỗi đọc file: " + e.getMessage());
        }
        return result;
    }

    private String getClientIp() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                jakarta.servlet.http.HttpServletRequest req = attrs.getRequest();
                String ip = req.getHeader("X-Forwarded-For");
                if (ip == null || ip.isEmpty()) ip = req.getRemoteAddr();
                return ip;
            }
        } catch (Exception e) {
            log.warn("Không lấy được IP", e);
        }
        return "";
    }
}
