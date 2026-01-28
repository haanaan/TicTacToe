<template>
  <div class="join">
    <div class="join-container">
      <h1>Rejoindre une Partie</h1>

      <div v-if="errors.length > 0" class="errors">
        <p v-for="(error, index) in errors" :key="index" class="error">
          {{ error }}
        </p>
      </div>

      <form @submit.prevent="joinGame">
        <div class="form-group">
          <label for="code">Code de la partie</label>
          <input
            type="text"
            id="code"
            v-model="gameCode"
            placeholder="Entrez le code"
            required
          />
        </div>

        <div class="buttons">
          <button type="submit" class="btn btn-primary">Rejoindre</button>
          <button type="button" @click="goHome" class="btn btn-secondary">Retour</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import api from '@/api'

export default {
  name: 'JoinView',
  data() {
    return {
      gameCode: '',
      errors: [],
    }
  },
  methods: {
    async joinGame() {
      this.errors = []
      try {
        const response = await api.patch(`/api/games/${this.gameCode}/join`)
        const gameId = response.data.id
        this.$router.push({ name: 'game', params: { id: gameId } })
      } catch (error) {
        console.error('Erreur lors de la tentative de rejoindre la partie:', error)
        if (error.response && error.response.data) {
          if (error.response.data.errors) {
            const apiErrors = error.response.data.errors
            if (typeof apiErrors === 'object') {
              this.errors = Object.values(apiErrors).flat()
            } else if (Array.isArray(apiErrors)) {
              this.errors = apiErrors
            } else {
              this.errors = [apiErrors]
            }
          } else if (error.response.data.message) {
            this.errors = [error.response.data.message]
          } else {
            this.errors = ['Code de partie invalide ou partie non trouvée']
          }
        } else {
          this.errors = ['Impossible de rejoindre la partie']
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
.join {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.join-container {
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
  text-transform: uppercase;
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
</style>
