package com.rostagabor.mathmaze.data

/**
 *   Available operation types for mazes.
 */
enum class OperationType {

    ADDITION,

    SUBTRACTION,

    BOTH_ADDITION_AND_SUBTRACTION,

    MULTIPLICATION,

    DIVISION,

    BOTH_MULTIPLICATION_AND_DIVISION,
    ;


    /**
     *   Checks if the operation is mixed.
     */
    val isMixed: Boolean
        get() = this == BOTH_ADDITION_AND_SUBTRACTION || this == BOTH_MULTIPLICATION_AND_DIVISION

    /**
     *   Checks if the first operation is addition or multiplication.
     */
    val firsOperation: Boolean
        get() = this == ADDITION || this == MULTIPLICATION

    /**
     *   Checks if the operation is addition, subtraction or both.
     */
    val involvesSum: Boolean
        get() = this == ADDITION || this == SUBTRACTION || this == BOTH_ADDITION_AND_SUBTRACTION

    /**
     *   Checks if the operation is multiplication, division or both.
     */
    val involvesProduct: Boolean
        get() = this == MULTIPLICATION || this == DIVISION || this == BOTH_MULTIPLICATION_AND_DIVISION


    companion object {

        /**
         *   Creates an operation type from a string.
         */
        fun from(operation: String) = when (operation.split(" ")[1]) {
            "+" -> ADDITION
            "-" -> SUBTRACTION
            "*" -> MULTIPLICATION
            "/" -> DIVISION
            else -> throw IllegalArgumentException("Invalid operation type: $operation")
        }

    }

}
