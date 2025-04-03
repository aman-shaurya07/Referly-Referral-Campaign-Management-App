
import React from 'react';

const Login = () => {
  const handleLogin = () => {
    window.location.href = `${process.env.REACT_APP_BACKEND_URL}/auth/google`;
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Login as Business</h2>
      <button onClick={handleLogin} style={{ padding: '10px 20px', fontSize: '16px' }}>
        Sign in with Google
      </button>
    </div>
  );
};

export default Login;
