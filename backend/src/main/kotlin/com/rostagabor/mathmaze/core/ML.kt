package com.rostagabor.mathmaze.core

import org.jetbrains.kotlinx.dl.api.core.Sequential
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
import org.jetbrains.kotlinx.dl.dataset.embedded.NUMBER_OF_CLASSES
import org.jetbrains.kotlinx.dl.dataset.embedded.extractImages
import org.jetbrains.kotlinx.dl.dataset.embedded.extractLabels
import java.io.File

/**
 *   The machine learning model for recognising the numbers in a maze.
 */
object ML {

    /**
     *   The size of an input image.
     */
    private const val IMAGE_SIZE = 28L

    /**
     *   The number of channels in an input image.
     */
    private const val NUM_CHANNELS = 1L


    /**
     *   The seed for the kernel initializer.
     */
    private const val SEED = 12L


    /**
     *   The number of epochs to train the model.
     */
    private const val EPOCHS = 3

    /**
     *   The number of images to train the model in one batch.
     */
    private const val TRAINING_BATCH_SIZE = 1000

    /**
     *   The number of images to test the model in one batch.
     */
    private const val TEST_BATCH_SIZE = 1000


    /**
     *   States whether the model has been trained.
     */
    private var trained = false


    /**
     *   The dataset for training and testing the model. It is based on the MNIST dataset.
     */
    private val dataset by lazy {
        //The path to the datasets
        val prefix = File("datasets").absolutePath + File.separator

        //Create the datasets
        OnHeapDataset.createTrainAndTestDatasets(
            trainFeaturesPath = prefix + "extended-train-images.gz",
            trainLabelsPath = prefix + "extended-train-labels.gz",
            testFeaturesPath = prefix + "extended-test-images.gz",
            testLabelsPath = prefix + "extended-test-labels.gz",
            numClasses = NUMBER_OF_CLASSES,
            featuresExtractor = ::extractImages,
            labelExtractor = ::extractLabels,
        )
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
     *   Train the model and return the accuracy on the test dataset.
     */
    fun train(): Double? {
        //Split the dataset into training and testing datasets
        val (train, test) = dataset

        //Configure the model for training
        model.compile(
            optimizer = Adam(clipGradient = ClipGradientByValue(0.1f)),
            loss = Losses.SOFT_MAX_CROSS_ENTROPY_WITH_LOGITS,
            metric = Metrics.ACCURACY,
        )

        //Train the model
        model.fit(dataset = train, epochs = EPOCHS, batchSize = TRAINING_BATCH_SIZE)

        //The model has been trained
        trained = true

        //Evaluate the model on the test dataset
        return model.evaluate(dataset = test, batchSize = TEST_BATCH_SIZE).metrics[Metrics.ACCURACY]
    }


    /**
     *   Predicts the number on the image.
     */
    fun predict(image: FloatArray): Int = if (trained) model.predict(image) else 0

}