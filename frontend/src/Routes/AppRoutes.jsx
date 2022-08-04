import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import MealBookingPage from '../Pages/MealBookingPage';
import HomePage from '../Pages/HomePage';
import RoomBookingPage from '../Pages/RoomBookingPage';
import TourBookingPage from '../Pages/TourBookingPage';
import OutletPage from '../Pages/OutletPage';
import RegisterPage from '../Pages/RegisterPage';
import LoginPage from '../Pages/LoginPage';
import ValidateUserSession from '../Components/ValidateUserSession';
import ReviewPage from '../Pages/ReviewPage';
import VisualizationsPage from '../Pages/VisualizationsPage';
import ChatBot from "../Components/ChatBot"
import LoginStatisticsPage from '../Pages/LoginStatisticsPage';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<RoomBookingPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/visualizations' element={<VisualizationsPage />} />
        <Route
          path='/'
          element={
            <ValidateUserSession>
              <OutletPage />
            </ValidateUserSession>
          }
        >
          <Route path='/home' element={<HomePage />} />
          <Route path='/meals' element={<MealBookingPage />} />
          <Route path='/tours' element={<TourBookingPage />} />
          <Route path='/feedback' element={<ReviewPage />} />
          <Route path='/login-statistics' element={<LoginStatisticsPage />} />
        </Route>
      </Routes>
      <ChatBot />
    </BrowserRouter>
  );
};

export default AppRoutes;
