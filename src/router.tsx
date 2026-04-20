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

    const defaultRoutes: RouteObject[] = props.auth === Constant.GUEST_USER ? guestRoutes : userRoutes;
    defaultRoutes.push(
        {
            path: "*",
            element: <Error />,
        },
        {
            path: "/",
            element: <Home />,
        }
    );
    const routes = useRoutes(defaultRoutes);
    return (
        <>{routes}</>
    );
}

export default Router;