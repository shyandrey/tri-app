import { useEffect, useState } from 'react'
import { NEWS_CHANNEL_URL } from '../../shared/news'
import { newsSeed } from '../data/newsSeed'
import { loadNews, validNewsItems } from '../api/news'
import './LatestNews.css'
import { newsPresentation } from '../utils/newsPresentation'
import NewsIcon from './NewsIcon'
import { TelegramIcon } from './AppIcons'
export default function LatestNews() {
  const [items,setItems] = useState(() => validNewsItems(newsSeed))
  useEffect(() => { let active=true; void loadNews(newsSeed).then(news=>{if(active)setItems(news)}); return()=>{active=false} }, [])
  return <section className="section latest-news" aria-labelledby="latest-news-heading">
    <div className="latest-news__header"><h2 id="latest-news-heading">Последние новости</h2><a className="latest-news__channel" href={NEWS_CHANNEL_URL} target="_blank" rel="noopener noreferrer"><TelegramIcon /><span>@trista_watt</span></a></div>
    {items.length ? <div className="latest-news__list">{items.map(item => {
      const presentation = newsPresentation(item.title)
      return <a className="latest-news__row" key={item.id} href={item.telegramUrl} target="_blank" rel="noopener noreferrer" aria-label={item.title}>
        <span className="latest-news__icon"><NewsIcon type={presentation.type} /></span>
        <span className="latest-news__title">{presentation.title}</span>
        <span className="latest-news__chevron" aria-hidden="true">›</span>
      </a>
    })}</div> : null}
  </section>
}
