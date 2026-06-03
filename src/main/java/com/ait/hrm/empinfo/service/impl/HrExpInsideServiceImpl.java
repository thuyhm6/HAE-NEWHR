package com.ait.hrm.empinfo.service.impl;

import com.ait.hrm.empinfo.dto.HrExpInsideDto;
import com.ait.hrm.empinfo.mapper.HrExpInsideMapper;
import com.ait.hrm.empinfo.service.HrExpInsideService;
import com.ait.sy.sys.dto.DataTablesResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class HrExpInsideServiceImpl implements HrExpInsideService {

    private static final Logger log = LoggerFactory.getLogger(HrExpInsideServiceImpl.class);

    @Autowired
    private HrExpInsideMapper mapper;

    @Override
    public HrExpInsideDto searchEmployee(HrExpInsideDto dto) {
        try {
            return mapper.selectEmployeeByKeyword(dto);
        } catch (Exception e) {
            log.error("Lỗi tìm kiếm nhân viên theo keyword={}", dto.getSearchKeyword(), e);
            return null;
        }
    }

    @Override
    public DataTablesResponse<HrExpInsideDto> getDecisionList(HrExpInsideDto dto) {
        try {
            int total = mapper.countDecisionList(dto);
            List<HrExpInsideDto> list = mapper.selectDecisionListPage(dto);
            return new DataTablesResponse<>(dto.getDraw(), total, total, list);
        } catch (Exception e) {
            log.error("Lỗi lấy danh sách quyết định personId={}", dto.getPersonId(), e);
            return new DataTablesResponse<>(dto.getDraw(), "Lỗi truy vấn dữ liệu");
        }
    }

    @Override
    public HrExpInsideDto getDecisionBySeq(Long seq) {
        try {
            return mapper.selectDecisionBySeq(seq);
        } catch (Exception e) {
            log.error("Lỗi lấy chi tiết quyết định seq={}", seq, e);
            return null;
        }
    }

    @Override
    public List<HrExpInsideDto> getAllDecisionsByPersonId(String personId) {
        try {
            return mapper.selectAllDecisionsByPersonId(personId);
        } catch (Exception e) {
            log.error("Lỗi lấy tất cả quyết định personId={}", personId, e);
            return java.util.Collections.emptyList();
        }
    }

    @Override
    @Transactional
    public Map<String, Object> saveDecision(HrExpInsideDto dto) {
        Map<String, Object> result = new HashMap<>();
        try {
            if (dto.getSeq() == null) {
                mapper.insertDecision(dto);
            } else {
                mapper.updateDecision(dto);
            }
            log.info("Gọi PKG_RECRUIT_MANAGE.PR_EXPERIENCE_EXECUTE_SINGLE seq={}", dto.getSeq());
            mapper.callExperienceExecuteSingle();
            result.put("success", true);
            result.put("seq", dto.getSeq());
            result.put("message", "Lưu thành công");
        } catch (Exception e) {
            log.error("Lỗi lưu quyết định nhân sự seq={}", dto.getSeq(), e);
            result.put("success", false);
            result.put("message", "Lỗi lưu dữ liệu: " + e.getMessage());
        }
        return result;
    }

    @Override
    @Transactional
    public Map<String, Object> deleteDecision(Long seq) {
        Map<String, Object> result = new HashMap<>();
        try {
            mapper.deleteDecision(seq);
            result.put("success", true);
            result.put("message", "Xóa thành công");
        } catch (Exception e) {
            log.error("Lỗi xóa quyết định seq={}", seq, e);
            result.put("success", false);
            result.put("message", "Lỗi xóa dữ liệu: " + e.getMessage());
        }
        return result;
    }
}
