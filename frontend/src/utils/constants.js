/**
 * BACKEND_URL is the URL of the backend server.
 * 
 * @type {string}
 */
export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * FRONTEND_URL is the URL of the frontend application.
 * 
 * @type {string}
 */
export const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL;


/**
 * Regex for email.
 * 
 * @type {RegExp}
 */
export const EMAIL_REGEX = new RegExp(/^[\w-.]+@([\w-]+.)+[\w-]{2,4}$/);

/**
 * Regex for password.
 * 
 * @type {RegExp}
 */
export const PASSWORD_REGEX = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)[A-Za-z\d\W]{8,20}$/);

/**
 * Empty regex.
 * 
 * @type {RegExp}
 */
export const EMPTY_REGEX = new RegExp(/.*/);
