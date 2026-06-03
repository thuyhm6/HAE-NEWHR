package com.ait.hrm.empinfo.service.impl;

import com.ait.hrm.empinfo.mapper.HrQualificationMapper;
import com.ait.hrm.empinfo.model.HrQualification;
import com.ait.hrm.empinfo.service.HrQualificationService;
import com.ait.sy.sys.service.HrAuthenticationService.HrUserInfo;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpSession;
import java.util.List;

@Service
@Transactional
public class HrQualificationServiceImpl implements HrQualificationService {
    private static final Logger log = LoggerFactory.getLogger(HrQualificationServiceImpl.class);

    @Autowired
    private HrQualificationMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public List<HrQualification> searchQualification(String empId, String localName, String qualName) {
        return mapper.searchQualification(empId, localName, qualName);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HrQualification> getByPersonId(String personId) {
        return mapper.getByPersonId(personId);
    }

    @Override
    public boolean saveQualification(HrQualification info, boolean isNew) {
        // Lấy thông tin người thực hiện từ Session
        try {
            ServletRequestAttributes attr = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
            HttpSession session = attr.getRequest().getSession();
            HrUserInfo user = (HrUserInfo) session.getAttribute("currentHrUser");
            String username = (user != null) ? user.getUsername() : "SYSTEM";
            String ip = attr.getRequest().getRemoteAddr();

            if (isNew || info.getQualNo() == null) {
                info.setCreatedBy(username);
                info.setCreatedIp(ip);
                info.setActivity(1);
                return mapper.insert(info) > 0;
            } else {
                info.setUpdatedBy(username);
                info.setUpdatedIp(ip);
                return mapper.update(info) > 0;
            }
        } catch (Exception e) {
            log.error("Failed to save qualification qualNo={}", info.getQualNo(), e);
            return false;
        }
    }

    @Override
    public boolean deleteQualification(Long qualNo) {
        return mapper.delete(qualNo) > 0;
    }

    @Override
    @Transactional(readOnly = true)
    public HrQualification getById(Long qualNo) {
        return mapper.getById(qualNo);
    }
}
