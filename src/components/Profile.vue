<template>
    <div class="profile-container">
      <h1>Welcome, {{ user.username }}</h1>
  
      <div class="tabs">
        <div
          v-for="tab in filteredTabs"
          :key="tab.name"
          class="tab"
          :class="{ active: activeTab === tab.name }"
          @click="activeTab = tab.name"
        >
          {{ tab.label }}
        </div>
      </div>
  
      <div class="tab-content">
        <div v-if="activeTab === 'user-info'">
          <h2>User Information</h2>
          <p><strong>Username:</strong> <input v-model="updatedUser.username" /></p>
          <p><strong>Email:</strong> <input v-model="updatedUser.email" /></p>
  
          <label for="password">Change Password:</label>
          <input type="password" v-model="newPassword" />
  
          <button @click="updateProfile">Update Profile</button><br />
          <router-link to="/airbnb">Back to homepage</router-link>
        </div>
  
        <div v-if="activeTab === 'bookings'">
          <h2>Your Bookings</h2>
          <div v-if="bookings.length">
            <div class="booking-cards">
              <div
                v-for="booking in bookings"
                :key="booking.booking_id"
                class="booking-card"
              >
                <h3>{{ booking.camping_name }}</h3>
                <p><strong>Start Date:</strong> {{ formatDate(booking.start_date) }}</p>
                <p><strong>End Date:</strong> {{ formatDate(booking.end_date) }}</p>
                <p><strong>Total Price:</strong> €{{ booking.total_price }}</p>
                <button @click="deleteBooking(booking.booking_id)">Delete Booking</button>
              </div>
            </div>
            <br />
            <router-link to="/airbnb">Back to homepage</router-link>
          </div>
          <div v-else>
            <p>You have no bookings.</p>
          </div>
        </div>
  
        <div v-if="user.role === 'admin' && activeTab === 'campings'">
          <h2>Manage Campings</h2>
          <div v-if="campings.length">
            <div class="camping-cards">
              <div
                v-for="camping in campings"
                :key="camping.camping_id"
                class="camping-card"
              >
                <h3>{{ camping.name }}</h3>
                <p><strong>Location:</strong> {{ camping.location }}</p>
                <p><strong>Price per night:</strong> €{{ camping.price_per_night }}</p>
                <button @click="deleteCamping(camping.camping_id)">Delete Camping</button>
              </div>
            </div>
          </div>
          <div v-else>
            <p>No campings available.</p>
          </div>
        </div>
  
        <div v-if="user.role === 'admin' && activeTab === 'add-camping'">
        <h2>Add New Camping</h2>
        <div class="add-camping">
            <label for="camping-name">Camping Name:</label>
            <input id="camping-name" v-model="newCamping.name" placeholder="Camping Name" />

            <label for="camping-location">Location:</label>
            <input id="camping-location" v-model="newCamping.location" placeholder="Location" />

            <label for="price-per-night">Price per Night (€):</label>
            <input
            id="price-per-night"
            type="number"
            v-model="newCamping.price_per_night"
            placeholder="Price per night"
            />

            <textarea
            id="camping-description"
            v-model="newCamping.description"
            placeholder="Description"
            rows="4"
            cols="50"
            ></textarea>

            <button @click="addCamping">Add Camping</button>
        </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import VueJwtDecode from 'vue-jwt-decode';
  
  export default {
    name: 'UserProfile',
  data() {
    return {
        activeTab: "user-info",
        user: {},
        bookings: [],
        campings: [],
        newPassword: "",
        updatedUser: {
            username: "",
            email: "",
        },
        newCamping: {
            user_id: "",
            name: "",
            location: "",
            price_per_night: 0,
            description: "",
        },
        tabs: [
            { name: "user-info", label: "User Information" },
            { name: "bookings", label: "Bookings" },
            { name: "campings", label: "Manage Campings" },
            { name: "add-camping", label: "Add Camping" },
        ],
        };
    },
    computed: {
        filteredTabs() {
        return this.user.role === "admin"
            ? this.tabs
            : this.tabs.filter((tab) => tab.name !== "campings" && tab.name !== "add-camping");
        },
    },
    async created() {
        this.token = localStorage.getItem("token");

        if (this.token) {
        const decodedToken = VueJwtDecode.decode(this.token);
        const userId = decodedToken.userId;
        await this.fetchUser(userId);
        } else {
        this.$router.push("/login");
        }
        this.fetchBookings();
        this.fetchCampings();
    },
    methods: {
      async fetchUser(userId) {
        try {
          const response = await this.$axios.get(`http://localhost:3000/api/users/${userId}`);
          this.user = response.data[0];
          this.updatedUser.username = this.user.username;
          this.updatedUser.email = this.user.email;
        } catch (error) {
          console.error('Error fetching user details:', error);
        }
      },
      formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' }; 
        return date.toLocaleDateString('en-GB', options); 
      },
      async fetchBookings() {
        try {
          const response = await this.$axios.get(`http://localhost:3000/api/bookings/${this.user.user_id}`);
          this.bookings = await Promise.all(response.data.map(async (booking) => {
            const campingResponse = await this.$axios.get(`http://localhost:3000/api/campings/${booking.camping_id}`);
            booking.camping_name = campingResponse.data.name;
            return booking;
          }));
        } catch (error) {
          console.error('Error fetching bookings:', error);
        }
      },
      async deleteBooking(bookingId) {
        try {
          await this.$axios.delete(`http://localhost:3000/api/bookings/${bookingId}`);
          alert('Booking deleted successfully!');
          this.fetchBookings();
        } catch (error) {
          console.error('Error deleting booking:', error);
          alert('Failed to delete booking.');
        }
      },
      async fetchCampings() {
        try {
            const response = await this.$axios.get(`http://localhost:3000/api/campings/user/${this.user.user_id}`);
            this.campings = response.data;
        } catch (error) {
            console.error('Error fetching campings:', error);
        }
      },
      async deleteCamping(campingId) {
        try {
            await this.$axios.delete(`http://localhost:3000/api/campings/${campingId}`);
            this.fetchCampings();
            alert('Camping deleted successfully!');
        } catch (error) {
            if (error.response && error.response.status === 400) {
             alert(error.response.data); 
            } else {
                console.error('Error deleting camping:', error);
                alert('Failed to delete camping.');
            }
        }
     },
     async addCamping() {
        try {
            this.newCamping.user_id = this.user.user_id;
            await this.$axios.post('http://localhost:3000/api/campings', this.newCamping);
            this.fetchCampings();
            alert('Camping added successfully!');
        } catch (error) {
            console.error('Error adding camping:', error);
            alert('Failed to add camping.');
        }
      },
      async updateProfile() {
        if (this.updatedUser.username || this.updatedUser.email || this.newPassword) {
          try {
            await this.$axios.put(`http://localhost:3000/api/users/${this.user.user_id}`, {
              username: this.updatedUser.username,
              email: this.updatedUser.email,
              newPassword: this.newPassword,
            });
            alert('Profile updated successfully!');
          } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile.');
          }
        } else {
          alert('Please provide at least one update.');
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .profile-container {
    padding: 20px;
    background-color: #f9f9f9;
    font-family: 'Arial', sans-serif;
  }
  
  h1 {
    color: #4CAF50;
  }
  
  .tabs {
    display: flex;
    margin-bottom: 20px;
  }
  
  .tab {
    margin-right: 20px;
    cursor: pointer;
    padding: 10px 20px;
    background-color: #ddd;
    border-radius: 5px;
  }
  
  .tab.active {
    background-color: #4CAF50;
    color: white;
  }
  
  .tab-content {
    background-color: white;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .tab-content h2 {
    color: #4CAF50;
  }
  
  .booking-cards,
  .camping-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  }
  
  .booking-card,
  .camping-card {
    background-color: #fff;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }
  
  .booking-card:hover,
  .camping-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }
  
  button {
    background-color: #4CAF50;
    color: white;
    border: none;
    padding: 10px 20px;
    font-size: 1em;
    cursor: pointer;
    border-radius: 5px;
  }
  
  button:hover {
    background-color: #45a049;
  }
  
  .add-camping input {
    margin-top: 10px;
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ddd;
    width: 100%;
    margin-bottom: 10px;
  }
  
  .add-camping button {
    background-color: #f44336;
  }
  
  .add-camping button:hover {
    background-color: #e53935;
  }
  </style>
  