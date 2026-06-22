package com.ait.ess.empinfo.service.impl;

import com.ait.ess.empinfo.dto.EssApplyInfoDto;
import com.ait.ess.empinfo.dto.EssFileDto;
import com.ait.ess.empinfo.dto.EssPersonalInfoDto;
import com.ait.ess.empinfo.dto.HrAddressMattersApplyDto;
import com.ait.ess.empinfo.dto.HrEducationApplyDto;
import com.ait.ess.empinfo.dto.HrEmergencyAddressApplyDto;
import com.ait.ess.empinfo.dto.HrQualificationApplyDto;
import com.ait.ess.empinfo.dto.HrFamilyApplyDto;
import com.ait.ess.empinfo.dto.HrPersonalInfoApplyDto;
import com.ait.ess.empinfo.dto.HrWorkExperienceApplyDto;
import com.ait.ess.empinfo.mapper.EssFileMapper;
import com.ait.ess.empinfo.mapper.EssPersonalInfoMapper;
import com.ait.ess.empinfo.mapper.HrAddressMattersApplyMapper;
import com.ait.ess.empinfo.mapper.HrEducationApplyMapper;
import com.ait.ess.empinfo.mapper.HrEmergencyAddressApplyMapper;
import com.ait.ess.empinfo.mapper.HrQualificationApplyMapper;
import com.ait.ess.empinfo.mapper.HrFamilyApplyMapper;
import com.ait.ess.empinfo.mapper.HrPersonalInfoApplyMapper;
import com.ait.ess.empinfo.mapper.HrWorkExperienceApplyMapper;
import com.ait.ess.empinfo.service.EssPersonalInfoService;
import com.ait.hrm.empinfo.mapper.HrAddressMattersMapper;
import com.ait.hrm.empinfo.mapper.HrEmergencyAddressMapper;
import com.ait.hrm.empinfo.mapper.HrFamilyMapper;
import com.ait.hrm.empinfo.model.HrAddressMatters;
import com.ait.hrm.empinfo.model.HrEmergencyAddress;
import com.ait.hrm.empinfo.model.HrFamily;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
public class EssPersonalInfoServiceImpl implements EssPersonalInfoService {

    private static final Logger log = LoggerFactory.getLogger(EssPersonalInfoServiceImpl.class);

    @Value("${app.file.upload.path:D:/source/VHR/HAE_HR/resources/fileUpload}")
    private String fileUploadPath;

    @Autowired
    private EssPersonalInfoMapper essPersonalInfoMapper;

    @Autowired
    private HrAddressMattersMapper addressMapper;

    @Autowired
    private HrFamilyMapper familyMapper;

    @Autowired
    private HrEmergencyAddressMapper emergencyMapper;

    @Autowired
    private HrPersonalInfoApplyMapper personalInfoApplyMapper;

    @Autowired
    private HrAddressMattersApplyMapper hrAddressMattersApplyMapper;

    @Autowired
    private HrFamilyApplyMapper hrFamilyApplyMapper;

    @Autowired
    private HrEmergencyAddressApplyMapper hrEmergencyAddressApplyMapper;

    @Autowired
    private HrWorkExperienceApplyMapper hrWorkExperienceApplyMapper;

    @Autowired
    private HrEducationApplyMapper hrEducationApplyMapper;

    @Autowired
    private HrQualificationApplyMapper hrQualificationApplyMapper;

    @Autowired
    private EssFileMapper essFileMapper;

    @Override
    public EssPersonalInfoDto getMyInfo(String personId) {
        return essPersonalInfoMapper.findMyInfo(personId);
    }

