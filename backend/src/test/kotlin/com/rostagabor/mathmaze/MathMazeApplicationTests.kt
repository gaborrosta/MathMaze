package com.rostagabor.mathmaze

import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.annotation.DirtiesContext

@SpringBootTest(properties = ["spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.HSQLDialect", "spring.datasource.url=jdbc:hsqldb:mem:23;DB_CLOSE_DELAY=-1;"])
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class MathMazeApplicationTests {

    @Test
    fun contextLoads() {
    }

}
