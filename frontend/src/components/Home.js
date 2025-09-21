import React from "react";

function Home({ user }) {
  return (
    <div>
      <h2>Welcome {user?.fullName || user?.username}</h2>
      <p>You are logged in successfully 🎉</p>
    </div>
  );
}

export default Home;
