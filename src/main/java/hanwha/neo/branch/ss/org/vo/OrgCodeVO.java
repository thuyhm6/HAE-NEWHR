/**
 * OrgCodeVO.java
 *
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package hanwha.neo.branch.ss.org.vo;

public class OrgCodeVO  implements java.io.Serializable {
    private java.lang.String activeYn;

    private java.lang.String codeId;

    private java.lang.String codeName;

    private java.lang.String codeNameEn;

    private java.lang.String codeType;

    private java.lang.String companyName;

    private java.lang.String companyNameEn;

    private java.lang.String companyid;

    private java.lang.Integer sortNo;

    public OrgCodeVO() {
    }

    public OrgCodeVO(
           java.lang.String activeYn,
           java.lang.String codeId,
           java.lang.String codeName,
           java.lang.String codeNameEn,
           java.lang.String codeType,
           java.lang.String companyName,
           java.lang.String companyNameEn,
           java.lang.String companyid,
           java.lang.Integer sortNo) {
           this.activeYn = activeYn;
           this.codeId = codeId;
           this.codeName = codeName;
           this.codeNameEn = codeNameEn;
           this.codeType = codeType;
           this.companyName = companyName;
           this.companyNameEn = companyNameEn;
           this.companyid = companyid;
           this.sortNo = sortNo;
    }


    /**
     * Gets the activeYn value for this OrgCodeVO.
     * 
     * @return activeYn
     */
    public java.lang.String getActiveYn() {
        return activeYn;
    }


    /**
     * Sets the activeYn value for this OrgCodeVO.
     * 
     * @param activeYn
     */
    public void setActiveYn(java.lang.String activeYn) {
        this.activeYn = activeYn;
    }


    /**
     * Gets the codeId value for this OrgCodeVO.
     * 
     * @return codeId
     */
    public java.lang.String getCodeId() {
        return codeId;
    }


    /**
     * Sets the codeId value for this OrgCodeVO.
     * 
     * @param codeId
     */
    public void setCodeId(java.lang.String codeId) {
        this.codeId = codeId;
    }


    /**
     * Gets the codeName value for this OrgCodeVO.
     * 
     * @return codeName
     */
    public java.lang.String getCodeName() {
        return codeName;
    }


    /**
     * Sets the codeName value for this OrgCodeVO.
     * 
     * @param codeName
     */
    public void setCodeName(java.lang.String codeName) {
        this.codeName = codeName;
    }


    /**
     * Gets the codeNameEn value for this OrgCodeVO.
     * 
     * @return codeNameEn
     */
    public java.lang.String getCodeNameEn() {
        return codeNameEn;
    }


    /**
     * Sets the codeNameEn value for this OrgCodeVO.
     * 
     * @param codeNameEn
     */
    public void setCodeNameEn(java.lang.String codeNameEn) {
        this.codeNameEn = codeNameEn;
    }


    /**
     * Gets the codeType value for this OrgCodeVO.
     * 
     * @return codeType
     */
    public java.lang.String getCodeType() {
        return codeType;
    }


    /**
     * Sets the codeType value for this OrgCodeVO.
     * 
     * @param codeType
     */
    public void setCodeType(java.lang.String codeType) {
        this.codeType = codeType;
    }


    /**
     * Gets the companyName value for this OrgCodeVO.
     * 
     * @return companyName
     */
    public java.lang.String getCompanyName() {
        return companyName;
    }


    /**
     * Sets the companyName value for this OrgCodeVO.
     * 
     * @param companyName
     */
    public void setCompanyName(java.lang.String companyName) {
        this.companyName = companyName;
    }


    /**
     * Gets the companyNameEn value for this OrgCodeVO.
     * 
     * @return companyNameEn
     */
    public java.lang.String getCompanyNameEn() {
        return companyNameEn;
    }


    /**
     * Sets the companyNameEn value for this OrgCodeVO.
     * 
     * @param companyNameEn
     */
    public void setCompanyNameEn(java.lang.String companyNameEn) {
        this.companyNameEn = companyNameEn;
    }


    /**
     * Gets the companyid value for this OrgCodeVO.
     * 
     * @return companyid
     */
    public java.lang.String getCompanyid() {
        return companyid;
    }


    /**
     * Sets the companyid value for this OrgCodeVO.
     * 
     * @param companyid
     */
    public void setCompanyid(java.lang.String companyid) {
        this.companyid = companyid;
    }


    /**
     * Gets the sortNo value for this OrgCodeVO.
     * 
     * @return sortNo
     */
    public java.lang.Integer getSortNo() {
        return sortNo;
    }


    /**
     * Sets the sortNo value for this OrgCodeVO.
     * 
     * @param sortNo
     */
    public void setSortNo(java.lang.Integer sortNo) {
        this.sortNo = sortNo;
    }

    private java.lang.Object __equalsCalc = null;
    public synchronized boolean equals(java.lang.Object obj) {
        if (!(obj instanceof OrgCodeVO)) return false;
        OrgCodeVO other = (OrgCodeVO) obj;
        if (obj == null) return false;
        if (this == obj) return true;
        if (__equalsCalc != null) {
            return (__equalsCalc == obj);
        }
        __equalsCalc = obj;
        boolean _equals;
        _equals = true && 
            ((this.activeYn==null && other.getActiveYn()==null) || 
             (this.activeYn!=null &&
              this.activeYn.equals(other.getActiveYn()))) &&
            ((this.codeId==null && other.getCodeId()==null) || 
             (this.codeId!=null &&
              this.codeId.equals(other.getCodeId()))) &&
            ((this.codeName==null && other.getCodeName()==null) || 
             (this.codeName!=null &&
              this.codeName.equals(other.getCodeName()))) &&
            ((this.codeNameEn==null && other.getCodeNameEn()==null) || 
             (this.codeNameEn!=null &&
              this.codeNameEn.equals(other.getCodeNameEn()))) &&
            ((this.codeType==null && other.getCodeType()==null) || 
             (this.codeType!=null &&
              this.codeType.equals(other.getCodeType()))) &&
            ((this.companyName==null && other.getCompanyName()==null) || 
             (this.companyName!=null &&
              this.companyName.equals(other.getCompanyName()))) &&
            ((this.companyNameEn==null && other.getCompanyNameEn()==null) || 
             (this.companyNameEn!=null &&
              this.companyNameEn.equals(other.getCompanyNameEn()))) &&
            ((this.companyid==null && other.getCompanyid()==null) || 
             (this.companyid!=null &&
              this.companyid.equals(other.getCompanyid()))) &&
            ((this.sortNo==null && other.getSortNo()==null) || 
             (this.sortNo!=null &&
              this.sortNo.equals(other.getSortNo())));
        __equalsCalc = null;
        return _equals;
    }

    private boolean __hashCodeCalc = false;
    public synchronized int hashCode() {
        if (__hashCodeCalc) {
            return 0;
        }
        __hashCodeCalc = true;
        int _hashCode = 1;
        if (getActiveYn() != null) {
            _hashCode += getActiveYn().hashCode();
        }
        if (getCodeId() != null) {
            _hashCode += getCodeId().hashCode();
        }
        if (getCodeName() != null) {
            _hashCode += getCodeName().hashCode();
        }
        if (getCodeNameEn() != null) {
            _hashCode += getCodeNameEn().hashCode();
        }
        if (getCodeType() != null) {
            _hashCode += getCodeType().hashCode();
        }
        if (getCompanyName() != null) {
            _hashCode += getCompanyName().hashCode();
        }
        if (getCompanyNameEn() != null) {
            _hashCode += getCompanyNameEn().hashCode();
        }
        if (getCompanyid() != null) {
            _hashCode += getCompanyid().hashCode();
        }
        if (getSortNo() != null) {
            _hashCode += getSortNo().hashCode();
        }
        __hashCodeCalc = false;
        return _hashCode;
    }

    // Type metadata
    private static org.apache.axis.description.TypeDesc typeDesc =
        new org.apache.axis.description.TypeDesc(OrgCodeVO.class, true);

    static {
        typeDesc.setXmlType(new javax.xml.namespace.QName("http://vo.org.ss.branch.neo.hanwha", "OrgCodeVO"));
        org.apache.axis.description.ElementDesc elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("activeYn");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.org.ss.branch.neo.hanwha", "activeYn"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setMinOccurs(0);
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("codeId");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.org.ss.branch.neo.hanwha", "codeId"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setMinOccurs(0);
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("codeName");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.org.ss.branch.neo.hanwha", "codeName"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setMinOccurs(0);
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("codeNameEn");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.org.ss.branch.neo.hanwha", "codeNameEn"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setMinOccurs(0);
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("codeType");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.org.ss.branch.neo.hanwha", "codeType"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setMinOccurs(0);
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("companyName");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.org.ss.branch.neo.hanwha", "companyName"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setMinOccurs(0);
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("companyNameEn");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.org.ss.branch.neo.hanwha", "companyNameEn"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setMinOccurs(0);
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("companyid");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.org.ss.branch.neo.hanwha", "companyid"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setMinOccurs(0);
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("sortNo");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.org.ss.branch.neo.hanwha", "sortNo"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "int"));
        elemField.setMinOccurs(0);
        elemField.setNillable(false);
        typeDesc.addFieldDesc(elemField);
    }

    /**
     * Return type metadata object
     */
    public static org.apache.axis.description.TypeDesc getTypeDesc() {
        return typeDesc;
    }

    /**
     * Get Custom Serializer
     */
    public static org.apache.axis.encoding.Serializer getSerializer(
           java.lang.String mechType, 
           java.lang.Class _javaType,  
           javax.xml.namespace.QName _xmlType) {
        return 
          new  org.apache.axis.encoding.ser.BeanSerializer(
            _javaType, _xmlType, typeDesc);
    }

    /**
     * Get Custom Deserializer
     */
    public static org.apache.axis.encoding.Deserializer getDeserializer(
           java.lang.String mechType, 
           java.lang.Class _javaType,  
           javax.xml.namespace.QName _xmlType) {
        return 
          new  org.apache.axis.encoding.ser.BeanDeserializer(
            _javaType, _xmlType, typeDesc);
    }

}
