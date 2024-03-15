package com.rostagabor.mathmaze.utils

import com.rostagabor.mathmaze.data.Maze

/**
 *   Generates a displayable list of the possible locations of the mazes.
 */
fun generateLocationsList(mazes: List<Maze>): List<String> {
    val locations = mazes.mapTo(HashSet()) { it.location }

    return locations.map { location ->
        val parts = location.split("/")

        val results = arrayListOf<String>()
        repeat(parts.size) {
            results.add(parts.take(it).joinToString("/") + "/")
        }

        results
    }.flatten().distinct()
}
