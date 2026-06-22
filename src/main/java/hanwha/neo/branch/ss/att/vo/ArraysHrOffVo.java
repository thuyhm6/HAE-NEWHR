package hanwha.neo.branch.ss.att.vo;

public class ArraysHrOffVo implements java.io.Serializable {
    private hanwha.neo.branch.ss.att.vo.HrOffListVo[] hrOffList;
    private hanwha.neo.branch.ss.att.vo.HrOffCodeVo[] hrOffCode;

    public ArraysHrOffVo() {}

    public hanwha.neo.branch.ss.att.vo.HrOffListVo[] getHrOffList() { return hrOffList; }
    public void setHrOffList(hanwha.neo.branch.ss.att.vo.HrOffListVo[] hrOffList) { this.hrOffList = hrOffList; }

    public hanwha.neo.branch.ss.att.vo.HrOffCodeVo[] getHrOffCode() { return hrOffCode; }
    public void setHrOffCode(hanwha.neo.branch.ss.att.vo.HrOffCodeVo[] hrOffCode) { this.hrOffCode = hrOffCode; }

    private static org.apache.axis.description.TypeDesc typeDesc =
        new org.apache.axis.description.TypeDesc(ArraysHrOffVo.class, true);

    static {
        typeDesc.setXmlType(new javax.xml.namespace.QName("http://vo.att.ss.branch.neo.hanwha", "ArraysHrOffVo"));
        org.apache.axis.description.ElementDesc elemField;

        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("hrOffList");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.att.ss.branch.neo.hanwha", "hrOffList"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://vo.att.ss.branch.neo.hanwha", "HrOffListVo"));
        elemField.setNillable(true);
        elemField.setItemQName(new javax.xml.namespace.QName("http://vo.att.ss.branch.neo.hanwha", "item"));
        typeDesc.addFieldDesc(elemField);

        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("hrOffCode");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.att.ss.branch.neo.hanwha", "hrOffCode"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://vo.att.ss.branch.neo.hanwha", "HrOffCodeVo"));
        elemField.setNillable(true);
        elemField.setItemQName(new javax.xml.namespace.QName("http://vo.att.ss.branch.neo.hanwha", "item"));
        typeDesc.addFieldDesc(elemField);
    }

    public static org.apache.axis.description.TypeDesc getTypeDesc() { return typeDesc; }

    public static org.apache.axis.encoding.Serializer getSerializer(
            java.lang.String mechType, java.lang.Class _javaType, javax.xml.namespace.QName _xmlType) {
        return new org.apache.axis.encoding.ser.BeanSerializer(_javaType, _xmlType, typeDesc);
    }

    public static org.apache.axis.encoding.Deserializer getDeserializer(
            java.lang.String mechType, java.lang.Class _javaType, javax.xml.namespace.QName _xmlType) {
        return new org.apache.axis.encoding.ser.BeanDeserializer(_javaType, _xmlType, typeDesc);
    }
}
