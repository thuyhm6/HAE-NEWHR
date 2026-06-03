package com.ait.evs.manage.service;

import com.ait.evs.manage.dto.EvsResumeDto;

import java.util.List;

public interface EvsResumeService {
    List<EvsResumeDto> getList(EvsResumeDto params);
    EvsResumeDto getOne(String seq);
    void save(EvsResumeDto dto);
    void delete(String seq);
    List<EvsResumeDto> getEvsResumeList(EvsResumeDto params);
}
