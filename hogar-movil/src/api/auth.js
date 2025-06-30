// src/api/auth.js
import axios from 'axios';
const API_BASE_URL = 'http://10.0.2.2:4000/api/auth';

export const registrarUsuario = async (datos) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, datos);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Error al registrar usuario';
  }
};

export const loginUsuario = async (credenciales) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, credenciales);
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Error al iniciar sesión';
  }
};
