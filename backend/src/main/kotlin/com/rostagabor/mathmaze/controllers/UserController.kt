package com.rostagabor.mathmaze.controllers

import com.rostagabor.mathmaze.data.LoginRequest
import com.rostagabor.mathmaze.data.User
import com.rostagabor.mathmaze.services.UserService
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
            ResponseEntity.ok().body("1")
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
            ResponseEntity.ok().body("1")
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e::class.simpleName)
        }
    }

}
