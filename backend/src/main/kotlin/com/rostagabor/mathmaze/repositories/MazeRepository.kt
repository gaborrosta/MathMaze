package com.rostagabor.mathmaze.repositories

import com.rostagabor.mathmaze.data.Maze
import com.rostagabor.mathmaze.data.OperationType
import org.springframework.data.jpa.repository.JpaRepository

/**
 *   Manages the mazes table in the database.
 */
interface MazeRepository : JpaRepository<Maze, Long> {

    /**
     *   Finds mazes by their width, height, numbers range, operation, path type, and saved status.
     */
    fun findByWidthAndHeightAndNumbersRangeStartAndNumbersRangeEndAndOperationAndPathTypeEvenAndSaved(
        width: Int,
        height: Int,
        numbersRangeStart: Int,
        numbersRangeEnd: Int,
        operation: OperationType,
        pathTypeEven: Boolean,
        saved: Boolean = false,
    ): List<Maze>

}