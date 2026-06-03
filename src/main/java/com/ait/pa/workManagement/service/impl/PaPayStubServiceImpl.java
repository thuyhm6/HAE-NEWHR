package com.ait.pa.workManagement.service.impl;

import com.ait.pa.workManagement.dto.PaPayStubDto;
import com.ait.pa.workManagement.dto.PaPayStubItemDto;
import com.ait.pa.workManagement.dto.PaPayStubOtherDto;
import com.ait.pa.workManagement.mapper.PaPayStubMapper;
import com.ait.pa.workManagement.service.PaPayStubService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaPayStubServiceImpl implements PaPayStubService {

    private static final Logger log = LoggerFactory.getLogger(PaPayStubServiceImpl.class);

    @Autowired
    private PaPayStubMapper mapper;

    @Override
    @Transactional
    public List<PaPayStubDto> loadPayStubs(PaPayStubDto params, String lang) {
        log.info("Bắt đầu tải phiếu lương payScheduleNo={}, empSearch={}, deptNos={}, empOfficeCond={}",
                params.getPayScheduleNo(), params.getEmpSearch(), params.getDeptNos(), params.getEmpOfficeCond());
        try {
            if (StringUtils.hasText(params.getDeptNos())) {
                List<String> deptNoList = Arrays.stream(params.getDeptNos().split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .collect(Collectors.toList());
                params.setDeptNoList(deptNoList);
            }

            List<PaPayStubDto> employees = mapper.selectEmployeeList(params);
            log.info("Tìm được {} nhân viên cho payScheduleNo={}", employees.size(), params.getPayScheduleNo());

            for (PaPayStubDto emp : employees) {
                String personId      = emp.getPersonId();
                String payScheduleNo = emp.getPayScheduleNo();

                try {
                    mapper.callSalaryPagePackage(payScheduleNo, personId);
                    log.debug("Đã gọi package PA_FOR_EMP_SALARY_PAGE_P cho personId={}", personId);
                } catch (Exception e) {
                    log.error("Lỗi khi gọi package PA_FOR_EMP_SALARY_PAGE_P personId={}: {}", personId, e.getMessage(), e);
                    throw e;
                }

                List<PaPayStubItemDto> allItems = mapper.selectSalaryPageItems(personId, lang);

                emp.setAttendanceItems(allItems.stream()
                        .filter(i -> Integer.valueOf(1).equals(i.getItemType()))
                        .collect(Collectors.toList()));
                emp.setSalaryItems(allItems.stream()
                        .filter(i -> Integer.valueOf(2).equals(i.getItemType()))
                        .collect(Collectors.toList()));
                emp.setDeductionItems(allItems.stream()
                        .filter(i -> Integer.valueOf(3).equals(i.getItemType()))
                        .collect(Collectors.toList()));
                emp.setStandardItems(allItems.stream()
                        .filter(i -> Integer.valueOf(4).equals(i.getItemType()))
                        .collect(Collectors.toList()));

                List<PaPayStubOtherDto> otherItems = mapper.selectOtherItems(payScheduleNo, personId);
                emp.setOtherItems(otherItems);

                log.debug("Đã tải phiếu lương cho personId={}: attendance={}, salary={}, deduction={}, standard={}, other={}",
                        personId,
                        emp.getAttendanceItems().size(),
                        emp.getSalaryItems().size(),
                        emp.getDeductionItems().size(),
                        emp.getStandardItems().size(),
                        emp.getOtherItems().size());
            }

            log.info("Hoàn tất tải phiếu lương cho {} nhân viên", employees.size());
            return employees;
        } catch (Exception e) {
            log.error("Lỗi khi tải phiếu lương payScheduleNo={}: {}", params.getPayScheduleNo(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public List<PaPayStubDto> loadSelfPayStub(PaPayStubDto params, String lang) {
        log.info("Bắt đầu tải phiếu lương cá nhân payScheduleNo={}", params.getPayScheduleNo());
        try {
            List<PaPayStubDto> employees = mapper.selectSelfEmployee(params);
            log.info("Tìm được {} bản ghi cho nhân viên đăng nhập payScheduleNo={}", employees.size(), params.getPayScheduleNo());

            for (PaPayStubDto emp : employees) {
                String personId      = emp.getPersonId();
                String payScheduleNo = emp.getPayScheduleNo();

                try {
                    mapper.callSalaryPagePackage(payScheduleNo, personId);
                    log.debug("Đã gọi package PA_FOR_EMP_SALARY_PAGE_P cho personId={}", personId);
                } catch (Exception e) {
                    log.error("Lỗi khi gọi package PA_FOR_EMP_SALARY_PAGE_P personId={}: {}", personId, e.getMessage(), e);
                    throw e;
                }

                List<PaPayStubItemDto> allItems = mapper.selectSalaryPageItems(personId, lang);

                emp.setAttendanceItems(allItems.stream()
                        .filter(i -> Integer.valueOf(1).equals(i.getItemType()))
                        .collect(Collectors.toList()));
                emp.setSalaryItems(allItems.stream()
                        .filter(i -> Integer.valueOf(2).equals(i.getItemType()))
                        .collect(Collectors.toList()));
                emp.setDeductionItems(allItems.stream()
                        .filter(i -> Integer.valueOf(3).equals(i.getItemType()))
                        .collect(Collectors.toList()));
                emp.setStandardItems(allItems.stream()
                        .filter(i -> Integer.valueOf(4).equals(i.getItemType()))
                        .collect(Collectors.toList()));

                List<PaPayStubOtherDto> otherItems = mapper.selectOtherItems(payScheduleNo, personId);
                emp.setOtherItems(otherItems);

                log.debug("Đã tải phiếu lương cá nhân cho personId={}: attendance={}, salary={}, deduction={}, standard={}, other={}",
                        personId,
                        emp.getAttendanceItems().size(),
                        emp.getSalaryItems().size(),
                        emp.getDeductionItems().size(),
                        emp.getStandardItems().size(),
                        emp.getOtherItems().size());
            }

            log.info("Hoàn tất tải phiếu lương cá nhân payScheduleNo={}", params.getPayScheduleNo());
            return employees;
        } catch (Exception e) {
            log.error("Lỗi khi tải phiếu lương cá nhân payScheduleNo={}: {}", params.getPayScheduleNo(), e.getMessage(), e);
            throw e;
        }
    }
}
