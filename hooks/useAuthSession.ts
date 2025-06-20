import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import apiRequest from '@/lib/apiRequest';
import { setLogin, setLogout } from '@/lib/authSlice';

let refreshTimeout: NodeJS.Timeout | null = null;
let inactivityTimeout: NodeJS.Timeout | null = null;

const sessionInactivityCheckTime = 5 * 60 * 1000; // 5 minutes
const tokenExpireIn = 15 * 60 * 1000; // 15 minutes
const refreshTime = 10 * 60 * 1000; // 10 minutes

export const useAuthSession = () => {
  const dispatch = useAppDispatch();
  const { token, refreshToken, expireIn } = useAppSelector((state) => state.auth);

  // Function to handle logout
  const handleLogout = () => {
    dispatch(setLogout());
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  // Function to refresh token
  const refreshAuthToken = async () => {
    if (!refreshToken) {
      handleLogout();
      return;
    }
    try {
      const response: any = await apiRequest({
        method: 'post',
        url: '/auth/refresh',
        data: { refreshToken },
      });
      if (response?.jwtToken) {
        const { userName, jwtToken, refreshToken: newRefreshToken, expireTime } = response;
        dispatch(
          setLogin({
            user: userName || null,
            token: jwtToken,
            refreshToken: newRefreshToken,
            expireIn: (expireTime || 15) * 60 * 1000, // convert min to ms
          })
        );
        scheduleTokenRefresh((expireTime || 15) * 60 * 1000);
      } else {
        handleLogout();
      }
    } catch (error) {
      handleLogout();
    }
  };

  // Function to schedule auto-refresh after 10 minutes
  const scheduleTokenRefresh = (expireIn: number) => {
    if (refreshTimeout) clearTimeout(refreshTimeout);
    refreshTimeout = setTimeout(refreshAuthToken, refreshTime);
  };

  // Function to start inactivity detection
  const startInactivityTimer = () => {
    if (inactivityTimeout) clearTimeout(inactivityTimeout);
    inactivityTimeout = setTimeout(() => {
      handleLogout();
    }, sessionInactivityCheckTime);
  };

  // Attach event listeners to reset inactivity timer on user activity
  const setupInactivityListeners = () => {
    ["mousemove", "mousedown", "keydown", "scroll", "touchstart"].forEach((event) => {
      window.addEventListener(event, startInactivityTimer);
    });
  };

  useEffect(() => {
    if (token) {
      scheduleTokenRefresh(expireIn || tokenExpireIn);
      setupInactivityListeners();
      startInactivityTimer();
    }
    return () => {
      if (refreshTimeout) clearTimeout(refreshTimeout);
      if (inactivityTimeout) clearTimeout(inactivityTimeout);
      ["mousemove", "mousedown", "keydown", "scroll", "touchstart"].forEach((event) => {
        window.removeEventListener(event, startInactivityTimer);
      });
    };
  }, [token, expireIn]);
}; 