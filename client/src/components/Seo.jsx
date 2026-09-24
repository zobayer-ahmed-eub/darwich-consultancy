import { useEffect } from 'react';

export default function Seo({title, description, canonical, noindex=false}) {
  useEffect(() => {
    if (title) document.title = title;
    const set = (name, content, attr='name') => {
      let el = document.head.querySelector(`meta[${attr}="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr,name); document.head.appendChild(el); }
      el.setAttribute('content',content || '');
    };
    set('description', description || '');
    set('robots', noindex ? 'noindex,nofollow' : 'index,follow');
    if (canonical) {
      let link = document.head.querySelector('link[rel="canonical"]');
      if (!link) { link = document.createElement('link'); link.rel='canonical'; document.head.appendChild(link); }
      link.href = canonical;
    }
  }, [title,description,canonical,noindex]);
  return null;
}
