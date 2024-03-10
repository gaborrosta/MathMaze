package com.rostagabor.mathmaze.services

import com.rostagabor.mathmaze.data.User
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Profile
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.mail.javamail.MimeMessageHelper
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
        val message = emailSender.createMimeMessage()
        val helper = MimeMessageHelper(message, true)
        helper.setTo(user.email)
        helper.setSubject("Password Reset Request - Jelszó-visszaállítási kérelem | MathMaze")

        //URLs
        val url = "$baseUrl/set-new-password?token=$token"
        val imageUrl = "$baseUrl/logo.png"

        //HTML content
        val htmlText = """
        <html>
            <head>
                <link href="https://fonts.googleapis.com/css2?family=Zilla+Slab&display=swap" rel="stylesheet">
            </head>
            <body style="font-family: 'Zilla Slab', serif; font-size: 1rem">
                <img src="$imageUrl" alt="Website logo" style="width: 50px; height: 50px; float: right;">
                <h1>Hey ${user.username},</h1>
                <p>To reset your password, click the link below:</p>
                <p><a href="$url">Set new password</a></p>
                <hr />
                <img src="$imageUrl" alt="Weboldal logója" style="width: 50px; height: 50px; float: right;">
                <h1>Szia ${user.username}!</h1>
                <p>Egy új jelszó beállításához kattints a következő linkre:</p>
                <p><a href="$url">Új jelszó beállítása</a></p>
            </body>
        </html>
        """.trimIndent()

        //Plain text content
        val plainText = """
            Hey ${user.username},\n
            To reset your password, visit the following link:\n
            $url
            ---
            Szia ${user.username},\n
            Egy új jelszó beállításához kattints a következő linkre:\n
            $url
        """.trimIndent()

        //Set the content
        helper.setText(plainText, false)
        helper.setText(htmlText, true)

        //Send the email
        emailSender.send(message)
    }

}
