package com.ait.ess.arConfirm.mapper;

import com.ait.ess.arConfirm.dto.EssOtConfirmDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface EssOtConfirmMapper {

    int countList(EssOtConfirmDto dto);

    List<EssOtConfirmDto> selectListPage(EssOtConfirmDto dto);

    void callOtConfirm(Map<String, Object> params);
}
