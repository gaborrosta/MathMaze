package com.rostagabor.mathmaze.controllers

import com.rostagabor.mathmaze.data.LoginRequest
import com.rostagabor.mathmaze.data.User
import com.rostagabor.mathmaze.services.UserService
import jakarta.servlet.http.HttpServletRequest
import org.springframework.security.web.csrf.CsrfToken
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
    fun register(@RequestBody user: User, request: HttpServletRequest): Long {
        val csrfToken = request.getHeader("X-CSRF-TOKEN")
        println("Received CSRF Token: $csrfToken")
        println("Registering user: $user, Scheme: ${request.scheme}")

        return userService.register(user).userId
    }

    /**
     *   Logs in a user.
     */
    @PostMapping("/login")
    fun login(@RequestBody loginRequest: LoginRequest): Long? {
        println("Logging in user: ${loginRequest.email}")

        return userService.login(loginRequest.email, loginRequest.password)
    }

}
