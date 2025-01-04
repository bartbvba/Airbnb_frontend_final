<template>
  <div class="camping-container">
    <h1>Available Camping Spots</h1>

    <div class="filters">
      <label for="location-filter">Filter by Location:</label>
      <select id="location-filter" v-model="selectedLocation" @change="fetchCampings">
        <option value="">All Locations</option>
        <option v-for="location in uniqueLocations" :key="location" :value="location">
          {{ location }}
        </option>
      </select>
      <label for="price-range">Price Range:</label>
      <div class="price-range">
        <input type="number" v-model="priceRange.min" placeholder="Min" @input="fetchCampings" />
        <input type="number" v-model="priceRange.max" placeholder="Max" @input="fetchCampings" />
      </div>
    </div>

    <div class="camping-cards">
      <div v-for="camping in campings" :key="camping.camping_id" class="camping-card">
        <h2>{{ camping.name }}</h2>
        <p><strong>Location:</strong> {{ camping.location }}</p>
        <p><strong>Price per night:</strong> €{{ camping.price_per_night }}</p>
        <p><strong>Description:</strong> {{ camping.description }}</p>
        <router-link :to="`/campings/${camping.camping_id}`" class="primary-btn">
          View Details
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import VueJwtDecode from 'vue-jwt-decode';

export default {
  data() {
    return {
      campings: [],
      selectedLocation: '',
      priceRange: { min: '', max: '' },
      uniqueLocations: [],
      user: {}
    };
  },
  created() {
    this.token = localStorage.getItem('token');
    
    if (this.token) {
      const decodedToken = VueJwtDecode.decode(this.token); 
      const userId = decodedToken.userId;

      this.fetchUser(userId);
    }else{
      this.$router.push('/login');
    }
  },
  methods: {
    async fetchCampings() {
      try {
        const queryParams = [];
        if (this.selectedLocation) queryParams.push(`location=${this.selectedLocation}`);
        if (this.priceRange.min) queryParams.push(`minPrice=${this.priceRange.min}`);
        if (this.priceRange.max) queryParams.push(`maxPrice=${this.priceRange.max}`);

        const queryString = queryParams.length ? `?${queryParams.join('&')}` : '';
        const response = await this.$axios.get(
          `http://localhost:3000/api/campings${queryString}`
        );

        this.campings = response.data;

        if (!this.uniqueLocations.length) {
          const locations = [...new Set(this.campings.map((camping) => camping.location))];
          this.uniqueLocations = locations;
        }
      } catch (err) {
        console.error('Error fetching campings:', err.message);
      }
    },

    async fetchUser(userId) {
      try {
        const response = await this.$axios.get(`http://localhost:3000/api/users/${userId}`);
        this.user = response.data[0];

        console.log(this.user)
      } catch (error) {
        console.log(error)
        console.error('Error fetching user details:', error);
      }
    }
  },
  mounted() {
    this.fetchCampings();
  },
};
</script>

<style scoped>
.camping-container {
  padding: 20px;
  background-color: #f9f9f9;
  font-family: 'Arial', sans-serif;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

.filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background-color: #fff;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

.filters label {
  margin-right: 10px;
  font-weight: bold;
  color: #555;
}

.filters input,
.filters select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1em;
}

.camping-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  padding: 10px;
}

.camping-card {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.camping-card h2 {
  color: #4CAF50;
  font-size: 1.5em;
}

.camping-card p {
  color: #555;
  margin: 10px 0;
}

.primary-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 15px;
  font-size: 1em;
  cursor: pointer;
  transition: 0.3s ease;
}

.primary-btn:hover {
  background-color: #45a049;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  text-align: center;
}

.modal-content label {
  display: block;
  margin-top: 15px;
  font-weight: bold;
  color: #333;
}

.modal-content input {
  width: 100%;
  padding: 10px;
  margin-top: 5px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.modal-actions {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
}

.secondary-btn {
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 15px;
  font-size: 1em;
  cursor: pointer;
  transition: 0.3s ease;
}

.secondary-btn:hover {
  background-color: #e53935;
}
</style>