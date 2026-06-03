package com.ait.evs.manage.service.impl;

import com.ait.evs.manage.dto.EvsItemSstDto;
import com.ait.evs.manage.dto.EvsPersonalTargetDto;
import com.ait.evs.manage.mapper.EvsPersonalTargetMapper;
import com.ait.evs.manage.service.EvsPersonalTargetService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EvsPersonalTargetServiceImpl implements EvsPersonalTargetService {

    private static final Logger log = LoggerFactory.getLogger(EvsPersonalTargetServiceImpl.class);

    @Autowired
    private EvsPersonalTargetMapper mapper;

    @Override
    public EvsPersonalTargetDto getObjectInfo(EvsPersonalTargetDto params) {
        try {
            return mapper.selectObjectInfo(params);
        } catch (Exception e) {
            log.error("Lỗi khi lấy thông tin cá nhân: resumeSeq={}, {}", params.getResumeSeq(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public List<EvsItemSstDto> getItemList(EvsItemSstDto params) {
        try {
            return mapper.selectItemList(params);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách mục tiêu: evsObjectSeq={}, {}", params.getEvsObjectSeq(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void saveItem(EvsItemSstDto dto) {
        try {
            // Lưu item nếu có dữ liệu item (thêm mới từ modal)
            if (dto.getItemName() != null && !dto.getItemName().isEmpty()) {
                if (dto.getSeq() == null || dto.getSeq().isEmpty()) {
                    String seq = mapper.getNextItemSeq();
                    dto.setSeq(seq);
                    mapper.insertItem(dto);
                    log.info("Thêm mới mục tiêu: seq={}, evsObjectSeq={}", seq, dto.getEvsObjectSeq());
                } else {
                    mapper.updateItem(dto);
                    log.info("Cập nhật mục tiêu: seq={}", dto.getSeq());
                }
            }

            // Chỉ gọi stored procedure khi FLAG=1 (Thực hiện)
            if ("1".equals(dto.getFlag())) {
                dto.setMessage(null);
                mapper.callModifyObjectActivity(dto);
                log.info("PR_MODIFY_OBJECT_ACTIVITY: evsObjectSeq={}, flag={}, message={}",
                        dto.getEvsObjectSeq(), dto.getFlag(), dto.getMessage());
                if (dto.getMessage() != null && !dto.getMessage().isEmpty()) {
                    throw new RuntimeException(dto.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("Lỗi khi lưu mục tiêu: evsObjectSeq={}, {}", dto.getEvsObjectSeq(), e.getMessage(), e);
            throw e instanceof RuntimeException ? (RuntimeException) e : new RuntimeException(e);
        }
    }

    @Override
    @Transactional
    public void deleteItem(EvsItemSstDto dto) {
        try {
            mapper.deleteItem(dto);
            log.info("Xóa mục tiêu: seq={}", dto.getSeq());
        } catch (Exception e) {
            log.error("Lỗi khi xóa mục tiêu: seq={}, {}", dto.getSeq(), e.getMessage(), e);
            throw e;
        }
    }
}
