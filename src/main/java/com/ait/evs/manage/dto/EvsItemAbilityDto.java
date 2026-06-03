package com.ait.evs.manage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvsItemAbilityDto {

    // Dữ liệu hiển thị từ EVS_ITEM + EVS_ITEM_PARAM + EVS_OBJECT
    private String itemSeq;
    private String groupName;
    private String itemCode;
    private String itemName;
    private String remark;
    private String itemScore;
    private String evsScore0;   // Tự đánh giá (AFFIRM_LEVEL=0)
    private String evsScore1;   // Người đánh giá lần 1 (AFFIRM_LEVEL=1)
    private String evsScore2;   // Người đánh giá lần 2 (AFFIRM_LEVEL=2)

    // Trường hỗ trợ upsert EVS_ITEM_SCORE (set bởi service trước khi gọi mapper)
    private String evsObjectSeq;
    private String resumeSeq;
}
