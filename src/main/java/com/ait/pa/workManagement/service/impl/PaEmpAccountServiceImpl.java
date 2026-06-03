package com.ait.pa.workManagement.service.impl;

import com.ait.pa.workManagement.dto.PaEmpAccountDto;
import com.ait.pa.workManagement.mapper.PaEmpAccountMapper;
import com.ait.pa.workManagement.service.PaEmpAccountService;
import com.ait.sy.sys.dto.DataTablesResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaEmpAccountServiceImpl implements PaEmpAccountService {

    private static final Logger log = LoggerFactory.getLogger(PaEmpAccountServiceImpl.class);

    @Autowired
    private PaEmpAccountMapper mapper;

    @Override
    public DataTablesResponse<PaEmpAccountDto> getPagedList(PaEmpAccountDto params) {
        try {
            parseDeptNos(params);
            long total = mapper.countList(params);
            List<PaEmpAccountDto> data = mapper.selectListPage(params);
            log.info("Phân trang PA_EMP_ACCOUNT: total={}, start={}, length={}", total, params.getStart(), params.getLength());
            return new DataTablesResponse<>(params.getDraw(), total, total, data);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách tài khoản lương nhân viên: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public PaEmpAccountDto getOne(Long paEmpAccountNo) {
        try {
            return mapper.selectOne(paEmpAccountNo);
        } catch (Exception e) {
            log.error("Lỗi khi lấy chi tiết PA_EMP_ACCOUNT no={}: {}", paEmpAccountNo, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void save(PaEmpAccountDto dto) {
        try {
            if (dto.getPaEmpAccountNo() == null) {
                mapper.insert(dto);
                log.info("Thêm mới PA_EMP_ACCOUNT: personId={}", dto.getPersonId());
            } else {
                mapper.update(dto);
                log.info("Cập nhật PA_EMP_ACCOUNT: no={}", dto.getPaEmpAccountNo());
            }
        } catch (Exception e) {
            log.error("Lỗi khi lưu PA_EMP_ACCOUNT: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void deleteList(List<Long> ids) {
        try {
            for (Long id : ids) {
                mapper.deleteByNo(id);
                log.info("Xóa PA_EMP_ACCOUNT: no={}", id);
            }
        } catch (Exception e) {
            log.error("Lỗi khi xóa danh sách PA_EMP_ACCOUNT: {}", e.getMessage(), e);
            throw e;
        }
    }

    private void parseDeptNos(PaEmpAccountDto params) {
        if (params.getDeptNos() != null && !params.getDeptNos().trim().isEmpty()) {
            List<String> list = Arrays.stream(params.getDeptNos().split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());
            params.setDeptNoList(list.isEmpty() ? null : list);
        } else {
            params.setDeptNoList(null);
        }
    }
}
