package com.rostagabor.mathmaze.configs

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository

/**
 *   Security Config.
 */
@Configuration
@EnableWebSecurity
class WebSecurityConfig {

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain =
        http.csrf { csrf -> csrf.csrfTokenRepository(HttpSessionCsrfTokenRepository()) }
            .authorizeHttpRequests { authorizeRequests -> authorizeRequests.anyRequest().permitAll() }
            .build()

}
