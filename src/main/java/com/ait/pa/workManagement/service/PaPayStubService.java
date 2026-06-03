package com.ait.pa.workManagement.service;

import com.ait.pa.workManagement.dto.PaPayStubDto;

import java.util.List;

public interface PaPayStubService {

    List<PaPayStubDto> loadPayStubs(PaPayStubDto params, String lang);

    List<PaPayStubDto> loadSelfPayStub(PaPayStubDto params, String lang);
}
