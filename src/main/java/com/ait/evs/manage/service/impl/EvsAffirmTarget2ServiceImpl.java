package com.ait.evs.manage.service.impl;

import com.ait.evs.manage.dto.EvsAffirmTarget2Dto;
import com.ait.evs.manage.dto.EvsItemSstDto;
import com.ait.evs.manage.dto.EvsPersonalTargetDto;
import com.ait.evs.manage.mapper.EvsAffirmTarget2Mapper;
import com.ait.evs.manage.service.EvsAffirmTarget2Service;
import com.ait.sy.sys.dto.DataTablesResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class EvsAffirmTarget2ServiceImpl implements EvsAffirmTarget2Service {

    private static final Logger log = LoggerFactory.getLogger(EvsAffirmTarget2ServiceImpl.class);

    @Autowired
    private EvsAffirmTarget2Mapper mapper;

    @Override
    public DataTablesResponse<EvsAffirmTarget2Dto> getObjectList(EvsAffirmTarget2Dto params) {
        try {
            int total = mapper.countList(params);
            List<EvsAffirmTarget2Dto> data = mapper.selectListPage(params);
            return new DataTablesResponse<>(params.getDraw(), total, total, data);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách đánh giá lần 2: resumeSeq={}, {}", params.getResumeSeq(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public List<Map<String, Object>> getGradeSummary(EvsAffirmTarget2Dto params) {
        try {
            return mapper.selectGradeSummary(params);
        } catch (Exception e) {
            log.error("Lỗi khi lấy thống kê cấp đánh giá lần 2: resumeSeq={}, {}", params.getResumeSeq(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void saveBatch(EvsAffirmTarget2Dto dto) {
        try {
            if (dto.getItems() == null || dto.getItems().isEmpty()) return;
            String affirmLevel = (dto.getAffirmLevel() != null && !dto.getAffirmLevel().isEmpty())
                    ? dto.getAffirmLevel() : "2";
            for (EvsAffirmTarget2Dto item : dto.getItems()) {
                item.setAffirmLevel(affirmLevel);
                mapper.updateAffirm(item);
                log.info("Cập nhật EVS_AFFIRM lần 2: seq={}, evsPoint={}, evsGrade={}",
                        item.getSeq(), item.getEvsPoint(), item.getEvsGrade());
            }
        } catch (Exception e) {
            log.error("Lỗi khi lưu đánh giá lần 2: resumeSeq={}, {}", dto.getResumeSeq(), e.getMessage(), e);
            throw e instanceof RuntimeException ? (RuntimeException) e : new RuntimeException(e);
        }
    }

    @Override
    public EvsPersonalTargetDto getObjectInfoBySeq(String evsObjectSeq) {
        try {
            EvsPersonalTargetDto params = new EvsPersonalTargetDto();
            params.setSeq(evsObjectSeq);
            return mapper.selectObjectInfoBySeq(params);
        } catch (Exception e) {
            log.error("Lỗi khi lấy thông tin đối tượng (lần 2): evsObjectSeq={}, {}", evsObjectSeq, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public List<EvsItemSstDto> getItemList(String evsObjectSeq) {
        try {
            EvsItemSstDto params = new EvsItemSstDto();
            params.setEvsObjectSeq(evsObjectSeq);
            return mapper.selectItemListByObjectSeq(params);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách item (lần 2): evsObjectSeq={}, {}", evsObjectSeq, e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void saveDetail(EvsAffirmTarget2Dto dto) {
        try {
            if (dto.getItemScores() != null) {
                for (EvsItemSstDto item : dto.getItemScores()) {
                    mapper.updateItemScore2(item);
                    log.info("Cập nhật EVS_SCORE2: itemSeq={}, score2={}", item.getSeq(), item.getEvsScore2());
                }
            }
            dto.setAffirmLevel("2");
            mapper.updateAffirm(dto);
            log.info("Cập nhật EVS_AFFIRM lần 2 (lưu tạm): seq={}, evsPoint={}, evsGrade={}",
                    dto.getSeq(), dto.getEvsPoint(), dto.getEvsGrade());
        } catch (Exception e) {
            log.error("Lỗi khi lưu chi tiết đánh giá lần 2: seq={}, {}", dto.getSeq(), e.getMessage(), e);
            throw e instanceof RuntimeException ? (RuntimeException) e : new RuntimeException(e);
        }
    }

    @Override
    @Transactional
    public void confirmDetail(EvsAffirmTarget2Dto dto) {
        try {
            saveDetail(dto);
            dto.setFlag("1");
            mapper.callModifyObjectActivity(dto);
            log.info("PR_MODIFY_OBJECT_ACTIVITY lần 2 (xác nhận): seq={}, flag=1, message={}", dto.getSeq(), dto.getMessage());
            if (dto.getMessage() != null && !dto.getMessage().isEmpty()) {
                throw new RuntimeException(dto.getMessage());
            }
        } catch (Exception e) {
            log.error("Lỗi khi xác nhận đánh giá lần 2: seq={}, {}", dto.getSeq(), e.getMessage(), e);
            throw e instanceof RuntimeException ? (RuntimeException) e : new RuntimeException(e);
        }
    }

    @Override
    @Transactional
    public void rejectDetail(EvsAffirmTarget2Dto dto) {
        try {
            dto.setFlag("0");
            mapper.callModifyObjectActivity(dto);
            log.info("PR_MODIFY_OBJECT_ACTIVITY lần 2 (từ chối): seq={}, flag=0, message={}", dto.getSeq(), dto.getMessage());
            if (dto.getMessage() != null && !dto.getMessage().isEmpty()) {
                throw new RuntimeException(dto.getMessage());
            }
        } catch (Exception e) {
            log.error("Lỗi khi từ chối đánh giá lần 2: seq={}, {}", dto.getSeq(), e.getMessage(), e);
            throw e instanceof RuntimeException ? (RuntimeException) e : new RuntimeException(e);
        }
    }

    @Override
    @Transactional
    public void executeActivity(EvsAffirmTarget2Dto dto) {
        try {
            saveBatch(dto);
            String affirmLevel = (dto.getAffirmLevel() != null && !dto.getAffirmLevel().isEmpty()) ? dto.getAffirmLevel() : "2";
            dto.setAffirmLevel(affirmLevel);
            List<String> seqs = mapper.selectAllObjectSeqs(dto);

            if (dto.getItems() == null || dto.getItems().isEmpty()) return;
            log.info("Thực hiện PKG_EVS_PROCESS.PR_MODIFY_OBJECT_ACTIVITY lần 2: resumeSeq={}, totalSeqs={}", dto.getResumeSeq(), seqs.size());
            for (EvsAffirmTarget2Dto item : dto.getItems()) {
                EvsAffirmTarget2Dto procDto = new EvsAffirmTarget2Dto();
                procDto.setSeq(item.getSeq());
                procDto.setFlag("1");
                mapper.callModifyObjectActivity(procDto);
                if (procDto.getMessage() != null && !procDto.getMessage().isEmpty()) {
                    log.warn("PR_MODIFY_OBJECT_ACTIVITY lần 2: seq={}, message={}", item.getSeq(), procDto.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("Lỗi khi thực hiện đánh giá lần 2: resumeSeq={}, {}", dto.getResumeSeq(), e.getMessage(), e);
            throw e instanceof RuntimeException ? (RuntimeException) e : new RuntimeException(e);
        }
    }
}
