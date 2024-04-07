package com.rostagabor.mathmaze.services

import com.rostagabor.mathmaze.utils.*
import org.springframework.stereotype.Service

/**
 *   Handles contact related operations.
 */
@Service
class ContactService(private val mailService: MailService) {

    /**
     *   Sends an email to the admin.
     */
    @Throws(Exception::class)
    fun send(name: String, email: String, subject: String, message: String) {
        //Validate name, email, subject, and message
        if (name.isEmpty()) throw ContactNameEmptyException()
        validateEmail(email).let { if (!it) throw EmailInvalidFormatException() }
        if (subject.isEmpty()) throw ContactSubjectEmptyException()
        if (message.isEmpty()) throw ContactMessageEmptyException()

        //Send the email
        mailService.sendAdminMail(name, email, subject, message)
    }

}
