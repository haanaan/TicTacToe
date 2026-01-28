import axios from 'axios'

// Instance Axios configurée pour l'API Morpion
const api = axios.create({
  baseURL: 'https://morpion-api.edu.netlor.fr',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'key=2R),-RB)bQhk',
  },
})

export default api
