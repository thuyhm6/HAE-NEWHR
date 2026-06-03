package com.ait.evs.manage.service.impl;

import com.ait.evs.manage.dto.EvsAffirmorSetupDto;
import com.ait.evs.manage.mapper.EvsAffirmorSetupMapper;
import com.ait.evs.manage.service.EvsAffirmorSetupService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EvsAffirmorSetupServiceImpl implements EvsAffirmorSetupService {

    private static final Logger log = LoggerFactory.getLogger(EvsAffirmorSetupServiceImpl.class);

    @Autowired
    private EvsAffirmorSetupMapper mapper;

    @Override
    public List<EvsAffirmorSetupDto> getList(EvsAffirmorSetupDto params) {
        try {
            return mapper.selectList(params);
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách đối tượng đánh giá: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public List<EvsAffirmorSetupDto> searchEmployee(EvsAffirmorSetupDto params) {
        try {
            return mapper.searchEmployee(params);
        } catch (Exception e) {
            log.error("Lỗi khi tìm kiếm nhân viên: keyword={}, {}", params.getAffirmorKeyword(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void saveBatch(List<EvsAffirmorSetupDto> list) {
        // Bước 1: Cập nhật người đánh giá level 1 và 2 qua PR_MODIFY_AFFIRM_INFO
        try {
            for (EvsAffirmorSetupDto dto : list) {
                dto.setAffirmLevel("1");
                dto.setPersonIdAffirm(dto.getPersonId1());
                dto.setMessage(null);
                mapper.callModifyAffirmInfo(dto);
                log.info("PR_MODIFY_AFFIRM_INFO level=1: seq={}, message={}", dto.getSeq(), dto.getMessage());
                if (dto.getMessage() != null && !dto.getMessage().isEmpty()) {
                    throw new RuntimeException("Người đánh giá lần 1: " + dto.getMessage());
                }

                dto.setAffirmLevel("2");
                dto.setPersonIdAffirm(dto.getPersonId2());
                dto.setMessage(null);
                mapper.callModifyAffirmInfo(dto);
                log.info("PR_MODIFY_AFFIRM_INFO level=2: seq={}, message={}", dto.getSeq(), dto.getMessage());
                if (dto.getMessage() != null && !dto.getMessage().isEmpty()) {
                    throw new RuntimeException("Người đánh giá lần 2: " + dto.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("Lỗi khi cập nhật người đánh giá: {}", e.getMessage(), e);
            throw e instanceof RuntimeException ? (RuntimeException) e : new RuntimeException(e);
        }

        // Bước 2: Cập nhật EVS_OBJECT sau khi người đánh giá đã lưu thành công
        try {
            for (EvsAffirmorSetupDto dto : list) {
                mapper.updateEvsObject(dto);
                log.info("Cập nhật EVS_OBJECT: seq={}", dto.getSeq());
            }
        } catch (Exception e) {
            log.error("Lưu người đánh giá thành công nhưng lưu đối tượng đánh giá thất bại: {}", e.getMessage(), e);
            throw new RuntimeException("Lưu người đánh giá thành công nhưng lưu đối tượng đánh giá thất bại: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void addObject(EvsAffirmorSetupDto dto) {
        try {
            // 1. Gọi stored procedure thêm đối tượng đánh giá
            dto.setMessage(null);
            mapper.callAddEvsObject(dto);
            log.info("PR_ADD_EVS_OBJECT: resumeSeq={}, personId={}, message={}",
                    dto.getResumeSeq(), dto.getPersonId(), dto.getMessage());
            if (dto.getMessage() != null && !dto.getMessage().isEmpty()) {
                throw new RuntimeException(dto.getMessage());
            }

            // 2. Lấy SEQ của đối tượng vừa thêm
            String objSeq = mapper.selectNewObjSeq(dto);
            if (objSeq == null) {
                throw new RuntimeException("Không tìm thấy đối tượng đánh giá vừa thêm.");
            }
            dto.setSeq(objSeq);
            log.info("Đối tượng mới: seq={}", objSeq);

            // 3. Lưu người đánh giá theo từng level (chỉ level nào có personId)
            String[] personIds = {dto.getPersonId1(), dto.getPersonId2(), dto.getPersonId3(), dto.getPersonId4()};
            for (int i = 0; i < personIds.length; i++) {
                if (personIds[i] != null && !personIds[i].isEmpty()) {
                    dto.setAffirmLevel(String.valueOf(i + 1));
                    dto.setPersonIdAffirm(personIds[i]);
                    dto.setMessage(null);
                    mapper.callModifyAffirmInfo(dto);
                    log.info("PR_MODIFY_AFFIRM_INFO: objSeq={}, level={}, message={}",
                            objSeq, i + 1, dto.getMessage());
                    if (dto.getMessage() != null && !dto.getMessage().isEmpty()) {
                        throw new RuntimeException("Lần " + (i + 1) + ": " + dto.getMessage());
                    }
                }
            }
        } catch (Exception e) {
            log.error("Lỗi khi thêm đối tượng đánh giá: resumeSeq={}, personId={}, {}",
                    dto.getResumeSeq(), dto.getPersonId(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public void evsStart(EvsAffirmorSetupDto dto) {
        try {
            dto.setMessage(null);
            mapper.callEvsStart(dto);
            log.info("PR_EVS_START: resumeSeq={}, message={}", dto.getResumeSeq(), dto.getMessage());
            if (dto.getMessage() != null && !dto.getMessage().isEmpty()) {
                throw new RuntimeException(dto.getMessage());
            }
        } catch (Exception e) {
            log.error("Lỗi khi bắt đầu đánh giá: resumeSeq={}, {}", dto.getResumeSeq(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public void createTarget(EvsAffirmorSetupDto dto) {
        try {
            dto.setMessage(null);
            mapper.callCreateEvsTarget(dto);
            log.info("PR_CREATE_EVS_TARGET: resumeSeq={}, message={}", dto.getResumeSeq(), dto.getMessage());
            if (dto.getMessage() != null && !dto.getMessage().isEmpty()) {
                throw new RuntimeException(dto.getMessage());
            }
        } catch (Exception e) {
            log.error("Lỗi khi tạo mục tiêu: resumeSeq={}, {}", dto.getResumeSeq(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public void deleteObjects(List<String> seqList) {
        try {
            mapper.deleteObjects(seqList);
            log.info("Xóa {} đối tượng đánh giá: seqList={}", seqList.size(), seqList);
        } catch (Exception e) {
            log.error("Lỗi khi xóa đối tượng đánh giá: seqList={}, {}", seqList, e.getMessage(), e);
            throw e;
        }
    }
}
