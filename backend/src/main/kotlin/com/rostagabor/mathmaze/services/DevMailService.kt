package com.rostagabor.mathmaze.services

import com.rostagabor.mathmaze.data.User
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service

/**
 *   Handles sending emails in development.
 */
@Service
@Profile("dev")
class DevMailService : MailService {

    /**
     *   The base URL of the application.
     */
    @Value("\${app.base-url}")
    private lateinit var baseUrl: String


    /**
     *   Sends a password reset mail to the user.
     */
    override fun sendPasswordResetMail(user: User, token: String) {
        println("Sending password reset mail to ${user.email} with token $token and reset link: $baseUrl/set-new-password?token=$token")
    }

}