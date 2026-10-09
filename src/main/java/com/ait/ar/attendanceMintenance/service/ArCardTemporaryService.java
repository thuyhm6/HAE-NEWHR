package com.ait.ar.attendanceMintenance.service;

import com.ait.ar.attendanceMintenance.dto.ArCardTemporaryDto;
import com.ait.ar.attendanceMintenance.dto.ArCardTemporarySaveRequest;

import java.util.List;

public interface ArCardTemporaryService {

    List<ArCardTemporaryDto> getList(ArCardTemporaryDto params);

    ArCardTemporaryDto getInfo(Long recordNo);

    /** Thêm thẻ tạm: vô hiệu hóa thẻ đang dùng của nhân viên rồi thêm thẻ mới. */
    int add(ArCardTemporarySaveRequest request);

    /** Cập nhật trạng thái sử dụng của thẻ tạm. */
    int update(ArCardTemporarySaveRequest request);
}
