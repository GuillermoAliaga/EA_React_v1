import axios, { CanceledError } from 'axios';

export default axios.create({
  baseURL: 'http://localhost:1337',
})

export { CanceledError };