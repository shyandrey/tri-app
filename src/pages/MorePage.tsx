import BottomNav from '../components/BottomNav'
import type { Page } from '../types/Page'

type MorePageProps = {
  onNavigate: (page: Page) => void
}

function MorePage({ onNavigate }: MorePageProps) {
  return (
    <main className="app">
      <section className="section">
        <div className="section__header">
          <h1>Ещё</h1>
        </div>

        <div className="more-list">
          <article className="more-card">
            <h3>Telegram-канал</h3>
            <p>@trista_watt</p>
            <span>›</span>
          </article>

          <article className="more-card">
            <h3>О приложении</h3>
            <p>TRI APP — приложение о триатлоне</p>
            <span>›</span>
          </article>

          <article className="more-card">
            <h3>Обратная связь</h3>
            <p>Предложения и замечания</p>
            <span>›</span>
          </article>
        </div>
      </section>

      <BottomNav
        currentPage="more"
        onNavigate={onNavigate}
      />
    </main>
  )
}

export default MorePage