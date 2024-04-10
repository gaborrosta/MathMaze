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
     *   The email of the admin.
     */
    @Value("\${app.admin-contact-email}")
    private lateinit var adminEmail: String


    /**
     *   Sends a password reset email to the user.
     */
    override fun sendPasswordResetMail(user: User, token: String) {
        val message = emailSender.createMimeMessage()
        val helper = MimeMessageHelper(message, true)
        helper.setFrom("MathMaze <smtpmailer.send@gmail.com>")
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
                <p>To reset your password, click the link below:<br /><a href="$url">Set new password</a><br />Or copy this link: $url</p>
                <hr />
                <img src="$imageUrl" alt="Weboldal logója" style="width: 50px; height: 50px; float: right;">
                <h1>Szia ${user.username}!</h1>
                <p>Egy új jelszó beállításához kattints a következő linkre:<br /><a href="$url">Új jelszó beállítása</a><br />Vagy másold ki ezt a linket: $url</p>
            </body>
        </html>
        """.trimIndent()

        //Plain text content
        val plainText = StringBuilder()
            .append("Hey ")
            .append(user.username)
            .append(",\nTo reset your password, visit the following link:\n")
            .append(url)
            .append("\n---\nSzia ")
            .append(user.username)
            .append(",\nEgy új jelszó beállításához kattints a következő linkre:\n")
            .append(url)
            .toString()

        //Set the content
        helper.setText(plainText, false)
        helper.setText(htmlText, true)

        //Send the email
        emailSender.send(message)
    }


    /**
     *   Sends an email to the admin.
     */
    override fun sendAdminMail(name: String, email: String, subject: String, message: String) {
        val adminMessage = emailSender.createMimeMessage()
        val helper = MimeMessageHelper(adminMessage, true)
        helper.setFrom("$name <$email>")
        helper.setTo(adminEmail)
        helper.setSubject("$subject | MathMaze")

        //HTML content
        val htmlText = """
        <html>
            <head>
                <link href="https://fonts.googleapis.com/css2?family=Zilla+Slab&display=swap" rel="stylesheet">
            </head>
            <body style="font-family: 'Zilla Slab', serif; font-size: 1rem">
                <p>From: $name $email</p>
                <p>${message.replace("\n", "<br />")}</p>
            </body>
        </html>
        """.trimIndent()

        //Plain text content
        val plainText = "From: $name <$email>\n\n$message"

        //Set the content
        helper.setText(plainText, false)
        helper.setText(htmlText, true)

        //Send the email
        emailSender.send(adminMessage)
    }

}
