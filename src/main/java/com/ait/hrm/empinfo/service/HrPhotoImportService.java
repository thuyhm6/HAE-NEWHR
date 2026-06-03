package com.ait.hrm.empinfo.service;

import com.ait.hrm.empinfo.dto.PhotoImportResultDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface HrPhotoImportService {

    /**
     * Validate danh sách ảnh (không lưu file, không cập nhật DB).
     * Trả về danh sách kết quả cho từng file: hợp lệ hay lỗi và lý do.
     */
    List<PhotoImportResultDto> validatePhotos(MultipartFile[] files);

    /**
     * Lưu danh sách ảnh vào thư mục upload và cập nhật PHOTO_PATH trong DB.
     * Server sẽ validate lại trước khi lưu.
     */
    List<PhotoImportResultDto> savePhotos(MultipartFile[] files);
}
