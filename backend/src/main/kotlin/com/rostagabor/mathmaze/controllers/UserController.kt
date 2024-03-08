package com.rostagabor.mathmaze.controllers

import com.rostagabor.mathmaze.data.User
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
            userService.register(user)
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
            userService.login(loginRequest.email, loginRequest.password)
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
            userService.requestPasswordReset(emailRequest.email)
            ResponseEntity.ok().body("1")
        } catch (e: Exception) {
            //This way hackers can't tell if there is a user with the given email or not
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
            userService.validateToken(token)
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
            userService.resetPassword(passwordResetRequest.token, passwordResetRequest.password)
            ResponseEntity.ok().body("1")
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e::class.simpleName)
        }
    }


    /**
     *   Checks if a user is still logged in.
     */
    @GetMapping("/check")
    fun isUserStillLoggedIn(@RequestParam token: String): ResponseEntity<Any> {
        return try {
            val (_, newToken) = userService.regenerateTokenIfStillValid(token)
            if (newToken.isEmpty()) {
                ResponseEntity.badRequest().body("1")
            } else {
                ResponseEntity.ok().body("1")
            }
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e::class.simpleName)
        }
    }

}
