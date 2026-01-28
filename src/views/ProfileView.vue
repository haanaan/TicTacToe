<template>
  <div class="profile">
    <div class="profile-container">
      <h1>Mon Profil</h1>

      <div v-if="errors.length > 0" class="errors">
        <p v-for="(error, index) in errors" :key="index" class="error">
          {{ error }}
        </p>
      </div>

      <form @submit.prevent="saveProfile" v-if="user">
        <div class="form-group">
          <label for="name">Surnom</label>
          <input type="text" id="name" v-model="user.name" required />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="user.email" required />
        </div>

        <div class="buttons">
          <button type="submit" class="btn btn-primary">Enregistrer</button>
          <button type="button" @click="goHome" class="btn btn-secondary">Retour</button>
        </div>
      </form>

      <div v-else class="loading">Chargement...</div>
    </div>
  </div>
</template>

<script>
import api from '@/api'
import { useRouter } from 'vue-router'

export default {
  name: 'ProfileView',
  data() {
    return {
      user: null,
      errors: [],
    }
  },
  async beforeRouteEnter(to, from, next) {
    try {
      const response = await api.get('/api/profile')
      next((vm) => {
        vm.user = response.data
      })
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error)
      next((vm) => {
        vm.errors = ['Impossible de charger le profil']
      })
    }
  },
  methods: {
    async saveProfile() {
      this.errors = []
      try {
        await api.put('/api/profile', {
          name: this.user.name,
          email: this.user.email,
        })
        alert('Profil mis à jour avec succès !')
      } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error)
        if (error.response && error.response.data && error.response.data.errors) {
          // Si l'API retourne un objet d'erreurs
          const apiErrors = error.response.data.errors
          if (typeof apiErrors === 'object') {
            this.errors = Object.values(apiErrors).flat()
          } else if (Array.isArray(apiErrors)) {
            this.errors = apiErrors
          } else {
            this.errors = [apiErrors]
          }
        } else if (error.response && error.response.data && error.response.data.message) {
          this.errors = [error.response.data.message]
        } else {
          this.errors = ['Erreur lors de la mise à jour du profil']
        }
      }
    },
    goHome() {
      this.$router.push('/')
    },
  },
}
</script>

<style scoped>
.profile {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.profile-container {
  width: 100%;
  max-width: 500px;
  padding: 2rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  color: #42b983;
  margin-bottom: 2rem;
}

.errors {
  margin-bottom: 1.5rem;
}

.error {
  background-color: #fee;
  color: #c33;
  padding: 0.75rem;
  border-radius: 5px;
  margin-bottom: 0.5rem;
  border-left: 4px solid #c33;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #333;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.1);
}

.buttons {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background-color: #42b983;
  color: white;
}

.btn-primary:hover {
  background-color: #35a372;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}
</style>
