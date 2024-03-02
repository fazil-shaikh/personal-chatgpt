/*
 * The getCSRFToken function is a JavaScript utility designed to fetch the CSRF (Cross-Site Request Forgery) token from the browser's cookies. 
 * This token is essential for making secure API requests to the server. 
 * The function scans through all the cookies, identifies the one named "csrftoken," and returns its value. 
 * If the token is not found, the function returns an empty string.
 */
export const getCSRFToken = () => {
    const cookies = document.cookie.split("; ");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].split("=");
      if (cookie[0] === "csrftoken") {
        return cookie[1];
      }
    }
    return "";
  };