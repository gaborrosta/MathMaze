package com.rostagabor.mathmaze.services

import com.rostagabor.mathmaze.utils.ContactMessageEmptyException
import com.rostagabor.mathmaze.utils.ContactNameEmptyException
import com.rostagabor.mathmaze.utils.ContactSubjectEmptyException
import com.rostagabor.mathmaze.utils.EmailInvalidFormatException
import io.mockk.*
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

/**
 *   Tests for the ContactService class.
 */
class ContactServiceTest {

    private lateinit var mailService: MailService

    private lateinit var contactService: ContactService

    @BeforeEach
    fun setUp() {
        mailService = mockk<MailService>()
        contactService = ContactService(mailService)
    }

    @AfterEach
    fun tearDown() {
        unmockkAll()
    }


    @Test
    fun `send throws ContactNameEmptyException when name is empty`() {
        //Assert...
        assertThrows(ContactNameEmptyException::class.java) {
            contactService.send("", "test@example.com", "Test Subject", "Test Message")
        }
    }

    @Test
    fun `send throws EmailInvalidFormatException when email is invalid`() {
        //Assert...
        assertThrows(EmailInvalidFormatException::class.java) {
            contactService.send("Test Name", "invalidEmail", "Test Subject", "Test Message")
        }
    }

    @Test
    fun `send throws ContactSubjectEmptyException when subject is empty`() {
        //Assert...
        assertThrows(ContactSubjectEmptyException::class.java) {
            contactService.send("Test Name", "test@example.com", "", "Test Message")
        }
    }

    @Test
    fun `send throws ContactMessageEmptyException when message is empty`() {
        //Assert...
        assertThrows(ContactMessageEmptyException::class.java) {
            contactService.send("Test Name", "test@example.com", "Test Subject", "")
        }
    }

    @Test
    fun `send calls sendAdminMail on MailService when all parameters are valid`() {
        every { mailService.sendAdminMail(any(), any(), any(), any()) } just runs

        contactService.send("Test Name", "test@example.com", "Test Subject", "Test Message")

        //Assert...
        verify { mailService.sendAdminMail("Test Name", "test@example.com", "Test Subject", "Test Message") }
    }

}
