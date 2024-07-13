import React, { useEffect } from "react";
import { useTranslation, Trans } from "react-i18next";
import { Link } from "react-router-dom";
import { Accordion  } from "react-bootstrap";

/**
 * Help displays the user manual of the application.
 *
 * @returns {React.Element} The Help component.
 */
const Help = () => {
  //Localisation
  const { i18n, t } = useTranslation();


  //Set the page title
  useEffect(() => { document.title = t("help-title") + " | " + t("app-name"); });


  //Render the page
  return (
    <>
      <center>
        <h1>{t("help-title")}</h1>
      </center>

      <p>
        <Trans i18nKey="help-privacy-terms-link">You can read our <Link to="/privacy-policy">Privacy Policy</Link> and our <Link to="/terms-and-conditions">Terms and Conditions</Link>.</Trans>
      </p>

      {i18n.resolvedLanguage === "hu" && <p className="lead" style={{ fontWeight: "800" }}>A Segítség oldal jelenleg csak angol nyelven érhető el.</p>}

      <Accordion className="mb-3">
        <Accordion.Item eventKey="0">
          <Accordion.Header>Signing up</Accordion.Header>
          <Accordion.Body>
            <p>
              Signing up unlocks additional features on the website, allowing you to save your mazes, edit their visibility, and view uploaded solutions.<br />
              <b>Security Reminder:</b> Maintaining a strong password and keeping it confidential is crucial for protecting your account information.
            </p>

              <b>To create an account</b>, follow these simple steps:
              <ol>
                <li>Locate the 'Sign Up' button in the navigation bar. Alternatively, you can click here: <Link to="/signup">Sign Up</Link>.</li>
                <li>Choose a unique username. This username will be displayed when you print a maze or when someone solves your maze.</li>
                <li>Enter your email address. This address will only be used for password reset purposes.</li>
                <li>Create a strong password that includes at least one uppercase letter, one lowercase letter, one number, and one special character.</li>
                <li>Click on the 'Sign Up' button.</li>
                <li>Upon successful registration, the page will redirect you to the Profile page. If there are any errors, an informative message will be displayed at the top of the page.</li>
              </ol>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="1">
          <Accordion.Header>Login & Forgotten password</Accordion.Header>
          <Accordion.Body>
            <p>
              Logging in allows you to access your saved mazes. You can also edit the visibility of your mazes and view uploaded solutions.<br />
              <b>Security Reminder:</b> Always log out of your account when you are done using the website, especially if you are using a shared computer, but the website will automatically log you out after a period of inactivity.
            </p>

            <b>To log in</b>, follow these simple steps:
            <ol>
              <li>Locate the 'Login' button in the navigation bar. Alternatively, you can click here: <Link to="/login">Log In</Link>.</li>
              <li>Enter your email address and password.</li>
              <li>Click on the 'Login' button.</li>
              <li>Upon successful login, the page will redirect you to the Profile page. If there are any errors, an informative message will be displayed at the top of the page.</li>
            </ol>

            <b>If you have forgotten your password</b>, you can reset it by following these steps:
            <ol>
              <li>Locate the 'Login' button in the navigation bar. Alternatively, you can click here: <Link to="/login">Log In</Link>.</li>
              <li>Click on the 'Did you forget your password? You can create a new one here' link.</li>
              <li>Enter the email address associated with your account.</li>
              <li>Click on the 'Send reset link' button.</li>
              <li>Check your email inbox for a message from us. This message will contain a link that you can use to reset your password. It may need some time to deliver the message, please, check your spam folder as well. The link is valid for an hour.</li>
              <li>Click on the link in the email. You will be redirected to a page where you can enter a new password.</li>
              <li>Enter your new password and click on the 'Set new password' button.</li>
              <li>Upon successful password reset, the page will display a message that your password has been set. If there are any errors, an informative message will be displayed at the top of the page.</li>
            </ol>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="2">
          <Accordion.Header>Generating a Maze</Accordion.Header>
          <Accordion.Body>
          <p>
              The maze generator page allows you to create a maze with custom settings. Logged-in or not-logged-in users can generate a maze. However, only logged-in users can view uploaded solutions.
            </p>

            <b>To generate a maze</b>, follow these simple steps:
            <ol>
              <li>Locate the 'Generate Maze' button in the navigation bar. Alternatively, you can click here: <Link to="/generate-maze">Generate Maze</Link>.</li>
              <li>You can set the width and height of the maze, the operation and the range for the numbers.</li>
              <li>If you want to use previously solved mazes, you need to open the 'Use previous mazes' section and either enter the solution ID or the maze ID with the used nickname. This information was displayed when the solution was uploaded. You can use up to 3 previous mazes.</li>
              <li>You can also customise the path type, i.e. if the path should be the even or odd results, and can provide a range for the path's length. To set these, you need to open the 'Advanced Options' section.</li>
              <li>Click on the 'Generate maze' button.</li>
              <li>Upon successful maze generation, the page will display the maze. If there are any errors, an informative message will be displayed just before the button.</li>
              <li>If you are not happy with the maze, you can generate new ones. Otherwise, by clicking on the 'I want to use this maze' button you save it.</li>
              <li><b>If you are logged in</b>, then you can edit the description, and change the folder of the maze and its visibility. And of course, you can download it.</li>
              <li><b>If you are not logged in</b>, then you can only download the maze or solve it online.</li>
            </ol>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="3">
          <Accordion.Header>Solving a Maze</Accordion.Header>
          <Accordion.Body>
            <p>
              The maze solver page allows you to download a maze or solve it online.
            </p>

            <b>To access a maze and download or solve it online</b>, follow these simple steps:
            <ol>
              <li>Locate the 'Solve Maze' button in the navigation bar. Alternatively, you can click here: <Link to="/solve-maze">Solve Maze</Link>.</li>
              <li>Enter the maze ID. If the maze is private and you created it, you need to log in to access it. If the maze is private, but you did not create it, you cannot access it and an error message will be displayed. If the maze is public, you may need a passcode to access it.</li>
              <li>Click on the 'Save maze ID' button.</li>
              <li>If the website asks for a passcode, enter it and then click on the 'Save passcode' button.</li>
              <li>If the passcode and the maze ID were fine, you can see some details about the maze. You can download it in PDF in different paper sizes or click on the 'Solve online' button.</li>
              <li>The online solver will display instructions and only a 5x5 part of the maze. You need to solve it using the keyboard and/or mouse.</li>
              <li>If you solved the maze, you need to enter a nickname and then click on the 'Check' button.</li>
              <li>The solution ID, maze ID and your nickname will be displayed with a summary of the solution. You can also check the maze tile-by-tile.</li>
            </ol>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="4">
          <Accordion.Header>Checking a Maze</Accordion.Header>
          <Accordion.Body>
            <p>
              The maze checker page allows you to check a solution for a maze. You need to scan the printed and solved maze. You can check your solution even if the maze is private.
            </p>

            <b>To check a maze</b>, follow these simple steps:
            <ol>
              <li>Locate the 'Check Maze' button in the navigation bar. Alternatively, you can click here: <Link to="/check-maze">Check Maze</Link>.</li>
              <li>Enter the maze ID (it is located on the top right part of the PDF) and then upload the image. If it is not in the right orientation, you can rotate it.</li>
              <li>Click on the 'Check Maze' button.</li>
              <li>The website will check the maze and extract the digits. After successful extraction, you can see the maze with the recognised numbers. You can edit them and with the checkboxes, you can edit the path.</li>
              <li>Enter a nickname after correcting the numbers and click on the 'Check' button.</li>
              <li>The solution ID, maze ID and your nickname will be displayed with a summary of the solution. You can also check the maze tile-by-tile.</li>
            </ol>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="5">
          <Accordion.Header>Profile page</Accordion.Header>
          <Accordion.Body>
            <p>
              The profile page allows you to view your saved mazes, manage them and see the uploaded solutions.
            </p>

            <p>
              <b>To access your profile page</b>, locate the 'Your Account' button in the navigation bar if you are logged in. Alternatively, you can click here: <Link to="/account">Profile</Link>.
            </p>

            <b>To change your password</b>, follow these simple steps:
            <ol>
              <li>Locate the 'Your Account' button in the navigation bar if you are logged in. Alternatively, you can click here: <Link to="/account">Profile</Link>.</li>
              <li>Click on the 'Settings' tab.</li>
              <li>Enter your current password and the new password.</li>
              <li>Click on the 'Set new password' button.</li>
              <li>Upon successful password change, the page will display a message that your password has been changed. If there are any errors, an informative message will be displayed at the top of the page.</li>
            </ol>

            <p>
              <b>To log out</b>, locate the 'Logout' button in the navigation bar if you are logged in.
            </p>

            <p>
              You can also <b>order the mazes</b> by their creation time. If there are too many of them, you can use the <b>pagination</b>. If you click on a different folder, the mazes which are in that folder will be displayed.
            </p>

            <b>To view the solutions for a maze</b>, follow these simple steps:
            <ol>
              <li>Locate the 'Your Account' button in the navigation bar if you are logged in. Alternatively, you can click here: <Link to="/account">Profile</Link>.</li>
              <li>Find the maze you want to check the solutions for.</li>
              <li>Click on the 'Check solutions' button. It is only visible if there is at least one solution.</li>
              <li>The website will add a new tab with the maze ID to the page.</li>
              <li>If there is only one solution, it will be displayed, just like how it appeared when a person uploaded it. Otherwise, you can select the solution by nickname.</li>
              <li>You can close the tab by clicking on the 'X' after its name, or by clicking on the 'Close opened solutions' all the tabs will be removed.</li>
            </ol>

            <b>To rename a folder</b>, follow these simple steps:
            <ol>
              <li>Locate the 'Your Account' button in the navigation bar if you are logged in. Alternatively, you can click here: <Link to="/account">Profile</Link>.</li>
              <li>On the left, find the folder you want to rename.</li>
              <li>Click on the edit icon.</li>
              <li>Enter the new name.</li>
              <li>Click on the 'Rename' button.</li>
              <li>Upon successful folder rename, the page will display a message that the folder has been renamed. If there are any errors, an informative message will be displayed at the top of the page.</li>
            </ol>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </>
  );
}

export default Help;
