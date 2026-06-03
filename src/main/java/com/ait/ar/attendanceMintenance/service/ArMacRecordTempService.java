package com.ait.ar.attendanceMintenance.service;

import com.ait.ar.attendanceMintenance.dto.ArMacRecordTempDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface ArMacRecordTempService {

    Map<String, Object> uploadExcel(MultipartFile file);

    List<ArMacRecordTempDto> getList(String errorOnly);

    Map<String, Object> confirm();
}
