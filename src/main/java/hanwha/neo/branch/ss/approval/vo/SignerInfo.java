/**
 * SignerInfo.java
 *
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package hanwha.neo.branch.ss.approval.vo;

public class SignerInfo  implements java.io.Serializable {
    private boolean arbitrary;

    private int assignType;

    private java.lang.String comment;

    private java.lang.String companyId;

    private java.lang.String companyName;

    private boolean delegeted;

    private java.lang.String deptId;

    private java.lang.String deptName;

    private java.lang.String emailAddr;

    private java.lang.String endDate;

    private java.lang.String functionId;

    private java.lang.String functionName;

    private boolean notEditable;

    private boolean notRemovable;

    private int sequence;

    private int status;

    private java.lang.String stdDate;

    private java.lang.String userId;

    private java.lang.String userName;

    private java.lang.String userkey;

    public SignerInfo() {
    }

    public SignerInfo(
           boolean arbitrary,
           int assignType,
           java.lang.String comment,
           java.lang.String companyId,
           java.lang.String companyName,
           boolean delegeted,
           java.lang.String deptId,
           java.lang.String deptName,
           java.lang.String emailAddr,
           java.lang.String endDate,
           java.lang.String functionId,
           java.lang.String functionName,
           boolean notEditable,
           boolean notRemovable,
           int sequence,
           int status,
           java.lang.String stdDate,
           java.lang.String userId,
           java.lang.String userName,
           java.lang.String userkey) {
           this.arbitrary = arbitrary;
           this.assignType = assignType;
           this.comment = comment;
           this.companyId = companyId;
           this.companyName = companyName;
           this.delegeted = delegeted;
           this.deptId = deptId;
           this.deptName = deptName;
           this.emailAddr = emailAddr;
           this.endDate = endDate;
           this.functionId = functionId;
           this.functionName = functionName;
           this.notEditable = notEditable;
           this.notRemovable = notRemovable;
           this.sequence = sequence;
           this.status = status;
           this.stdDate = stdDate;
           this.userId = userId;
           this.userName = userName;
           this.userkey = userkey;
    }


    /**
     * Gets the arbitrary value for this SignerInfo.
     * 
     * @return arbitrary
     */
    public boolean isArbitrary() {
        return arbitrary;
    }


    /**
     * Sets the arbitrary value for this SignerInfo.
     * 
     * @param arbitrary
     */
    public void setArbitrary(boolean arbitrary) {
        this.arbitrary = arbitrary;
    }


    /**
     * Gets the assignType value for this SignerInfo.
     * 
     * @return assignType
     */
    public int getAssignType() {
        return assignType;
    }


    /**
     * Sets the assignType value for this SignerInfo.
     * 
     * @param assignType
     */
    public void setAssignType(int assignType) {
        this.assignType = assignType;
    }


    /**
     * Gets the comment value for this SignerInfo.
     * 
     * @return comment
     */
    public java.lang.String getComment() {
        return comment;
    }


    /**
     * Sets the comment value for this SignerInfo.
     * 
     * @param comment
     */
    public void setComment(java.lang.String comment) {
        this.comment = comment;
    }


    /**
     * Gets the companyId value for this SignerInfo.
     * 
     * @return companyId
     */
    public java.lang.String getCompanyId() {
        return companyId;
    }


    /**
     * Sets the companyId value for this SignerInfo.
     * 
     * @param companyId
     */
    public void setCompanyId(java.lang.String companyId) {
        this.companyId = companyId;
    }


    /**
     * Gets the companyName value for this SignerInfo.
     * 
     * @return companyName
     */
    public java.lang.String getCompanyName() {
        return companyName;
    }


    /**
     * Sets the companyName value for this SignerInfo.
     * 
     * @param companyName
     */
    public void setCompanyName(java.lang.String companyName) {
        this.companyName = companyName;
    }


    /**
     * Gets the delegeted value for this SignerInfo.
     * 
     * @return delegeted
     */
    public boolean isDelegeted() {
        return delegeted;
    }


    /**
     * Sets the delegeted value for this SignerInfo.
     * 
     * @param delegeted
     */
    public void setDelegeted(boolean delegeted) {
        this.delegeted = delegeted;
    }


    /**
     * Gets the deptId value for this SignerInfo.
     * 
     * @return deptId
     */
    public java.lang.String getDeptId() {
        return deptId;
    }


    /**
     * Sets the deptId value for this SignerInfo.
     * 
     * @param deptId
     */
    public void setDeptId(java.lang.String deptId) {
        this.deptId = deptId;
    }


    /**
     * Gets the deptName value for this SignerInfo.
     * 
     * @return deptName
     */
    public java.lang.String getDeptName() {
        return deptName;
    }


    /**
     * Sets the deptName value for this SignerInfo.
     * 
     * @param deptName
     */
    public void setDeptName(java.lang.String deptName) {
        this.deptName = deptName;
    }


    /**
     * Gets the emailAddr value for this SignerInfo.
     * 
     * @return emailAddr
     */
    public java.lang.String getEmailAddr() {
        return emailAddr;
    }


    /**
     * Sets the emailAddr value for this SignerInfo.
     * 
     * @param emailAddr
     */
    public void setEmailAddr(java.lang.String emailAddr) {
        this.emailAddr = emailAddr;
    }


    /**
     * Gets the endDate value for this SignerInfo.
     * 
     * @return endDate
     */
    public java.lang.String getEndDate() {
        return endDate;
    }


    /**
     * Sets the endDate value for this SignerInfo.
     * 
     * @param endDate
     */
    public void setEndDate(java.lang.String endDate) {
        this.endDate = endDate;
    }


    /**
     * Gets the functionId value for this SignerInfo.
     * 
     * @return functionId
     */
    public java.lang.String getFunctionId() {
        return functionId;
    }


    /**
     * Sets the functionId value for this SignerInfo.
     * 
     * @param functionId
     */
    public void setFunctionId(java.lang.String functionId) {
        this.functionId = functionId;
    }


    /**
     * Gets the functionName value for this SignerInfo.
     * 
     * @return functionName
     */
    public java.lang.String getFunctionName() {
        return functionName;
    }


    /**
     * Sets the functionName value for this SignerInfo.
     * 
     * @param functionName
     */
    public void setFunctionName(java.lang.String functionName) {
        this.functionName = functionName;
    }


    /**
     * Gets the notEditable value for this SignerInfo.
     * 
     * @return notEditable
     */
    public boolean isNotEditable() {
        return notEditable;
    }


    /**
     * Sets the notEditable value for this SignerInfo.
     * 
     * @param notEditable
     */
    public void setNotEditable(boolean notEditable) {
        this.notEditable = notEditable;
    }


    /**
     * Gets the notRemovable value for this SignerInfo.
     * 
     * @return notRemovable
     */
    public boolean isNotRemovable() {
        return notRemovable;
    }


    /**
     * Sets the notRemovable value for this SignerInfo.
     * 
     * @param notRemovable
     */
    public void setNotRemovable(boolean notRemovable) {
        this.notRemovable = notRemovable;
    }


    /**
     * Gets the sequence value for this SignerInfo.
     * 
     * @return sequence
     */
    public int getSequence() {
        return sequence;
    }


    /**
     * Sets the sequence value for this SignerInfo.
     * 
     * @param sequence
     */
    public void setSequence(int sequence) {
        this.sequence = sequence;
    }


    /**
     * Gets the status value for this SignerInfo.
     * 
     * @return status
     */
    public int getStatus() {
        return status;
    }


    /**
     * Sets the status value for this SignerInfo.
     * 
     * @param status
     */
    public void setStatus(int status) {
        this.status = status;
    }


    /**
     * Gets the stdDate value for this SignerInfo.
     * 
     * @return stdDate
     */
    public java.lang.String getStdDate() {
        return stdDate;
    }


    /**
     * Sets the stdDate value for this SignerInfo.
     * 
     * @param stdDate
     */
    public void setStdDate(java.lang.String stdDate) {
        this.stdDate = stdDate;
    }


    /**
     * Gets the userId value for this SignerInfo.
     * 
     * @return userId
     */
    public java.lang.String getUserId() {
        return userId;
    }


    /**
     * Sets the userId value for this SignerInfo.
     * 
     * @param userId
     */
    public void setUserId(java.lang.String userId) {
        this.userId = userId;
    }


    /**
     * Gets the userName value for this SignerInfo.
     * 
     * @return userName
     */
    public java.lang.String getUserName() {
        return userName;
    }


    /**
     * Sets the userName value for this SignerInfo.
     * 
     * @param userName
     */
    public void setUserName(java.lang.String userName) {
        this.userName = userName;
    }


    /**
     * Gets the userkey value for this SignerInfo.
     * 
     * @return userkey
     */
    public java.lang.String getUserkey() {
        return userkey;
    }


    /**
     * Sets the userkey value for this SignerInfo.
     * 
     * @param userkey
     */
    public void setUserkey(java.lang.String userkey) {
        this.userkey = userkey;
    }

    private java.lang.Object __equalsCalc = null;
    public synchronized boolean equals(java.lang.Object obj) {
        if (!(obj instanceof SignerInfo)) return false;
        SignerInfo other = (SignerInfo) obj;
        if (obj == null) return false;
        if (this == obj) return true;
        if (__equalsCalc != null) {
            return (__equalsCalc == obj);
        }
        __equalsCalc = obj;
        boolean _equals;
        _equals = true && 
            this.arbitrary == other.isArbitrary() &&
            this.assignType == other.getAssignType() &&
            ((this.comment==null && other.getComment()==null) || 
             (this.comment!=null &&
              this.comment.equals(other.getComment()))) &&
            ((this.companyId==null && other.getCompanyId()==null) || 
             (this.companyId!=null &&
              this.companyId.equals(other.getCompanyId()))) &&
            ((this.companyName==null && other.getCompanyName()==null) || 
             (this.companyName!=null &&
              this.companyName.equals(other.getCompanyName()))) &&
            this.delegeted == other.isDelegeted() &&
            ((this.deptId==null && other.getDeptId()==null) || 
             (this.deptId!=null &&
              this.deptId.equals(other.getDeptId()))) &&
            ((this.deptName==null && other.getDeptName()==null) || 
             (this.deptName!=null &&
              this.deptName.equals(other.getDeptName()))) &&
            ((this.emailAddr==null && other.getEmailAddr()==null) || 
             (this.emailAddr!=null &&
              this.emailAddr.equals(other.getEmailAddr()))) &&
            ((this.endDate==null && other.getEndDate()==null) || 
             (this.endDate!=null &&
              this.endDate.equals(other.getEndDate()))) &&
            ((this.functionId==null && other.getFunctionId()==null) || 
             (this.functionId!=null &&
              this.functionId.equals(other.getFunctionId()))) &&
            ((this.functionName==null && other.getFunctionName()==null) || 
             (this.functionName!=null &&
              this.functionName.equals(other.getFunctionName()))) &&
            this.notEditable == other.isNotEditable() &&
            this.notRemovable == other.isNotRemovable() &&
            this.sequence == other.getSequence() &&
            this.status == other.getStatus() &&
            ((this.stdDate==null && other.getStdDate()==null) || 
             (this.stdDate!=null &&
              this.stdDate.equals(other.getStdDate()))) &&
            ((this.userId==null && other.getUserId()==null) || 
             (this.userId!=null &&
              this.userId.equals(other.getUserId()))) &&
            ((this.userName==null && other.getUserName()==null) || 
             (this.userName!=null &&
              this.userName.equals(other.getUserName()))) &&
            ((this.userkey==null && other.getUserkey()==null) || 
             (this.userkey!=null &&
              this.userkey.equals(other.getUserkey())));
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
        _hashCode += (isArbitrary() ? Boolean.TRUE : Boolean.FALSE).hashCode();
        _hashCode += getAssignType();
        if (getComment() != null) {
            _hashCode += getComment().hashCode();
        }
        if (getCompanyId() != null) {
            _hashCode += getCompanyId().hashCode();
        }
        if (getCompanyName() != null) {
            _hashCode += getCompanyName().hashCode();
        }
        _hashCode += (isDelegeted() ? Boolean.TRUE : Boolean.FALSE).hashCode();
        if (getDeptId() != null) {
            _hashCode += getDeptId().hashCode();
        }
        if (getDeptName() != null) {
            _hashCode += getDeptName().hashCode();
        }
        if (getEmailAddr() != null) {
            _hashCode += getEmailAddr().hashCode();
        }
        if (getEndDate() != null) {
            _hashCode += getEndDate().hashCode();
        }
        if (getFunctionId() != null) {
            _hashCode += getFunctionId().hashCode();
        }
        if (getFunctionName() != null) {
            _hashCode += getFunctionName().hashCode();
        }
        _hashCode += (isNotEditable() ? Boolean.TRUE : Boolean.FALSE).hashCode();
        _hashCode += (isNotRemovable() ? Boolean.TRUE : Boolean.FALSE).hashCode();
        _hashCode += getSequence();
        _hashCode += getStatus();
        if (getStdDate() != null) {
            _hashCode += getStdDate().hashCode();
        }
        if (getUserId() != null) {
            _hashCode += getUserId().hashCode();
        }
        if (getUserName() != null) {
            _hashCode += getUserName().hashCode();
        }
        if (getUserkey() != null) {
            _hashCode += getUserkey().hashCode();
        }
        __hashCodeCalc = false;
        return _hashCode;
    }

    // Type metadata
    private static org.apache.axis.description.TypeDesc typeDesc =
        new org.apache.axis.description.TypeDesc(SignerInfo.class, true);

    static {
        typeDesc.setXmlType(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "SignerInfo"));
        org.apache.axis.description.ElementDesc elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("arbitrary");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "arbitrary"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "boolean"));
        elemField.setNillable(false);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("assignType");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "assignType"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "int"));
        elemField.setNillable(false);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("comment");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "comment"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("companyId");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "companyId"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("companyName");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "companyName"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("delegeted");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "delegeted"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "boolean"));
        elemField.setNillable(false);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("deptId");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "deptId"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("deptName");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "deptName"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("emailAddr");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "emailAddr"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("endDate");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "endDate"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("functionId");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "functionId"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("functionName");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "functionName"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("notEditable");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "notEditable"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "boolean"));
        elemField.setNillable(false);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("notRemovable");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "notRemovable"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "boolean"));
        elemField.setNillable(false);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("sequence");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "sequence"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "int"));
        elemField.setNillable(false);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("status");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "status"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "int"));
        elemField.setNillable(false);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("stdDate");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "stdDate"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("userId");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "userId"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("userName");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "userName"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("userkey");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.approval.ss.branch.neo.hanwha", "userkey"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(true);
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
