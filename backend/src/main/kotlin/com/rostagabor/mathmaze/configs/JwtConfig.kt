package com.rostagabor.mathmaze.configs

import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Configuration
import java.util.*
import javax.crypto.SecretKey

/**
 *   Configuration for JWT.
 */
@Configuration
class JwtConfig {

    /**
     *   The secret key.
     */
    @Value("\${app.secret-key}")
    private lateinit var secretKey: String


    /**
     *   The key for signing JWT.
     */
    val key: SecretKey by lazy { Keys.hmacShaKeyFor(secretKey.toByteArray(Charsets.UTF_8)) }


    /**
     *   The time of expiration.
     */
    val expirationTime: Date
        get() = Date(System.currentTimeMillis() + 1000 * 60 * 60) //1 hour

}
