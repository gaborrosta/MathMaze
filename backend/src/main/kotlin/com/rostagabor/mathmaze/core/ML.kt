package com.rostagabor.mathmaze.core

import org.jetbrains.kotlinx.dl.api.core.Sequential
import org.jetbrains.kotlinx.dl.api.core.WritingMode
import org.jetbrains.kotlinx.dl.api.core.activation.Activations
import org.jetbrains.kotlinx.dl.api.core.initializer.Constant
import org.jetbrains.kotlinx.dl.api.core.initializer.GlorotNormal
import org.jetbrains.kotlinx.dl.api.core.initializer.Zeros
import org.jetbrains.kotlinx.dl.api.core.layer.convolutional.Conv2D
import org.jetbrains.kotlinx.dl.api.core.layer.convolutional.ConvPadding
import org.jetbrains.kotlinx.dl.api.core.layer.core.Dense
import org.jetbrains.kotlinx.dl.api.core.layer.core.Input
import org.jetbrains.kotlinx.dl.api.core.layer.pooling.AvgPool2D
import org.jetbrains.kotlinx.dl.api.core.layer.reshaping.Flatten
import org.jetbrains.kotlinx.dl.api.core.loss.Losses
import org.jetbrains.kotlinx.dl.api.core.metric.Metrics
import org.jetbrains.kotlinx.dl.api.core.optimizer.Adam
import org.jetbrains.kotlinx.dl.api.core.optimizer.ClipGradientByValue
import org.jetbrains.kotlinx.dl.dataset.OnHeapDataset
import org.jetbrains.kotlinx.dl.impl.summary.logSummary
import org.jetbrains.kotlinx.dl.impl.util.toNormalizedVector
import java.io.DataInputStream
import java.io.File
import java.io.FileInputStream
import java.util.zip.GZIPInputStream

/**
 *   The machine learning model for recognising the numbers in a maze.
 */
object ML {

    /**
     *   Whether to create copies of the images and labels in training.
     */
    private enum class Copy {

        /**
         *  Do not create copies.
         */
        NO,

        /**
         *   Create copies next to each other.
         */
        NEXT_TO,

        /**
         *   Create copies far away from each other.
         */
        FAR_AWAY,

    }


    /**
     *   The size of an input image.
     */
    private const val IMAGE_SIZE = 28L

    /**
     *   The number of channels in an input image.
     */
    private const val NUM_CHANNELS = 1L

    /**
     *   The number of classes.
     */
    private const val NUM_CLASSES = 10


    /**
     *   The seed for the kernel initializer.
     */
    private const val SEED = 12L


    /**
     *   The number of epochs to train the model.
     */
    private const val EPOCHS = 25

    /**
     *   The number of images to train the model in one batch.
     */
    private const val TRAINING_BATCH_SIZE = 128

    /**
     *   The number of images to test the model in one batch.
     */
    private const val TEST_BATCH_SIZE = 1000


    /**
     *   The directory where the model is saved.
     */
    private val modelDirectory: File = File("model")


    /**
     *   The dataset for training and testing the model. It is based on the MNIST dataset.
     */
    private val dataset by lazy {
        //The path to the datasets
        val prefix = File("datasets").absolutePath + File.separator

        //Create the datasets
        Pair(
            OnHeapDataset.create(
                featuresPath = prefix + "extended-train-images.gz",
                labelsPath = prefix + "extended-train-labels.gz",
                numClasses = NUM_CLASSES,
                featuresExtractor = { path -> extractImages(archivePath = path) },
                labelExtractor = { path, _ -> extractLabels(archivePath = path) },
            ),
            OnHeapDataset.create(
                featuresPath = prefix + "extended-test-images.gz",
                labelsPath = prefix + "extended-test-labels.gz",
                numClasses = NUM_CLASSES,
                featuresExtractor = { path -> extractImages(archivePath = path) },
                labelExtractor = { path, _ -> extractLabels(archivePath = path) },
            )
        )
    }

    /**
     *   Extracts images from [archivePath].
     */
    private fun extractImages(archivePath: String, copy: Copy = Copy.NO): Array<FloatArray> {
        //Open the archive
        val archiveStream = DataInputStream(GZIPInputStream(FileInputStream(archivePath)))
        archiveStream.readInt()

        //Read the metadata
        val imageCount = archiveStream.readInt()
        val imageRows = archiveStream.readInt()
        val imageCols = archiveStream.readInt()
        println(String.format("Extracting %d images of %dx%d from %s", imageCount, imageRows, imageCols, archivePath))

        //Create the buffer and the array for the images
        val imageBuffer = ByteArray(imageRows * imageCols)
        val images = Array(imageCount * if (copy != Copy.NO) 9 else 1) { FloatArray(28 * 28) }

        //Read the images
        for (i in 0 until imageCount) {
            //Read the original image and normalise it
            archiveStream.readFully(imageBuffer)
            val normalised = toNormalizedVector(imageBuffer)

            //Creating copies of the image?
            if (copy != Copy.NO) {
                //Create a 30x30 buffer and copy the original image into the center of it
                val extendedBuffer = FloatArray(30 * 30) { 0f }
                for (row in 0 until 28) {
                    for (col in 0 until 28) {
                        extendedBuffer[(row + 1) * 30 + (col + 1)] = normalised[row * 28 + col]
                    }
                }

                //Create 9 different 28x28 images
                for (j in 0 until 9) {
                    val startRow = j / 3
                    val startCol = j % 3
                    for (row in 0 until 28) {
                        for (col in 0 until 28) {
                            //Copy the image
                            if (copy == Copy.NEXT_TO) {
                                images[i * imageCount + j][row * 28 + col] = extendedBuffer[(startRow + row) * 30 + (startCol + col + 1)]
                            } else if (copy == Copy.FAR_AWAY) {
                                images[j * imageCount + i][row * 28 + col] = extendedBuffer[(startRow + row) * 30 + (startCol + col + 1)]
                            }
                        }
                    }
                }
            }
            //No copies
            else {
                images[i] = normalised
            }
        }

        println(images.size)

        //Return the images
        return images
    }

