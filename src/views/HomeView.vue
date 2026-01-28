<template>
  <div class="home">
    <h1>BIENVENUE DANS MORPION</h1>
    <div class="menu">
      <button @click="showProfile = true" class="menu-btn">MON PROFIL</button>
      <button @click="createGame" class="menu-btn">NOUVELLE PARTIE</button>
      <button @click="showJoin = true" class="menu-btn">REJOINDRE UNE PARTIE</button>
    </div>

    <!-- Modal Profil -->
    <div v-if="showProfile" class="modal-overlay" @click="showProfile = false">
      <div class="modal" @click.stop>
        <button class="close-btn" @click="showProfile = false">×</button>
        <h2>MON PROFIL</h2>

        <div v-if="errors.length > 0" class="errors">
          <p v-for="(error, index) in errors" :key="index" class="error">{{ error }}</p>
        </div>

        <form @submit.prevent="saveProfile">
          <div class="form-group">
            <label>Surnom</label>
            <input type="text" v-model="user.name" required />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" v-model="user.email" required />
          </div>
          <button type="submit" class="btn-submit">ENREGISTRER</button>
        </form>
      </div>
    </div>

    <!-- Modal Rejoindre -->
    <div v-if="showJoin" class="modal-overlay" @click="showJoin = false">
      <div class="modal" @click.stop>
        <button class="close-btn" @click="showJoin = false">×</button>
        <h2>REJOINDRE UNE PARTIE</h2>

        <div v-if="joinErrors.length > 0" class="errors">
          <p v-for="(error, index) in joinErrors" :key="index" class="error">{{ error }}</p>
        </div>

        <form @submit.prevent="joinGame">
          <div class="form-group">
            <label>CODE</label>
            <input type="text" v-model="gameCode" placeholder="1R3G55" required />
          </div>
          <button type="submit" class="btn-submit">REJOINDRE</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api'

export default {
  name: 'HomeView',
  data() {
    return {
      showProfile: false,
      showJoin: false,
      user: { name: '', email: '' },
      gameCode: '',
      errors: [],
      joinErrors: [],
    }
  },
  async mounted() {
    // Charger le profil utilisateur
    try {
      const response = await api.get('/api/profile')
      this.user = response.data
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error)
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
        this.showProfile = false
      } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error)
        if (error.response?.data?.errors) {
          const apiErrors = error.response.data.errors
          this.errors = typeof apiErrors === 'object' ? Object.values(apiErrors).flat() : [apiErrors]
        } else {
          this.errors = ['Erreur lors de la mise à jour du profil']
        }
      }
    },
    async createGame() {
      try {
        const response = await api.post('/api/games', {})
        const gameId = response.data.id
        this.$router.push({ name: 'game', params: { id: gameId } })
      } catch (error) {
        console.error('Erreur lors de la création de la partie:', error)
        alert('Impossible de créer la partie')
      }
    },
    async joinGame() {
      this.joinErrors = []
      try {
        const response = await api.patch(`/api/games/${this.gameCode}/join`)
        const gameId = response.data.id
        this.$router.push({ name: 'game', params: { id: gameId } })
      } catch (error) {
        console.error('Erreur lors de la tentative de rejoindre la partie:', error)
        if (error.response?.data?.errors) {
          const apiErrors = error.response.data.errors
          this.joinErrors =
            typeof apiErrors === 'object' ? Object.values(apiErrors).flat() : [apiErrors]
        } else if (error.response?.data?.message) {
          this.joinErrors = [error.response.data.message]
        } else {
          this.joinErrors = ['Code de partie invalide']
        }
      }
    },
  },
}
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
}

h1 {
  font-size: 2rem;
  margin-bottom: 3rem;
  color: #000;
  font-weight: normal;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 280px;
}

.menu-btn {
  padding: 0.8rem 2rem;
  font-size: 0.9rem;
  font-weight: 600;
  background-color: #000;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.menu-btn:hover {
  background-color: #333;
  transform: scale(1.02);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #f0f0f0;
  border-radius: 15px;
  padding: 2rem;
  width: 90%;
  max-width: 400px;
  position: relative;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #000;
  line-height: 1;
  padding: 0;
  width: 30px;
  height: 30px;
}

.close-btn:hover {
  color: #666;
}

.modal h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
  font-weight: 600;
  text-transform: uppercase;
}

.form-group {
  margin-bottom: 1.2rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.4rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.7rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
  background: white;
}

.btn-submit {
  width: auto;
  padding: 0.7rem 2.5rem;
  background-color: #000;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: block;
  margin: 1.5rem auto 0;
  text-transform: uppercase;
}

.btn-submit:hover {
  background-color: #333;
}

.errors {
  margin-bottom: 1rem;
}

.error {
  background-color: #fee;
  color: #c33;
  padding: 0.5rem;
  border-radius: 5px;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
}
</style>
