import { Outlet } from 'react-router-dom'
import Header from './ui/curved-menu'
import Footer from './Footer'
import ShaderBackground from './ui/ShaderBackground'

export default function Layout() {
  return (
    <>
      {/* Fixed Unicorn Studio shader behind everything */}
      <ShaderBackground />

      {/* Curved hamburger menu */}
      <Header />

      {/* Page content layered above the shader */}
      <main className="page-content" style={{ position: 'relative', zIndex: 1 }}>
        <Outlet />
      </main>

      <Footer />
    </>
  )
}
