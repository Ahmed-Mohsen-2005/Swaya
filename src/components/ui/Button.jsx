export function Button({children, variant='primary', size='md', loading=false, className='', disabled, ...props}){
  const map={primary:'btn-primary',blue:'btn-blue',soft:'btn-soft',danger:'btn-danger',green:'btn-green',outline:'btn-outline',ghost:'btn-ghost'};
  return <button className={`btn btn-${size} ${map[variant]||map.primary} ${loading?'is-loading':''} ${className}`} disabled={disabled||loading} {...props}>{loading && <span className="loader-dot"/>}{children}</button>
}
