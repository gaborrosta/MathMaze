package com.rostagabor.mathmaze.configs

import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.util.*
import kotlin.math.abs

/**
 *   Tests for the JWT Configuration.
 */
class JwtConfigTest {

    @Test
    fun getExpirationTime() {
        val jwtConfig = JwtConfig()
        val expirationTime = jwtConfig.expirationTime
        val currentPlusOneHour = Date(System.currentTimeMillis() + 1000 * 60 * 60)

        assertTrue(abs(currentPlusOneHour.time - expirationTime.time) < 1000)
    }

}
