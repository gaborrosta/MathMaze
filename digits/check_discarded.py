import os
import cv2
import numpy as np
from pathlib import Path
from scipy import ndimage


def check_images(files, source_folder, destination_folder):
    """
    Checks the images and move them to the destination folder if they are OK.
    """

    for file in files:
        # Load the image
        image = cv2.imread(source_folder + "/" + file, cv2.IMREAD_GRAYSCALE)

        # Print the image to decide if it is OK
        byte_array = image.flatten()
        for j in range(28):
            for k in range(28):
                print("X" if byte_array[j * 28 + k] > 50 else " ", end="")
            print()

        # Ask if the image is OK
        ok = input(f"OK? {file} ") == ""

        # Save the image if ok
        if ok:
            cv2.imwrite(f"{destination_folder}/{file}", image)


if __name__ == "__main__":
    # Folders
    discarded_ones_folder = "./discarded/ones"
    discarded_sevens_folder = "./discarded/sevens"
    prepared_ones_folder = "./prepared/ones"
    prepared_sevens_folder = "./prepared/sevens"
    discarded_folder = "./discarded"
    Path(discarded_ones_folder).mkdir(exist_ok=True, parents=True)
    Path(discarded_sevens_folder).mkdir(exist_ok=True)
    Path(prepared_ones_folder).mkdir(exist_ok=True, parents=True)
    Path(prepared_sevens_folder).mkdir(exist_ok=True)

    # List the images
    ones = os.listdir(discarded_ones_folder)
    sevens = os.listdir(discarded_sevens_folder)

    # Check the images
    check_images(ones, discarded_ones_folder, prepared_ones_folder)
    check_images(sevens, discarded_sevens_folder, prepared_sevens_folder)
