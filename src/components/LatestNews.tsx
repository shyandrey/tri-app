import { useEffect, useState } from 'react'
import { NEWS_CHANNEL_URL } from '../../shared/news'
import { newsSeed } from '../data/newsSeed'
import { loadNews, newsDate, validNewsItems } from '../api/news'
import './LatestNews.css'
export default function LatestNews() {
  const [items,setItems] = useState(() => validNewsItems(newsSeed))
  useEffect(() => { let active=true; void loadNews(newsSeed).then(news=>{if(active)setItems(news)}); return()=>{active=false} }, [])
  return <section className="section latest-news" aria-labelledby="latest-news-heading">
    <div className="section__header"><h2 id="latest-news-heading">Последние новости</h2></div>
    {items.length ? <div className="latest-news__list">{items.map(item=><article className="latest-news__card" key={item.id}>
      <time dateTime={item.publishedAt}>{newsDate(item.publishedAt)}</time>
      <h3>{item.title}</h3>{item.excerpt && <p>{item.excerpt}</p>}
      <a href={item.telegramUrl} target="_blank" rel="noopener noreferrer" aria-label={`Читать в Telegram: ${item.title}`}>Читать в Telegram →</a>
    </article>)}</div> : <p className="latest-news__fallback">Последние новости — в Telegram <a href={NEWS_CHANNEL_URL} target="_blank" rel="noopener noreferrer">@trista_watt</a></p>}
    <a className="latest-news__all" href={NEWS_CHANNEL_URL} target="_blank" rel="noopener noreferrer">Все новости в Telegram →</a>
  </section>
}
