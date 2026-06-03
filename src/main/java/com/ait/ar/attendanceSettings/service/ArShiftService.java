package com.ait.ar.attendanceSettings.service;

import com.ait.ar.attendanceSettings.dto.ArShift010Dto;
import com.ait.ar.attendanceSettings.dto.ArShift020Dto;

import java.util.List;

public interface ArShiftService {
    // SHIFT 010
    List<ArShift010Dto> getShiftList(String cpnyId, String searchText);

    ArShift010Dto getShiftById(String shiftNo);

    void saveShift(ArShift010Dto dto);

    void deleteShift(String shiftNo);

    // SHIFT 020
    List<ArShift020Dto> getShiftDetailList(String shiftNo);

    ArShift020Dto getShiftDetailById(Long pkNo);

    void saveShiftDetail(ArShift020Dto dto);

    void deleteShiftDetail(Long pkNo);
}
