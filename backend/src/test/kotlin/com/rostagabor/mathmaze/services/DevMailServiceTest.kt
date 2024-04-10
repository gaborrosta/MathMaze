package com.rostagabor.mathmaze.services

import com.rostagabor.mathmaze.data.User
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.test.util.ReflectionTestUtils
import java.io.ByteArrayOutputStream
import java.io.PrintStream

/**
 *   Tests for the DevMailService class.
 */
class DevMailServiceTest {

    private lateinit var devMailService: DevMailService

    private lateinit var stream: ByteArrayOutputStream

    @BeforeEach
    fun beforeTests() {
        //Capture the output
        stream = ByteArrayOutputStream()
        System.setOut(PrintStream(stream))

        //Mock the base URL
        devMailService = DevMailService()
        ReflectionTestUtils.setField(devMailService, "baseUrl", "")
    }


    @Test
    fun sendPasswordResetMail() {
        //Create a user and token
        val user = User(username = "testUser", email = "text@example.com")
        val token = "testToken"

        devMailService.sendPasswordResetMail(user, token)

        //Flush the output
        stream.flush()
        val allWrittenLines = String(stream.toByteArray())

        //Assert...
        assertEquals(
            "Sending password reset email to ${user.email} with reset link: /set-new-password?token=$token\n",
            allWrittenLines.replace("\r", "")
        )
    }

    @Test
    fun sendAdminMail() {
        //Create the parameters
        val name = "testName"
        val email = "testEmail"
        val subject = "testSubject"
        val message = "testMessage"

        devMailService.sendAdminMail(name, email, subject, message)

        //Flush the output
        stream.flush()
        val allWrittenLines = String(stream.toByteArray())

        //Assert...
        assertEquals(
            "Sending email to admin with name: $name, email: $email, subject: $subject, message:\n$message\n",
            allWrittenLines.replace("\r", "")
        )
    }

}
