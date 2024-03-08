package com.rostagabor.mathmaze.configs

import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

/**
 *   Development CORS Configuration.
 */
@Configuration
@Profile("dev")
class DevCorsConfig : WebMvcConfigurer {

    /**
     *   Adds CORS mappings.
     */
    override fun addCorsMappings(registry: CorsRegistry) {
        registry.addMapping("/**")
            .allowedOrigins("*")
            .allowedMethods("GET", "POST", "OPTIONS")
    }

}
