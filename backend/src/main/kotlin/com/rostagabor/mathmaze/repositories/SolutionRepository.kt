package com.rostagabor.mathmaze.repositories

import com.rostagabor.mathmaze.data.Maze
import com.rostagabor.mathmaze.data.Solution
import org.springframework.data.jpa.repository.JpaRepository

/**
 *   Manages the solutions table in the database.
 */
interface SolutionRepository : JpaRepository<Solution, Long> {

    /**
     *   Checks if a solution exists by nickname and maze.
     */
    fun existsByMazeAndNickname(maze: Maze, nickname: String): Boolean

}