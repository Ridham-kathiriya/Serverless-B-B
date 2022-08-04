import React from 'react';
import axios from '../Config/AxiosConfig';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const LoginStatisticsPage = (props) => {
  const [sessionData, setSessionData] = useState([]);
  const location = useLocation();
  const userEmail = location.state.userId;
  const url = '/get_user_session_stats?email=' + userEmail;

  useEffect(() => {
    axios.get(url).then((res) => {
      const data = res.data;
      setSessionData(data.message);
    });
  }, []);

  const getFormattedSessionData = (data) => {
    if (data.length > 0) {
      return (
        <table class='table'>
          <thead class='thead-dark'>
            <tr>
              <th scope='col'>Session #</th>
              <th scope='col'>Logged-in</th>
              <th scope='col'>Logged-out</th>
            </tr>
          </thead>
          <tbody>
            {data.map((session, index) => {
              const login = session.login_timestamp;
              const logout = session.logout_timestamp || 'Currently active';
              return (
                <tr key={index}>
                  <th scope='row'>{index}</th>
                  <td>{login}</td>
                  <td>{logout}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      );
    }
  };
  return getFormattedSessionData(sessionData);
};

export default LoginStatisticsPage;
