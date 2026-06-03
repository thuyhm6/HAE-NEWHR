package com.ait.config;

import java.lang.reflect.Array;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import org.apache.ibatis.cache.CacheKey;
import org.apache.ibatis.executor.Executor;
import org.apache.ibatis.mapping.BoundSql;
import org.apache.ibatis.mapping.MappedStatement;
import org.apache.ibatis.mapping.ParameterMapping;
import org.apache.ibatis.mapping.ParameterMode;
import org.apache.ibatis.plugin.Interceptor;
import org.apache.ibatis.plugin.Intercepts;
import org.apache.ibatis.plugin.Invocation;
import org.apache.ibatis.plugin.Plugin;
import org.apache.ibatis.plugin.Signature;
import org.apache.ibatis.reflection.MetaObject;
import org.apache.ibatis.session.Configuration;
import org.apache.ibatis.session.ResultHandler;
import org.apache.ibatis.session.RowBounds;
import org.apache.ibatis.type.TypeHandlerRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Logs MyBatis SQL with resolved parameter values and caller method.
 */
@Component
@Intercepts({
        @Signature(type = Executor.class, method = "update", args = { MappedStatement.class, Object.class }),
        @Signature(type = Executor.class, method = "query", args = {
                MappedStatement.class, Object.class, RowBounds.class, ResultHandler.class }),
        @Signature(type = Executor.class, method = "query", args = {
                MappedStatement.class, Object.class, RowBounds.class, ResultHandler.class, CacheKey.class,
                BoundSql.class })
})
public class SqlOnlyInterceptor implements Interceptor {

    private static final Logger logger = LoggerFactory.getLogger(SqlOnlyInterceptor.class);
    private static final String APP_PACKAGE_PREFIX = "com.ait.";
    private static final String MAPPER_PACKAGE_MARKER = ".mapper.";
    private static final String MISSING_PARAMETER_PLACEHOLDER = "<MISSING_PARAM>";

    @Override
    public Object intercept(Invocation invocation) throws Throwable {
        MappedStatement mappedStatement = (MappedStatement) invocation.getArgs()[0];
        String methodName = invocation.getMethod().getName();
        Object parameterObject = invocation.getArgs().length > 1 ? invocation.getArgs()[1] : null;
        String mapperMethod = mappedStatement.getId();
        String callerMethod = resolveCallerMethod();
        String sqlTemplate = "<UNAVAILABLE>";
        String executableSql = "<UNAVAILABLE>";
        String parameterSnapshot = buildRawParameterSnapshot(parameterObject);
        long startTime = System.currentTimeMillis();

        try {
            BoundSql boundSql = resolveBoundSql(invocation, mappedStatement, parameterObject);
            sqlTemplate = boundSql.getSql().replaceAll("\\s+", " ").trim();
            List<SqlParameter> sqlParameters = resolveSqlParameters(mappedStatement.getConfiguration(), boundSql,
                    parameterObject);
            executableSql = buildExecutableSql(sqlTemplate, sqlParameters);
            parameterSnapshot = buildParameterSnapshot(sqlParameters);

            if (logger.isInfoEnabled()) {
                logger.info("SQL Execute | mapper={} | caller={} | command={} | params={} | sql={}",
                        mapperMethod,
                        callerMethod,
                        mappedStatement.getSqlCommandType().name(),
                        parameterSnapshot,
                        executableSql);
            }

            Object result = invocation.proceed();
            long executionTime = System.currentTimeMillis() - startTime;

            if (logger.isInfoEnabled()) {
                if ("update".equals(methodName)) {
                    if (result instanceof Integer) {
                        logger.info("SQL Result  | mapper={} | caller={} | rowsAffected={} | took={} ms",
                                mapperMethod,
                                callerMethod,
                                result,
                                executionTime);
                    } else {
                        logger.info("SQL Result  | mapper={} | caller={} | updateCompleted=true | took={} ms",
                                mapperMethod,
                                callerMethod,
                                executionTime);
                    }
                } else if ("query".equals(methodName)) {
                    if (result instanceof java.util.List) {
                        logger.info("SQL Result  | mapper={} | caller={} | rowsReturned={} | took={} ms",
                                mapperMethod,
                                callerMethod,
                                ((java.util.List<?>) result).size(),
                                executionTime);
                    } else {
                        logger.info("SQL Result  | mapper={} | caller={} | queryCompleted=true | took={} ms",
                                mapperMethod,
                                callerMethod,
                                executionTime);
                    }
                } else {
                    logger.info("SQL Result  | mapper={} | caller={} | took={} ms",
                            mapperMethod,
                            callerMethod,
                            executionTime);
                }
            }

            return result;
        } catch (Throwable ex) {
            long executionTime = System.currentTimeMillis() - startTime;
            logger.error("SQL Failed  | mapper={} | caller={} | command={} | took={} ms | params={} | sql={} | errorType={} | error={}",
                    mapperMethod,
                    callerMethod,
                    mappedStatement.getSqlCommandType().name(),
                    executionTime,
                    parameterSnapshot,
                    executableSql,
                    ex.getClass().getName(),
                    ex.getMessage(),
                    ex);
            throw ex;
        }
    }

