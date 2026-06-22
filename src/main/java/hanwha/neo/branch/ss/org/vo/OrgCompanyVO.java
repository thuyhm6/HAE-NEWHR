/**
 * OrgCompanyVO.java
 *
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package hanwha.neo.branch.ss.org.vo;

public class OrgCompanyVO  implements java.io.Serializable {
    private java.lang.Integer activeFlag;

    private java.lang.String companyId;

    private java.lang.String companyName;

    private java.lang.String companyNameEn;

    private java.lang.Integer sortNo;

    public OrgCompanyVO() {
    }

    public OrgCompanyVO(
           java.lang.Integer activeFlag,
           java.lang.String companyId,
           java.lang.String companyName,
           java.lang.String companyNameEn,
           java.lang.Integer sortNo) {
           this.activeFlag = activeFlag;
           this.companyId = companyId;
           this.companyName = companyName;
           this.companyNameEn = companyNameEn;
           this.sortNo = sortNo;
    }


    /**
     * Gets the activeFlag value for this OrgCompanyVO.
     * 
     * @return activeFlag
     */
    public java.lang.Integer getActiveFlag() {
        return activeFlag;
    }


    /**
     * Sets the activeFlag value for this OrgCompanyVO.
     * 
     * @param activeFlag
     */
    public void setActiveFlag(java.lang.Integer activeFlag) {
        this.activeFlag = activeFlag;
    }


    /**
     * Gets the companyId value for this OrgCompanyVO.
     * 
     * @return companyId
     */
    public java.lang.String getCompanyId() {
        return companyId;
    }


    /**
     * Sets the companyId value for this OrgCompanyVO.
     * 
     * @param companyId
     */
    public void setCompanyId(java.lang.String companyId) {
        this.companyId = companyId;
    }


    /**
     * Gets the companyName value for this OrgCompanyVO.
     * 
     * @return companyName
     */
    public java.lang.String getCompanyName() {
        return companyName;
    }


    /**
     * Sets the companyName value for this OrgCompanyVO.
     * 
     * @param companyName
     */
    public void setCompanyName(java.lang.String companyName) {
        this.companyName = companyName;
    }


    /**
     * Gets the companyNameEn value for this OrgCompanyVO.
     * 
     * @return companyNameEn
     */
    public java.lang.String getCompanyNameEn() {
        return companyNameEn;
    }


    /**
     * Sets the companyNameEn value for this OrgCompanyVO.
     * 
     * @param companyNameEn
     */
    public void setCompanyNameEn(java.lang.String companyNameEn) {
        this.companyNameEn = companyNameEn;
    }


    /**
     * Gets the sortNo value for this OrgCompanyVO.
     * 
     * @return sortNo
     */
    public java.lang.Integer getSortNo() {
        return sortNo;
    }


    /**
     * Sets the sortNo value for this OrgCompanyVO.
     * 
     * @param sortNo
     */
    public void setSortNo(java.lang.Integer sortNo) {
        this.sortNo = sortNo;
    }

    private java.lang.Object __equalsCalc = null;
    public synchronized boolean equals(java.lang.Object obj) {
        if (!(obj instanceof OrgCompanyVO)) return false;
        OrgCompanyVO other = (OrgCompanyVO) obj;
        if (obj == null) return false;
        if (this == obj) return true;
        if (__equalsCalc != null) {
            return (__equalsCalc == obj);
        }
        __equalsCalc = obj;
        boolean _equals;
        _equals = true && 
            ((this.activeFlag==null && other.getActiveFlag()==null) || 
             (this.activeFlag!=null &&
              this.activeFlag.equals(other.getActiveFlag()))) &&
            ((this.companyId==null && other.getCompanyId()==null) || 
             (this.companyId!=null &&
              this.companyId.equals(other.getCompanyId()))) &&
            ((this.companyName==null && other.getCompanyName()==null) || 
             (this.companyName!=null &&
              this.companyName.equals(other.getCompanyName()))) &&
            ((this.companyNameEn==null && other.getCompanyNameEn()==null) || 
             (this.companyNameEn!=null &&
              this.companyNameEn.equals(other.getCompanyNameEn()))) &&
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
        if (getActiveFlag() != null) {
            _hashCode += getActiveFlag().hashCode();
        }
        if (getCompanyId() != null) {
            _hashCode += getCompanyId().hashCode();
        }
        if (getCompanyName() != null) {
            _hashCode += getCompanyName().hashCode();
        }
        if (getCompanyNameEn() != null) {
            _hashCode += getCompanyNameEn().hashCode();
        }
        if (getSortNo() != null) {
            _hashCode += getSortNo().hashCode();
        }
        __hashCodeCalc = false;
        return _hashCode;
    }

    // Type metadata
    private static org.apache.axis.description.TypeDesc typeDesc =
        new org.apache.axis.description.TypeDesc(OrgCompanyVO.class, true);

    static {
        typeDesc.setXmlType(new javax.xml.namespace.QName("http://vo.org.ss.branch.neo.hanwha", "OrgCompanyVO"));
        org.apache.axis.description.ElementDesc elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("activeFlag");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.org.ss.branch.neo.hanwha", "activeFlag"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "int"));
        elemField.setMinOccurs(0);
        elemField.setNillable(false);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("companyId");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.org.ss.branch.neo.hanwha", "companyId"));
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
