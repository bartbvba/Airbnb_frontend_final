<template>
    <div class="camping-details">
      <h1>{{ camping.name }}</h1>
      <p><strong>Location:</strong> {{ camping.location }}</p>
      <p><strong>Price per night:</strong> €{{ camping.price_per_night }}</p>
      <p><strong>Description:</strong> {{ camping.description }}</p>
  
      <div class="booking-section">
        <h2>Book This Camping Spot</h2>
        <label for="start-date">Start Date:</label>
        <input type="date" v-model="startDate" id="start-date" />
  
        <label for="end-date">End Date:</label>
        <input type="date" v-model="endDate" id="end-date" />
  
        <p v-if="totalPrice">
          <strong>Total Price:</strong> €{{ totalPrice }}
        </p>
  
        <button class="primary-btn" @click="bookCamping">Confirm Booking</button>
        <p v-if="bookingSuccess" class="success-message">Booking successful!</p>
        <p v-if="bookingError" class="error-message">Error: {{ bookingError }}</p>
        <router-link to="/airbnb">Go back</router-link>
      </div>
    </div>
  </template>
  
  <script>
  import VueJwtDecode from 'vue-jwt-decode';

  export default {
    data() {
      return {
        camping: {},
        startDate: '',
        endDate: '',
        totalPrice: null,
        bookingSuccess: false,
        bookingError: null,
        user: {}
      };
    },
    methods: {
      async fetchCampingDetails() {
        const campingId = this.$route.params.id;
        try {
          const response = await this.$axios.get(
            `http://localhost:3000/api/campings/${campingId}`
          );
          this.camping = response.data;
        } catch (err) {
          console.error('Error fetching camping details:', err.message);
        }
      },
      calculateTotalPrice() {
        if (this.startDate && this.endDate) {
          const start = new Date(this.startDate);
          const end = new Date(this.endDate);
          const numNights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  
          if (numNights > 0) {
            this.totalPrice = this.camping.price_per_night * numNights;
          } else {
            this.totalPrice = null;
          }
        }
      },
      async fetchUser(userId) {
        try {
          const response = await this.$axios.get(`http://localhost:3000/api/users/${userId}`);
          this.user = response.data[0];

        } catch (error) {
          console.error('Error fetching user details:', error);
        }
      },
      async bookCamping() {
        try {
          this.token = localStorage.getItem('token');
    
          if (this.token) {
            const decodedToken = VueJwtDecode.decode(this.token); 
            const userId = decodedToken.userId;

            await this.fetchUser(userId);
          }

          const response = await this.$axios.post('http://localhost:3000/api/bookings', {
            user_id: this.user.user_id,
            camping_id: this.camping.camping_id,
            start_date: this.startDate,
            end_date: this.endDate,
          });
          alert(`Booking successful! Total price: €${response.data.totalPrice}`);
          this.$router.push('/airbnb');
        } catch (error) {
          console.error('Error during booking:', error.message);
          alert('Booking failed. Please try again.');
        }
            },
          },
          watch: {
            startDate: 'calculateTotalPrice',
            endDate: 'calculateTotalPrice',
          },
          mounted() {
            this.fetchCampingDetails();
          },
        }
  </script>
  
  <style scoped>
  .camping-details {
    padding: 20px;
    background-color: #f9f9f9;
    font-family: 'Arial', sans-serif;
  }
  
  h1, h2 {
    color: #4CAF50;
  }
  
  label {
    display: block;
    margin-top: 15px;
    font-weight: bold;
    color: #333;
  }
  
  input {
    width: 100%;
    padding: 10px;
    margin-top: 5px;
    border: 1px solid #ddd;
    border-radius: 5px;
  }
  
  .primary-btn {
    margin-top: 20px;
    background-color: #4CAF50;
    color: white;
    border: none;
    padding: 10px 20px;
    font-size: 1em;
    cursor: pointer;
    border-radius: 5px;
  }
  
  .primary-btn:hover {
    background-color: #45a049;
  }
  
  .success-message {
    color: #4CAF50;
    margin-top: 10px;
  }
  
  .error-message {
    color: #f44336;
    margin-top: 10px;
  }
  </style>
  