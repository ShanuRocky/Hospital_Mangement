import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (email: string, password: string,role: string) => {
  const response = await api.post('/auth/login', { email, password,role});
  return response.data;
};

export const getPatients = async () => {
  const response = await api.get('/patients');
  return response.data;
};

export const createPatient = async (patientData: any) => {
  const response = await api.post('/patients', patientData);
  return response.data;
};

export const updatePatient = async (id: string, patientData: any) => {
  const response = await api.put(`/patients/${id}`, patientData);
  return response.data;
};

export const getDietCharts = async () => {
  const response = await api.get('/diet-charts');
  return response.data;
};

export const createDietChart = async (dietChartData: any) => {
  const response = await api.post('/diet-charts', dietChartData);
  //console.log(response.data)
  return response.data;
};

export const getDeliveries = async (role: string, id: string) => {
  const response = await api.get(`/deliveries/${role}/${id}`);
  return response.data;
};

export const updatePreparationStatus = async (id: string, preparation_status: string) => {
  const response = await api.patch(`/deliveries/${id}/preparation_status`, { preparation_status });
  return response.data;
};

export const updateDeliveryStatus = async (id: string, delivery_status: string) => {
  const response = await api.patch(`/deliveries/${id}/delivery_status`, { delivery_status});
  return response.data;
};

export const createDelivery = async (diet_chart_id: string, assigned_to_pantry: string) => {
  // console.log(deliveryData,"fuck")
  const response = await api.post('/deliveries', {diet_chart_id , assigned_to_pantry});
  return response.data;
};

export default api;
