package com.ait.sy.basicMaintenance.service.impl;

import com.ait.sy.basicMaintenance.dto.SyCodeParamDto;
import com.ait.sy.basicMaintenance.mapper.SyCodeParamMapper;
import com.ait.sy.basicMaintenance.model.SyCodeParam;
import com.ait.sy.basicMaintenance.service.SyCodeParamService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class SyCodeParamServiceImpl implements SyCodeParamService {

    @Autowired
    private SyCodeParamMapper syCodeParamMapper;

    @Override
    public List<SyCodeParamDto> getList(String parentCode, String cpnyId) {
        return syCodeParamMapper.selectParamByParentAndCompany(parentCode, cpnyId, "vi");
    }

    @Override
    @Transactional
    public void save(SyCodeParamDto dto) {
        if (syCodeParamMapper.existsByCodeNoAndCpnyId(dto.getCodeNo(), dto.getCpnyId())) {
            return;
        }


        SyCodeParam param = new SyCodeParam();
        param.setCodeNo(dto.getCodeNo());
        param.setCpnyId(dto.getCpnyId());
        param.setOrderNo(dto.getParamOrderNo() != null ? dto.getParamOrderNo() : 0);
        param.setActivity(dto.getActivity() != null ? dto.getActivity() : "1");

        syCodeParamMapper.insert(param);
    }

    @Override
    @Transactional
    public void update(SyCodeParamDto dto) {
        SyCodeParam param = syCodeParamMapper.findByCodeNoAndCpnyId(dto.getCodeNo(), dto.getCpnyId());
        if (param != null) {
            param.setOrderNo(dto.getOrderNo());

            param.setOrderNo(dto.getOrderNo());
            param.setActivity(dto.getActivity());

            syCodeParamMapper.update(param);
        }
    }

    @Override
    @Transactional
    public void delete(String codeNo, String cpnyId) {
        syCodeParamMapper.deleteByCodeNoAndCpnyId(codeNo, cpnyId);
    }

    @Override
    @Transactional
    public void deleteByParamNo(String paramNo) {
        syCodeParamMapper.deleteByParamNo(paramNo);
    }
}
