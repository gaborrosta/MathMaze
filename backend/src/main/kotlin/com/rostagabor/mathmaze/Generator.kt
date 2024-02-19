package com.rostagabor.mathmaze

object Generator {

    enum class Direction {
        UP, DOWN, LEFT, RIGHT,
    }

    fun generateCharacterMaze(width: Int, height: Int): List<List<Char>> {
        require(width > 10) { "Width must be greater than 10" }
        require(height > 10) { "Height must be greater than 10" }
        require(width % 2 == 1) { "Width must be odd" }
        require(height % 2 == 1) { "Height must be odd" }
        require(width < 50) { "Width must be less than 50" }
        require(height < 50) { "Height must be less than 50" }

        val maze = Array(height) { IntArray(width) { 1 } }
        generateRecursively(maze, 0, 0)

        return maze.map { it.map { ch -> if (ch == 0) ' ' else '#' } }
    }

    private fun generateRecursively(maze: Array<IntArray>, x: Int, y: Int) {
        maze[y][x] = 0

        val ways = Direction.entries.toMutableList()
        ways.shuffle()

        for (way in ways) {
            when (way) {
                Direction.UP -> if (y >= 2 && maze[y - 2][x] != 0) {
                    maze[y - 1][x] = 0
                    generateRecursively(maze, x, y - 2)
                }

                Direction.DOWN -> if (y < maze.size - 2 && maze[y + 2][x] != 0) {
                    maze[y + 1][x] = 0
                    generateRecursively(maze, x, y + 2)
                }

                Direction.LEFT -> if (x >= 2 && maze[y][x - 2] != 0) {
                    maze[y][x - 1] = 0
                    generateRecursively(maze, x - 2, y)
                }

                Direction.RIGHT -> if (x < maze[0].size - 2 && maze[y][x + 2] != 0) {
                    maze[y][x + 1] = 0
                    generateRecursively(maze, x + 2, y)
                }
            }
        }
    }

}
