package com.rostagabor.mathmaze.utils

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

/**
 *   Tests for the utils.
 */
class UtilsTest {

    @Test
    fun generateLocationsList() {
        val locations = listOf("/a/b/c/", "/a/b/d/", "/a/e/", "/f/", "/g/h/i/")
        val expected = listOf("/", "/a/", "/a/b/", "/a/b/c/", "/a/b/d/", "/a/e/", "/f/", "/g/", "/g/h/", "/g/h/i/")
        assertEquals(expected, generateLocationsList(locations))
    }

}
