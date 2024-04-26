# MathMaze

[![Unit Tests for Backend](https://github.com/gaborrosta/MathMaze/actions/workflows/backend.yml/badge.svg)](https://github.com/gaborrosta/MathMaze/actions/workflows/backend.yml)
[![Unit Tests for Frontend & Deploy to Firebase Hosting](https://github.com/gaborrosta/MathMaze/actions/workflows/frontend.yml/badge.svg)](https://github.com/gaborrosta/MathMaze/actions/workflows/frontend.yml)

"MathMaze: An Entertaining Way to Practice Mathematics" project is a web application that aims to help young pupils practice mathematics in an entertaining way with the help of mazes.

## How to get started

The project is divided into two main parts: the backend and the frontend. The backend is responsible for managing the database and providing an API, while the frontend is responsible for the user interface.

### Backend

The backend is a Spring Boot application written in Kotlin. It is built with IntelliJ IDEA and Gradle. The project is hosted on Heroku.

For development, you can run the application locally by executing the `main` function in the `MathMazeApplication.kt` file. The application will be available at `http://localhost:8080`. If you are on a Mac, you need to install [OpenCV](https://opencv.org/), but on Windows and Linux, it is built-in to the project.

If you want to train the model, you can run the `main` function in the `Trainer.kt` file. The model will be saved to the `model` directory. The new model will be evaluated on some examples as well and the results will be available in the output.

You can run the tests with the `./gradlew test` command.

### Frontend

The frontend is a React application. It is built with Visual Studio Code and npm. The project is hosted with Firebase Hosting at [`https://mathmaze.rostagabor.com`](https://mathmaze.rostagabor.com).

For development, you can run the application locally by executing the `npm start` command after you installed npm. The application will be available at `http://localhost:3000`. But first, you need to install the dependencies with the `npm install` command.

You can run the tests with the `npm test` command. Running the `npm test -- --coverage` command will create a coverage folder.

To generate a production build, you can run the `npm run build` command.

To deploy the application to Firebase, you can run the `firebase deploy` command.

## Digits folder

The digits folder contains the data and Python scripts used to extend the MNIST dataset with the collected numbers.
