<template>
  <div id="app">
    <h1>{{ user.username ? `Welcome to Airbnb, ${user.username}` : 'Welcome to Airbnb' }}</h1>

    <div v-if="user.username" class="profile-logout-container">
      <router-link to="/profile" class="profile-button">Profile</router-link>
      <button @click="logout" class="logout-button">Logout</button>
    </div>

    <router-view />
  </div>
</template>

<script>
import VueJwtDecode from 'vue-jwt-decode';

export default {
  name: 'App',
  data() {
    return {
      token: null,
      user: {},
    };
  },
  created() {
    this.token = localStorage.getItem('token');
    
    if (this.token) {
      const decodedToken = VueJwtDecode.decode(this.token); 
      const userId = decodedToken.userId;

      this.fetchUser(userId);
    }
  },
  methods: {
    async fetchUser(userId) {
      try {
        const response = await this.$axios.get(`http://localhost:3000/api/users/${userId}`);
        this.user = response.data[0];

      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    },
    logout() {
      localStorage.removeItem('token');
      this.user = {}; 
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
.profile-logout-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.profile-button {
  background-color: #333;
  color: white;
  padding: 10px 20px;
  text-decoration: none;
  border-radius: 5px;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.profile-button:hover {
  background-color: #555;
}

.logout-button {
  background-color: #f44336;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-left: 20px;
}

.logout-button:hover {
  background-color: #e53935;
}
</style>
