package com.rostagabor.mathmaze.services

import com.rostagabor.mathmaze.data.User

/**
 *   Handles sending emails.
 */
interface MailService {

    /**
     *   Sends a password reset email to the user.
     */
    fun sendPasswordResetMail(user: User, token: String)


    /**
     *   Sends an email to the admin.
     */
    fun sendAdminMail(name: String, email: String, subject: String, message: String)

}
