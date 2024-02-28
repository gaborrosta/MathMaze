package com.rostagabor.mathmaze.data

import jakarta.persistence.*
import java.time.Instant

/**
 *   Data class representing a password reset token in the database.
 */
@Entity
@Table(name = "password_reset_tokens")
data class PasswordResetToken @JvmOverloads constructor(
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "token_id")
    val id: Long = 0,

    @Column(name = "token", nullable = false, unique = true)
    val token: String = "",

    @ManyToOne(targetEntity = User::class, fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User = User(),

    @Column(name = "expiry_date", nullable = false)
    val expiryDate: Instant = Instant.now(),

    @Column(name = "used", nullable = false)
    var used: Boolean = false,
)
