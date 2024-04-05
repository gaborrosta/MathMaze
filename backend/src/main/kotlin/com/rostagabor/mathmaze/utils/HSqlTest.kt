package com.rostagabor.mathmaze.utils

/**
 *   Additional annotation for a test class that is marked with "SpringBootTest".
 */
@Retention(AnnotationRetention.RUNTIME)
@Target(AnnotationTarget.CLASS)
annotation class HSqlTest(
    val jdbcUrl: String = "jdbc:hsqldb:mem:23;DB_CLOSE_DELAY=-1",
    val dialect: String = "org.hibernate.dialect.HSQLDialect"
)
