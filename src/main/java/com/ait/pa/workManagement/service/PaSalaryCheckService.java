package com.ait.pa.workManagement.service;

import com.ait.pa.workManagement.dto.PaArDetailDto;
import com.ait.pa.workManagement.dto.PaItemDifSummaryDto;
import com.ait.pa.workManagement.dto.PaMonthChainDto;
import com.ait.pa.workManagement.dto.PaPayItemOptionDto;
import com.ait.pa.workManagement.dto.PaResultConfirmSummaryDto;
import com.ait.pa.workManagement.dto.PaSalaryCheckAmountDto;
import com.ait.pa.workManagement.dto.PaSalaryCheckEmpDto;
import com.ait.pa.workManagement.dto.PaSalaryCheckQueryDto;
import com.ait.pa.workManagement.dto.PaSalaryDetailInfoDto;

import java.util.List;
import java.util.Map;

/** Đối chiếu lương - port từ viewPaParamSerImp / PaMonthChainImp (Hanwha_HAE) */
public interface PaSalaryCheckService {

    /** NV tham gia tính lương: {countList, increaseList, decreaseList} */
    Map<String, Object> getMonthPersonCount(PaSalaryCheckQueryDto query);

    List<PaSalaryCheckEmpDto> getMonthPersonChangeEmpList(PaSalaryCheckQueryDto query);

    /** Các khoản chi trả: gọi procedure sinh dữ liệu tạm rồi đọc ra */
    List<PaMonthChainDto> getMonthChainList(PaSalaryCheckQueryDto query);

    List<PaSalaryCheckEmpDto> getVerificationList(PaSalaryCheckQueryDto query);

    PaSalaryCheckEmpDto getPaDetailEmpInfo(PaSalaryCheckQueryDto query);

    /** Chi tiết hạng mục lương kèm công thức: gọi procedure sinh dữ liệu tạm rồi đọc ra */
    List<PaSalaryDetailInfoDto> getSalaryDetailInfoList(PaSalaryCheckQueryDto query);

    List<PaPayItemOptionDto> getPayItemOptions();

    List<PaSalaryCheckEmpDto> getItemCountList(PaSalaryCheckQueryDto query);

    /** Gọi procedure chênh lệch hạng mục rồi trả về tổng hợp theo hạng mục + loại thay đổi */
    List<PaItemDifSummaryDto> getItemDifSummaryList(PaSalaryCheckQueryDto query);

    /** Danh sách NV chênh lệch hạng mục (đọc dữ liệu tạm đã sinh); callProc = true thì gọi procedure trước */
    List<PaSalaryCheckEmpDto> getItemDifEmpList(PaSalaryCheckQueryDto query, boolean callProc);

    PaResultConfirmSummaryDto getResultConfirmSummary(PaSalaryCheckQueryDto query);

    List<PaSalaryCheckEmpDto> getOvertimeList(PaSalaryCheckQueryDto query);

    List<PaArDetailDto> getArDetailList(PaSalaryCheckQueryDto query);

    List<PaSalaryCheckAmountDto> getInsuranceList(PaSalaryCheckQueryDto query);

    List<PaSalaryCheckAmountDto> getTaxList(PaSalaryCheckQueryDto query);
}
