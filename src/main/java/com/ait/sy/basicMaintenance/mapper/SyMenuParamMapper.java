package com.ait.sy.basicMaintenance.mapper;

import com.ait.sy.basicMaintenance.dto.SyMenuParamDto;
import com.ait.sy.basicMaintenance.model.SyMenuParam;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface SyMenuParamMapper {

    /**
     * Lấy danh sách Menu con của parentMenuNo, kèm trạng thái đã gán cho cpnyId
     */
    List<SyMenuParamDto> findByParentMenuAndCpny(
            @Param("parentMenuNo") String parentMenuNo,
            @Param("cpnyId") String cpnyId);

    void insert(SyMenuParam param);

    void update(SyMenuParam param);

    void deleteByCpnyIdAndMenuNo(@Param("cpnyId") String cpnyId, @Param("menuNo") String menuNo);

    String getNextParamNoSeq();

    // Check exist
    SyMenuParam findByCpnyIdAndMenuNo(@Param("cpnyId") String cpnyId, @Param("menuNo") String menuNo);
}
