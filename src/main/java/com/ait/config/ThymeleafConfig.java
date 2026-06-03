package com.ait.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.spring6.messageresolver.SpringMessageResolver;
import org.thymeleaf.spring6.templateresolver.SpringResourceTemplateResolver;
import org.thymeleaf.spring6.view.ThymeleafViewResolver;

/**
 * Thymeleaf Configuration for WAR deployment
 * Configures Thymeleaf to use WEB-INF/view directory
 */
@Configuration
public class ThymeleafConfig implements WebMvcConfigurer {

    @Autowired
    private MessageSource messageSource;

    /**
     * Template Resolver for Thymeleaf
     * Points to WEB-INF/view directory for templates
     */
    @Bean
    public SpringResourceTemplateResolver templateResolver() {
        SpringResourceTemplateResolver templateResolver = new SpringResourceTemplateResolver();
        templateResolver.setPrefix("/WEB-INF/view/");
        templateResolver.setSuffix(".html");
        templateResolver.setTemplateMode("HTML");
        templateResolver.setCharacterEncoding("UTF-8");
        templateResolver.setCacheable(false); // Disable cache for development
        return templateResolver;
    }

    /**
     * Template Engine for Thymeleaf
     */
    @Bean
    public SpringTemplateEngine templateEngine() {
        SpringMessageResolver messageResolver = new SpringMessageResolver();
        messageResolver.setMessageSource(messageSource);

        SpringTemplateEngine templateEngine = new SpringTemplateEngine();
        templateEngine.setTemplateResolver(templateResolver());
        templateEngine.setEnableSpringELCompiler(true);
        templateEngine.addMessageResolver(messageResolver);
        return templateEngine;
    }

    /**
     * View Resolver for Thymeleaf
     */
    @Bean
    public ThymeleafViewResolver thymeleafViewResolver() {
        ThymeleafViewResolver viewResolver = new ThymeleafViewResolver();
        viewResolver.setTemplateEngine(templateEngine());
        viewResolver.setCharacterEncoding("UTF-8");
        viewResolver.setOrder(1);
        return viewResolver;
    }

    /**
     * Static Resource Handler
     * Configure static resources (CSS, JS, Images)
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Handle assets directory
        registry.addResourceHandler("/assets/**")
                .addResourceLocations("/assets/");

        // Handle static resources
        registry.addResourceHandler("/static/**")
                .addResourceLocations("/static/");

        // Handle webjars
        registry.addResourceHandler("/webjars/**")
                .addResourceLocations("/webjars/");
    }
}