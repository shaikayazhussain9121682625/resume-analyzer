import axios from "axios";

const api = axios.create({
  baseURL: "https://ayazhussain.pythonanywhere.com",
  withCredentials: true,
});

export default api;
