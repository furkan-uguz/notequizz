import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getAnalytics, logEvent, isSupported } from 'firebase/analytics';

/**
 * Rota değişimlerini dinleyerek Firebase Analytics'e 'page_view' etkinliği gönderen hook.
 */
const usePageView = () => {
    const location = useLocation();

    useEffect(() => {
        isSupported().then((supported) => {
            if (supported) {
                const analytics = getAnalytics();
                logEvent(analytics, 'page_view', {
                    page_path: location.pathname + location.search,
                });
            }
        });
    }, [location]);
};

export default usePageView;