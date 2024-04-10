package com.rostagabor.mathmaze.services

import com.rostagabor.mathmaze.data.User
import io.mockk.*
import jakarta.mail.Message
import jakarta.mail.internet.InternetAddress
import jakarta.mail.internet.MimeMessage
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.test.util.ReflectionTestUtils

/**
 *   Tests for the ProdMailService class.
 */
class ProdMailServiceTest {

    private lateinit var mimeMessage: MimeMessage

    private lateinit var emailSender: JavaMailSender

    private lateinit var prodMailService: ProdMailService

    @BeforeEach
    fun setUp() {
        mimeMessage = mockk<MimeMessage> {
            every { setFrom(any<InternetAddress>()) } just runs
            every { setRecipient(any(), any<InternetAddress>()) } just runs
            every { subject = any() } just runs
            every { setContent(any()) } just runs
        }
        emailSender = mockk<JavaMailSender> {
            every { createMimeMessage() } returns mimeMessage
            every { send(any<MimeMessage>()) } just runs
        }
        prodMailService = ProdMailService(emailSender)

        //Mock the base URL and the admin email
        ReflectionTestUtils.setField(prodMailService, "baseUrl", "")
        ReflectionTestUtils.setField(prodMailService, "adminEmail", "admin@example.com")
    }

    @AfterEach
    fun tearDown() {
        unmockkAll()
    }


    @Test
    fun sendPasswordResetMail() {
        //Create a user and token
        val user = User(username = "testUser", email = "text@example.com")
        val token = "testToken"

        prodMailService.sendPasswordResetMail(user, token)

        //Assert
        verify { emailSender.send(any<MimeMessage>()) }
        verify { mimeMessage.setFrom(InternetAddress("MathMaze <smtpmailer.send@gmail.com>")) }
        verify { mimeMessage.setRecipient(Message.RecipientType.TO, InternetAddress(user.email)) }
        verify { mimeMessage.subject = "Password Reset Request - Jelszó-visszaállítási kérelem | MathMaze" }
    }

    @Test
    fun sendAdminMail() {
        //Create the parameters
        val name = "testName"
        val email = "email@example.com"
        val subject = "testSubject"
        val message = "testMessage"

        prodMailService.sendAdminMail(name, email, subject, message)

        //Assert...
        verify { emailSender.send(any<MimeMessage>()) }
        verify { mimeMessage.setFrom(InternetAddress("$name <$email>")) }
        verify { mimeMessage.setRecipient(Message.RecipientType.TO, InternetAddress("admin@example.com")) }
        verify { mimeMessage.subject = "$subject | MathMaze" }
    }

}
