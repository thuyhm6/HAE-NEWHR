package com.ait.edu.trainEducation.service;

import com.ait.edu.trainEducation.model.EduTrainingRegister;
import com.ait.edu.trainEducation.model.EduTrainingRegisterRequest;
import com.ait.exception.BusinessException;
import com.ait.sy.syAffirm.dto.SyAffirmEmailDto;

import java.util.List;

/**
 * Đăng ký đào tạo bên ngoài (/edu/traineducation/viewRegisterForTraining) - port từ
 * TrainEducationCtroller#viewRegisterForTrainingList / addRegisterForTraining (Hanwha_HAE).
 */
public interface EduTrainingRegisterService {

    /** APPLY_TYPE_NO / APPLY_TYPE_CODE của đơn đăng ký đào tạo (giữ nguyên bản gốc). */
    String APPLY_TYPE = "81006456";
    /** Trạng thái "Đang chờ duyệt" khi mới tạo đơn. */
    String AFFIRM_FLAG_APPLY = "14014306";

    String ERR_NO_EMPLOYEE = "EDU_REGISTER_NO_EMPLOYEE";
    String ERR_NO_APPROVER = "EDU_REGISTER_NO_APPROVER";
    String ERR_INVALID_DATE = "EDU_REGISTER_INVALID_DATE";

    /** Đơn đăng ký của người đăng nhập. */
    List<EduTrainingRegister> findMyList(String trainingType);

    /** Người phê duyệt mặc định (PKG_AFFIRM_EMAIL.GET_AFFIRMOR_LIST_IMPROVE). */
    List<SyAffirmEmailDto> findDefaultApprovers();

    /** Tạo đơn + tiến trình phê duyệt, trả về APPLY_NO. */
    String apply(EduTrainingRegisterRequest request) throws BusinessException;
}
