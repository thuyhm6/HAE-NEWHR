package com.ait.sy.basicMaintenance.service.impl;

import com.ait.sy.basicMaintenance.dto.SyMenuDto;
import com.ait.sy.basicMaintenance.mapper.SyMenuMapper;
import com.ait.sy.basicMaintenance.model.SyMenu;
import com.ait.sy.basicMaintenance.service.SyMenuService;
import com.ait.sy.sys.mapper.SyGlobalNameMapper;
import com.ait.sy.sys.model.SyGlobalName;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
public class SyMenuServiceImpl implements SyMenuService {

    @Autowired
    private SyMenuMapper syMenuMapper;

    @Autowired
    private SyGlobalNameMapper syGlobalNameMapper;

    @Override
    public List<SyMenuDto> findAll(String keyword) {
        return syMenuMapper.findAll(keyword);
    }

    @Override
    @Transactional
    public void save(SyMenuDto dto) {
        String seqId = dto.getMenuNo();
        boolean isNew = (seqId == null || seqId.isEmpty());

        if (isNew) {
            seqId = syMenuMapper.getNextGlobalNoSeq();
            dto.setMenuNo(seqId);
        }

        SyMenu menu = new SyMenu();
        menu.setMenuNo(seqId);
        menu.setMenuParentNo(dto.getMenuParentNo());
        menu.setMenuCode(dto.getMenuCode());
        menu.setMenuImg(dto.getMenuImg());
        menu.setDepth(dto.getDepth() == null ? 0 : dto.getDepth());
        menu.setMenuUrl(dto.getMenuUrl());
        menu.setOrderNo(dto.getOrderNo() == null ? 0 : dto.getOrderNo());
        menu.setActivity(dto.getActivity() == null ? 1 : dto.getActivity());

        if (isNew) {
            syMenuMapper.insert(menu);
        } else {
            syMenuMapper.update(menu);
        }

        // Save Multilingual Names
        if (seqId != null) {
            saveGlobalName(seqId, "vi", dto.getNameVi());
            saveGlobalName(seqId, "en", dto.getNameEn());
            saveGlobalName(seqId, "zh", dto.getNameZh());
            saveGlobalName(seqId, "ko", dto.getNameKo());
        }
    }

    private void saveGlobalName(String no, String lang, String content) {
        if (content == null)
            content = "";

        SyGlobalName existing = syGlobalNameMapper.findByNoAndLanguage(no, lang);

        if (existing != null) {
            existing.setContent(content);
            if (existing.getActivity() == null || !existing.getActivity().equals("1")) {
                existing.setActivity("1");
            }
            syGlobalNameMapper.update(existing);
        } else {
            SyGlobalName globalName = new SyGlobalName();
            globalName.setNo(no);
            globalName.setLanguage(lang);
            globalName.setContent(content);
            globalName.setActivity("1"); // Active
            globalName.setOrderNo(0);
            syGlobalNameMapper.insert(globalName);
        }
    }

    @Override
    @Transactional
    public void delete(String menuNo) {
        if (menuNo != null) {
            // Soft delete
            syMenuMapper.deleteByMenuNo(menuNo);
        }
    }

    @Override
    public byte[] exportExcel() {
        List<SyMenuDto> list = syMenuMapper.findAll(null);
        StringBuilder sb = new StringBuilder();
        sb.append('\uFEFF');
        sb.append("Menu No,Code,Name (VI),Name (EN),Parent No,URL,Order No\n");
        for (SyMenuDto dto : list) {
            sb.append(escapeCsv(dto.getMenuNo())).append(",");
            sb.append(escapeCsv(dto.getMenuCode())).append(",");
            sb.append(escapeCsv(dto.getNameVi())).append(",");
            sb.append(escapeCsv(dto.getNameEn())).append(",");
            sb.append(escapeCsv(dto.getMenuParentNo())).append(",");
            sb.append(escapeCsv(dto.getMenuUrl())).append(",");
            sb.append(dto.getOrderNo()).append("\n");
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String escapeCsv(String s) {
        if (s == null)
            return "";
        return "\"" + s.replace("\"", "\"\"") + "\"";
    }
}
