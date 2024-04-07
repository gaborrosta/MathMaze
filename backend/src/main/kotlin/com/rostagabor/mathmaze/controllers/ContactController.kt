package com.rostagabor.mathmaze.controllers

import com.rostagabor.mathmaze.requests.ContactRequest
import com.rostagabor.mathmaze.services.ContactService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

/**
 *   Controller for contact.
 */
@RestController
@RequestMapping("/contact")
class ContactController(private val contactService: ContactService) {

    /**
     *   Sends an email to the admin.
     */
    @PostMapping("")
    fun send(@RequestBody contactRequest: ContactRequest): ResponseEntity<Any> {
        return try {
            //Send the email
            contactService.send(contactRequest.name, contactRequest.email, contactRequest.subject, contactRequest.message)

            //Return success
            ResponseEntity.ok().body("1")
        } catch (e: Exception) {
            ResponseEntity.badRequest().body(e::class.simpleName)
        }
    }

}
