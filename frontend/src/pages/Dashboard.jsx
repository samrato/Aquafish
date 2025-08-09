import React, { useEffect, useState } from 'react'
import Menu from '../components/common/Menu';
import Farmer from '../components/Farmer';

function Dashboard() {
  const userInfo = JSON.parse(localStorage.getItem("user"))
  if(!userInfo){
    window.location.href = "/login"
  }
  
  return (
    <div>
        <Menu/>
        {userInfo.role === "farmer" && <Farmer/> }
    </div>
  )
}

export default Dashboard