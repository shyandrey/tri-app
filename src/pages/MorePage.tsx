import { currentRelease } from '../../.generated/current-release'
import BottomNav from '../components/BottomNav'
import type { Page } from '../types/Page'
import { buildMetadata } from '../utils/buildMetadata'
import { NEWS_CHANNEL_URL } from '../../shared/news'
import './MorePage.css'

type MorePageProps = {
  onBack: () => void
  onFeedback: () => void
  onNavigate: (page: Page) => void
}

function MorePage({ onNavigate, onFeedback, onBack }: MorePageProps) {
  return (
    <main className="app more-page">
      <button className="page-back-button" type="button" onClick={onBack}>← Назад</button>
      <div className="more-content">
        <h1>Ещё</h1>
        <section className="more-block" aria-labelledby="more-about">
          <h2 id="more-about">О приложении</h2>
          <div className="more-panel">
            <h3 className="more-brand">300W⚡ APP</h3>
            <p>Профессиональный триатлон: календарь, результаты, профили атлетов и многое другое.</p>
            <p>ТРИАТЛОН — ЭТО МОЩНО!</p>
            <details className="more-release">
              <summary>
                <span className="more-version">Версия {buildMetadata.version}</span>
                <span className="more-release-title">{currentRelease.title}</span>
              </summary>
              {currentRelease.unpublished && <p>Предварительная версия — публичный релиз ещё не объявлен.</p>}
              {currentRelease.sections.map(section => (
                <div key={section.heading}>
                  <h4>{({ Added: 'Добавлено', Changed: 'Изменено', Fixed: 'Исправлено', Technical: 'Техническое' } as const)[section.heading as 'Added' | 'Changed' | 'Fixed' | 'Technical']}</h4>
                  <ul>{section.items.map(item => <li key={item}>{item}</li>)}</ul>
                </div>
              ))}
            </details>
          </div>
        </section>
        <section className="more-block" aria-labelledby="more-feedback">
          <h2 id="more-feedback">Обратная связь</h2>
          <button className="more-panel more-action feedback-entry" type="button" onClick={onFeedback}>
            <span><strong>Сообщить об ошибке</strong><small>Нашли ошибку в результатах или работе приложения? Напишите нам.</small></span>
            <span className="more-indicator" aria-hidden="true">›</span>
          </button>
        </section>
        <section className="more-block" aria-labelledby="more-community">
          <h2 id="more-community">Сообщество</h2>
          <a className="more-panel more-action" href={NEWS_CHANNEL_URL} target="_blank" rel="noopener noreferrer">
            <span><strong>Telegram <span className="more-handle">@trista_watt</span></strong><small>Новости и обсуждение профессионального триатлона.</small></span>
            <span className="more-indicator" aria-hidden="true">↗</span>
            <span className="more-sr-only">Откроется в новой вкладке</span>
          </a>
        </section>
        <section className="more-block" aria-labelledby="more-data">
          <h2 id="more-data">Данные и конфиденциальность</h2>
          <div className="more-panel more-information">
            <div>
              <h3>Основные источники спортивных данных</h3>
              <p>Результаты и сведения об атлетах обновляются после проверки.</p>
              <p><a href="https://stats.protriathletes.org/" target="_blank" rel="noopener noreferrer">Stats PTO <span aria-hidden="true">↗</span><span className="more-sr-only"> (откроется в новой вкладке)</span></a></p>
              <p><a href="https://triathlon.org/" target="_blank" rel="noopener noreferrer">World Triathlon <span aria-hidden="true">↗</span><span className="more-sr-only"> (откроется в новой вкладке)</span></a></p>
            </div>
            <div><h3>Конфиденциальность</h3><p>При отправке обратной связи мы сохраняем текст сообщения и технический контекст, необходимый для его обработки. Email указывается по желанию. Исходный IP-адрес не сохраняется в обращении.</p></div>
          </div>
        </section>
      </div>
      <BottomNav currentPage="more" onNavigate={onNavigate} />
    </main>
  )
}

export default MorePage
