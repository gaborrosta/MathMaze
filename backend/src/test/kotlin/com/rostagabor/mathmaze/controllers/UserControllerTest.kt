package com.rostagabor.mathmaze.controllers

import com.fasterxml.jackson.databind.ObjectMapper
import com.rostagabor.mathmaze.data.PasswordResetToken
import com.rostagabor.mathmaze.data.User
import com.rostagabor.mathmaze.requests.AccountPasswordResetRequest
import com.rostagabor.mathmaze.requests.EmailRequest
import com.rostagabor.mathmaze.requests.LoginRequest
import com.rostagabor.mathmaze.requests.PasswordResetRequest
import com.rostagabor.mathmaze.services.UserService
import com.rostagabor.mathmaze.utils.UserNotFoundException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.mockito.Mockito
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

/**
 *   Tests for the UserController class.
 */
@SpringBootTest(properties = ["jdbc:hsqldb:mem:23;DB_CLOSE_DELAY=-1", "hibernate.dialect=org.hibernate.dialect.HSQLDialect"])
@AutoConfigureMockMvc
@ActiveProfiles("test", "dev")
class UserControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockBean
    private lateinit var userService: UserService

    @Test
    fun register() {
        val user = User(username = "testUser", email = "test@example.com")
        Mockito.`when`(userService.register(user)).thenReturn(user)
        Mockito.`when`(userService.generateToken(user.email)).thenReturn("testToken")

        val response = UserController(userService).register(user)

        //Assert...
        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals("testToken", response.body)
    }

    @Test
    fun registerWithException() {
        val user = User(username = "testUser", email = "test@example.com")
        Mockito.`when`(userService.register(user)).thenThrow(Exception::class.java)
        Mockito.`when`(userService.generateToken(user.email)).thenReturn("testToken")

        val response = UserController(userService).register(user)

        //Assert...
        assertEquals(HttpStatus.BAD_REQUEST, response.statusCode)
        assertEquals("Exception", response.body)
    }

    @Test
    fun urlRegister() {
        val user = User(username = "testUser", email = "test@example.com")
        Mockito.`when`(userService.register(user)).thenReturn(user)
        Mockito.`when`(userService.generateToken(user.email)).thenReturn("testToken")

        val objectMapper = ObjectMapper()
        val content = objectMapper.writeValueAsString(user)

        //Assert...
        mockMvc
            .perform(
                post("/users/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(content)
            )
            .andExpect(status().isOk)
            .andExpect(content().string("testToken"))
    }

    @Test
    fun login() {
        val loginRequest = LoginRequest(email = "test@example.com", password = "testPassword")
        Mockito.`when`(userService.login(loginRequest.email, loginRequest.password))
            .thenReturn(User(username = "testUser", email = loginRequest.email))
        Mockito.`when`(userService.generateToken(loginRequest.email)).thenReturn("testToken")

        val response = UserController(userService).login(loginRequest)

        //Assert...
        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals("testToken", response.body)
    }

    @Test
    fun loginWithException() {
        val loginRequest = LoginRequest(email = "test@example.com", password = "testPassword")
        Mockito.`when`(userService.login(loginRequest.email, loginRequest.password)).thenThrow(Exception::class.java)
        Mockito.`when`(userService.generateToken(loginRequest.email)).thenReturn("testToken")

        val response = UserController(userService).login(loginRequest)

        //Assert...
        assertEquals(HttpStatus.BAD_REQUEST, response.statusCode)
        assertEquals("Exception", response.body)
    }

    @Test
    fun urlLogin() {
        val loginRequest = LoginRequest(email = "test@example.com", password = "testPassword")
        Mockito.`when`(userService.login(loginRequest.email, loginRequest.password))
            .thenReturn(User(username = "testUser", email = loginRequest.email))
        Mockito.`when`(userService.generateToken(loginRequest.email)).thenReturn("testToken")

        val objectMapper = ObjectMapper()
        val content = objectMapper.writeValueAsString(loginRequest)

        //Assert...
        mockMvc
            .perform(
                post("/users/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(content)
            )
            .andExpect(status().isOk)
            .andExpect(content().string("testToken"))
    }

    @Test
    fun requestPasswordReset() {
        val emailRequest = EmailRequest(email = "test@example.com")
        Mockito.doNothing().`when`(userService).requestPasswordReset(emailRequest.email)

        val response = UserController(userService).requestPasswordReset(emailRequest)

        //Assert...
        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals("1", response.body)
    }

    @Test
    fun requestPasswordResetWithException1() {
        val emailRequest = EmailRequest(email = "test@example.com")
        Mockito.`when`(userService.requestPasswordReset(emailRequest.email)).thenThrow(Exception::class.java)

        val response = UserController(userService).requestPasswordReset(emailRequest)

        //Assert...
        assertEquals(HttpStatus.BAD_REQUEST, response.statusCode)
        assertEquals("Exception", response.body)
    }

    @Test
    fun requestPasswordResetWithException2() {
        val emailRequest = EmailRequest(email = "test@example.com")
        Mockito.`when`(userService.requestPasswordReset(emailRequest.email)).thenThrow(UserNotFoundException::class.java)

        val response = UserController(userService).requestPasswordReset(emailRequest)

        //Assert...
        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals("1", response.body)
    }

    @Test
    fun urlRequestPasswordReset() {
        val emailRequest = EmailRequest(email = "test@example.com")
        Mockito.doNothing().`when`(userService).requestPasswordReset(emailRequest.email)

        val objectMapper = ObjectMapper()
        val content = objectMapper.writeValueAsString(emailRequest)

        //Assert...
        mockMvc
            .perform(
                post("/users/password-request")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(content)
            )
            .andExpect(status().isOk)
            .andExpect(content().string("1"))
    }

    @Test
    fun validateToken() {
        val token = "test-token"
        Mockito.`when`(userService.validateToken(token)).thenReturn(PasswordResetToken())

        val response = UserController(userService).validateToken(token)

        //Assert...
        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals("1", response.body)
    }

    @Test
    fun validateTokenWithException() {
        val token = "test-token"
        Mockito.`when`(userService.validateToken(token)).thenThrow(Exception::class.java)

        val response = UserController(userService).validateToken(token)

        //Assert...
        assertEquals(HttpStatus.BAD_REQUEST, response.statusCode)
        assertEquals("Exception", response.body)
    }

    @Test
    fun urlValidateToken() {
        val token = "test-token"
        Mockito.`when`(userService.validateToken(token)).thenReturn(PasswordResetToken())

        //Assert...
        mockMvc
            .perform(get("/users/password-validate?token=$token"))
            .andExpect(status().isOk)
            .andExpect(content().string("1"))
    }

    @Test
    fun resetPassword() {
        val passwordResetRequest = PasswordResetRequest(token = "test-token", password = "testPassword")
        Mockito.doNothing().`when`(userService).resetPassword(passwordResetRequest.token, passwordResetRequest.password)

        val response = UserController(userService).resetPassword(passwordResetRequest)

        //Assert...
        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals("1", response.body)
    }

    @Test
    fun resetPasswordWithException() {
        val passwordResetRequest = PasswordResetRequest(token = "test-token", password = "testPassword")
        Mockito.`when`(userService.resetPassword(passwordResetRequest.token, passwordResetRequest.password)).thenThrow(Exception::class.java)

        val response = UserController(userService).resetPassword(passwordResetRequest)

        //Assert...
        assertEquals(HttpStatus.BAD_REQUEST, response.statusCode)
        assertEquals("Exception", response.body)
    }

    @Test
    fun urlResetPassword() {
        val passwordResetRequest = PasswordResetRequest(token = "test-token", password = "testPassword")
        Mockito.doNothing().`when`(userService).resetPassword(passwordResetRequest.token, passwordResetRequest.password)

        val objectMapper = ObjectMapper()
        val content = objectMapper.writeValueAsString(passwordResetRequest)

        //Assert...
        mockMvc
            .perform(
                post("/users/password-reset")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(content)
            )
            .andExpect(status().isOk)
            .andExpect(content().string("1"))
    }

    @Test
    fun accountResetPassword() {
        val accountPasswordResetRequest =
            AccountPasswordResetRequest(token = "test-token", oldPassword = "testOldPassword", newPassword = "testNewPassword")
        Mockito.`when`(userService.regenerateTokenIfStillValid(accountPasswordResetRequest.token))
            .thenReturn(Pair("test@example.com", "testNewToken"))
        Mockito.doNothing().`when`(userService).accountResetPassword(Mockito.anyString(), Mockito.anyString(), Mockito.anyString())

        val response = UserController(userService).accountResetPassword(accountPasswordResetRequest)

        //Assert...
        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals("testNewToken", response.body)
    }

    @Test
    fun accountResetPasswordWithException() {
        val accountPasswordResetRequest =
            AccountPasswordResetRequest(token = "test-token", oldPassword = "testOldPassword", newPassword = "testNewPassword")
        Mockito.`when`(userService.regenerateTokenIfStillValid(accountPasswordResetRequest.token))
            .thenReturn(Pair("test@example.com", "testNewToken"))
        Mockito.`when`(userService.accountResetPassword(Mockito.anyString(), Mockito.anyString(), Mockito.anyString()))
            .thenThrow(Exception::class.java)

        val response = UserController(userService).accountResetPassword(accountPasswordResetRequest)

        //Assert...
        assertEquals(HttpStatus.BAD_REQUEST, response.statusCode)
        assertEquals("Exception", response.body)
    }

    @Test
    fun urlAccountResetPassword() {
        val accountPasswordResetRequest =
            AccountPasswordResetRequest(token = "test-token", oldPassword = "testOldPassword", newPassword = "testNewPassword")
        Mockito.`when`(userService.regenerateTokenIfStillValid(accountPasswordResetRequest.token))
            .thenReturn(Pair("test@example.com", "testNewToken"))

        val objectMapper = ObjectMapper()
        val content = objectMapper.writeValueAsString(accountPasswordResetRequest)

        //Assert...
        mockMvc
            .perform(
                post("/users/account-password-reset")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(content)
            )
            .andExpect(status().isOk)
            .andExpect(content().string("testNewToken"))
    }

    @Test
    fun isUserStillLoggedIn() {
        val token = "test-token"
        Mockito.`when`(userService.regenerateTokenIfStillValid(token)).thenReturn(Pair("test@example.com", "testNewToken"))

        val response = UserController(userService).isUserStillLoggedIn(token)

        //Assert...
        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals("testNewToken", response.body)
    }

    @Test
    fun isUserStillLoggedInWithException() {
        val token = "test-token"
        Mockito.`when`(userService.regenerateTokenIfStillValid(token)).thenReturn(Pair("", ""))

        val response = UserController(userService).isUserStillLoggedIn(token)

        //Assert...
        assertEquals(HttpStatus.BAD_REQUEST, response.statusCode)
        assertEquals("1", response.body)
    }

    @Test
    fun urlIsUserStillLoggedIn() {
        val token = "test-token"
        Mockito.`when`(userService.regenerateTokenIfStillValid(token)).thenReturn(Pair("test@example.com", "testNewToken"))

        //Assert...
        mockMvc
            .perform(get("/users/check?token=$token"))
            .andExpect(status().isOk)
            .andExpect(content().string("testNewToken"))
    }

}