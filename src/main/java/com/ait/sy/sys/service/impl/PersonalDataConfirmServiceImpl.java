package com.ait.sy.sys.service.impl;

import com.ait.hrm.empinfo.mapper.HrEmployeeMapper;
import com.ait.sy.syRole.mapper.SyUserMapper;
import com.ait.sy.sys.dto.PersonalDataConfirmInfoDTO;
import com.ait.sy.sys.service.PersonalDataConfirmService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class PersonalDataConfirmServiceImpl implements PersonalDataConfirmService {

    private static final Logger log = LoggerFactory.getLogger(PersonalDataConfirmServiceImpl.class);

    @Autowired
    private HrEmployeeMapper hrEmployeeMapper;

    @Autowired
    private SyUserMapper syUserMapper;

    @Override
    public PersonalDataConfirmInfoDTO getConfirmInfo(String personId) {
        try {
            PersonalDataConfirmInfoDTO info = hrEmployeeMapper.findPersonalDataConfirmInfo(personId);
            if (info == null) {
                log.warn("Khong tim thay thong tin nhan vien cho popup xac nhan du lieu ca nhan, personId={}",
                        personId);
            }
            return info;
        } catch (Exception e) {
            log.error("Loi khi lay thong tin popup xac nhan du lieu ca nhan cho personId={}", personId, e);
            throw new RuntimeException("Loi he thong khi lay thong tin xac nhan du lieu ca nhan.", e);
        }
    }

    @Override
    public boolean confirmPersonalData(String userNo) {
        try {
            int result = syUserMapper.confirmPersonalData(userNo);
            log.info("Da ghi nhan xac nhan dong y xu ly du lieu ca nhan cho userNo={}, result={}", userNo, result);
            return result > 0;
        } catch (Exception e) {
            log.error("Loi khi ghi nhan xac nhan dong y xu ly du lieu ca nhan cho userNo={}", userNo, e);
            throw new RuntimeException("Loi he thong khi xac nhan dong y xu ly du lieu ca nhan.", e);
        }
    }
}
