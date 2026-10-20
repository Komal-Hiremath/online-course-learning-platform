import React from 'react'
import { Outlet } from 'react-router-dom'

const AdminContent = () => {
  return (
    <div>
      <Outlet/>
    </div>
  )
}

export default AdminContent