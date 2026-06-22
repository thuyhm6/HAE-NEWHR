/**
 * WsAttachFile.java
 *
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package hanwha.neo.branch.ss.common.vo;

public class WsAttachFile  implements java.io.Serializable {
    private java.lang.String fileId;

    private javax.activation.DataHandler fileInfo;

    private java.lang.String fileName;

    private java.lang.String fileSize;

    private int seqID;

    public WsAttachFile() {
    }

    public WsAttachFile(
           java.lang.String fileId,
           javax.activation.DataHandler fileInfo,
           java.lang.String fileName,
           java.lang.String fileSize,
           int seqID) {
           this.fileId = fileId;
           this.fileInfo = fileInfo;
           this.fileName = fileName;
           this.fileSize = fileSize;
           this.seqID = seqID;
    }


    /**
     * Gets the fileId value for this WsAttachFile.
     * 
     * @return fileId
     */
    public java.lang.String getFileId() {
        return fileId;
    }


    /**
     * Sets the fileId value for this WsAttachFile.
     * 
     * @param fileId
     */
    public void setFileId(java.lang.String fileId) {
        this.fileId = fileId;
    }


    /**
     * Gets the fileInfo value for this WsAttachFile.
     * 
     * @return fileInfo
     */
    public javax.activation.DataHandler getFileInfo() {
        return fileInfo;
    }


    /**
     * Sets the fileInfo value for this WsAttachFile.
     * 
     * @param fileInfo
     */
    public void setFileInfo(javax.activation.DataHandler fileInfo) {
        this.fileInfo = fileInfo;
    }


    /**
     * Gets the fileName value for this WsAttachFile.
     * 
     * @return fileName
     */
    public java.lang.String getFileName() {
        return fileName;
    }


    /**
     * Sets the fileName value for this WsAttachFile.
     * 
     * @param fileName
     */
    public void setFileName(java.lang.String fileName) {
        this.fileName = fileName;
    }


    /**
     * Gets the fileSize value for this WsAttachFile.
     * 
     * @return fileSize
     */
    public java.lang.String getFileSize() {
        return fileSize;
    }


    /**
     * Sets the fileSize value for this WsAttachFile.
     * 
     * @param fileSize
     */
    public void setFileSize(java.lang.String fileSize) {
        this.fileSize = fileSize;
    }


    /**
     * Gets the seqID value for this WsAttachFile.
     * 
     * @return seqID
     */
    public int getSeqID() {
        return seqID;
    }


    /**
     * Sets the seqID value for this WsAttachFile.
     * 
     * @param seqID
     */
    public void setSeqID(int seqID) {
        this.seqID = seqID;
    }

    private java.lang.Object __equalsCalc = null;
    public synchronized boolean equals(java.lang.Object obj) {
        if (!(obj instanceof WsAttachFile)) return false;
        WsAttachFile other = (WsAttachFile) obj;
        if (obj == null) return false;
        if (this == obj) return true;
        if (__equalsCalc != null) {
            return (__equalsCalc == obj);
        }
        __equalsCalc = obj;
        boolean _equals;
        _equals = true && 
            ((this.fileId==null && other.getFileId()==null) || 
             (this.fileId!=null &&
              this.fileId.equals(other.getFileId()))) &&
            ((this.fileInfo==null && other.getFileInfo()==null) || 
             (this.fileInfo!=null &&
              this.fileInfo.equals(other.getFileInfo()))) &&
            ((this.fileName==null && other.getFileName()==null) || 
             (this.fileName!=null &&
              this.fileName.equals(other.getFileName()))) &&
            ((this.fileSize==null && other.getFileSize()==null) || 
             (this.fileSize!=null &&
              this.fileSize.equals(other.getFileSize()))) &&
            this.seqID == other.getSeqID();
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
        if (getFileId() != null) {
            _hashCode += getFileId().hashCode();
        }
        if (getFileInfo() != null) {
            _hashCode += getFileInfo().hashCode();
        }
        if (getFileName() != null) {
            _hashCode += getFileName().hashCode();
        }
        if (getFileSize() != null) {
            _hashCode += getFileSize().hashCode();
        }
        _hashCode += getSeqID();
        __hashCodeCalc = false;
        return _hashCode;
    }

    // Type metadata
    private static org.apache.axis.description.TypeDesc typeDesc =
        new org.apache.axis.description.TypeDesc(WsAttachFile.class, true);

    static {
        typeDesc.setXmlType(new javax.xml.namespace.QName("http://vo.common.ss.branch.neo.hanwha", "WsAttachFile"));
        org.apache.axis.description.ElementDesc elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("fileId");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.common.ss.branch.neo.hanwha", "fileId"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("fileInfo");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.common.ss.branch.neo.hanwha", "fileInfo"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "anyURI"));
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("fileName");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.common.ss.branch.neo.hanwha", "fileName"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("fileSize");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.common.ss.branch.neo.hanwha", "fileSize"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("seqID");
        elemField.setXmlName(new javax.xml.namespace.QName("http://vo.common.ss.branch.neo.hanwha", "seqID"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "int"));
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
