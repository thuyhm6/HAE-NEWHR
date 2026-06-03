package com.ait.evs.manage.mapper;

import com.ait.evs.manage.dto.EvsAffirmorSetupDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface EvsAffirmorSetupMapper {

    /** Danh sách đối tượng đánh giá kèm thông tin người đánh giá */
    List<EvsAffirmorSetupDto> selectList(EvsAffirmorSetupDto dto);

    /** Tìm kiếm nhân viên để chọn làm người đánh giá */
    List<EvsAffirmorSetupDto> searchEmployee(EvsAffirmorSetupDto dto);

    /** Cập nhật người đánh giá cho một đối tượng */
    void updateAffirmor(EvsAffirmorSetupDto dto);

    /** Gọi PR_ADD_EVS_OBJECT để thêm đối tượng đánh giá */
    void callAddEvsObject(EvsAffirmorSetupDto dto);

    /** Lấy SEQ của đối tượng vừa được thêm (theo resumeSeq + personId) */
    String selectNewObjSeq(EvsAffirmorSetupDto dto);

    /** Gọi PR_MODIFY_AFFIRM_INFO để lưu người đánh giá theo level */
    void callModifyAffirmInfo(EvsAffirmorSetupDto dto);

    /** Cập nhật thông tin đối tượng đánh giá vào EVS_OBJECT */
    void updateEvsObject(EvsAffirmorSetupDto dto);

    /** Gọi PR_CREATE_EVS_TARGET để tạo mục tiêu đánh giá */
    void callCreateEvsTarget(EvsAffirmorSetupDto dto);

    /** Gọi PR_EVS_START để bắt đầu đánh giá */
    void callEvsStart(EvsAffirmorSetupDto dto);

    /** Xóa các đối tượng đánh giá theo danh sách SEQ */
    void deleteObjects(@Param("seqList") List<String> seqList);
}
