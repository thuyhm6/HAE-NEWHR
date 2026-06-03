package com.ait.evs.manage.service.impl;

import com.ait.evs.manage.dto.EvsEvsBySelfHtsvDto;
import com.ait.evs.manage.dto.EvsItemSstDto;
import com.ait.evs.manage.dto.EvsPersonalTargetDto;
import com.ait.evs.manage.mapper.EvsEvsBySelfHtsvMapper;
import com.ait.evs.manage.service.EvsEvsBySelfHtsvService;
import com.ait.sy.sys.dto.DataTablesResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EvsEvsBySelfHtsvServiceImpl implements EvsEvsBySelfHtsvService {

    private static final Logger log = LoggerFactory.getLogger(EvsEvsBySelfHtsvServiceImpl.class);

    @Autowired
    private EvsEvsBySelfHtsvMapper mapper;

    @Override
    public DataTablesResponse<EvsEvsBySelfHtsvDto> getObjectList(EvsEvsBySelfHtsvDto params) {
        try {
            int total = mapper.countList(params);
            List<EvsEvsBySelfHtsvDto> data = mapper.selectListPage(params);
            return new DataTablesResponse<>(params.getDraw(), total, total, data);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách đánh giá bản thân HTSV: resumeSeq={}, {}", params.getResumeSeq(), e.getMessage(), e);
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
    public void save(EvsEvsBySelfHtsvDto dto) {
        try {
            // Cập nhật EVS_SCORE cho từng item
            List<EvsItemSstDto> items = dto.getItems();
            if (items != null && !items.isEmpty()) {
                for (EvsItemSstDto item : items) {
                    mapper.updateEvsScore(item);
                }
                log.info("Đã cập nhật EVS_SCORE: evsObjectSeq={}, số items={}", dto.getEvsObjectSeq(), items.size());
            }

            // Lưu thành tích/hạn chế bản thân vào EVS_AFFIRM (AFFIRM_LEVEL=0)
            mapper.upsertAffirm(dto);
            log.info("Đã upsert EVS_AFFIRM LEVEL=0: evsObjectSeq={}", dto.getEvsObjectSeq());

            // Nếu flag='1' (Thực hiện) thì gọi stored procedure chuyển trạng thái
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
            log.error("Lỗi khi lưu đánh giá bản thân HTSV: evsObjectSeq={}, flag={}, {}",
                    dto.getEvsObjectSeq(), dto.getFlag(), e.getMessage(), e);
            throw e instanceof RuntimeException ? (RuntimeException) e : new RuntimeException(e);
        }
    }
}
