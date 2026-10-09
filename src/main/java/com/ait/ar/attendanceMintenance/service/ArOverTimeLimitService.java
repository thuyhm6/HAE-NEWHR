package com.ait.ar.attendanceMintenance.service;

import com.ait.ar.attendanceMintenance.dto.ArOverTimeLimitDto;
import com.ait.ar.attendanceMintenance.dto.ArOverTimeLimitSaveRequest;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface ArOverTimeLimitService {

    List<ArOverTimeLimitDto> getList(ArOverTimeLimitDto params);

    int saveOverTimeLimit(ArOverTimeLimitSaveRequest request);

    Workbook buildImportTemplate();

    /** Trả về danh sách lỗi theo dòng, rỗng nếu import thành công toàn bộ. */
    List<String> importOverTimeLimit(MultipartFile file) throws IOException;
}
