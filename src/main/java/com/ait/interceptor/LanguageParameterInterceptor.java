package com.ait.interceptor;

import org.apache.ibatis.executor.Executor;
import org.apache.ibatis.executor.parameter.ParameterHandler;
import org.apache.ibatis.mapping.BoundSql;
import org.apache.ibatis.plugin.*;
import org.apache.ibatis.mapping.MappedStatement;
import org.apache.ibatis.session.ResultHandler;
import org.apache.ibatis.session.RowBounds;
import org.apache.ibatis.reflection.MetaObject;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;

/**
 * MyBatis interceptor to ensure every statement has global parameters like
 * `lang`, `adminIP`, and `adminID`.
 */
@Intercepts({
        @Signature(type = ParameterHandler.class, method = "setParameters", args = {
                java.sql.PreparedStatement.class }),
        @Signature(type = Executor.class, method = "query", args = { MappedStatement.class, Object.class,
                RowBounds.class, ResultHandler.class }),
        @Signature(type = Executor.class, method = "update", args = { MappedStatement.class, Object.class })
})
public class LanguageParameterInterceptor implements Interceptor {

    @Override
    public Object intercept(Invocation invocation) throws Throwable {
        Object target = invocation.getTarget();
        // Intercept early at Executor level to ensure dynamic SQL can see parameters
        if (target instanceof Executor) {
            Object[] args = invocation.getArgs();
            if (args != null && args.length >= 2) {
                MappedStatement ms = (MappedStatement) args[0];
                Object originalParam = args[1];
                String currentLang = resolveCurrentLanguage();
                String currentIp = resolveClientIp();
                String currentAdminId = resolveAdminId();
                String currentCpnyId = resolveCpnyId();

                if (originalParam instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> map = (Map<String, Object>) originalParam;
                    if (!map.containsKey("lang") || map.get("lang") == null) {
                        map.put("lang", currentLang);
                    }
                    if (!map.containsKey("adminIP") || map.get("adminIP") == null) {
                        map.put("adminIP", currentIp);
                    }
                    if (!map.containsKey("adminID") || map.get("adminID") == null) {
                        map.put("adminID", currentAdminId);
                    }
                    if (!map.containsKey("cpnyId") || map.get("cpnyId") == null) {
                        map.put("cpnyId", currentCpnyId);
                    }
                } else if (originalParam == null) {
                    Map<String, Object> map = new HashMap<>();
                    map.put("lang", currentLang);
                    map.put("adminIP", currentIp);
                    map.put("adminID", currentAdminId);
                    map.put("cpnyId", currentCpnyId);
                    args[1] = map;
                } else {
                    Map<String, Object> map = new HashMap<>();
                    // Copy all readable bean properties so existing #{offset}, #{limit}, ... keep
                    // working
                    MetaObject metaObject = ms.getConfiguration().newMetaObject(originalParam);
                    for (String getter : metaObject.getGetterNames()) {
                        map.put(getter, metaObject.getValue(getter));
                    }
                    map.put("_param", originalParam);
                    map.put("value", originalParam);
                    map.put("lang", currentLang);
                    map.put("adminIP", currentIp);
                    map.put("adminID", currentAdminId);
                    map.put("cpnyId", currentCpnyId);
                    args[1] = map;
                }
            }
            return invocation.proceed();
        }

        if (target instanceof ParameterHandler) {
            ParameterHandler parameterHandler = (ParameterHandler) target;

            // Access BoundSql to read current parameterObject
            Field boundSqlField = parameterHandler.getClass().getDeclaredField("boundSql");
            boundSqlField.setAccessible(true);
            BoundSql boundSql = (BoundSql) boundSqlField.get(parameterHandler);

            Object paramObj = boundSql.getParameterObject();

            // Determine current language and IP from request/session
            // Determine current language and IP from request/session
            String currentLang = resolveCurrentLanguage();
            String currentIp = resolveClientIp();
            String currentAdminId = resolveAdminId();
            String currentCpnyId = resolveCpnyId();

            // If parameter is a Map, inject/override params
            if (paramObj instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> map = (Map<String, Object>) paramObj;
                if (!map.containsKey("lang") || map.get("lang") == null) {
                    map.put("lang", currentLang);
                }
                if (!map.containsKey("adminIP") || map.get("adminIP") == null) {
                    map.put("adminIP", currentIp);
                }
                if (!map.containsKey("adminID") || map.get("adminID") == null) {
                    map.put("adminID", currentAdminId);
                }
                if (!map.containsKey("cpnyId") || map.get("cpnyId") == null) {
                    map.put("cpnyId", currentCpnyId);
                }
            } else if (paramObj == null) {
                // No parameters: create a map
                Map<String, Object> map = new HashMap<>();
                map.put("lang", currentLang);
                map.put("adminIP", currentIp);
                map.put("adminID", currentAdminId);
                map.put("cpnyId", currentCpnyId);
                // Replace parameterObject via reflection
                replaceParameterObject(parameterHandler, boundSql, map);
            } else {
                // Bean or primitive parameter: wrap into a map
                Map<String, Object> map = new HashMap<>();
                map.put("_param", paramObj); // allow access to original param if needed
                map.put("value", paramObj); // MyBatis uses "value" for single param
                map.put("lang", currentLang);
                map.put("adminIP", currentIp);
                map.put("adminID", currentAdminId);
                map.put("cpnyId", currentCpnyId);
                replaceParameterObject(parameterHandler, boundSql, map);
            }
        }
        return invocation.proceed();
    }

