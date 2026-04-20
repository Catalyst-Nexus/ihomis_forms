import { useState } from 'react';
import Forms from './Forms'
import Sidebar from './Sidebar'
import './App.css'

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className={`app-layout ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <Sidebar />
      <main className="main-content">
        <Forms isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      </main>
    </div>
  )
}

export default App
