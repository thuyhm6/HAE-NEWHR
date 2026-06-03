package com.ait.ar.attendanceSettings.service.impl;

import com.ait.ar.attendanceSettings.dto.ArCalenderDto;
import com.ait.ar.attendanceSettings.dto.ArCalenderGroupDto;
import com.ait.ar.attendanceSettings.dto.ArEmpCalenderDto;
import com.ait.ar.attendanceSettings.mapper.ArCalenderMapper;
import com.ait.ar.attendanceSettings.model.ArCalender;
import com.ait.ar.attendanceSettings.model.ArCalenderGroup;
import com.ait.ar.attendanceSettings.model.ArCalenderGroupHistory;
import com.ait.ar.attendanceSettings.service.ArCalenderService;
import com.ait.ar.attendanceMintenance.model.ArScheduleHtsv;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Calendar;
import java.util.List;

@Service
@Transactional
public class ArCalenderServiceImpl implements ArCalenderService {

    @Autowired
    private ArCalenderMapper arCalenderMapper;

    @Override
    public List<ArCalenderDto> getHolidayList(String iyear, String imonth, String keyword) {
        return arCalenderMapper.findAll(iyear, imonth, keyword);
    }

    @Override
    public List<ArCalenderDto> getCalendarMonth(int year, int month) {
        return arCalenderMapper.findByMonth(String.valueOf(year), String.valueOf(month));
    }

    @Override
    public ArCalenderDto getHolidayByPk(String ddateStr) {
        ArCalender entity = arCalenderMapper.selectByPk(ddateStr);
        if (entity == null)
            return null;
        ArCalenderDto dto = new ArCalenderDto();
        BeanUtils.copyProperties(entity, dto);
        return dto;
    }

    @Override
    public void saveHoliday(ArCalenderDto dto) {
        String ddateStr = dto.getDdateStr();
        if (ddateStr == null)
            return;
        try {
            String[] parts = ddateStr.split("/");
            int year = Integer.parseInt(parts[0]);
            int month = Integer.parseInt(parts[1]);
            int day = Integer.parseInt(parts[2]);
            Calendar cal = Calendar.getInstance();
            cal.set(year, month - 1, day);
            dto.setIyear(year);
            dto.setImonth(month);
            dto.setIday(day);
            dto.setIweek(cal.get(Calendar.DAY_OF_WEEK));
        } catch (Exception ignored) {
        }

        ArCalender entity = new ArCalender();
        BeanUtils.copyProperties(dto, entity);
        int count = arCalenderMapper.countByPk(ddateStr);
        if (count > 0) {
            arCalenderMapper.update(entity);
        } else {
            arCalenderMapper.insert(entity);
        }
    }

    @Override
    public void deleteHoliday(String ddateStr) {
        arCalenderMapper.deleteHistory(ddateStr);
        arCalenderMapper.delete(ddateStr);
    }

    // --- Class Calendar ---

    @Override
    public List<ArCalenderGroupDto> getGroupCalendarMonth(int year, int month, String groupId) {
        return arCalenderMapper.selectGroupCalendarMonth(
                String.valueOf(year), String.valueOf(month), groupId);
    }

    @Override
    public ArCalenderGroupDto getGroupCalendarDetail(String arDateStr, String groupId) {
        return arCalenderMapper.selectGroupCalendarDetail(arDateStr, groupId);
    }

    @Override
    public void saveGroupCalendarBatch(String startDate, String endDate, String groupId,
            String workShift, String restShift) {
        arCalenderMapper.callAddCalenderDateBanciP(startDate, endDate, workShift, restShift, groupId);
    }

    @Override
    public void updateGroupCalendarSingle(ArCalenderGroupDto dto) {
        String arDateStr = dto.getArDateStr();
        String groupId = dto.getGroupId();
        if (arDateStr == null || groupId == null)
            return;

        ArCalenderGroup group = new ArCalenderGroup();
        BeanUtils.copyProperties(dto, group);
        if (dto.getWorkdayflag() == null)
            group.setWorkdayflag(0);

        int count = arCalenderMapper.countGroup(arDateStr, groupId);
        if (count > 0) {
            arCalenderMapper.updateGroup(group);
        } else {
            try {
                String[] parts = arDateStr.split("/");
                int year = Integer.parseInt(parts[0]);
                int month = Integer.parseInt(parts[1]);
                int day = Integer.parseInt(parts[2]);
                Calendar cal = Calendar.getInstance();
                cal.set(year, month - 1, day);
                group.setIyear(year);
                group.setImonth(month);
                group.setIday(day);
                group.setIweek(cal.get(Calendar.DAY_OF_WEEK));
            } catch (Exception ignored) {
            }
            arCalenderMapper.insertGroup(group);
        }

        arCalenderMapper.deleteHistoryByGroup(arDateStr, groupId);
        ArCalenderGroupHistory hist = new ArCalenderGroupHistory();
        BeanUtils.copyProperties(group, hist);
        arCalenderMapper.insertHistory(hist);
    }

    // --- Emp Calendar ---

    @Override
    public List<ArEmpCalenderDto> getEmpCalendarMonth(int year, int month, String personId) {
        return arCalenderMapper.selectEmpCalendarMonth(String.format("%04d", year), String.format("%02d", month),
                personId);
    }

    @Override
    public void saveEmpCalendarDay(ArEmpCalenderDto dto) {
        String personId = dto.getPersonId();
        String arDateStr = dto.getArDateStr();
        if (personId == null || arDateStr == null)
            return;

        ArScheduleHtsv entity = new ArScheduleHtsv();
        entity.setPersonId(personId);
        entity.setArDateStr(arDateStr);
        entity.setShiftNo(dto.getShiftNo());
        entity.setTypeid(dto.getTypeid() != null ? Long.parseLong(dto.getTypeid()) : null);
        entity.setRemark(dto.getRemark());
        entity.setActivity(1);
        entity.setOrderno(0);
        entity.setAddFlag("M");

        int count = arCalenderMapper.countScheduleHtsv(personId, arDateStr);
        if (count > 0) {
            arCalenderMapper.updateScheduleHtsv(entity);
        } else {
            arCalenderMapper.insertScheduleHtsv(entity);
        }
    }

    @Override
    public ArEmpCalenderDto getEmpScheduleDetail(String personId, String arDateStr) {
        return arCalenderMapper.selectEmpScheduleDetail(personId, arDateStr);
    }
}
