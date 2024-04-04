package com.rostagabor.mathmaze.controllers

import com.rostagabor.mathmaze.data.User
import com.rostagabor.mathmaze.requests.AccountPasswordResetRequest
import com.rostagabor.mathmaze.requests.EmailRequest
import com.rostagabor.mathmaze.requests.LoginRequest
import com.rostagabor.mathmaze.requests.PasswordResetRequest
import com.rostagabor.mathmaze.services.UserService
import com.rostagabor.mathmaze.utils.UserNotFoundException
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

/**
 *   Controller for user-related tasks.
 */
@RestController
@RequestMapping("/users")
class UserController(private val userService: UserService) {

    /**
     *   Registers a new user.
     */
    @PostMapping("/register")
    fun register(@RequestBody user: User): ResponseEntity<Any> {
        return try {
            //Register the user
            userService.register(user)

            //Generate a token and return it
            ResponseEntity.ok().body(userService.generateToken(user.email))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e::class.simpleName)
        }
    }


    /**
     *   Logs in a user.
     */
    @PostMapping("/login")
    fun login(@RequestBody loginRequest: LoginRequest): ResponseEntity<Any> {
        return try {
            //Log in the user
            userService.login(loginRequest.email, loginRequest.password)

            //Generate a token and return it
            ResponseEntity.ok().body(userService.generateToken(loginRequest.email))
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e::class.simpleName)
        }
    }


    /**
     *   Requests a password reset.
     */
    @PostMapping("/password-request")
    fun requestPasswordReset(@RequestBody emailRequest: EmailRequest): ResponseEntity<Any> {
        return try {
            //Request a password reset
            userService.requestPasswordReset(emailRequest.email)

            //Return success
            ResponseEntity.ok().body("1")
        } catch (e: Exception) {
            //If the user is not found, return success because we don't want to reveal if an email is registered or not
            if (e is UserNotFoundException) {
                ResponseEntity.ok().body("1")
            } else {
                ResponseEntity.badRequest().body(e::class.simpleName)
            }
        }
    }


    /**
     *   Validates a password reset token.
     */
    @GetMapping("/password-validate")
    fun validateToken(@RequestParam token: String): ResponseEntity<Any> {
        return try {
            //Validate the token
            userService.validateToken(token)

            //Return success
            ResponseEntity.ok().body("1")
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e::class.simpleName)
        }
    }


    /**
     *   Resets a user's password.
     */
    @PostMapping("/password-reset")
    fun resetPassword(@RequestBody passwordResetRequest: PasswordResetRequest): ResponseEntity<Any> {
        return try {
            //Reset the password
            userService.resetPassword(passwordResetRequest.token, passwordResetRequest.password)

            //Return success
            ResponseEntity.ok().body("1")
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e::class.simpleName)
        }
    }

    /**
     *   Resets a user's password in the account page.
     */
    @PostMapping("/account-password-reset")
    fun accountResetPassword(@RequestBody accountPasswordResetRequest: AccountPasswordResetRequest): ResponseEntity<Any> {
        return try {
            //Check if the user is still logged in
            val (email, newToken) = userService.regenerateTokenIfStillValid(accountPasswordResetRequest.token)

            //Reset the password
            userService.accountResetPassword(email, accountPasswordResetRequest.oldPassword, accountPasswordResetRequest.newPassword)

            //Return success
            ResponseEntity.ok().body(newToken)
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e::class.simpleName)
        }
    }


    /**
     *   Checks if a user is still logged in.
     */
    @GetMapping("/check")
    fun isUserStillLoggedIn(@RequestParam token: String): ResponseEntity<Any> {
        //Check if the user is still logged in
        val (_, newToken) = userService.regenerateTokenIfStillValid(token)

        //Return the new token or an error
        return if (newToken.isEmpty()) {
            ResponseEntity.badRequest().body("1")
        } else {
            ResponseEntity.ok().body(newToken)
        }
    }

}
