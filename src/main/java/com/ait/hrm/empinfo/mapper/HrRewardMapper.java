package com.ait.hrm.empinfo.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.ait.hrm.empinfo.model.HrReward;

import java.util.List;

@Mapper
public interface HrRewardMapper {
    List<HrReward> searchReward(@Param("empId") String empId,
            @Param("localName") String localName,
            @Param("rewardType") String rewardType);

    List<HrReward> getByPersonId(@Param("personId") String personId);

    HrReward getById(@Param("rewardNo") Long rewardNo);

    int insert(HrReward info);

    int update(HrReward info);

    int delete(@Param("rewardNo") Long rewardNo);
}