    private BoundSql resolveBoundSql(Invocation invocation, MappedStatement mappedStatement, Object parameterObject) {
        Object[] args = invocation.getArgs();
        if (args.length >= 6 && args[5] instanceof BoundSql existingBoundSql) {
            return existingBoundSql;
        }
        return mappedStatement.getBoundSql(parameterObject);
    }

    private List<SqlParameter> resolveSqlParameters(Configuration configuration, BoundSql boundSql,
            Object parameterObject) {
        List<SqlParameter> sqlParameters = new ArrayList<>();
        List<ParameterMapping> parameterMappings = boundSql.getParameterMappings();

        if (parameterMappings == null || parameterMappings.isEmpty()) {
            return sqlParameters;
        }

        TypeHandlerRegistry typeHandlerRegistry = configuration.getTypeHandlerRegistry();
        for (ParameterMapping parameterMapping : parameterMappings) {
            String propertyName = parameterMapping.getProperty();
            if (parameterMapping.getMode() == ParameterMode.OUT) {
                sqlParameters.add(new SqlParameter(propertyName, formatOutParameter(parameterMapping)));
                continue;
            }

            Object value = resolveParameterValue(configuration, boundSql, parameterObject, parameterMapping,
                    typeHandlerRegistry);
            sqlParameters.add(new SqlParameter(propertyName, formatParameterValue(value)));
        }

        return sqlParameters;
    }

    private String buildExecutableSql(String sqlTemplate, List<SqlParameter> sqlParameters) {
        if (sqlTemplate == null || sqlTemplate.isEmpty()) {
            return sqlTemplate;
        }

        if (!sqlTemplate.contains("?")) {
            return sqlTemplate;
        }

        List<String> parameterValues = new ArrayList<>();
        for (SqlParameter sqlParameter : sqlParameters) {
            parameterValues.add(sqlParameter.renderedValue());
        }
        return replaceQuestionMarks(sqlTemplate, parameterValues);
    }

    private Object resolveParameterValue(Configuration configuration, BoundSql boundSql, Object parameterObject,
            ParameterMapping parameterMapping, TypeHandlerRegistry typeHandlerRegistry) {
        String propertyName = parameterMapping.getProperty();

        if (boundSql.hasAdditionalParameter(propertyName)) {
            return boundSql.getAdditionalParameter(propertyName);
        }

        if (parameterObject == null) {
            return null;
        }

        if (typeHandlerRegistry.hasTypeHandler(parameterObject.getClass())) {
            return parameterObject;
        }

        if (parameterObject instanceof Map<?, ?> mapParameter && mapParameter.containsKey(propertyName)) {
            return mapParameter.get(propertyName);
        }

        MetaObject metaObject = configuration.newMetaObject(parameterObject);
        if (metaObject.hasGetter(propertyName)) {
            return metaObject.getValue(propertyName);
        }

        return null;
    }

    private String replaceQuestionMarks(String sqlTemplate, List<String> parameterValues) {
        StringBuilder renderedSql = new StringBuilder(sqlTemplate.length() + (parameterValues.size() * 10));
        int valueIndex = 0;
        boolean inSingleQuote = false;

        for (int i = 0; i < sqlTemplate.length(); i++) {
            char currentChar = sqlTemplate.charAt(i);

            if (currentChar == '\'') {
                if (inSingleQuote && i + 1 < sqlTemplate.length() && sqlTemplate.charAt(i + 1) == '\'') {
                    renderedSql.append(currentChar).append(sqlTemplate.charAt(i + 1));
                    i++;
                    continue;
                }
                inSingleQuote = !inSingleQuote;
                renderedSql.append(currentChar);
                continue;
            }

            if (currentChar == '?' && !inSingleQuote) {
                if (valueIndex < parameterValues.size()) {
                    renderedSql.append(parameterValues.get(valueIndex++));
                } else {
                    renderedSql.append(MISSING_PARAMETER_PLACEHOLDER);
                }
                continue;
            }

            renderedSql.append(currentChar);
        }
        return renderedSql.toString();
    }

