package hanwha.neo.branch.ss.att.vo;

public class SyncHrOffDataRequest implements java.io.Serializable {
    private hanwha.neo.branch.ss.att.vo.ArraysHrOffVo arraysHrOffVo;

    public SyncHrOffDataRequest() {}

    public hanwha.neo.branch.ss.att.vo.ArraysHrOffVo getArraysHrOffVo() { return arraysHrOffVo; }
    public void setArraysHrOffVo(hanwha.neo.branch.ss.att.vo.ArraysHrOffVo arraysHrOffVo) { this.arraysHrOffVo = arraysHrOffVo; }

    private static org.apache.axis.description.TypeDesc typeDesc =
        new org.apache.axis.description.TypeDesc(SyncHrOffDataRequest.class, true);

    static {
        typeDesc.setXmlType(new javax.xml.namespace.QName("http://vo.att.ss.branch.neo.hanwha", "SyncHrOffDataRequest"));
        org.apache.axis.description.ElementDesc elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("arraysHrOffVo");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.att.ss.branch.neo.hanwha", "arraysHrOffVo"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://vo.att.ss.branch.neo.hanwha", "ArraysHrOffVo"));
        elemField.setNillable(true);
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
