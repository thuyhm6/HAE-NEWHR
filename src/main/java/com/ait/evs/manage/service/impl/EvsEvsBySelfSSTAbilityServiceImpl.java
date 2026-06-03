package com.ait.evs.manage.service.impl;

import com.ait.evs.manage.dto.EvsEvsBySelfSSTAbilityDto;
import com.ait.evs.manage.dto.EvsItemAbilityDto;
import com.ait.evs.manage.mapper.EvsEvsBySelfSSTAbilityMapper;
import com.ait.evs.manage.service.EvsEvsBySelfSSTAbilityService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EvsEvsBySelfSSTAbilityServiceImpl implements EvsEvsBySelfSSTAbilityService {

    private static final Logger log = LoggerFactory.getLogger(EvsEvsBySelfSSTAbilityServiceImpl.class);

    @Autowired
    private EvsEvsBySelfSSTAbilityMapper mapper;

    @Override
    public List<EvsItemAbilityDto> getItemList(EvsEvsBySelfSSTAbilityDto params) {
        try {
            return mapper.selectItemList(params);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách năng lực: resumeSeq={}, {}", params.getResumeSeq(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void save(EvsEvsBySelfSSTAbilityDto dto) {
        try {
            // 1. Upsert điểm tự đánh giá vào EVS_ITEM_SCORE cho từng hạng mục
            List<EvsItemAbilityDto> items = dto.getItems();
            if (items != null && !items.isEmpty()) {
                for (EvsItemAbilityDto item : items) {
                    item.setEvsObjectSeq(dto.getEvsObjectSeq());
                    item.setResumeSeq(dto.getResumeSeq());
                    mapper.upsertItemScore(item);
                }
                log.info("Đã upsert EVS_ITEM_SCORE: evsObjectSeq={}, số items={}", dto.getEvsObjectSeq(), items.size());
            }

            // 2. Đảm bảo EVS_AFFIRM LEVEL=0 tồn tại (chưa tính điểm) để upsertItemScore có thể join được
            mapper.upsertAffirm(dto);
            log.info("Đã upsert EVS_AFFIRM LEVEL=0 lần 1 (tạo record): evsObjectSeq={}", dto.getEvsObjectSeq());

            // 3. Tính lại EVS_POINT và EVS_GRADE sau khi EVS_ITEM_SCORE đã có điểm mới nhất
            mapper.upsertAffirm(dto);
            log.info("Đã upsert EVS_AFFIRM LEVEL=0 lần 2 (cập nhật EVS_POINT/EVS_GRADE): evsObjectSeq={}", dto.getEvsObjectSeq());

            // 4. Nếu flag='1' (Thực hiện), gọi stored procedure chuyển trạng thái
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
            log.error("Lỗi khi lưu đánh giá năng lực bản thân SST: evsObjectSeq={}, flag={}, {}",
                    dto.getEvsObjectSeq(), dto.getFlag(), e.getMessage(), e);
            throw e instanceof RuntimeException ? (RuntimeException) e : new RuntimeException(e);
        }
    }
}
