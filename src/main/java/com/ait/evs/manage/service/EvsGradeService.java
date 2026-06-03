package com.ait.evs.manage.service;

import com.ait.evs.manage.dto.EvsGradeDto;

import java.util.List;

public interface EvsGradeService {
    List<EvsGradeDto> getList(EvsGradeDto params);
    void saveBatch(List<EvsGradeDto> list);
    void deleteBatch(List<String> seqs);
}
