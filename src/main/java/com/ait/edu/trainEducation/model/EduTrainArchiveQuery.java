package com.ait.edu.trainEducation.model;

import lombok.Data;

/**
 * Điều kiện tìm hồ sơ đào tạo (arcEmpidName, arcDepartno, arcCourseName,
 * actStartdate, actEnddate, arcTrainContent bản gốc).
 */
@Data
public class EduTrainArchiveQuery {

    /** Mã nhân viên (khớp đúng) hoặc họ tên (không dấu, không phân biệt hoa thường) */
    private String keyword;
    /** Phòng ban - gồm phòng ban con */
    private String deptNo;
    private String courseName;
    /** DD/MM/YYYY - rỗng thì mặc định ngày đầu tháng hiện tại */
    private String startDate;
    /** DD/MM/YYYY - rỗng thì mặc định ngày cuối tháng hiện tại */
    private String endDate;
    private String trainContent;
}
