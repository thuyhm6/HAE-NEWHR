package com.ait.pa.workManagement.mapper;

import com.ait.pa.workManagement.dto.PaArDetailDto;
import com.ait.pa.workManagement.dto.PaItemDifSummaryDto;
import com.ait.pa.workManagement.dto.PaMonthChainDto;
import com.ait.pa.workManagement.dto.PaMonthPersonChangeDto;
import com.ait.pa.workManagement.dto.PaMonthPersonCountDto;
import com.ait.pa.workManagement.dto.PaPayItemOptionDto;
import com.ait.pa.workManagement.dto.PaResultConfirmSummaryDto;
import com.ait.pa.workManagement.dto.PaSalaryCheckAmountDto;
import com.ait.pa.workManagement.dto.PaSalaryCheckEmpDto;
import com.ait.pa.workManagement.dto.PaSalaryCheckQueryDto;
import com.ait.pa.workManagement.dto.PaSalaryDetailInfoDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

/**
 * Đối chiếu lương - port từ sqlViewPaParam.xml (Hanwha_HAE, nhánh HAE). Xem chú thích từng câu SQL
 * trong PaSalaryCheckMapper.xml.
 */
@Mapper
public interface PaSalaryCheckMapper {

    // ── NV tham gia tính lương (monthPersonCountInfoList) ──
    List<PaMonthPersonCountDto> selectMonthPersonCountList(PaSalaryCheckQueryDto query);

    List<PaMonthPersonChangeDto> selectMonthPersonIncreaseList(PaSalaryCheckQueryDto query);

    List<PaMonthPersonChangeDto> selectMonthPersonDecreaseList(PaSalaryCheckQueryDto query);

    List<PaSalaryCheckEmpDto> selectMonthPersonChangeEmpList(PaSalaryCheckQueryDto query);

    // ── Các khoản chi trả (viewPaMonthChain) ──
    void callMonthChainProc(PaSalaryCheckQueryDto query);

    List<PaMonthChainDto> selectMonthChainList(PaSalaryCheckQueryDto query);

    // ── Quyết định thực hiện (viewVerificationList) ──
    List<PaSalaryCheckEmpDto> selectVerificationList(PaSalaryCheckQueryDto query);

    // ── Chi tiết lương (detailPersonCountInfo / detailPersonCountInfoRight) ──
    PaSalaryCheckEmpDto selectPaDetailEmpInfo(PaSalaryCheckQueryDto query);

    void callSalaryDetailProc(PaSalaryCheckQueryDto query);

    List<PaSalaryDetailInfoDto> selectSalaryDetailInfoList(PaSalaryCheckQueryDto query);

    // ── Đối chiếu hạng mục (detailItemCountInfo) ──
    List<PaPayItemOptionDto> selectPayItemOptions(PaSalaryCheckQueryDto query);

    List<PaSalaryCheckEmpDto> selectItemCountList(PaSalaryCheckQueryDto query);

    // ── Chênh lệch hạng mục (detailItemDifCountInfo / viewResultConfirmList tab 2, 4 / viewPaMonthChain popup) ──
    void callMonthDifItemProc(PaSalaryCheckQueryDto query);

    List<PaItemDifSummaryDto> selectItemDifSummaryList(PaSalaryCheckQueryDto query);

    List<PaSalaryCheckEmpDto> selectItemDifEmpList(PaSalaryCheckQueryDto query);

    // ── Đối chiếu kết quả (viewResultConfirmList) ──
    List<PaResultConfirmSummaryDto> selectResultConfirmSummary(PaSalaryCheckQueryDto query);

    List<PaSalaryCheckEmpDto> selectOvertimeList(PaSalaryCheckQueryDto query);

    List<PaArDetailDto> selectArDetailList(PaSalaryCheckQueryDto query);

    List<PaSalaryCheckAmountDto> selectInsuranceList(PaSalaryCheckQueryDto query);

    List<PaSalaryCheckAmountDto> selectTaxList(PaSalaryCheckQueryDto query);
}
