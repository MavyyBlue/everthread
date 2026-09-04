import type { ReactNode } from 'react';

export function BottomSheet({open,title,onClose,children,wide=false}:{open:boolean;title:string;onClose:()=>void;children:ReactNode;wide?:boolean}){
  if(!open)return null;return <div className="sheet-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}>
    <section className={`bottom-sheet ${wide?'bottom-sheet--wide':''}`} role="dialog" aria-modal="true" aria-label={title}>
      <header className="sheet-header"><div className="sheet-handle" aria-hidden="true"/><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label={`Close ${title}`}>×</button></header>
      <div className="sheet-body">{children}</div>
    </section>
  </div>;
}
