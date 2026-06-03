package com.ait.hrm.empinfo.service.impl;

import com.ait.hrm.empinfo.mapper.HrEmergencyAddressMapper;
import com.ait.hrm.empinfo.mapper.HrFamilyMapper;
import com.ait.hrm.empinfo.model.HrEmergencyAddress;
import com.ait.hrm.empinfo.model.HrFamily;
import com.ait.hrm.empinfo.service.HrFamilyService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class HrFamilyServiceImpl implements HrFamilyService {

    @Autowired
    private HrFamilyMapper hrFamilyMapper;

    @Autowired
    private HrEmergencyAddressMapper hrEmergencyAddressMapper;

    @Override
    public List<HrFamily> searchFamily(String empId, String personId, String localName, String famName) {
        return hrFamilyMapper.searchFamily(empId, personId, localName, famName);
    }

    @Override
    public HrFamily getById(Long familyNo) {
        return hrFamilyMapper.getById(familyNo);
    }

    @Override
    @Transactional
    public boolean saveFamily(HrFamily info, boolean isNew) {
        boolean success;
        if (isNew) {
            info.setActivity(1); // Mặc định activity là 1 khi thêm mới
            success = hrFamilyMapper.insert(info) > 0;
        } else {
            success = hrFamilyMapper.update(info) > 0;
        }

        if (success) {
            handleEmergencyAddress(info);
        }
        return success;
    }

    private void handleEmergencyAddress(HrFamily info) {
        if (info.getPersonId() == null || info.getFamName() == null) {
            return;
        }

        if ("Y".equals(info.getEmergencyContactYn())) {
            List<HrEmergencyAddress> existingList = hrEmergencyAddressMapper.findByPersonAndName(info.getPersonId(),
                    info.getFamName());

            if (existingList != null && !existingList.isEmpty()) {
                // Đã tồn tại -> Cập nhật và active
                for (HrEmergencyAddress addr : existingList) {
                    addr.setActivity(1);
                    addr.setEmerPhone(info.getFamPhone());
                    addr.setEmerAddress(info.getFamAddress());
                    addr.setEmerEmail(info.getFamEmail());
                    addr.setEmerTypeCode(info.getFamTypeCode());
                    hrEmergencyAddressMapper.update(addr);
                }
            } else {
                // Chưa tồn tại -> Thêm mới
                HrEmergencyAddress newAddr = new HrEmergencyAddress();
                newAddr.setPersonId(info.getPersonId());
                newAddr.setEmerName(info.getFamName());
                newAddr.setEmerPhone(info.getFamPhone());
                newAddr.setEmerAddress(info.getFamAddress());
                newAddr.setEmerEmail(info.getFamEmail());
                newAddr.setEmerTypeCode(info.getFamTypeCode());
                newAddr.setActivity(1);
                newAddr.setIsEmergencyAddress("1"); // Đánh dấu là địa chỉ khẩn cấp

                hrEmergencyAddressMapper.insert(newAddr);
            }
        } else if ("N".equals(info.getEmergencyContactYn())) {
            // Nếu không là liên hệ khẩn cấp -> Tìm và deactivate
            List<HrEmergencyAddress> existingList = hrEmergencyAddressMapper.findByPersonAndName(info.getPersonId(),
                    info.getFamName());
            if (existingList != null) {
                for (HrEmergencyAddress addr : existingList) {
                    addr.setActivity(0);
                    hrEmergencyAddressMapper.update(addr);
                }
            }
        }
    }

    @Override
    @Transactional
    public boolean deleteFamily(Long familyNo) {
        return hrFamilyMapper.delete(familyNo) > 0;
    }
}
