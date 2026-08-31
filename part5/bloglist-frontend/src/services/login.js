import axios from 'axios'

const baseUrl = '/api/login'

const login = credentials => axios.post(baseUrl, credentials).then(response => response.data)

export default { login }
