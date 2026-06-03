package com.ait.config;

import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.type.JdbcType;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

import javax.sql.DataSource;
import jakarta.annotation.PostConstruct;

/**
 * MyBatis Configuration với database optimization
 */
@Configuration
@MapperScan(basePackages = "com.ait", annotationClass = org.apache.ibatis.annotations.Mapper.class)
public class MyBatisConfig {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private SqlOnlyInterceptor sqlOnlyInterceptor;

    // Do not autowire to avoid bean cycles; instantiate manually below

    @Bean
    public SqlSessionFactory sqlSessionFactory() throws Exception {
        SqlSessionFactoryBean sessionFactory = new SqlSessionFactoryBean();
        sessionFactory.setDataSource(dataSource);

        // Set mapper locations
        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        sessionFactory.setMapperLocations(resolver.getResources("classpath:com/ait/mapper/*.xml"));

        // Add interceptors
        org.apache.ibatis.session.Configuration configuration = new org.apache.ibatis.session.Configuration();
        configuration.setMapUnderscoreToCamelCase(true);
        configuration.setJdbcTypeForNull(JdbcType.NULL);
        configuration.addInterceptor(sqlOnlyInterceptor);
        configuration.addInterceptor(new com.ait.interceptor.LanguageParameterInterceptor());
        sessionFactory.setConfiguration(configuration);

        return sessionFactory.getObject();
    }

    @PostConstruct
    public void addInterceptors() {
        // Additional interceptor configuration if needed
    }
}
