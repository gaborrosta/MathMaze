package com.rostagabor.mathmaze.data

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

/**
 *   Tests for the OperationType enum.
 */
class OperationTypeTest {

    @Test
    fun from() {
        assertEquals(OperationType.ADDITION, OperationType.from("1 + 1"))
        assertEquals(OperationType.SUBTRACTION, OperationType.from("1 - 1"))
        assertEquals(OperationType.MULTIPLICATION, OperationType.from("1 * 1"))
        assertEquals(OperationType.DIVISION, OperationType.from("1 / 1"))
        assertThrows(IllegalArgumentException::class.java) { OperationType.from("1 % 1") }
    }

    @Test
    fun isMixed() {
        assertFalse(OperationType.ADDITION.isMixed)
        assertFalse(OperationType.SUBTRACTION.isMixed)
        assertTrue(OperationType.BOTH_ADDITION_AND_SUBTRACTION.isMixed)
        assertFalse(OperationType.MULTIPLICATION.isMixed)
        assertFalse(OperationType.DIVISION.isMixed)
        assertTrue(OperationType.BOTH_MULTIPLICATION_AND_DIVISION.isMixed)
    }

    @Test
    fun firstOperation() {
        assertTrue(OperationType.ADDITION.firstOperation)
        assertFalse(OperationType.SUBTRACTION.firstOperation)
        assertFalse(OperationType.BOTH_ADDITION_AND_SUBTRACTION.firstOperation)
        assertTrue(OperationType.MULTIPLICATION.firstOperation)
        assertFalse(OperationType.DIVISION.firstOperation)
        assertFalse(OperationType.BOTH_MULTIPLICATION_AND_DIVISION.firstOperation)
    }

    @Test
    fun involvesSum() {
        assertTrue(OperationType.ADDITION.involvesSum)
        assertTrue(OperationType.SUBTRACTION.involvesSum)
        assertTrue(OperationType.BOTH_ADDITION_AND_SUBTRACTION.involvesSum)
        assertFalse(OperationType.MULTIPLICATION.involvesSum)
        assertFalse(OperationType.DIVISION.involvesSum)
        assertFalse(OperationType.BOTH_MULTIPLICATION_AND_DIVISION.involvesSum)
    }

    @Test
    fun involvesProduct() {
        assertFalse(OperationType.ADDITION.involvesProduct)
        assertFalse(OperationType.SUBTRACTION.involvesProduct)
        assertFalse(OperationType.BOTH_ADDITION_AND_SUBTRACTION.involvesProduct)
        assertTrue(OperationType.MULTIPLICATION.involvesProduct)
        assertTrue(OperationType.DIVISION.involvesProduct)
        assertTrue(OperationType.BOTH_MULTIPLICATION_AND_DIVISION.involvesProduct)
    }

}
