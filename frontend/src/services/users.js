import axios from "axios";

class UserDataService {
    registerUser(data) {
        return axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/users/register`, data);
    }
    loginUser(data) {
        return axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/users/login`, data);
    }

}
export default new UserDataService();