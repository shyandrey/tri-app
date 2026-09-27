import { useEffect, useState } from 'react'
import { NEWS_CHANNEL_URL } from '../../shared/news'
import { newsSeed } from '../data/newsSeed'
import { loadNews, validNewsItems } from '../api/news'
import './LatestNews.css'
import { newsPresentation } from '../utils/newsPresentation'
import NewsIcon from './NewsIcon'
export default function LatestNews() {
  const [items,setItems] = useState(() => validNewsItems(newsSeed))
  useEffect(() => { let active=true; void loadNews(newsSeed).then(news=>{if(active)setItems(news)}); return()=>{active=false} }, [])
  return <section className="section latest-news" aria-labelledby="latest-news-heading">
    <h2 id="latest-news-heading">Последние новости</h2>
    {items.length ? <div className="latest-news__list">{items.map(item => {
      const presentation = newsPresentation(item.title)
      return <a className="latest-news__row" key={item.id} href={item.telegramUrl} target="_blank" rel="noopener noreferrer" aria-label={item.title}>
        <span className="latest-news__icon"><NewsIcon type={presentation.type} /></span>
        <span className="latest-news__title">{presentation.title}</span>
        <span className="latest-news__chevron" aria-hidden="true">›</span>
      </a>
    })}</div> : null}
    <a className="latest-news__all" href={NEWS_CHANNEL_URL} target="_blank" rel="noopener noreferrer"><span>Все новости в Telegram</span><span className="latest-news__chevron" aria-hidden="true">›</span></a>
  </section>
}
