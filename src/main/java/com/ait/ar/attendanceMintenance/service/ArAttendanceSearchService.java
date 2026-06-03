package com.ait.ar.attendanceMintenance.service;

import com.ait.ar.attendanceMintenance.dto.ArAttendanceSearchDto;

import java.util.List;

public interface ArAttendanceSearchService {
    List<ArAttendanceSearchDto> getAttendanceSearchList(ArAttendanceSearchDto params);

    List<ArAttendanceSearchDto> getAttendanceOtSearchList(ArAttendanceSearchDto params);
}
