package com.rostagabor.mathmaze.data

import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

/**
 *   Tests for the MustIncludeTile class.
 */
class MustIncludeTileTest {

    @Test
    fun check() {
        val tile = MustIncludeTile(1, 1, 2, OperationType.ADDITION, "1 + 1")

        //Assert...
        assertTrue(
            tile.check(
                pathTypeEven = true,
                isPartOfPath = true,
                wantedType = OperationType.ADDITION,
                neighboursList = emptyList(),
            )
        )
        assertTrue(
            tile.check(
                pathTypeEven = false,
                isPartOfPath = false,
                wantedType = OperationType.ADDITION,
                neighboursList = emptyList(),
            )
        )
        assertFalse(
            tile.check(
                pathTypeEven = true,
                isPartOfPath = false,
                wantedType = OperationType.ADDITION,
                neighboursList = emptyList(),
            )
        )
        assertFalse(
            tile.check(
                pathTypeEven = true,
                isPartOfPath = true,
                wantedType = OperationType.SUBTRACTION,
                neighboursList = emptyList(),
            )
        )
        assertFalse(
            tile.check(
                pathTypeEven = true,
                isPartOfPath = true,
                wantedType = OperationType.ADDITION,
                neighboursList = listOf(Triple(1, 1, 2))
            )
        )
    }

}
