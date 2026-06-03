package com.ait.evs.manage.service.impl;

import com.ait.evs.manage.dto.EvsConfirmTarget1Dto;
import com.ait.evs.manage.dto.EvsPersonalTargetDto;
import com.ait.evs.manage.mapper.EvsConfirmTarget1Mapper;
import com.ait.evs.manage.service.EvsConfirmTarget1Service;
import com.ait.sy.sys.dto.DataTablesResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EvsConfirmTarget1ServiceImpl implements EvsConfirmTarget1Service {

    private static final Logger log = LoggerFactory.getLogger(EvsConfirmTarget1ServiceImpl.class);

    @Autowired
    private EvsConfirmTarget1Mapper mapper;

    @Override
    public DataTablesResponse<EvsConfirmTarget1Dto> getObjectList(EvsConfirmTarget1Dto params) {
        try {
            int total = mapper.countList(params);
            List<EvsConfirmTarget1Dto> data = mapper.selectListPage(params);
            return new DataTablesResponse<>(params.getDraw(), total, total, data);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách xác nhận mục tiêu: resumeSeq={}, {}", params.getResumeSeq(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public EvsPersonalTargetDto getObjectInfoBySeq(String evsObjectSeq) {
        try {
            EvsPersonalTargetDto params = new EvsPersonalTargetDto();
            params.setSeq(evsObjectSeq);
            return mapper.selectObjectInfoBySeq(params);
        } catch (Exception e) {
            log.error("Lỗi khi lấy thông tin đối tượng: evsObjectSeq={}, {}", evsObjectSeq, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void confirm(EvsConfirmTarget1Dto dto) {
        try {
            // Cập nhật ý kiến trước khi gọi stored procedure
            if (dto.getAffirmLevel() == null || dto.getAffirmLevel().isEmpty()) {
                dto.setAffirmLevel("1");
            }
            mapper.updateAffirmComment(dto);
            log.info("Cập nhật AFFIRM_COMMENT: evsObjectSeq={}, affirmLevel=1", dto.getEvsObjectSeq());

            // Gọi stored procedure để chuyển trạng thái
            dto.setMessage(null);
            mapper.callModifyObjectActivity(dto);
            log.info("PR_MODIFY_OBJECT_ACTIVITY: evsObjectSeq={}, flag={}, message={}",
                    dto.getEvsObjectSeq(), dto.getFlag(), dto.getMessage());

            if (dto.getMessage() != null && !dto.getMessage().isEmpty()) {
                throw new RuntimeException(dto.getMessage());
            }
        } catch (Exception e) {
            log.error("Lỗi khi xác nhận mục tiêu: evsObjectSeq={}, flag={}, {}",
                    dto.getEvsObjectSeq(), dto.getFlag(), e.getMessage(), e);
            throw e instanceof RuntimeException ? (RuntimeException) e : new RuntimeException(e);
        }
    }
}
