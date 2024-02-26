package com.rostagabor.mathmaze.configs

import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

/**
 *   Production CORS Config.
 */
@Configuration
@Profile("prod")
class ProdCorsConfig : WebMvcConfigurer {

    /**
     *   Adds CORS mappings.
     */
    override fun addCorsMappings(registry: CorsRegistry) {
        registry.addMapping("/**")
            .allowedOrigins("https://mathmaze.rostagabor.com")
            .allowedMethods("GET", "POST", "OPTIONS")
    }

}
