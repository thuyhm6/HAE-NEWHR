package com.ait.edu.trainEducation.service.impl;

import com.ait.edu.trainEducation.mapper.EduTrainingRegisterMapper;
import com.ait.edu.trainEducation.model.EduTrainingRegister;
import com.ait.edu.trainEducation.model.EduTrainingRegisterRequest;
import com.ait.edu.trainEducation.service.EduTrainingRegisterService;
import com.ait.edu.trainEducation.util.EduCurrentUser;
import com.ait.ess.empinfo.dto.EssPersonalInfoDto;
import com.ait.ess.empinfo.mapper.EssPersonalInfoMapper;
import com.ait.exception.BusinessException;
import com.ait.sy.syAffirm.dto.SyAffirmEmailDto;
import com.ait.sy.syAffirm.mapper.SyAffirmEmailMapper;
import com.ait.sy.syAffirm.service.SyAffirmEmailService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Collections;
import java.util.Date;
import java.util.List;

@Service
public class EduTrainingRegisterServiceImpl implements EduTrainingRegisterService {
    private static final Logger log = LoggerFactory.getLogger(EduTrainingRegisterServiceImpl.class);

    @Autowired
    private EduTrainingRegisterMapper eduTrainingRegisterMapper;

    /** Tái sử dụng insert SY_AFFIRM_EMAIL dùng chung của các đơn ESS. */
    @Autowired
    private SyAffirmEmailMapper syAffirmEmailMapper;

    @Autowired
    private SyAffirmEmailService syAffirmEmailService;

    @Autowired
    private EssPersonalInfoMapper essPersonalInfoMapper;

    @Override
    @Transactional(readOnly = true)
    public List<EduTrainingRegister> findMyList(String trainingType) {
        log.info("Lay danh sach dang ky dao tao, trainingType={}", trainingType);
        try {
            return eduTrainingRegisterMapper.findMyList(trimToNull(trainingType));
        } catch (Exception e) {
            log.error("Loi khi lay danh sach dang ky dao tao, trainingType={}", trainingType, e);
            throw e;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<SyAffirmEmailDto> findDefaultApprovers() {
        String personId = EduCurrentUser.personId();
        log.info("Lay nguoi phe duyet mac dinh dang ky dao tao, personId={}", personId);
        if (personId == null || personId.isEmpty()) {
            return Collections.emptyList();
        }
        try {
            List<SyAffirmEmailDto> list = syAffirmEmailService.findAffirmorList(APPLY_TYPE, personId, APPLY_TYPE, "0");
            return list != null ? list : Collections.emptyList();
        } catch (Exception e) {
            // Chưa cấu hình người duyệt cho loại đơn này -> người dùng tự thêm (giống bản gốc)
            log.warn("Khong lay duoc nguoi phe duyet mac dinh, personId={}: {}", personId, e.getMessage());
            return Collections.emptyList();
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public String apply(EduTrainingRegisterRequest request) throws BusinessException {
        String personId = EduCurrentUser.personId();
        log.info("Dang ky dao tao, personId={}, approvers={}", personId,
                request.getApprovers() != null ? request.getApprovers().size() : 0);
        try {
            if (personId == null || personId.isEmpty()) {
                throw new BusinessException(ERR_NO_EMPLOYEE, "Tài khoản đăng nhập không gắn với nhân viên.");
            }
            if (request.getApprovers() == null || request.getApprovers().isEmpty()) {
                throw new BusinessException(ERR_NO_APPROVER, "Xin thiết lập người duyệt");
            }
            validateDates(request.getStartDate(), request.getEndDate());

            String applyNo = String.valueOf(eduTrainingRegisterMapper.nextApplyNo());
            eduTrainingRegisterMapper.insert(applyNo, AFFIRM_FLAG_APPLY, request);

            EssPersonalInfoDto me = essPersonalInfoMapper.findMyInfo(personId);
            String localName = me != null ? safe(me.getLocalName()) : safe(EduCurrentUser.name());
            String lastName = " Training Application (" + localName + ")[Date："
                    + new SimpleDateFormat("yyyy.MM.dd").format(new Date()) + "]";
            String applyPersonInfo = me != null
                    ? localName + "/" + safe(me.getPostGradeName()) + "/" + safe(me.getDeptName())
                    : localName;

            // Cấp 0: người nộp đơn (AFFIRM_TYPE = 4)
            syAffirmEmailMapper.insert(affirm(applyNo, personId, "0", "4", lastName, applyPersonInfo));
            // Các cấp phê duyệt theo thứ tự người dùng sắp xếp
            int level = 1;
            for (EduTrainingRegisterRequest.Approver a : request.getApprovers()) {
                String type = a.getAffirmType() == null || a.getAffirmType().isEmpty() ? "1" : a.getAffirmType();
                syAffirmEmailMapper.insert(
                        affirm(applyNo, a.getPersonId(), String.valueOf(level++), type, lastName, applyPersonInfo));
            }
            log.info("Dang ky dao tao thanh cong, applyNo={}", applyNo);
            return applyNo;
        } catch (BusinessException e) {
            log.warn("Dang ky dao tao that bai: {}", e.getUserMessage());
            throw e;
        } catch (Exception e) {
            log.error("Loi khi dang ky dao tao, personId={}", personId, e);
            throw e;
        }
    }

    private static SyAffirmEmailDto affirm(String applyNo, String affirmPersonId, String level, String type,
            String lastName, String applyPersonInfo) {
        SyAffirmEmailDto dto = new SyAffirmEmailDto();
        dto.setApplyNo(applyNo);
        dto.setApplyType(APPLY_TYPE);
        dto.setApplyTypeCode(APPLY_TYPE);
        dto.setApplyAffirmFlag(AFFIRM_FLAG_APPLY);
        dto.setApplyFlag("0");
        dto.setAffirmPersonId(affirmPersonId);
        dto.setAffirmLevel(level);
        dto.setAffirmType(type);
        dto.setLastName(lastName);
        dto.setApplyPersonInfo(applyPersonInfo);
        return dto;
    }

    private static void validateDates(String start, String end) throws BusinessException {
        Date s = parse(start);
        Date e = parse(end);
        if (s != null && e != null && s.after(e)) {
            throw new BusinessException(ERR_INVALID_DATE, "Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.");
        }
    }

    private static Date parse(String value) throws BusinessException {
        if (value == null || value.isEmpty()) {
            return null;
        }
        SimpleDateFormat f = new SimpleDateFormat("dd/MM/yyyy");
        f.setLenient(false);
        try {
            return f.parse(value);
        } catch (ParseException ex) {
            throw new BusinessException(ERR_INVALID_DATE, "Ngày không hợp lệ: " + value);
        }
    }

    private static String trimToNull(String v) {
        return v == null || v.trim().isEmpty() ? null : v.trim();
    }

    private static String safe(Object v) {
        return v == null ? "" : v.toString();
    }
}
