package com.rostagabor.mathmaze.data

import com.beust.klaxon.JsonObject
import jakarta.persistence.*
import java.time.Instant

/**
 *   Data class representing a maze in the database.
 */
@Entity
@Table(name = "mazes")
data class Maze(
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "maze_id")
    val mazeId: Long = 0,

    @ManyToOne(targetEntity = User::class)
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

    @Column(name = "data", nullable = false, length = 25000)
    val data: String = "",

    @Column(name = "path", nullable = false, length = 25000)
    val path: String = "",

    @Column(name = "created_at", nullable = false)
    var createdAt: Instant = Instant.now(),

    @Column(name = "saved", nullable = false)
    var saved: Boolean = false,

    @Column(name = "private", nullable = false)
    var isPrivate: Boolean = true,

    @Column(name = "passcode", nullable = false)
    var passcode: String = "",

    @ManyToOne(targetEntity = Solution::class)
    @JoinColumn(name = "based_on_1", nullable = true)
    var basedOn1: Solution? = null,

    @ManyToOne(targetEntity = Solution::class)
    @JoinColumn(name = "based_on_2", nullable = true)
    var basedOn2: Solution? = null,

    @ManyToOne(targetEntity = Solution::class)
    @JoinColumn(name = "based_on_3", nullable = true)
    var basedOn3: Solution? = null,

    @OneToMany(mappedBy = "maze", cascade = [CascadeType.ALL])
    val solutions: List<Solution> = listOf()
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


    /**
     *   Maximum numbers of digits involved in the results.
     */
    val numberOfDigits: Int
        get() = if (operation.involvesProduct && numbersRangeEnd == 20) 3 else 2


    /**
     *   A JSON representation of the maze. Used when displaying a recognised maze.
     */
    val jsonWhenRecognised: JsonObject
        get() = JsonObject().apply {
            this["id"] = mazeId
            this["width"] = width
            this["height"] = height
            this["start"] = Point.START.toList()
            this["end"] = endPoint.toList()
        }

    /**
     *   A JSON representation of the maze. Used when solving a maze.
     */
    val jsonForSolving: JsonObject
        get() = jsonWhenRecognised.apply {
            this["data"] = sendableData
            this["path"] = sendablePath
            this["digits"] = numberOfDigits
            this["pathLength"] = pathLength - 2
            this["pathTypeEven"] = pathTypeEven
            this["user"] = generatedBy.username
            this["description"] = description
        }

    /**
     *   A JSON representation of the maze. Used when generated or saved a maze.
     */
    val jsonWhenGeneratedOrSaved: JsonObject
        get() = jsonForSolving.apply {
            this["location"] = location
            this["isPrivate"] = isPrivate
            this["passcode"] = passcode
        }

    /**
     *   A JSON representation of the maze. Used when displaying a maze in the profile page.
     */
    val jsonForProfile: JsonObject
        get() = jsonWhenGeneratedOrSaved.apply {
            this["numbersRangeStart"] = numbersRangeStart
            this["numbersRangeEnd"] = numbersRangeEnd
            this["operation"] = operation.ordinal
            this["createdAt"] = createdAt.toEpochMilli()
            this["solved"] = solutions.size
        }

}
