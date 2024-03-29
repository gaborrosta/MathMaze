package com.rostagabor.mathmaze.requests

import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

/**
 *   Tests for the SolutionIDForm.
 */
class SolutionIDFormTest {

    @Test
    fun isEmpty() {
        assertTrue(SolutionIDForm(null, null, null).isEmpty)
        assertFalse(SolutionIDForm(1, null, null).isEmpty)
        assertFalse(SolutionIDForm(null, 1, null).isEmpty)
        assertFalse(SolutionIDForm(null, null, "nickname").isEmpty)
        assertFalse(SolutionIDForm(1, 1, null).isEmpty)
        assertFalse(SolutionIDForm(1, null, "nickname").isEmpty)
        assertFalse(SolutionIDForm(null, 1, "nickname").isEmpty)
    }

    @Test
    fun isCorrect() {
        assertFalse(SolutionIDForm(null, null, null).isCorrect)
        assertTrue(SolutionIDForm(1, null, null).isCorrect)
        assertFalse(SolutionIDForm(null, 1, null).isCorrect)
        assertFalse(SolutionIDForm(null, null, "nickname").isCorrect)
        assertFalse(SolutionIDForm(1, 1, null).isCorrect)
        assertFalse(SolutionIDForm(1, null, "nickname").isCorrect)
        assertTrue(SolutionIDForm(null, 1, "nickname").isCorrect)
    }

}
