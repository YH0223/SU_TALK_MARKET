import React from "react";
import "./Loading.css";

const LoadingScreen = () => {
  return (
    <div className="loading-Container">
      <div className="title-Container">
        <img loading="lazy" src="/assets/수야.png" alt="로고" className="logo" />
        <h1>중고 물품 거래</h1>
        <h1>on Su_Talk</h1>
      </div>
    </div>
  );
};

export default LoadingScreen;
