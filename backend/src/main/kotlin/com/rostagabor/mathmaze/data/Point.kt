package com.rostagabor.mathmaze.data

/**
 *   Data class for a point.
 */
data class Point(val x: Int, val y: Int) {

    /**
     *   Checks if the point is at the border of the maze.
     */
    fun atBorder(width: Int, height: Int): Boolean {
        return x == 0 || y == 0 || x == width - 1 || y == height - 1
    }

    /**
     *   Converts the point to a list.
     */
    fun toList() = listOf(x, y)

    /**
     *   Returns the neighbours of the point.
     */
    fun neighboursInRange(width: Int, height: Int): List<Point> {
        val neighbours = mutableListOf<Point>()
        if (x > 0) neighbours.add(Point(x - 1, y))
        if (x < width - 1) neighbours.add(Point(x + 1, y))
        if (y > 0) neighbours.add(Point(x, y - 1))
        if (y < height - 1) neighbours.add(Point(x, y + 1))
        return neighbours
    }


    companion object {

        /**
         *   The start point of the maze.
         */
        val START = Point(0, 0)

        /**
         *   A point outside the maze.
         */
        val NOWHERE = Point(-1, -1)

    }

}
