package com.rostagabor.mathmaze.controllers

import com.fasterxml.jackson.databind.ObjectMapper
import com.ninjasquad.springmockk.MockkBean
import com.rostagabor.mathmaze.requests.ContactRequest
import com.rostagabor.mathmaze.services.ContactService
import io.mockk.every
import io.mockk.just
import io.mockk.runs
import io.mockk.unmockkAll
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

/**
 *   Test class for the ContactController class.
 */
@SpringBootTest(
    properties = [
        "spring.datasource.url=jdbc:hsqldb:mem:testUser;DB_CLOSE_DELAY=-1",
        "spring.datasource.driverClassName=org.hsqldb.jdbcDriver",
        "hibernate.dialect=org.hibernate.dialect.HSQLDialect",
    ]
)
@AutoConfigureMockMvc
@ActiveProfiles("test", "dev")
class ContactControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    @MockkBean
    private lateinit var contactService: ContactService

    private lateinit var contactController: ContactController

    @BeforeEach
    fun setUp() {
        contactController = ContactController(contactService)
    }

    @AfterEach
    fun tearDown() {
        unmockkAll()
    }


    @Test
    fun send() {
        val contactRequest = ContactRequest("name", "test@example.com", "subject", "message")
        every { contactService.send(any(), any(), any(), any()) } just runs

        val response = contactController.send(contactRequest)

        //Assert...
        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals("1", response.body)
    }

    @Test
    fun sendWithException() {
        val contactRequest = ContactRequest("name", "test@example.com", "subject", "message")
        every { contactService.send(any(), any(), any(), any()) } throws Exception()

        val response = contactController.send(contactRequest)

        //Assert...
        assertEquals(HttpStatus.BAD_REQUEST, response.statusCode)
        assertEquals("Exception", response.body)
    }

    @Test
    fun urlSend() {
        val contactRequest = ContactRequest("name", "test@example.com", "subject", "message")
        every { contactService.send(any(), any(), any(), any()) } just runs

        val objectMapper = ObjectMapper()
        val content = objectMapper.writeValueAsString(contactRequest)

        //Assert...
        mockMvc
            .perform(
                post("/contact")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(content)
            )
            .andExpect(status().isOk)
            .andExpect(content().string("1"))
    }

}
