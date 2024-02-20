package com.rostagabor.mathmaze

object Generator {

    enum class Direction {
        UP, DOWN, LEFT, RIGHT,
    }

    data class Point(val x: Int, val y: Int)

    fun generateCharacterMaze(width: Int, height: Int, minLength: Int, maxLength: Int): Pair<List<List<Char>>, String> {
        require(width > 10) { "Width must be greater than 10" }
        require(height > 10) { "Height must be greater than 10" }
        require(width % 2 == 1) { "Width must be odd" }
        require(height % 2 == 1) { "Height must be odd" }
        require(width < 50) { "Width must be less than 50" }
        require(height < 50) { "Height must be less than 50" }
        require(minLength <= maxLength) { "minLength must be less than or equal to maxLength" }

        val maze = Array(height) { IntArray(width) { 1 } }
        val lengths = hashMapOf(Point(0, 0) to 0)
        generateRecursively(maze, 0, 0, lengths)

        val originalEnd = Point(width - 1, height - 1)
        val baseLength = lengths[originalEnd] ?: 0
        val range = minLength..maxLength

        val (message, endPoint) = if (baseLength < minLength || baseLength > maxLength) {
            val possibleEnds =
                lengths.entries.filter { it.value in range && (it.key.x == width - 1 || it.key.y == height - 1 || it.key.x == 0 || it.key.y == 0) }

            val end = possibleEnds.minByOrNull { it.value }
            if (end == null) {
                "No point with a path length in range $range is found, therefore the original end is used with length $baseLength." to originalEnd
            } else {
                "The shortest path with length ${end.value} in range $range is used instead of the original end with length $baseLength." to end.key
            }
        } else {
            "The original end with path length $baseLength is in range $range." to originalEnd
        }

        return maze.mapIndexed { y, row ->
            row.mapIndexed { x, ch ->
                if (x == 0 && y == 0) {
                    'S'
                } else if (x == endPoint.x && y == endPoint.y) {
                    'E'
                } else if (ch == 0) {
                    ' '
                } else {
                    '#'
                }
            }
        } to message
    }

    private fun generateRecursively(maze: Array<IntArray>, x: Int, y: Int, lengths: HashMap<Point, Int>) {
        maze[y][x] = 0

        val ways = Direction.entries.toMutableList()
        ways.shuffle()

        for (way in ways) {
            when (way) {
                Direction.UP -> if (y >= 2 && maze[y - 2][x] != 0) {
                    maze[y - 1][x] = 0
                    lengths[Point(x, y - 2)] = lengths[Point(x, y)]!! + 2
                    generateRecursively(maze, x, y - 2, lengths)
                }

                Direction.DOWN -> if (y < maze.size - 2 && maze[y + 2][x] != 0) {
                    maze[y + 1][x] = 0
                    lengths[Point(x, y + 2)] = lengths[Point(x, y)]!! + 2
                    generateRecursively(maze, x, y + 2, lengths)
                }

                Direction.LEFT -> if (x >= 2 && maze[y][x - 2] != 0) {
                    maze[y][x - 1] = 0
                    lengths[Point(x - 2, y)] = lengths[Point(x, y)]!! + 2
                    generateRecursively(maze, x - 2, y, lengths)
                }

                Direction.RIGHT -> if (x < maze[0].size - 2 && maze[y][x + 2] != 0) {
                    maze[y][x + 1] = 0
                    lengths[Point(x + 2, y)] = lengths[Point(x, y)]!! + 2
                    generateRecursively(maze, x + 2, y, lengths)
                }
            }
        }
    }

}
