package com.ait.sy.sys.mapper;

import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;
import java.util.Map;
/**
 * Mapper cho việc gửi email - SendEmailMapper
 *
 * Chứa các phương thức để tương tác với cơ sở dữ liệu liên quan đến việc gửi email, như cập nhật trạng thái gửi email, lấy thông tin người phê duyệt, v.v.
 *
 * @author [Tên tác giả]
 * @version 1.0
 * @since 2024-06-01
 */
@Mapper
public interface SendEmailMapper {
    int updateApplySendFlag(@Param("applyNo") String applyNo);

    List<Map<String, Object>> getWaitSendApplyInfoList(@Param("applyNo") String applyNo);

    List<Map<String, Object>> getAffirmListByApplyNo(Map<String, Object> paramMap);

    List<Map<String, Object>> getReceiverListByApplyNo(Map<String, Object> paramMap);

    List<Map<String, Object>> getNeedCancelApprovalInfo(Map<String, Object> paramMap);

    List<Map<String, Object>> getSynchronizationApprovalList();

    List<Map<String, Object>> getSendDataInfoList(@Param("paramMap") Map<String, Object> paramMap,
                                                  @Param("queryType") String queryType);

    List<Map<String, Object>> viewApprovalInfo();

    void viewModifyApprovalInfo(Map<String, Object> paramMap);

    int updateAttendace(Map<String, Object> paramMap);

    List<Map<String, Object>> getNeedCancelApprovaledInfo(@Param("applyNos") List<String> applyNos);
}
