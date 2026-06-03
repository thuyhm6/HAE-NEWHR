package com.ait.pa.workManagement.service.impl;

import com.ait.pa.workManagement.dto.PaPayObjDto;
import com.ait.pa.workManagement.mapper.PaPayObjMapper;
import com.ait.pa.workManagement.service.PaPayObjService;
import com.ait.sy.sys.dto.DataTablesResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PaPayObjServiceImpl implements PaPayObjService {

    private static final Logger log = LoggerFactory.getLogger(PaPayObjServiceImpl.class);

    @Autowired
    private PaPayObjMapper mapper;

    @Override
    public List<PaPayObjDto> getList(PaPayObjDto params) {
        try {
            return mapper.selectList(params);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách đối tượng nhận lương: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public DataTablesResponse<PaPayObjDto> getPagedList(PaPayObjDto params) {
        try {
            long total = mapper.countList(params);
            List<PaPayObjDto> data = mapper.selectListPage(params);
            log.info("Phân trang đối tượng nhận lương: total={}, start={}, length={}", total, params.getStart(), params.getLength());
            return new DataTablesResponse<>(params.getDraw(), total, total, data);
        } catch (Exception e) {
            log.error("Lỗi khi phân trang đối tượng nhận lương: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public PaPayObjDto findEmployee(String empId) {
        try {
            return mapper.selectEmployeeByEmpId(empId);
        } catch (Exception e) {
            log.error("Lỗi khi tìm nhân viên empId={}: {}", empId, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void save(PaPayObjDto dto) {
        try {
            int dup = mapper.countDuplicate(dto.getPayScheduleNo(), dto.getEmpId());
            if (dup > 0) {
                throw new IllegalArgumentException("Nhân viên đã tồn tại trong kế hoạch trả lương này!");
            }
            mapper.insert(dto);
            log.info("Thêm mới đối tượng nhận lương: payScheduleNo={}, empId={}", dto.getPayScheduleNo(), dto.getEmpId());
        } catch (Exception e) {
            log.error("Lỗi khi thêm mới đối tượng nhận lương: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void saveList(List<PaPayObjDto> items) {
        try {
            for (PaPayObjDto item : items) {
                mapper.updateIncludeType(item);
                log.info("Cập nhật includeType: payScheduleNo={}, empId={}, includeType={}", item.getPayScheduleNo(), item.getEmpId(), item.getIncludeType());
            }
        } catch (Exception e) {
            log.error("Lỗi khi lưu danh sách đối tượng nhận lương: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void deleteList(List<PaPayObjDto> keys) {
        try {
            for (PaPayObjDto key : keys) {
                mapper.deleteByKey(key.getPayScheduleNo(), key.getEmpId());
                log.info("Xóa đối tượng nhận lương: payScheduleNo={}, empId={}", key.getPayScheduleNo(), key.getEmpId());
            }
        } catch (Exception e) {
            log.error("Lỗi khi xóa danh sách đối tượng nhận lương: {}", e.getMessage(), e);
            throw e;
        }
    }
}
