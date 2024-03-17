package com.rostagabor.mathmaze.requests

/**
 *   Class for referencing a solution when generating a maze.
 */
class SolutionIDForm(
    val solutionId: Long?,
    val mazeId: Long?,
    val nickname: String?,
) {

    /**
     *   Checks if the form was empty.
     */
    val isEmpty: Boolean
        get() = solutionId == null && mazeId == null && nickname.isNullOrEmpty()

    /**
     *   Checks if the data is correct (either a solution ID or a maze ID with a nickname).
     */
    val isCorrect: Boolean
        get() = (solutionId != null && mazeId == null && nickname.isNullOrEmpty()) || (solutionId == null && mazeId != null && !nickname.isNullOrEmpty())

}
