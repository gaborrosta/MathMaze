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
 * Regex for username.
 *
 * @type {RegExp}
 */
export const USERNAME_REGEX = new RegExp(/^[a-zA-Z0-9]{5,20}$/);

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
 * Regex for nickname.
 *
 * @type {RegExp}
 */
export const NICKNAME_REGEX = new RegExp(/^[A-Za-z0-9ÁÉÍÓÖŐÚÜŰáéíóöőúüű .-]{5,20}$/);

/**
 * Regex for integers.
 *
 * @type {RegExp}
 */
export const INTEGER_REGEX = new RegExp(/^[1-9]\d*$/);

/**
 * Regex for anything. It matches any string.
 *
 * @type {RegExp}
 */
export const ANYTHING_REGEX = new RegExp(/.*/);

/**
 * Regex for empty string.
 *
 * @type {RegExp}
 */
export const EMPTY_STRING_REGEX = /^$/;
