import BottomNav from '../components/BottomNav'
import type { Page } from '../types/Page'

type MorePageProps = {
  onFeedback: () => void
  onNavigate: (page: Page) => void
}

function MorePage({ onNavigate, onFeedback }: MorePageProps) {
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

          <button className="more-card feedback-entry" type="button" onClick={onFeedback}>
            <strong>Сообщить об ошибке</strong>
            <small>Предложения и замечания</small>
            <span aria-hidden="true">›</span>
          </button>
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