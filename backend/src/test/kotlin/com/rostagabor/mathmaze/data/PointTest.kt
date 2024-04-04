package com.rostagabor.mathmaze.data

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

/**
 *   Tests for the Point class.
 */
class PointTest {

    @Test
    fun atBorder() {
        assertTrue(Point(0, 0).atBorder(5, 5))
        assertTrue(Point(4, 0).atBorder(5, 5))
        assertTrue(Point(0, 4).atBorder(5, 5))
        assertTrue(Point(4, 4).atBorder(5, 5))
        assertFalse(Point(1, 1).atBorder(5, 5))
    }

    @Test
    fun toList() {
        assertEquals(listOf(0, 0), Point(0, 0).toList())
        assertEquals(listOf(1, 1), Point(1, 1).toList())
        assertEquals(listOf(2, 3), Point(2, 3).toList())
    }

    @Test
    fun neighboursInRange() {
        assertEquals(listOf(Point(1, 0), Point(0, 1)), Point(0, 0).neighboursInRange(5, 5))
        assertEquals(
            listOf(Point(0, 1), Point(2, 1), Point(1, 0), Point(1, 2)),
            Point(1, 1).neighboursInRange(5, 5),
        )
        assertEquals(listOf(Point(3, 4), Point(4, 3)), Point(4, 4).neighboursInRange(5, 5))
    }

}
