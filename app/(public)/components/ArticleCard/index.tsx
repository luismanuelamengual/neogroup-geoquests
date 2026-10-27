import './index.scss'
import Link from 'next/link'
import { Article } from '@/app/(public)/models/Article'
import { Locale } from '@/app/i18n/config'

/** Link to a guide or to the rules of a mode, with its icon, title and summary. */
export default function ArticleCard({ article, href, locale }: { article: Article; href: string; locale: Locale }) {
  const text = article.text[locale]

  return (
    <Link href={href} className="article-card">
      <span className="icon" aria-hidden="true">
        {article.icon}
      </span>
      <span className="title">{text.title}</span>
      <span className="description">{text.description}</span>
    </Link>
  )
}
