package com.rostagabor.mathmaze.data

import jakarta.persistence.*

/**
 *   Data class representing a user in the database.
 */
@Entity
@Table(name = "users")
data class User @JvmOverloads constructor(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    var userId: Long = 0,

    @Column(name = "username", nullable = false, unique = true)
    var username: String = "",

    @Column(name = "email", nullable = false, unique = true)
    var email: String = "",

    @Column(name = "password", nullable = false)
    var password: String = "",
)
