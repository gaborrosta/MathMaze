import os
import cv2
import numpy as np
from pathlib import Path
from scipy import ndimage


def find_rectangle_contour(image, name):
    """
    Returns the contour of the rectangle in the image.
    Adapter from: https://stackoverflow.com/questions/67302143/opencv-python-how-to-detect-filled-rectangular-shapes-on-picture
    """

    # Grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Adaptive threshold
    thresh = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 51, 9
    )

    # Fill rectangular contours
    cnts = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cnts = cnts[0] if len(cnts) == 2 else cnts[1]
    for c in cnts:
        cv2.drawContours(thresh, [c], -1, (255, 255, 255), -1)

    # Morph open
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (9, 9))
    opening = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=4)

    # Find contours
    cnts = cv2.findContours(opening, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cnts = cnts[0] if len(cnts) == 2 else cnts[1]

    # If not exactly one rectangle was found, then something is wrong
    if len(cnts) != 1:
        raise Exception(
            f"Not exactly one rectangle was found, but {str(len(cnts))} in image {name}"
        )
    else:
        return cnts[0]


def rotate(image, cnt):
    """
    Rotates the image based on the rectangle contour.
    Adapter from: https://stackoverflow.com/questions/11627362/how-to-straighten-a-rotated-rectangle-area-of-an-image-using-opencv-in-python
    """

    # Detect angle and shape
    (_, (_, _), angle) = cv2.minAreaRect(cnt)
    shape = (image.shape[1], image.shape[0])

    # If wrong side was detected, correct the angle
    if angle > 45:
        angle = -(90 - angle)

    # Do not rotate if the angle is small
    if angle < 0.3:
        return image

    # Rotate the image
    matrix = cv2.getRotationMatrix2D(center=(0, 0), angle=angle, scale=1)
    return cv2.warpAffine(src=image, M=matrix, dsize=shape)


def cut_out_rectangle(image, cnt):
    """
    Cuts out the rectangle based on the contour from the image.
    Adapter from: https://docs.opencv.org/4.9.0/dd/d49/tutorial_py_contour_features.html
    """

    x, y, w, h = cv2.boundingRect(cnt)
    return image[y : y + h, x : x + w]


def cut_vertically(image):
    """
    Cuts the image vertically into 10 pieces.
    """

    # Number of pieces
    pieces = 10

    # Calculate the width of each piece
    piece_width = image.shape[1] // pieces

    # Cut the image into pieces
    image_pieces = [
        image[:, i * piece_width : (i + 1) * piece_width] for i in range(pieces)
    ]

    # Correct the last piece if the image width is not divisible by the number of pieces
    image_pieces[-1] = image[:, (pieces - 1) * piece_width :]

    return image_pieces


def remove_border(image):
    """
    Removes the border and any white space from the image.
    Adapted from: https://medium.com/@o.kroeger/tensorflow-mnist-and-your-own-handwritten-digits-4d1cd32bbab4
    """

    # Border width
    border_width = 20

    # Remove the border
    borderless_image = image[border_width:-border_width, border_width:-border_width]

    # Grayscale
    gray = cv2.cvtColor(borderless_image, cv2.COLOR_BGR2GRAY)

    # better black and white version
    (thresh, gray) = cv2.threshold(gray, 128, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)

    # Invert the image
    gray = 255 - gray

    # Remove the white space
    while np.sum(gray[0]) == 0:
        gray = gray[1:]
    while np.sum(gray[:, 0]) == 0:
        gray = np.delete(gray, 0, 1)
    while np.sum(gray[-1]) == 0:
        gray = gray[:-1]
    while np.sum(gray[:, -1]) == 0:
        gray = np.delete(gray, -1, 1)

    # Find its longest dimension
    height, width = gray.shape[:2]
    max_dim = max(height, width)

    # Calculate the amount of padding needed
    top = (max_dim - height) // 2
    bottom = max_dim - height - top
    left = (max_dim - width) // 2
    right = max_dim - width - left

    # Make the image square
    square_img = cv2.copyMakeBorder(gray, top, bottom, left, right, cv2.BORDER_CONSTANT)

    return square_img


def shift(image):
    """
    Shifts the image to be centered.
    Adapted from: https://medium.com/@o.kroeger/tensorflow-mnist-and-your-own-handwritten-digits-4d1cd32bbab4
    """

    # Find the center of mass
    s = np.sum(image)
    if np.all(s == 0):
        cv2.imshow("Image", image)
        cv2.waitKey(0)
        cy, cx = 0, 0
    else:
        cy, cx = ndimage.center_of_mass(image)

    # Shape
    height, width = image.shape

    # Find the shift needed
    shiftx = np.round(width / 2.0 - cx).astype(int)
    shifty = np.round(height / 2.0 - cy).astype(int)

    # Transformation matrix
    M = np.float32([[1, 0, shiftx], [0, 1, shifty]])

    # Shift the image
    return cv2.warpAffine(image, M, image.shape)


if __name__ == "__main__":
    try:
        # Folders
        raw_folder = "./raw"
        prepared_ones_folder = "./prepared/ones"
        prepared_sevens_folder = "./prepared/sevens"
        discarded_folder = "./discarded"
        Path(prepared_ones_folder).mkdir(exist_ok=True, parents=True)
        Path(prepared_sevens_folder).mkdir(exist_ok=True)
        Path(discarded_folder).mkdir(exist_ok=True)

        # Done and errors
        done =[]
        errors = []

        # List the images
        files = [item for item in os.listdir(raw_folder) if item not in done]

        # Prepare the images
        for (index, file) in enumerate(files):
            # One or seven?
            one = "One" in file

            # Load the image
            image = cv2.imread(raw_folder + "/" + file)

            try:
                # Find the rectangle contour
                contour = find_rectangle_contour(image, file)

                # Rotate the image based on the rectangle
                image = rotate(image, contour)

                # Find the new rectangle contour
                contour = find_rectangle_contour(image, file)

                # Cut out the rectangle
                image = cut_out_rectangle(image, contour)

                # Cut the image vertically into 10 pieces
                images = cut_vertically(image)

                # Prepare the pieces
                for (i, img) in enumerate(images):
                    # Remove the border and any white space
                    image = remove_border(img)

                    # Resize the image
                    image = cv2.resize(image, (20, 20), interpolation=cv2.INTER_AREA)

                    # Dilate the image to restore lines to original width
                    image = cv2.dilate(image, np.ones((2, 2), np.uint8), iterations=1)

                    # Add padding to make the image 28x28
                    image = cv2.copyMakeBorder(image, 4, 4, 4, 4, cv2.BORDER_CONSTANT)

                    # Shift the image
                    image = shift(image)

                    # Print the image to decide if it is OK
                    byte_array = image.flatten()
                    for j in range(28):
                        for k in range(28):
                            print("X" if byte_array[j * 28 + k] > 50 else " ", end="")
                        print()

                    # Ask if the image is OK
                    ok = input(f"OK? {(file, index, i)} ") == ""

                    # Save the image if ok
                    if not ok:
                        errors += [(file, index, i)]
                        cv2.imwrite(f"{discarded_folder}/{index}_{i}.jpg", image)
                    else:
                        if one:
                            cv2.imwrite(f"{prepared_ones_folder}/{index}_{i}.jpg", image)
                        else:
                            cv2.imwrite(f"{prepared_sevens_folder}/{index}_{i}.jpg", image)

                done += [file]

            except Exception as e:
                print(e)
                continue

    except KeyboardInterrupt:
        print("KeyboardInterrupt")
    finally:
        print()
        print("Errors:", errors)
        print("Done:", done)