    @Override
    public Object getApplyDetail(String applyNo, String applyTableType) {
        try {
            switch (applyTableType) {
                case "PERSONAL":     return personalInfoApplyMapper.selectByApplyNo(applyNo);
                case "ADDRESS":      return hrAddressMattersApplyMapper.selectByAddressNo(Long.parseLong(applyNo));
                case "FAMILY":       return hrFamilyApplyMapper.selectByApplyNo(applyNo);
                case "EMERGENCY":    return hrEmergencyAddressApplyMapper.selectByEmergencyNo(Long.parseLong(applyNo));
                case "WORK_EXP":     return hrWorkExperienceApplyMapper.selectByWorkExperNo(Long.parseLong(applyNo));
                case "EDUCATION":    return hrEducationApplyMapper.selectByApplyNo(applyNo);
                case "QUALIFICATION":return hrQualificationApplyMapper.selectByQualNo(Long.parseLong(applyNo));
                default:             return null;
            }
        } catch (Exception e) {
            log.error("Lỗi lấy chi tiết apply applyNo={} type={}", applyNo, applyTableType, e);
            return null;
        }
    }

    @Override
    public int countMyApplyList(EssApplyInfoDto dto) {
        try {
            return essPersonalInfoMapper.countMyApplyList(dto);
        } catch (Exception e) {
            log.error("Lỗi đếm danh sách apply của nhân viên personId={}", dto.getPersonId(), e);
            return 0;
        }
    }

    @Override
    public List<EssApplyInfoDto> getMyApplyListPage(EssApplyInfoDto dto) {
        try {
            return essPersonalInfoMapper.selectMyApplyListPage(dto);
        } catch (Exception e) {
            log.error("Lỗi lấy danh sách apply của nhân viên personId={}", dto.getPersonId(), e);
            return Collections.emptyList();
        }
    }

    @Override
    public List<HrAddressMatters> getMyAddresses(String personId) {
        return addressMapper.searchAddress(null, personId, null, null);
    }

    @Override
    public List<HrFamily> getMyFamilies(String personId) {
        return familyMapper.searchFamily(null, personId, null, null);
    }

    @Override
    public List<HrEmergencyAddress> getMyEmergencies(String personId) {
        return emergencyMapper.searchEmergencyAddress(null, personId, null, null);
    }

    @Override
    @Transactional
    public String savePersonalApply(HrPersonalInfoApplyDto dto, List<MultipartFile> files) throws Exception {
        Long seq = personalInfoApplyMapper.getNextPersonNoSeq();
        String personNo = String.valueOf(seq);
        dto.setPersonNo(personNo);
        dto.setActivity(1);
        if (dto.getApplyType() == null) {
            dto.setApplyType(2);
        }

        int inserted = personalInfoApplyMapper.insertPersonalInfoApply(dto);
        if (inserted <= 0) {
            throw new RuntimeException("Không thể lưu thông tin cá nhân apply");
        }
        log.info("Inserted HR_PERSONAL_INFO_APPLY personNo={} for personId={}", personNo, dto.getPersonId());

        if (files != null) {
            for (MultipartFile file : files) {
                if (file == null || file.isEmpty()) continue;
                saveFile(file, personNo, "HR_PERSONAL_INFO_APPLY");
            }
        }

        return personNo;
    }

    @Override
    @Transactional
    public String saveAddressApply(HrAddressMattersApplyDto dto, List<MultipartFile> files) throws Exception {
        Long addressNo = hrAddressMattersApplyMapper.getNextAddressNoSeq();
        dto.setAddressNo(addressNo);
        dto.setActivity(1);
        if (dto.getApplyType() == null) {
            dto.setApplyType(dto.getUpdateAddressNo() != null ? 2 : 1);
        }
        if (dto.getEssTypeCode() == null) {
            dto.setEssTypeCode("14013918");
        }

        int inserted = hrAddressMattersApplyMapper.insertAddressApply(dto);
        if (inserted <= 0) {
            throw new RuntimeException("Không thể lưu thông tin địa chỉ apply");
        }
        log.info("Inserted HR_ADDRESS_MATTERS_APPLY addressNo={} for personId={}", addressNo, dto.getPersonId());

        String applyNoForFile = String.valueOf(addressNo);
        if (files != null) {
            for (MultipartFile file : files) {
                if (file == null || file.isEmpty()) continue;
                saveFile(file, applyNoForFile, "HR_ADDRESS_MATTERS_APPLY");
            }
        }

        return applyNoForFile;
    }

