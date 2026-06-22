package hanwha.neo.branch.ss.approval.axisws;

public class ApprovalServiceProxy implements hanwha.neo.branch.ss.approval.axisws.ApprovalService {
  private String _endpoint = null;
  private hanwha.neo.branch.ss.approval.axisws.ApprovalService approvalService = null;
  
  public ApprovalServiceProxy() {
    _initApprovalServiceProxy();
  }
  
  public ApprovalServiceProxy(String endpoint) {
    _endpoint = endpoint;
    _initApprovalServiceProxy();
  }
  
  private void _initApprovalServiceProxy() {
    try {
      approvalService = (new hanwha.neo.branch.ss.approval.axisws.ApprovalServiceServiceLocator()).getApprovalService();
      if (approvalService != null) {
        if (_endpoint != null)
          ((javax.xml.rpc.Stub)approvalService)._setProperty("javax.xml.rpc.service.endpoint.address", _endpoint);
        else
          _endpoint = (String)((javax.xml.rpc.Stub)approvalService)._getProperty("javax.xml.rpc.service.endpoint.address");
      }
      
    }
    catch (javax.xml.rpc.ServiceException serviceException) {}
  }
  
  public String getEndpoint() {
    return _endpoint;
  }
  
  public void setEndpoint(String endpoint) {
    _endpoint = endpoint;
    if (approvalService != null)
      ((javax.xml.rpc.Stub)approvalService)._setProperty("javax.xml.rpc.service.endpoint.address", _endpoint);
    
  }
  
  public hanwha.neo.branch.ss.approval.axisws.ApprovalService getApprovalService() {
    if (approvalService == null)
      _initApprovalServiceProxy();
    return approvalService;
  }
  
  public java.lang.String submitTempApproval(hanwha.neo.branch.ss.approval.vo.ApprovalDocument approvalDocument) throws java.rmi.RemoteException, hanwha.neo.branch.ss.common.vo.WsException{
    if (approvalService == null)
      _initApprovalServiceProxy();
    return approvalService.submitTempApproval(approvalDocument);
  }
  
  public hanwha.neo.branch.ss.approval.vo.DelegatedSignerInfo getOriginUserIDUseUserId(hanwha.neo.branch.ss.approval.vo.MisKey miskey, hanwha.neo.branch.ss.approval.vo.DelegatedSignerInfo delegatedSignerInfo) throws java.rmi.RemoteException, hanwha.neo.branch.ss.common.vo.WsException{
    if (approvalService == null)
      _initApprovalServiceProxy();
    return approvalService.getOriginUserIDUseUserId(miskey, delegatedSignerInfo);
  }
  
  public hanwha.neo.branch.ss.approval.vo.ApprovalDocumentList[] getListByUserKeyUseUserId(hanwha.neo.branch.ss.approval.vo.ApprovalUserKey approvalUserKey) throws java.rmi.RemoteException, hanwha.neo.branch.ss.common.vo.WsException{
    if (approvalService == null)
      _initApprovalServiceProxy();
    return approvalService.getListByUserKeyUseUserId(approvalUserKey);
  }
  
  public java.lang.String submitApprovalUseUserId(hanwha.neo.branch.ss.approval.vo.ApprovalDocument approvalDocument) throws java.rmi.RemoteException, hanwha.neo.branch.ss.common.vo.WsException{
    if (approvalService == null)
      _initApprovalServiceProxy();
    return approvalService.submitApprovalUseUserId(approvalDocument);
  }
  
  public hanwha.neo.branch.ss.approval.vo.ApprovalDocumentStatusOnly[] getProcessIdByBulkMisId(hanwha.neo.branch.ss.approval.vo.MisKey[] miskey) throws java.rmi.RemoteException, hanwha.neo.branch.ss.common.vo.WsException{
    if (approvalService == null)
      _initApprovalServiceProxy();
    return approvalService.getProcessIdByBulkMisId(miskey);
  }
  
  public java.lang.String submitApproval(hanwha.neo.branch.ss.approval.vo.ApprovalDocument approvalDocument) throws java.rmi.RemoteException, hanwha.neo.branch.ss.common.vo.WsException{
    if (approvalService == null)
      _initApprovalServiceProxy();
    return approvalService.submitApproval(approvalDocument);
  }
  
  public hanwha.neo.branch.ss.approval.vo.ApprovalDocumentStatus getStatusByMisId(hanwha.neo.branch.ss.approval.vo.MisKey miskey) throws java.rmi.RemoteException, hanwha.neo.branch.ss.common.vo.WsException{
    if (approvalService == null)
      _initApprovalServiceProxy();
    return approvalService.getStatusByMisId(miskey);
  }
  
  public java.lang.String cancelApproval(hanwha.neo.branch.ss.approval.vo.CancelApprovalDocument cancelApprovalDocument) throws java.rmi.RemoteException, hanwha.neo.branch.ss.common.vo.WsException{
    if (approvalService == null)
      _initApprovalServiceProxy();
    return approvalService.cancelApproval(cancelApprovalDocument);
  }
  
  public hanwha.neo.branch.ss.approval.vo.DelegatedSignerInfo getOriginUserID(hanwha.neo.branch.ss.approval.vo.MisKey miskey, hanwha.neo.branch.ss.approval.vo.DelegatedSignerInfo delegatedSignerInfo) throws java.rmi.RemoteException, hanwha.neo.branch.ss.common.vo.WsException{
    if (approvalService == null)
      _initApprovalServiceProxy();
    return approvalService.getOriginUserID(miskey, delegatedSignerInfo);
  }
  
  public hanwha.neo.branch.ss.approval.vo.ApprovalDocumentList[] getListByUserKey(hanwha.neo.branch.ss.approval.vo.ApprovalUserKey approvalUserKey) throws java.rmi.RemoteException, hanwha.neo.branch.ss.common.vo.WsException{
    if (approvalService == null)
      _initApprovalServiceProxy();
    return approvalService.getListByUserKey(approvalUserKey);
  }
  
  public java.lang.String submitTempApprovalUseUserId(hanwha.neo.branch.ss.approval.vo.ApprovalDocument approvalDocument) throws java.rmi.RemoteException, hanwha.neo.branch.ss.common.vo.WsException{
    if (approvalService == null)
      _initApprovalServiceProxy();
    return approvalService.submitTempApprovalUseUserId(approvalDocument);
  }
  
  
}