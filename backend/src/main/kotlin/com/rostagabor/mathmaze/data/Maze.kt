package com.rostagabor.mathmaze.data

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "mazes")
data class Maze(
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "maze_id")
    val mazeId: Long = 0,

    @ManyToOne
    @JoinColumn(name = "generated_by", nullable = false)
    val generatedBy: User = User(),

    @Column(name = "location", nullable = false)
    val location: String = "/",

    @Column(name = "description", nullable = false)
    val description: String = "",

    @Column(name = "width", nullable = false)
    val width: Int = -1,

    @Column(name = "height", nullable = false)
    val height: Int = -1,

    @Column(name = "numbers_range_start", nullable = false)
    val numbersRangeStart: Int = -1,

    @Column(name = "numbers_range_end", nullable = false)
    val numbersRangeEnd: Int = -1,

    @Column(name = "operation", nullable = false)
    val operation: OperationType = OperationType.ADDITION,

    @Column(name = "path_type_even", nullable = false)
    val pathTypeEven: Boolean = true,

    @Column(name = "path", nullable = false, length = 25000)
    val path: String = "",

    @Column(name = "data", nullable = false, length = 25000)
    val data: String = "",

    @Column(name = "created_at", nullable = false)
    var createdAt: Instant = Instant.now(),

    @Column(name = "saved", nullable = false)
    var saved: Boolean = false
) {

    /**
     *   The end point of the maze.
     */
    val endPoint: Point
        get() = path.split(";").last().split(",").let { (x, y) -> Point(x.toInt(), y.toInt()) }


    /**
     *   The length of the path.
     */
    val pathLength: Int
        get() = path.split(";").size


    /**
     *   Properly formatted data for the frontend.
     */
    val sendableData: List<List<String>>
        get() = data.split(";").windowed(width, width)

    /**
     *   Properly formatted path for the frontend.
     */
    val sendablePath: List<Point>
        get() = path.split(";").map { it.split(",").let { (x, y) -> Point(x.toInt(), y.toInt()) } }

}