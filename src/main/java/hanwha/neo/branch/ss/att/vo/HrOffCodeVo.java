package hanwha.neo.branch.ss.att.vo;

public class HrOffCodeVo implements java.io.Serializable {
    private java.lang.String enterCd;
    private java.lang.String gntCd;
    private java.lang.String gntNm;
    private java.lang.String vacationYn;
    private java.lang.String ifDate;
    private java.lang.String ifId;

    public HrOffCodeVo() {}

    public HrOffCodeVo(String enterCd, String gntCd, String gntNm, String vacationYn, String ifDate, String ifId) {
        this.enterCd = enterCd;
        this.gntCd = gntCd;
        this.gntNm = gntNm;
        this.vacationYn = vacationYn;
        this.ifDate = ifDate;
        this.ifId = ifId;
    }

    public java.lang.String getEnterCd() { return enterCd; }
    public void setEnterCd(java.lang.String enterCd) { this.enterCd = enterCd; }

    public java.lang.String getGntCd() { return gntCd; }
    public void setGntCd(java.lang.String gntCd) { this.gntCd = gntCd; }

    public java.lang.String getGntNm() { return gntNm; }
    public void setGntNm(java.lang.String gntNm) { this.gntNm = gntNm; }

    public java.lang.String getVacationYn() { return vacationYn; }
    public void setVacationYn(java.lang.String vacationYn) { this.vacationYn = vacationYn; }

    public java.lang.String getIfDate() { return ifDate; }
    public void setIfDate(java.lang.String ifDate) { this.ifDate = ifDate; }

    public java.lang.String getIfId() { return ifId; }
    public void setIfId(java.lang.String ifId) { this.ifId = ifId; }

    private static org.apache.axis.description.TypeDesc typeDesc =
        new org.apache.axis.description.TypeDesc(HrOffCodeVo.class, true);

    static {
        typeDesc.setXmlType(new javax.xml.namespace.QName("http://vo.att.ss.branch.neo.hanwha", "HrOffCodeVo"));
        org.apache.axis.description.ElementDesc elemField;

        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("enterCd");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.att.ss.branch.neo.hanwha", "enterCd"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(false);
        typeDesc.addFieldDesc(elemField);

        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("gntCd");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.att.ss.branch.neo.hanwha", "gntCd"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(false);
        typeDesc.addFieldDesc(elemField);

        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("gntNm");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.att.ss.branch.neo.hanwha", "gntNm"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(false);
        typeDesc.addFieldDesc(elemField);

        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("vacationYn");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.att.ss.branch.neo.hanwha", "vacationYn"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(false);
        typeDesc.addFieldDesc(elemField);

        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("ifDate");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.att.ss.branch.neo.hanwha", "ifDate"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(false);
        typeDesc.addFieldDesc(elemField);

        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("ifId");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.att.ss.branch.neo.hanwha", "ifId"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(false);
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