    @Override
    @Transactional
    public String saveFamilyApply(HrFamilyApplyDto dto, List<MultipartFile> files) throws Exception {
        Long familyNo = hrFamilyApplyMapper.getNextFamilyNoSeq();
        dto.setFamilyNo(familyNo);
        dto.setActivity(1);
        if (dto.getApplyType() == null) {
            dto.setApplyType(dto.getUpdateFamilyNo() != null ? 2 : 1);
        }
        if (dto.getEssTypeCode() == null) {
            dto.setEssTypeCode("14013919");
        }
        if (dto.getEmergencyLiaisonOffice() == null) {
            dto.setEmergencyLiaisonOffice("N");
        }

        int inserted = hrFamilyApplyMapper.insertFamilyApply(dto);
        if (inserted <= 0) {
            throw new RuntimeException("Không thể lưu thông tin gia đình apply");
        }
        log.info("Inserted HR_FAMILY_APPLY familyNo={} for personId={}", familyNo, dto.getPersonId());

        String applyNoForFile = String.valueOf(familyNo);
        if (files != null) {
            for (MultipartFile file : files) {
                if (file == null || file.isEmpty()) continue;
                saveFile(file, applyNoForFile, "HR_FAMILY_APPLY");
            }
        }

        return applyNoForFile;
    }

    @Override
    @Transactional
    public String saveEmergencyApply(HrEmergencyAddressApplyDto dto, List<MultipartFile> files) throws Exception {
        dto.setActivity(1);
        if (dto.getApplyType() == null) {
            dto.setApplyType(dto.getUpdateEmergencyNo() != null ? 2 : 1);
        }
        if (dto.getEssTypeCode() == null) {
            dto.setEssTypeCode("14013920");
        }

        Long emergencyNoLong = hrEmergencyAddressApplyMapper.selectEmergencyNextval();
        dto.setEmergencyNo(emergencyNoLong);

        int inserted = hrEmergencyAddressApplyMapper.insertEmergencyApply(dto);
        if (inserted <= 0) {
            throw new RuntimeException("Không thể lưu thông tin người liên hệ khẩn cấp apply");
        }
        String emergencyNo = String.valueOf(emergencyNoLong);
        log.info("Inserted HR_EMERGENCY_ADDRESS_APPLY emergencyNo={} for personId={}", emergencyNo, dto.getPersonId());

        // ESS_FILE.APPLY_NO = EMERGENCY_NO của HR_EMERGENCY_ADDRESS_APPLY
        if (files != null) {
            for (MultipartFile file : files) {
                if (file == null || file.isEmpty()) continue;
                saveFile(file, emergencyNo, "HR_EMERGENCY_ADDRESS_APPLY");
            }
        }

        return emergencyNo;
    }

    @Override
    @Transactional
    public String saveWorkExperienceApply(HrWorkExperienceApplyDto dto, List<MultipartFile> files) throws Exception {
        dto.setActivity(1);
        if (dto.getApplyType() == null) {
            dto.setApplyType(dto.getUpdateWorkExperNo() != null ? 2 : 1);
        }
        if (dto.getEssTypeCode() == null) {
            dto.setEssTypeCode("14013921");
        }

        Long workExperNoLong = hrWorkExperienceApplyMapper.selectWorkExperNextval();
        dto.setWorkExperNo(workExperNoLong);

        int inserted = hrWorkExperienceApplyMapper.insertWorkExperienceApply(dto);
        if (inserted <= 0) {
            throw new RuntimeException("Không thể lưu kinh nghiệm làm việc apply");
        }
        String workExperNo = String.valueOf(workExperNoLong);
        log.info("Inserted HR_WORK_EXPERIENCE_APPLY workExperNo={} for personId={}", workExperNo, dto.getPersonId());

        if (files != null) {
            for (MultipartFile file : files) {
                if (file == null || file.isEmpty()) continue;
                saveFile(file, workExperNo, "HR_WORK_EXPERIENCE_APPLY");
            }
        }

        return workExperNo;
    }

