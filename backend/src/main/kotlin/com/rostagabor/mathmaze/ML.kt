package com.rostagabor.mathmaze

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
import org.jetbrains.kotlinx.dl.dataset.embedded.mnist
import org.jetbrains.kotlinx.dl.impl.summary.logSummary

object ML {

    private const val EPOCHS = 3
    private const val TRAINING_BATCH_SIZE = 1000
    private const val NUM_CHANNELS = 1L
    private const val IMAGE_SIZE = 28L
    private const val SEED = 12L
    private const val TEST_BATCH_SIZE = 1000

    private val mnist = mnist()

    /**
     *   Copied from https://github.com/Kotlin/kotlindl
     */
    private val lenet5Classic = Sequential.of(
        Input(
            IMAGE_SIZE,
            IMAGE_SIZE,
            NUM_CHANNELS
        ),
        Conv2D(
            filters = 6,
            kernelSize = intArrayOf(5, 5),
            strides = intArrayOf(1, 1, 1, 1),
            activation = Activations.Tanh,
            kernelInitializer = GlorotNormal(SEED),
            biasInitializer = Zeros(),
            padding = ConvPadding.SAME
        ),
        AvgPool2D(
            poolSize = intArrayOf(1, 2, 2, 1),
            strides = intArrayOf(1, 2, 2, 1),
            padding = ConvPadding.VALID
        ),
        Conv2D(
            filters = 16,
            kernelSize = intArrayOf(5, 5),
            strides = intArrayOf(1, 1, 1, 1),
            activation = Activations.Tanh,
            kernelInitializer = GlorotNormal(SEED),
            biasInitializer = Zeros(),
            padding = ConvPadding.SAME
        ),
        AvgPool2D(
            poolSize = intArrayOf(1, 2, 2, 1),
            strides = intArrayOf(1, 2, 2, 1),
            padding = ConvPadding.VALID
        ),
        Flatten(), // 3136
        Dense(
            outputSize = 120,
            activation = Activations.Tanh,
            kernelInitializer = GlorotNormal(SEED),
            biasInitializer = Constant(0.1f)
        ),
        Dense(
            outputSize = 84,
            activation = Activations.Tanh,
            kernelInitializer = GlorotNormal(SEED),
            biasInitializer = Constant(0.1f)
        ),
        Dense(
            outputSize = 10,
            activation = Activations.Linear,
            kernelInitializer = GlorotNormal(SEED),
            biasInitializer = Constant(0.1f)
        )
    )


    fun train() {
        val (train, test) = mnist

        lenet5Classic.let {
            it.compile(
                optimizer = Adam(clipGradient = ClipGradientByValue(0.1f)),
                loss = Losses.SOFT_MAX_CROSS_ENTROPY_WITH_LOGITS,
                metric = Metrics.ACCURACY
            )

            it.logSummary()

            it.fit(dataset = train, epochs = EPOCHS, batchSize = TRAINING_BATCH_SIZE)

            val accuracy = it.evaluate(dataset = test, batchSize = TEST_BATCH_SIZE).metrics[Metrics.ACCURACY]
            it.logger.info { "Accuracy: $accuracy" }
        }
    }

    fun ask(): List<String> {
        val (_, test) = mnist
        val result = arrayListOf<String>()

        lenet5Classic.let { model ->
            repeat(10) { i ->
                test.getX(i).toList().windowed(28, 28).forEach { row ->
                    val r = StringBuilder()
                    row.forEach { pixel ->
                        r.append(if (pixel > 0) "X" else " ")
                    }
                    result.add(r.toString())
                }
                result.add("y: ${test.getY(i)}; predicted: ${model.predict(test.getX(i))}")
                result.add("")
            }
        }

        return result
    }

}
