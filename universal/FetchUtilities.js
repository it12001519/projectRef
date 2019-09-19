import 'whatwg-fetch'
import 'ti-fetch'
import { errorModal } from 'js/universal/Modals'

// URL's
const fatal_error_url = window.location.protocol + "//" + window.location.host + "/fatal"
// Messages to users by response status
const not_logged_in_msg = 'You are not logged in. Please login first.'
const forbidden_status_msg = 'You do not have enough privileges to do that transaction.'
const generic_err_msg = 'System has encountered an unexpected error'
// Utility variables
const getHeaders = new Headers({
    'Pragma': 'no-cache',
    'Cache-Control': 'no-cache'
})
const postHeaders = new Headers({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Pragma': 'no-cache',
    'Cache-Control': 'no-cache'
})

/**
 * Helper function that checks for http ok.
 * Errors are bundled and thrown back to calling client. 
 * @param {*} response 
 */
export function checkStatus(response) {
    return checkStatusWithSecurity(response)
}

/**
 * Helper function that checks for 302 redirects to ti-pass and 401 unauthorized and sends to ti-pass.
 * Errors are bundled and thrown back to calling client. 
 * @param {*} response 
 */
export function checkStatusWithSecurity(response) {
    if (response.status >= 200 && response.status < 300) {
        // Success, return response
        return response
    } else if (response.status === 400) {
        // If 400 is detected, it may be a validation error
        return response
    } else if (response.status === 404) {
        // If 404 is detected, it may mean object being fetched is not found
        return response
    } else if (response.status === 401) {
        // If redirect 401 is detected, return a user-friendly message or just log it
        // throw new Error(not_logged_in_msg)
        console.log(not_logged_in_msg)
    } else if (response.status === 403) {
        // If not enough privileges, return a user-friendly message
        throw new Error(forbidden_status_msg)
    } else if (!!response.message) {
      // Start assuming that response resulted in an error
      // First, check if a message is returned
      var error = new Error(response.message)
      error.status = response.status
      error.response = response
      throw error
    } else {
      // If all else fails, return a generic error message
      var defaulterror = new Error(generic_err_msg)
      defaulterror.status = response.status
      defaulterror.response = response
      throw defaulterror
    }
}

/**
 * Utility function for simplified fetch call with built-in error notification. 
 */
function simpleFetch(url, options, callback, errorHandler) {
    fetch(url, options)
        .then((response) => {
          return response.json().then(json => {
              return {
                  body: json,
                  status: response.status
              }
          }).catch((error) => {
            // If JSON parsing of the response hits a snag, just return the response itself
            return {
              body: response,
              status: response.status
            }
          })
        })
        .then((response) => {
          if ((response.status >= 200 && response.status < 300) || response.status === 400) {
            // If status is ~200 or 400 (validation error return), then proceed to callback
            if (typeof callback === 'function')
              callback(response.status, response.body)
          } else if (response.status === 401) {
            // If redirect 401 is detected, return a user-friendly message or just log it
            // errorModal(not_logged_in_msg)
            console.log(not_logged_in_msg)
          } else if (response.status === 403) {
            // If not enough privileges, return a user-friendly message
            errorModal(forbidden_status_msg)
          } else if (!!response.message) {
            // Start assuming that response resulted in an error
            // First, check if a message is returned
            var error = new Error(response.message)
            error.status = response.status
            error.response = response
            throw error
          } else {
            // If all else fails, return a generic error message
            var defaulterror = new Error(generic_err_msg)
            defaulterror.status = response.status
            defaulterror.response = response
            throw defaulterror
          }
        })
        .catch((error) => {
            errorModal(error.message) // Display a modal with the error message
            if (typeof errorHandler === 'function')
                errorHandler() // Execute additional instructions for error handling
        })
}

export function fetchGet(url, callback, errorHandler) {
    return simpleFetch(url, {
        method: 'GET',
        headers: getHeaders,
        credentials: 'include',
    }, callback, errorHandler)
}

export function fetchPost(url, data, callback, errorHandler) {
    data = data || ''
    data = typeof data === 'object' ? JSON.stringify(data) : data
    return simpleFetch(url, {
        method: 'POST',
        body: data,
        headers: postHeaders,
        credentials: 'include',
    }, callback, errorHandler)
}

export function fetchPut(url, data, callback, errorHandler) {
    data = data || ''
    data = typeof data === 'object' ? JSON.stringify(data) : data
    return simpleFetch(url, {
        method: 'PUT',
        body: data,
        headers: postHeaders,
        credentials: 'include',
    }, callback, errorHandler)
}

export function fetchDelete(url, callback, errorHandler) {
    return simpleFetch(url, {
        method: 'DELETE',
        headers: postHeaders,
        credentials: 'include',
    }, callback, errorHandler)
}

/**
 * Helper function that handles http errors. 
 * @param {*} error 
 */
export function handleError(error) {
  if (typeof error === 'string')
    errorModal(error) // If error is a string, show that to the user
  else if (!!error.message)
    errorModal(error.message) // If error has a message attribute, show that to the user
  console.error(JSON.stringify(error)) // Put the error in the console log fore debugging
}

/**
 * Helper function that redirects to a standard error page in cases of fatal errors.
 */
export function fatalError() {
    window.location = fatal_error_url;
}

export default { checkStatus, checkStatusWithSecurity, 
    fetchGet, fetchPost, fetchPut, fetchDelete, handleError, fatalError }
