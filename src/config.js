const BASE_URL = "http://192.168.1.217:5000";

if (!BASE_URL) {
  throw new Error(
    "REACT_APP_BACKEND_URL is not defined. Please check your .env file."
  );
}

export default BASE_URL;
