package hanwha.neo.branch.common.sso.service;

public class NeoSloWsProxy implements hanwha.neo.branch.common.sso.service.NeoSloWs {
  private String _endpoint = null;
  private hanwha.neo.branch.common.sso.service.NeoSloWs neoSloWs = null;
  
  public NeoSloWsProxy() {
    _initNeoSloWsProxy();
  }
  
  public NeoSloWsProxy(String endpoint) {
    _endpoint = endpoint;
    _initNeoSloWsProxy();
  }
  
  private void _initNeoSloWsProxy() {
    try {
      neoSloWs = (new hanwha.neo.branch.common.sso.service.NeoSloWsImplServiceLocator()).getNeoSloWsImplPort();
      if (neoSloWs != null) {
        if (_endpoint != null)
          ((javax.xml.rpc.Stub)neoSloWs)._setProperty("javax.xml.rpc.service.endpoint.address", _endpoint);
        else
          _endpoint = (String)((javax.xml.rpc.Stub)neoSloWs)._getProperty("javax.xml.rpc.service.endpoint.address");
      }
      
    }
    catch (javax.xml.rpc.ServiceException serviceException) {}
  }
  
  public String getEndpoint() {
    return _endpoint;
  }
  
  public void setEndpoint(String endpoint) {
    _endpoint = endpoint;
    if (neoSloWs != null)
      ((javax.xml.rpc.Stub)neoSloWs)._setProperty("javax.xml.rpc.service.endpoint.address", _endpoint);
    
  }
  
  public hanwha.neo.branch.common.sso.service.NeoSloWs getNeoSloWs() {
    if (neoSloWs == null)
      _initNeoSloWsProxy();
    return neoSloWs;
  }
  
  public java.lang.String create(java.lang.String id, java.lang.String type, java.lang.String target) throws java.rmi.RemoteException, hanwha.neo.branch.ss.common.vo.WsException{
    if (neoSloWs == null)
      _initNeoSloWsProxy();
    return neoSloWs.create(id, type, target);
  }
  
  public java.lang.String login(java.lang.String otaId, java.lang.String target) throws java.rmi.RemoteException, hanwha.neo.branch.ss.common.vo.WsException{
    if (neoSloWs == null)
      _initNeoSloWsProxy();
    return neoSloWs.login(otaId, target);
  }
  
  
}