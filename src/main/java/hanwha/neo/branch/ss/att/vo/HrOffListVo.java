package hanwha.neo.branch.ss.att.vo;

public class HrOffListVo implements java.io.Serializable {
    private java.lang.String enterCd;
    private java.lang.String sabun;
    private java.lang.String gntCd;
    private java.lang.String sYmd;
    private java.lang.String eYmd;
    private java.lang.String orgCd;
    private java.lang.String instanceId;
    private java.lang.String cancelYn;
    private java.lang.String ifDate;
    private java.lang.String ifId;
    private java.lang.String status;
    private java.lang.String reason;

    public HrOffListVo() {}

    public java.lang.String getEnterCd() { return enterCd; }
    public void setEnterCd(java.lang.String enterCd) { this.enterCd = enterCd; }

    public java.lang.String getSabun() { return sabun; }
    public void setSabun(java.lang.String sabun) { this.sabun = sabun; }

    public java.lang.String getGntCd() { return gntCd; }
    public void setGntCd(java.lang.String gntCd) { this.gntCd = gntCd; }

    public java.lang.String getSYmd() { return sYmd; }
    public void setSYmd(java.lang.String sYmd) { this.sYmd = sYmd; }

    public java.lang.String getEYmd() { return eYmd; }
    public void setEYmd(java.lang.String eYmd) { this.eYmd = eYmd; }

    public java.lang.String getOrgCd() { return orgCd; }
    public void setOrgCd(java.lang.String orgCd) { this.orgCd = orgCd; }

    public java.lang.String getInstanceId() { return instanceId; }
    public void setInstanceId(java.lang.String instanceId) { this.instanceId = instanceId; }

    public java.lang.String getCancelYn() { return cancelYn; }
    public void setCancelYn(java.lang.String cancelYn) { this.cancelYn = cancelYn; }

    public java.lang.String getIfDate() { return ifDate; }
    public void setIfDate(java.lang.String ifDate) { this.ifDate = ifDate; }

    public java.lang.String getIfId() { return ifId; }
    public void setIfId(java.lang.String ifId) { this.ifId = ifId; }

    public java.lang.String getStatus() { return status; }
    public void setStatus(java.lang.String status) { this.status = status; }

    public java.lang.String getReason() { return reason; }
    public void setReason(java.lang.String reason) { this.reason = reason; }

    private static org.apache.axis.description.TypeDesc typeDesc =
        new org.apache.axis.description.TypeDesc(HrOffListVo.class, true);

    static {
        typeDesc.setXmlType(new javax.xml.namespace.QName("http://vo.att.ss.branch.neo.hanwha", "HrOffListVo"));
        org.apache.axis.description.ElementDesc elemField;

        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("enterCd");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.att.ss.branch.neo.hanwha", "enterCd"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(false);
        typeDesc.addFieldDesc(elemField);

        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("sabun");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.att.ss.branch.neo.hanwha", "sabun"));
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
        elemField.setFieldName("sYmd");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.att.ss.branch.neo.hanwha", "sYmd"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(false);
        typeDesc.addFieldDesc(elemField);

        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("eYmd");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.att.ss.branch.neo.hanwha", "eYmd"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(false);
        typeDesc.addFieldDesc(elemField);

        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("orgCd");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.att.ss.branch.neo.hanwha", "orgCd"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);

        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("instanceId");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.att.ss.branch.neo.hanwha", "instanceId"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(false);
        typeDesc.addFieldDesc(elemField);

        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("cancelYn");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.att.ss.branch.neo.hanwha", "cancelYn"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(true);
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
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);

        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("status");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.att.ss.branch.neo.hanwha", "status"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);

        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("reason");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.att.ss.branch.neo.hanwha", "reason"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
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
