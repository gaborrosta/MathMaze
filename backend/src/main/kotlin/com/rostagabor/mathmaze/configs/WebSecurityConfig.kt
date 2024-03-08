package com.rostagabor.mathmaze.configs

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.web.SecurityFilterChain

/**
 *   Security Configuration.
 */
@Configuration
@EnableWebSecurity
class WebSecurityConfig {

    /**
     *   Configures the security filter chain.
     */
    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain =
        http.csrf { csrf -> csrf.disable() }
            .authorizeHttpRequests { authorizeRequests -> authorizeRequests.anyRequest().permitAll() }
            .build()

}
