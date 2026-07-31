import axios from "axios";
import { config } from "../config.js";

export const fastspring = axios.create({
  baseURL: config.fastspringApiBase,
  auth: {
    username: config.fastspringUsername,
    password: config.fastspringPassword,
  },
  headers: {
    "Content-Type": "application/json",
  },
});
