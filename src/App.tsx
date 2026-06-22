import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { TrackerProvider } from './context/TrackerContext'
import { ThemeProvider } from './context/ThemeContext'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Track } from './pages/Track'
import { Checklist } from './pages/Checklist'
import { Reports } from './pages/Reports'
import { Settings } from './pages/Settings'
import { Tools } from './pages/Tools'

export default function App() {
  return (
    <ThemeProvider>
      <TrackerProvider>
        <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="track" element={<Track />} />
            <Route path="checklist" element={<Checklist />} />
            <Route path="reports" element={<Reports />} />
            <Route path="tools" element={<Tools />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
        </BrowserRouter>
      </TrackerProvider>
    </ThemeProvider>
  )
}
