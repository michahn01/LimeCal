import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://35.2.150.123:8080/api/v1',
  headers: {'Content-Type': 'application/json'}
});
export default instance;