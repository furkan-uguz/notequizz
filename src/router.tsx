import { RouteObject, useRoutes } from 'react-router-dom';
import Home from './pages/Home';
import Error from './pages/Error';
import { Constant } from './constants/Constant';

interface RouteProps {
    auth: string;
}

const Router = (props : RouteProps) => {

    const guestRoutes: RouteObject[] = [
        // Only guest routes will defines here.
    ];

    const userRoutes: RouteObject[] = [
       // Only user allow routes will defines here.
    ];

    const activeRoutes: RouteObject[] = [
        ...(props.auth === Constant.GUEST_USER ? guestRoutes : userRoutes),
        {
            path: "/",
            element: <Home />,
        },
        {
            path: "*",
            element: <Error />,
        }
    ];

    const routes = useRoutes(activeRoutes);
    return (
        <>{routes}</>
    );
}

export default Router;