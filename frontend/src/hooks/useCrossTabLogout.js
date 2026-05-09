import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function useCrossTabLogout() {
    const { logout, isAuthenticated } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        const handleStorageChange = (event) => {
            // Only care about our storage key
            if (event.key !== 'auth-storage') return;

            // If storage was cleared or modified
            try {
                const newValue = event.newValue ? JSON.parse(event.newValue) : null;
                
                // If the new state says not authenticated, but we still think we are: logout.
                if (isAuthenticated && (!newValue || !newValue.state?.isAuthenticated)) {
                    logout();
                    navigate('/login');
                }
            } catch (err) {
                // Parse error, ignore
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [isAuthenticated, logout, navigate]);
}
