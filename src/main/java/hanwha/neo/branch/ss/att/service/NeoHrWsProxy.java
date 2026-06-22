package hanwha.neo.branch.ss.att.service;

public class NeoHrWsProxy implements hanwha.neo.branch.ss.att.service.NeoHrWs {

    private String _endpoint = null;
    private hanwha.neo.branch.ss.att.service.NeoHrWs neoHrWs = null;

    public NeoHrWsProxy() {
        _initNeoHrWsProxy();
    }

    public NeoHrWsProxy(String endpoint) {
        _endpoint = endpoint;
        _initNeoHrWsProxy();
    }

    private void _initNeoHrWsProxy() {
        try {
            neoHrWs = (new hanwha.neo.branch.ss.att.service.NeoHrWsImplServiceLocator()).getNeoHrWsImplPort();
            if (neoHrWs != null) {
                if (_endpoint != null) {
                    ((javax.xml.rpc.Stub) neoHrWs)._setProperty(
                            "javax.xml.rpc.service.endpoint.address", _endpoint);
                } else {
                    _endpoint = (String) ((javax.xml.rpc.Stub) neoHrWs)._getProperty(
                            "javax.xml.rpc.service.endpoint.address");
                }
            }
        } catch (javax.xml.rpc.ServiceException serviceException) {
        }
    }

    public String getEndpoint() {
        return _endpoint;
    }

    public void setEndpoint(String endpoint) {
        _endpoint = endpoint;
        if (neoHrWs != null) {
            ((javax.xml.rpc.Stub) neoHrWs)._setProperty(
                    "javax.xml.rpc.service.endpoint.address", _endpoint);
        }
    }

    public hanwha.neo.branch.ss.att.service.NeoHrWs getNeoHrWs() {
        if (neoHrWs == null) {
            _initNeoHrWsProxy();
        }
        return neoHrWs;
    }

    public java.lang.String syncHrOffData(hanwha.neo.branch.ss.att.vo.SyncHrOffDataRequest request)
            throws java.rmi.RemoteException, hanwha.neo.branch.ss.common.vo.WsException {
        if (neoHrWs == null) {
            _initNeoHrWsProxy();
        }
        return neoHrWs.syncHrOffData(request);
    }
}
