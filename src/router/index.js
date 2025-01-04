import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/components/HomePage.vue';
import Login from '@/components/UserLogin.vue';
import Register from '@/components/UserRegister.vue';
import AirbnbPage from '@/components/AirbnbPage.vue';
import CampingDetails from '@/components/CampingDetails.vue';
import Profile from '@/components/Profile.vue';

const routes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/airbnb', name: 'AirbnbPage', component: AirbnbPage },
  { path: '/profile', name: 'Profile', component: Profile },
  {
    path: '/campings/:id',
    name: 'CampingDetails',
    component: CampingDetails,
  }
];


const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
