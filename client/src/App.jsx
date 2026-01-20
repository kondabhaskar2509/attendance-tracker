import { useContext, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Header from './pages/Header'
import Subject from './pages/Subject'
import { context } from './pages/Context'
import DAuthCallback from './pages/DAuthCallback'
import Profile from './pages/Profile'

function App() {
 const {loggedin} = useContext(context);
  return (
    <>
     {loggedin && <Header />}
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/subject/:name/:id' element={<Subject/>}/>
        <Route path='/signin' element={<DAuthCallback/>}/>
        <Route path='/profile' element={<Profile/>}/>
      </Routes>
    </>
  )
}

export default App
