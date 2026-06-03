package com.ait.sy.basicMaintenance.service.impl;

import com.ait.sy.basicMaintenance.dto.SyCodeDto;
import com.ait.sy.basicMaintenance.mapper.SyCodeMapper;
import com.ait.sy.basicMaintenance.model.SyCode;
import com.ait.sy.basicMaintenance.service.SyCodeService;
import com.ait.sy.sys.mapper.SyGlobalNameMapper;
import com.ait.sy.sys.model.SyGlobalName;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class SyCodeServiceImpl implements SyCodeService {

    @Autowired
    private SyCodeMapper syCodeMapper;

    @Autowired
    private SyGlobalNameMapper syGlobalNameMapper;

    @Override
    public List<SyCodeDto> getCodeTree() {
        return syCodeMapper.findCodeWithParentNo(null);
    }

    @Override
    public List<SyCodeDto> getCodeList(String parentCodeNo) {
        if (parentCodeNo == null || parentCodeNo.isEmpty()) {
            return syCodeMapper.findCodeWithParentNo("ROOT");
        }
        return syCodeMapper.findCodeWithParentNo(parentCodeNo);
    }

    @Override
    @Transactional
    public void saveCode(SyCodeDto dto) {
        boolean isNew = dto.getCodeNo() == null || dto.getCodeNo().trim().isEmpty()
                || !syCodeMapper.existsByCodeNo(dto.getCodeNo());

        String codeNo = dto.getCodeNo();
        if (isNew) {
            codeNo = String.valueOf(syCodeMapper.getNextGlobalNoSeq());
            dto.setCodeNo(codeNo); // Update DTO with generated ID
        }

        SyCode code = new SyCode();
        code.setCodeNo(codeNo);
        code.setDescription(dto.getDescription());
        code.setDepth(dto.getDepth());
        code.setParentCodeNo(dto.getParentCodeNo());
        code.setOperationId(dto.getOperationId());
        code.setOrderNo(dto.getOrderNo());
        code.setActivity(dto.getActivity() != null ? dto.getActivity() : "1");
        code.setRemark(dto.getRemark());
        code.setGroupCode(dto.getGroupCode());
        code.setCodeId(dto.getCodeId());

        if (!isNew) {
            syCodeMapper.update(code);
        } else {
            syCodeMapper.insert(code);
        }

        saveGlobalName(codeNo, "vi", dto.getNameVi());
        saveGlobalName(codeNo, "en", dto.getNameEn());
        saveGlobalName(codeNo, "zh", dto.getNameZh());
        saveGlobalName(codeNo, "ko", dto.getNameKo());
    }

    private void saveGlobalName(String no, String lang, String content) {
        SyGlobalName existing = syGlobalNameMapper.findByNoAndLanguage(no, lang);

        if (existing != null) {
            existing.setContent(content);
            existing.setUpdateDate(LocalDateTime.now());
            // Ensure activity is set if null
            if (existing.getActivity() == null)
                existing.setActivity("1");
            syGlobalNameMapper.update(existing);
        } else {
            SyGlobalName globalName = new SyGlobalName();
            globalName.setNo(no);
            globalName.setLanguage(lang);
            globalName.setContent(content);
            globalName.setActivity("1");
            globalName.setOrderNo(0);
            syGlobalNameMapper.insert(globalName);
        }
    }

    @Override
    @Transactional
    public void deleteCode(String codeNo) {
        syGlobalNameMapper.deleteByNo(codeNo);
        syCodeMapper.deleteByCodeNo(codeNo);
    }

    @Override
    public List<SyCodeDto> searchCode(String keyword) {
        return syCodeMapper.searchCodeWithNames(keyword);
    }

    @Override
    public byte[] exportExcel() {
        List<SyCodeDto> list = syCodeMapper.findCodeWithParentNo(null);
        StringBuilder sb = new StringBuilder();
        // BOM for Excel to recognize UTF-8
        sb.append('\uFEFF');
        sb.append("Code No,Parent Code,Name (VI),Name (EN),Name (ZH),Name (KO),Description\n");
        for (SyCodeDto dto : list) {
            sb.append(escapeCsv(dto.getCodeNo())).append(",");
            sb.append(escapeCsv(dto.getParentCodeNo())).append(",");
            sb.append(escapeCsv(dto.getNameVi())).append(",");
            sb.append(escapeCsv(dto.getNameEn())).append(",");
            sb.append(escapeCsv(dto.getNameZh())).append(",");
            sb.append(escapeCsv(dto.getNameKo())).append(",");
            sb.append(escapeCsv(dto.getDescription())).append("\n");
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String escapeCsv(String s) {
        if (s == null)
            return "";
        return "\"" + s.replace("\"", "\"\"") + "\"";
    }
}
