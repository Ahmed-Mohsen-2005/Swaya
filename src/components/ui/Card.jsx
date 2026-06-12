export function Card({children, className='', interactive=false, as:Tag='div', ...props}){ return <Tag className={`card ${interactive?'interactive':''} ${className}`} {...props}>{children}</Tag> }
export const SectionCard = Card;