    /**
     *   Extracts labels from [archivePath].
     */
    private fun extractLabels(archivePath: String, copy: Copy = Copy.NO): FloatArray {
        //Open the archive
        val archiveStream = DataInputStream(GZIPInputStream(FileInputStream(archivePath)))
        archiveStream.readInt()

        //Read the metadata
        val labelCount = archiveStream.readInt()
        println(String.format("Extracting %d labels from %s", labelCount, archivePath))

        //Create the buffer for the labels
        val labelBuffer = ByteArray(labelCount)
        archiveStream.readFully(labelBuffer)

        //Create the array for the labels
        val floats = FloatArray(labelCount * if (copy != Copy.NO) 9 else 1)

        //Read the labels
        for (i in 0 until labelCount) {
            //Read the label
            val label = OnHeapDataset.convertByteToFloat(labelBuffer[i])

            //Creating copies of the labels?
            if (copy != Copy.NO) {
                //Save the label 9 times
                repeat(9) { j ->
                    if (copy == Copy.NEXT_TO) {
                        floats[i * labelCount + j] = label
                    } else if (copy == Copy.FAR_AWAY) {
                        floats[j * labelCount + i] = label
                    }
                }
            }
            //No copies
            else {
                floats[i] = label
            }
        }

        println(floats.size)

        //Return the labels
        return floats
    }


    /**
     *   The machine learning model.
     *
     *   Source: https://github.com/Kotlin/kotlindl
     */
    private val model = Sequential.of(
        Input(
            IMAGE_SIZE,
            IMAGE_SIZE,
            NUM_CHANNELS,
        ),
        Conv2D(
            filters = 6,
            kernelSize = intArrayOf(5, 5),
            strides = intArrayOf(1, 1, 1, 1),
            activation = Activations.Tanh,
            kernelInitializer = GlorotNormal(SEED),
            biasInitializer = Zeros(),
            padding = ConvPadding.SAME,
        ),
        AvgPool2D(
            poolSize = intArrayOf(1, 2, 2, 1),
            strides = intArrayOf(1, 2, 2, 1),
            padding = ConvPadding.VALID,
        ),
        Conv2D(
            filters = 16,
            kernelSize = intArrayOf(5, 5),
            strides = intArrayOf(1, 1, 1, 1),
            activation = Activations.Tanh,
            kernelInitializer = GlorotNormal(SEED),
            biasInitializer = Zeros(),
            padding = ConvPadding.SAME,
        ),
        AvgPool2D(
            poolSize = intArrayOf(1, 2, 2, 1),
            strides = intArrayOf(1, 2, 2, 1),
            padding = ConvPadding.VALID,
        ),
        Flatten(),
        Dense(
            outputSize = 120,
            activation = Activations.Tanh,
            kernelInitializer = GlorotNormal(SEED),
            biasInitializer = Constant(0.1f),
        ),
        Dense(
            outputSize = 84,
            activation = Activations.Tanh,
            kernelInitializer = GlorotNormal(SEED),
            biasInitializer = Constant(0.1f),
        ),
        Dense(
            outputSize = 10,
            activation = Activations.Linear,
            kernelInitializer = GlorotNormal(SEED),
            biasInitializer = Constant(0.1f),
        ),
    )


    /**
     *   Trains the model and saves it.
     */
    fun trainAndSave() {
        //Split the dataset into training and testing datasets
        val (train, test) = dataset

        //Configure the model for training
        model.compile(
            optimizer = Adam(clipGradient = ClipGradientByValue(0.1f)),
            loss = Losses.SOFT_MAX_CROSS_ENTROPY_WITH_LOGITS,
            metric = Metrics.ACCURACY,
        )

        //Log the summary of the model
        model.logSummary()

        //Train the model
        model.fit(
            trainingDataset = train,
            validationDataset = test,
            epochs = EPOCHS,
            trainBatchSize = TRAINING_BATCH_SIZE,
            validationBatchSize = TEST_BATCH_SIZE,
        )

        //Save the model
        model.save(modelDirectory, writingMode = WritingMode.OVERRIDE)
    }

    /**
     *   Loads the weights of the model.
     */
    fun loadWeights() {
        //Configure the model
        model.compile(
            optimizer = Adam(clipGradient = ClipGradientByValue(0.1f)),
            loss = Losses.SOFT_MAX_CROSS_ENTROPY_WITH_LOGITS,
            metric = Metrics.ACCURACY,
        )

        //Load the weights
        model.loadWeights(modelDirectory)
    }


    /**
     *   Predicts the number on the image.
     */
    fun predict(image: FloatArray): Int = model.predict(image)

}