    @Override
    @Transactional
    public String saveEducationApply(HrEducationApplyDto dto, List<MultipartFile> files) throws Exception {
        dto.setActivity(1);
        if (dto.getApplyType() == null) {
            dto.setApplyType(dto.getUpdateEducNo() != null ? 2 : 1);
        }
        if (dto.getEssTypeCode() == null) {
            dto.setEssTypeCode("14013923");
        }

        Long educNoLong = hrEducationApplyMapper.selectEducNextval();
        dto.setEducNo(educNoLong);

        int inserted = hrEducationApplyMapper.insertEducationApply(dto);
        if (inserted <= 0) {
            throw new RuntimeException("Không thể lưu thông tin học vấn apply");
        }
        String educNo = String.valueOf(educNoLong);
        log.info("Inserted HR_EDUCATION_APPLY educNo={} for personId={}", educNo, dto.getPersonId());

        if (files != null) {
            for (MultipartFile file : files) {
                if (file == null || file.isEmpty()) continue;
                saveFile(file, educNo, "HR_EDUCATION_APPLY");
            }
        }

        return educNo;
    }

    @Override
    @Transactional
    public String saveQualificationApply(HrQualificationApplyDto dto, List<MultipartFile> files) throws Exception {
        dto.setActivity(1);
        if (dto.getApplyType() == null) {
            dto.setApplyType(dto.getUpdateQualNo() != null ? 2 : 1);
        }
        if (dto.getEssTypeCode() == null) {
            dto.setEssTypeCode("14013924");
        }

        Long qualNoLong = hrQualificationApplyMapper.selectQualNextval();
        dto.setQualNo(qualNoLong);

        int inserted = hrQualificationApplyMapper.insertQualificationApply(dto);
        if (inserted <= 0) {
            throw new RuntimeException("Không thể lưu thông tin chứng chỉ apply");
        }
        String qualNo = String.valueOf(qualNoLong);
        log.info("Inserted HR_QUALIFICATION_APPLY qualNo={} for personId={}", qualNo, dto.getPersonId());

        if (files != null) {
            for (MultipartFile file : files) {
                if (file == null || file.isEmpty()) continue;
                saveFile(file, qualNo, "HR_QUALIFICATION_APPLY");
            }
        }

        return qualNo;
    }

    private void saveFile(MultipartFile file, String applyNo, String applyType) throws IOException {
        Path uploadDir = Paths.get(fileUploadPath);
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        String rawName = file.getOriginalFilename();
        String originalName = StringUtils.cleanPath(rawName != null ? rawName : "file");
        String ext = "";
        int dotIdx = originalName.lastIndexOf('.');
        if (dotIdx >= 0) ext = originalName.substring(dotIdx);

        String storedName = UUID.randomUUID().toString() + ext;
        Path target = uploadDir.resolve(storedName);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        log.info("Saved uploaded file: {} -> {}", originalName, target);

        EssFileDto fileDto = new EssFileDto();
        fileDto.setFileNo(storedName);
        fileDto.setApplyNo(applyNo);
        fileDto.setApplyType(applyType);
        fileDto.setFileUrl(storedName);
        fileDto.setFileName(originalName);
        essFileMapper.insertEssFile(fileDto);
    }

    @Override
    public List<EssFileDto> getFilesByApplyNo(String applyNo) {
        if (applyNo == null || applyNo.trim().isEmpty()) return Collections.emptyList();
        try {
            List<EssFileDto> result = essFileMapper.selectFilesByApplyNo(applyNo);
            return result != null ? result : Collections.emptyList();
        } catch (Exception e) {
            log.error("Lỗi lấy danh sách file theo applyNo={}", applyNo, e);
            return Collections.emptyList();
        }
    }
}
