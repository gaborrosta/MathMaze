package com.rostagabor.mathmaze.data

/**
 *   Class for the tiles that must be in the new maze.
 */
data class MustIncludeTile(
    val number1: Int,
    val number2: Int,
    val result: Int,
    val operationType: OperationType,
    val operation: String,
) {

    /**
     *   Checks if the tile would be fine to be placed here in the maze.
     */
    fun check(pathTypeEven: Boolean, isPartOfPath: Boolean, wantedType: OperationType, neighboursList: List<Triple<Int, Int, Int>?>): Boolean {
        //What type of tile is wanted
        val wantedEven = (pathTypeEven && isPartOfPath) || (!pathTypeEven && !isPartOfPath)

        //Is the result even?
        val isEven = result % 2 == 0

        //For neighbours
        val triple = Triple(number1, number2, result)

        //Check if the tile is fine to be placed here
        return operationType == wantedType && ((isEven && wantedEven) || (!isEven && !wantedEven)) && triple !in neighboursList
    }

}