    private String resolveCurrentLanguage() {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs != null) {
            HttpServletRequest request = attrs.getRequest();
            if (request != null) {
                String langParam = request.getParameter("lang");
                if (langParam != null && !langParam.isEmpty()) {
                    return langParam;
                }
                HttpSession session = request.getSession(false);
                if (session != null) {
                    Object sessionLang = session.getAttribute("language");
                    if (sessionLang != null) {
                        return sessionLang.toString();
                    }
                }
            }
        }
        // Default language fallback
        return "vi";
    }

    private String resolveClientIp() {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs != null) {
            HttpServletRequest request = attrs.getRequest();
            if (request != null) {
                HttpSession session = request.getSession(false);
                if (session != null) {
                    Object ip = session.getAttribute("adminIP");
                    if (ip != null) {
                        return ip.toString();
                    }
                }
            }
        }
        return "127.0.0.1";
    }

    private String resolveAdminId() {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs != null) {
            HttpServletRequest request = attrs.getRequest();
            if (request != null) {
                HttpSession session = request.getSession(false);
                if (session != null && session.getAttribute("adminID") != null) {
                    return session.getAttribute("adminID").toString();
                }
            }
        }
        return "";
    }

    private String resolveCpnyId() {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs != null) {
            HttpServletRequest request = attrs.getRequest();
            if (request != null) {
                HttpSession session = request.getSession(false);
                if (session != null && session.getAttribute("cpnyId") != null) {
                    return session.getAttribute("cpnyId").toString();
                }
            }
        }
        return "";
    }

    private void replaceParameterObject(ParameterHandler handler, BoundSql boundSql, Object newParam) throws Exception {
        // Replace parameterObject inside BoundSql
        Field parameterObjectField = BoundSql.class.getDeclaredField("parameterObject");
        parameterObjectField.setAccessible(true);
        parameterObjectField.set(boundSql, newParam);

        // Replace handler's own parameterObject if available
        try {
            Field handlerParam = handler.getClass().getDeclaredField("parameterObject");
            handlerParam.setAccessible(true);
            handlerParam.set(handler, newParam);
        } catch (NoSuchFieldException ignored) {
        }

        // Also replace metaParameters if present
        try {
            Field additionalParametersField = BoundSql.class.getDeclaredField("additionalParameters");
            additionalParametersField.setAccessible(true);
            @SuppressWarnings("unchecked")
            Map<String, Object> additional = (Map<String, Object>) additionalParametersField.get(boundSql);
            if (additional != null) {
                additional.put("lang", ((Map<?, ?>) newParam).get("lang"));
                additional.put("adminIP", ((Map<?, ?>) newParam).get("adminIP"));
                additional.put("adminID", ((Map<?, ?>) newParam).get("adminID"));
                additional.put("cpnyId", ((Map<?, ?>) newParam).get("cpnyId"));
            }
        } catch (NoSuchFieldException ignored) {
        }
    }

    @Override
    public Object plugin(Object target) {
        return Plugin.wrap(target, this);
    }

    @Override
    public void setProperties(java.util.Properties properties) {
        // No properties
    }
}
