import React from "react";
import { Constant } from "../constants/Constant";

export interface AuthContextProvider {
	authType: typeof Constant.GUEST_USER | typeof Constant.AUTH_USER;
	authenticatedUser: AuthUser;
}

interface AuthUser {
	id: number;
	fullname: string;
	username: string;
	email: string;
	roles: string[];
}

const initAuthUser: AuthUser = {
	id: 0,
	fullname: "",
	username: "",
	email: "",
	roles: [],
};

const initialize: AuthContextProvider = {
	authType: Constant.GUEST_USER,
	authenticatedUser: initAuthUser,
};

const AuthContext = React.createContext(initialize);

export default AuthContext;
