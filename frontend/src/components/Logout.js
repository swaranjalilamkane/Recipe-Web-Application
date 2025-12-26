import React from 'react';
import { googleLogout } from '@react-oauth/google';

function Logout({setUser, clientId}){
  const logOut = () => {
    googleLogout();
    setUser(null);
    localStorage.setItem("login");
    console.log("Logout made successfully");
  }

  return (
    <div>
      <button onClick={logOut} type="button" class="btn btn-light">
        <img src="/images/google_icon.png" alt="Logo"
        style={{"height": "20px", "margin-right":"10px"}}></img>
        Logout
      </button>
    </div>
  );
}

export default Logout;