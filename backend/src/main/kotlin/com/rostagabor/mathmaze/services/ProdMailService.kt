package com.rostagabor.mathmaze.services

import com.rostagabor.mathmaze.data.User
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Profile
import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.stereotype.Service

/**
 *   Handles sending emails in production.
 */
@Service
@Profile("prod")
class ProdMailService(private val emailSender: JavaMailSender) : MailService {

    /**
     *   The base URL of the application.
     */
    @Value("\${app.base-url}")
    private lateinit var baseUrl: String


    /**
     *   Sends a password reset mail to the user.
     */
    override fun sendPasswordResetMail(user: User, token: String) {
        val message = SimpleMailMessage()
        message.setTo(user.email)
        message.subject = "Password Reset Request"
        message.text = "Hey ${user.username}, To reset your password, click the link below:\n$baseUrl/set-new-password?token=$token"
        emailSender.send(message)
    }

}