    private String buildParameterSnapshot(List<SqlParameter> sqlParameters) {
        if (sqlParameters.isEmpty()) {
            return "[]";
        }

        StringBuilder builder = new StringBuilder("[");
        for (int i = 0; i < sqlParameters.size(); i++) {
            SqlParameter sqlParameter = sqlParameters.get(i);
            if (i > 0) {
                builder.append(", ");
            }

            String propertyName = sqlParameter.propertyName();
            if (propertyName == null || propertyName.isBlank()) {
                propertyName = "arg" + (i + 1);
            }

            builder.append(propertyName)
                    .append("=")
                    .append(sqlParameter.renderedValue());
        }
        builder.append("]");

        return builder.toString();
    }

    private String buildRawParameterSnapshot(Object parameterObject) {
        if (parameterObject == null) {
            return "[]";
        }

        if (parameterObject instanceof Map<?, ?> mapParameter) {
            StringBuilder builder = new StringBuilder("[");
            int index = 0;
            for (Map.Entry<?, ?> entry : mapParameter.entrySet()) {
                if (index > 0) {
                    builder.append(", ");
                }
                builder.append(String.valueOf(entry.getKey()))
                        .append("=")
                        .append(formatParameterValue(entry.getValue()));
                index++;
            }
            builder.append("]");
            return builder.toString();
        }

        return "[arg0=" + formatParameterValue(parameterObject) + "]";
    }

    private String formatOutParameter(ParameterMapping parameterMapping) {
        String jdbcTypeName = parameterMapping.getJdbcType() == null
                ? "UNKNOWN"
                : parameterMapping.getJdbcType().name();
        return "<OUT:" + jdbcTypeName + ">";
    }

    private String formatParameterValue(Object value) {
        if (value == null) {
            return "NULL";
        }
        if (value instanceof String || value instanceof Character) {
            return "'" + escapeSqlLiteral(value.toString()) + "'";
        }
        if (value instanceof Number || value instanceof Boolean) {
            return String.valueOf(value);
        }
        if (value instanceof Date) {
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS");
            return "'" + dateFormat.format((Date) value) + "'";
        }
        if (value instanceof LocalDateTime || value instanceof LocalDate || value instanceof LocalTime
                || value instanceof OffsetDateTime || value instanceof ZonedDateTime || value instanceof Instant) {
            return "'" + value + "'";
        }
        if (value instanceof byte[]) {
            return "'<BINARY:" + ((byte[]) value).length + " bytes>'";
        }
        if (value.getClass().isArray()) {
            return "'" + escapeSqlLiteral(formatArrayValue(value)) + "'";
        }
        if (value instanceof Collection) {
            return "'" + escapeSqlLiteral(value.toString()) + "'";
        }
        return "'" + escapeSqlLiteral(value.toString()) + "'";
    }

    private String formatArrayValue(Object arrayValue) {
        int length = Array.getLength(arrayValue);
        StringBuilder builder = new StringBuilder("[");
        for (int i = 0; i < length; i++) {
            if (i > 0) {
                builder.append(", ");
            }
            Object element = Array.get(arrayValue, i);
            builder.append(element);
        }
        builder.append(']');
        return builder.toString();
    }

    private String escapeSqlLiteral(String value) {
        return value == null ? null : value.replace("'", "''");
    }

    private String resolveCallerMethod() {
        StackTraceElement[] stack = Thread.currentThread().getStackTrace();
        for (StackTraceElement frame : stack) {
            String className = frame.getClassName();
            if (shouldSkipCallerFrame(className, frame)) {
                continue;
            }

            String normalizedClassName = normalizeProxyClassName(className);
            String fileName = frame.getFileName() == null ? "UnknownSource" : frame.getFileName();
            return normalizedClassName + "." + frame.getMethodName()
                    + "(" + fileName + ":" + frame.getLineNumber() + ")";
        }
        return "unknown";
    }

    private boolean shouldSkipCallerFrame(String className, StackTraceElement frame) {
        if (!className.startsWith(APP_PACKAGE_PREFIX)) {
            return true;
        }
        if (frame.getLineNumber() <= 0) {
            return true;
        }
        if (className.equals(SqlOnlyInterceptor.class.getName())) {
            return true;
        }
        if (className.contains(MAPPER_PACKAGE_MARKER)) {
            return true;
        }
        if (className.startsWith("com.ait.config.")
                || className.startsWith("com.ait.aspect.")
                || className.startsWith("com.ait.interceptor.")) {
            return true;
        }
        return className.contains("$Proxy") || className.contains("$$SpringCGLIB$$");
    }

    private String normalizeProxyClassName(String className) {
        int proxyIndex = className.indexOf("$$");
        if (proxyIndex > 0) {
            return className.substring(0, proxyIndex);
        }
        return className;
    }

    private record SqlParameter(String propertyName, String renderedValue) {
    }

    @Override
    public Object plugin(Object target) {
        return Plugin.wrap(target, this);
    }

    @Override
    public void setProperties(Properties properties) {
        // No properties needed
    }
}
