<template>
  <div class="game">
    <div v-if="game" class="game-container">
      <!-- En-tête avec informations joueurs -->
      <div class="game-header">
        <div class="player-info">
          <div class="player-box" :class="{ active: isPlayerTurn(game.player_one) }">
            <div class="player-label">JOUEUR 1</div>
            <div class="player-name">{{ game.player_one?.name || '...' }}</div>
            <div class="game-code">#{{ game.code }}</div>
          </div>
          <div class="player-box" :class="{ active: isPlayerTurn(game.player_two) }">
            <div class="player-label">JOUEUR 2</div>
            <div class="player-name">{{ game.player_two?.name || '...waiting' }}</div>
          </div>
        </div>
        <button @click="quitGame" class="btn-quit">Quitter la partie</button>
      </div>

      <!-- En attente d'adversaire -->
      <div v-if="!game.player_two" class="waiting-section">
        <p class="waiting-text">En attente d'un adversaire ...</p>
      </div>

      <!-- Écran de fin de partie -->
      <div v-else-if="game.status === 'finished'" class="game-over">
        <div class="game-over-content">
          <h2 class="winner-text" v-if="game.winner_id">
            {{ getWinnerName().toUpperCase() }}<br />A GAGNÉ !!
          </h2>
          <h2 class="winner-text" v-else>MATCH NUL !</h2>
          <button @click="goHome" class="btn-return">RETOUR</button>
        </div>
      </div>

      <!-- Grille de jeu -->
      <div v-else class="game-play">
        <div class="board">
          <div
            v-for="(cell, index) in game.board"
            :key="index"
            class="cell"
            :class="{ clickable: canPlayCell(index) }"
            @click="playCell(index)"
          >
            <span v-if="cell === 'X'" class="symbol symbol-x">X</span>
            <span v-if="cell === 'O'" class="symbol symbol-o">O</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="loading">
      <p>Chargement de la partie...</p>
    </div>
  </div>
</template>

<script>
import api from '@/api'

export default {
  name: 'GameView',
  data() {
    return {
      game: null,
      ws: null,
      currentUserId: null,
    }
  },
  async beforeRouteEnter(to, from, next) {
    try {
      const profileResponse = await api.get('/api/profile')
      const userId = profileResponse.data.id

      const gameResponse = await api.get(`/api/games/${to.params.id}`)
      const gameData = gameResponse.data

      next((vm) => {
        vm.game = gameData
        vm.currentUserId = userId
        vm.connectWebSocket()
      })
    } catch (error) {
      console.error('Erreur lors du chargement de la partie:', error)
      alert('Impossible de charger la partie')
      next('/')
    }
  },
  beforeUnmount() {
    if (this.ws) {
      this.ws.close()
    }
  },
  methods: {
    connectWebSocket() {
      try {
        this.ws = new WebSocket('wss://morpion-api.edu.netlor.fr/websockets')

        this.ws.onopen = () => {
          console.log('WebSocket connecté')
          this.ws.send(
            JSON.stringify({
              action: 'connect',
              game_id: this.game.id,
              player_id: this.currentUserId,
            }),
          )
        }

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            console.log('Message WebSocket reçu:', data)

            if (data.type === 'opponent-join') {
              this.refreshGame()
            } else if (data.type === 'opponent-play') {
              this.refreshGame()
            } else if (data.type === 'opponent-quit') {
              alert('Votre adversaire a quitté la partie')
              this.goHome()
            }
          } catch (error) {
            console.error('Erreur lors du traitement du message WebSocket:', error)
          }
        }

        this.ws.onerror = (error) => {
          console.error('Erreur WebSocket:', error)
        }

        this.ws.onclose = () => {
          console.log('WebSocket déconnecté')
        }
      } catch (error) {
        console.error('Erreur lors de la connexion WebSocket:', error)
      }
    },
    async refreshGame() {
      try {
        const response = await api.get(`/api/games/${this.game.id}`)
        this.game = response.data
      } catch (error) {
        console.error('Erreur lors du rafraîchissement de la partie:', error)
      }
    },
    async playCell(index) {
      if (!this.canPlayCell(index)) {
        return
      }

      const row = Math.floor(index / 3)
      const col = index % 3

      try {
        const response = await api.patch(`/api/games/${this.game.id}/play/${row}/${col}`)
        this.game = response.data
      } catch (error) {
        console.error('Erreur lors du coup:', error)
        if (error.response?.data?.message) {
          alert(error.response.data.message)
        } else {
          alert('Impossible de jouer ce coup')
        }
      }
    },
    canPlayCell(index) {
      if (!this.game || this.game.status === 'finished') return false
      if (!this.game.player_two) return false
      if (!this.isMyTurn()) return false
      return this.game.board[index] === null
    },
    isMyTurn() {
      return this.game && this.game.next_player_id === this.currentUserId
    },
    isPlayerTurn(player) {
      return player && this.game && this.game.next_player_id === player.id
    },
    getWinnerName() {
      if (!this.game?.winner_id) return ''
      if (this.game.winner_id === this.game.player_one?.id) return this.game.player_one.name
      if (this.game.winner_id === this.game.player_two?.id) return this.game.player_two.name
      return ''
    },
    quitGame() {
      if (confirm('Êtes-vous sûr de vouloir quitter la partie ?')) {
        this.goHome()
      }
    },
    goHome() {
      if (this.ws) {
        this.ws.close()
      }
      this.$router.push('/')
    },
  },
}
</script>

<style scoped>
.game {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.game-container {
  width: 100%;
  max-width: 500px;
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.game-header {
  margin-bottom: 2rem;
}

.player-info {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.player-box {
  flex: 1;
  padding: 1rem;
  background: #f8f8f8;
  border-radius: 8px;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.player-box.active {
  border-color: #000;
  background: #fff;
  box-shadow: 0 0 0 1px #000;
}

.player-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #666;
  margin-bottom: 0.3rem;
}

.player-name {
  font-size: 1rem;
  font-weight: 600;
  color: #000;
  margin-bottom: 0.3rem;
}

.game-code {
  font-size: 0.85rem;
  color: #999;
}

.btn-quit {
  width: 100%;
  padding: 0.7rem;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #666;
  transition: all 0.3s;
}

.btn-quit:hover {
  background: #f5f5f5;
  border-color: #999;
}

.waiting-section {
  text-align: center;
  padding: 3rem 1rem;
}

.waiting-text {
  font-size: 1.1rem;
  color: #666;
  font-style: italic;
}

.game-over {
  text-align: center;
  padding: 3rem 1rem;
}

.game-over-content {
  background: #f8f8f8;
  border-radius: 12px;
  padding: 2.5rem 2rem;
}

.winner-text {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 2rem;
  line-height: 1.4;
  color: #000;
}

.btn-return {
  padding: 0.8rem 3rem;
  background: #000;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  text-transform: uppercase;
  transition: all 0.3s;
}

.btn-return:hover {
  background: #333;
  transform: scale(1.05);
}

.board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  max-width: 400px;
  margin: 0 auto;
}

.cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 3px solid #000;
  border-radius: 8px;
  font-size: 4rem;
  font-weight: bold;
  cursor: default;
  transition: all 0.2s;
}

.cell.clickable {
  cursor: pointer;
}

.cell.clickable:hover {
  background: #f0f0f0;
  transform: scale(1.05);
}

.symbol {
  line-height: 1;
}

.symbol-x {
  color: #000;
}

.symbol-o {
  color: #000;
}

.loading {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: #666;
}
</style>
