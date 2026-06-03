package com.ait.sy.syRole.service;

import java.util.List;

import com.ait.sy.syRole.dto.SyUserDto;

public interface SyUserService {
    List<SyUserDto> searchUsers(String keyword);

    SyUserDto findByUserNo(String userNo);

    void saveRelations(String userNo, List<String> roleGroupNos);

    void resetPassword(String userNo, String newPassword);

    byte[] exportExcel();
}
