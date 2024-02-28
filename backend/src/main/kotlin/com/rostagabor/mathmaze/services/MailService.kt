package com.rostagabor.mathmaze.services

import com.rostagabor.mathmaze.data.User

/**
 *   Handles sending emails.
 */
interface MailService {

    /**
     *   Sends a password reset mail to the user.
     */
    fun sendPasswordResetMail(user: User, token: String)

}
