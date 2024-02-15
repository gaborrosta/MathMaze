import os
import cv2
import numpy as np
from pathlib import Path


def prepare_labels_and_images(
    prepared_ones_folder,
    prepared_sevens_folder,
    ones,
    sevens,
    count,
    labels,
    images,
    destination_labels,
    destination_images,
):
    """
    Prepare the labels and images and write them to the destination files.
    """

    # Add the new data to the labels
    labels = (
        labels[0:6] + count + labels[8:] + b"\x01" * len(ones) + b"\x07" * len(sevens)
    )

    # Write the labels to the destination file
    with open(destination_labels, mode="wb") as file:
        file.write(labels)

    # New images
    new_images = []

    # Ones...
    for file in ones:
        # Read the image
        image = cv2.imread(prepared_ones_folder + "/" + file, cv2.IMREAD_GRAYSCALE)

        # Remove the "noise"
        image = np.where(image > 50, image, 0)

        # Add the image to the list
        new_images.append(image.flatten())

    # Sevens...
    for file in sevens:
        # Read the image
        image = cv2.imread(prepared_sevens_folder + "/" + file, cv2.IMREAD_GRAYSCALE)

        # Remove the "noise"
        image = np.where(image > 50, image, 0)

        # Add the image to the list
        new_images.append(image.flatten())

    # Add the new images to the images
    images = images[0:6] + count + images[8:] + b"".join(new_images)

    # Write the images to the destination file
    with open(destination_images, mode="wb") as file:
        file.write(images)


if __name__ == "__main__":
    # Original data
    test_labels = Path("./datasets/t10k-labels.idx1-ubyte").read_bytes()
    test_data = Path("./datasets/t10k-images.idx3-ubyte").read_bytes()
    train_labels = Path("./datasets/train-labels.idx1-ubyte").read_bytes()
    train_data = Path("./datasets/train-images.idx3-ubyte").read_bytes()

    # Folders
    prepared_ones_folder = "./prepared/ones"
    prepared_sevens_folder = "./prepared/sevens"

    # List the images
    ones = os.listdir(prepared_ones_folder)
    sevens = os.listdir(prepared_sevens_folder)

    # Split the data
    one_train = ones[0:954]
    one_test = ones[954:]
    seven_train = sevens[0:954]
    seven_test = sevens[954:]

    # New counts
    new_test_count = b"\x28\x4e"
    new_train_count = b"\xf1\xd4"

    # Prepare the labels and images
    prepare_labels_and_images(
        prepared_ones_folder,
        prepared_sevens_folder,
        one_train,
        seven_train,
        new_train_count,
        train_labels,
        train_data,
        "./datasets/extended-train-labels.idx1-ubyte",
        "./datasets/extended-train-images.idx3-ubyte",
    )
    prepare_labels_and_images(
        prepared_ones_folder,
        prepared_sevens_folder,
        one_test,
        seven_test,
        new_test_count,
        test_labels,
        test_data,
        "./datasets/extended-test-labels.idx1-ubyte",
        "./datasets/extended-test-images.idx3-ubyte",
    )
