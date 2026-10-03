package com.ait.edu.trainEducation.model;

import lombok.Data;

/**
 * Đơn đăng ký đào tạo bên ngoài (EDU_TRAINING_REGISTER) - port từ
 * getRegisterForTrainingList (sqlTrainEducation.xml - Hanwha_HAE).
 */
@Data
public class EduTrainingRegister {

    private String applyNo;
    private String personId;
    private String empid;
    private String localName;
    private String deptName;
    private String trainingContent;
    private String trainingPurpose;
    private String trainingType;
    private String trainingTypeName;
    private String trainingUnit;
    private String trainingLocation;
    /** DD/MM/YYYY */
    private String startDate;
    /** DD/MM/YYYY */
    private String endDate;
    private String affirmFlag;
    private String affirmFlagName;
    private String remark;
    /** Đơn vị tiền tệ VND/USD */
    private String trainUnit;
    /** Số ngày (TRAIN_FEE bản gốc dùng cho cột "Số ngày") */
    private String trainFee;
    private String trainPrice;
    private String trainTrainee;
    private String trainAmount;
    private String trainFeesOther;
    private String trainFeesTotal;
    /** DD/MM/YYYY */
    private String createDate;
}
