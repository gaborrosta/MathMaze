package com.rostagabor.mathmaze.utils

/**
 *   Generates a displayable list of the possible locations of the mazes.
 */
fun generateLocationsList(locations: List<String>): List<String> {
    return locations.distinct().map { location ->
        val parts = location.split("/")

        val results = arrayListOf<String>()
        repeat(parts.size) {
            results.add(parts.take(it).joinToString("/") + "/")
        }

        results
    }.flatten().distinct()
}
