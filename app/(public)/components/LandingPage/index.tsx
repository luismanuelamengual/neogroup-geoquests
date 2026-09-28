import './index.scss'
import GameButton from '@/app/components/GameButton'
import GamePanel from '@/app/components/GamePanel'
import Logo from '@/app/components/Logo'

const STEPS = [
  { icon: '👀', title: 'Mirá', text: 'Aparecés en una calle de algún lugar del mundo. Girá, acercate, caminá.' },
  { icon: '📍', title: 'Marcá', text: 'Buscá pistas (carteles, autos, arquitectura) y poné tu pin en el mapa.' },
  { icon: '🏆', title: 'Sumá', text: 'Cuanto más cerca, más puntos. 5 rondas, hasta 25.000 puntos.' }
]

/** Public landing page (signed-out visitors). */
export default function LandingPage() {
  return (
    <main className="landing-page">
      <section className="hero">
        <Logo size="large" className="logo" />
        <p className="tagline">¿Dónde estás? Explorá las calles del mundo y adiviná el lugar.</p>
        <div className="actions">
          <GameButton size="large" href="/login">
            Jugar gratis
          </GameButton>
          <GameButton size="large" color="ghost" href="/register">
            Crear cuenta
          </GameButton>
        </div>
      </section>
      <section className="steps">
        {STEPS.map((step, index) => (
          <GamePanel
            key={step.title}
            className="step"
            title={`${index + 1}. ${step.title}`}
            accent={index === 1 ? 'magenta' : index === 2 ? 'lime' : 'cyan'}
          >
            <div className="icon">{step.icon}</div>
            <p>{step.text}</p>
          </GamePanel>
        ))}
      </section>
      <footer className="footer">Imágenes de calles © Google Street View · Mapas © OpenStreetMap / OpenFreeMap</footer>
    </main>
  )
}
