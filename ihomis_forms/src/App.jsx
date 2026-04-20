import { useMemo, useState } from 'react'
import LabUploadModule from './modules/labUpload/LabUploadModule.jsx'
import './App.css'

const modules = [
  {
    id: 'lab-upload',
    name: 'Laboratory Upload',
    description: 'Upload and review laboratory PDF results.',
    status: 'Ready',
    Component: LabUploadModule,
  },
]

function App() {
  const [activeModuleId, setActiveModuleId] = useState(null)

  const activeModule = useMemo(
    () => modules.find((moduleItem) => moduleItem.id === activeModuleId) || null,
    [activeModuleId],
  )

  if (!activeModule) {
    return (
      <div className="app-landing-page">
        <div className="app-landing-ambient app-landing-ambient-a" aria-hidden="true" />
        <div className="app-landing-ambient app-landing-ambient-b" aria-hidden="true" />

        <main className="app-landing-shell">
          <section className="app-landing-hero">
            <p className="app-landing-kicker">IHOMIS Forms</p>
            <h1>Module Navigator</h1>
            <p>Select a module to continue.</p>
          </section>

          <section className="app-module-grid" aria-label="Available modules">
            {modules.map((moduleItem) => (
              <article key={moduleItem.id} className="app-module-card">
                <div className="app-module-card-head">
                  <h2>{moduleItem.name}</h2>
                  <span>{moduleItem.status}</span>
                </div>

                <p>{moduleItem.description}</p>

                <button
                  type="button"
                  className="app-open-module"
                  onClick={() => setActiveModuleId(moduleItem.id)}
                >
                  Open Module
                </button>
              </article>
            ))}
          </section>
        </main>
      </div>
    )
  }

  const ActiveComponent = activeModule.Component

  return (
    <div className="app-module-host">
      <header className="app-module-header">
        <button
          type="button"
          className="app-back-button"
          onClick={() => setActiveModuleId(null)}
        >
          Back to Landing
        </button>
        <strong>{activeModule.name}</strong>
      </header>

      <ActiveComponent />
    </div>
  )
}

export default App
