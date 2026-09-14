import { Component, type ErrorInfo, type ReactNode } from 'react';

interface LazyScreenBoundaryProps{
  name:string;
  children:ReactNode;
  onExit?:()=>void;
}
interface LazyScreenBoundaryState{error?:Error;}

export class LazyScreenBoundary extends Component<LazyScreenBoundaryProps,LazyScreenBoundaryState>{
  state:LazyScreenBoundaryState={};
  static getDerivedStateFromError(error:Error):LazyScreenBoundaryState{return{error};}
  componentDidCatch(error:Error,info:ErrorInfo){console.error(`Everthread ${this.props.name} failed to load`,error,info.componentStack);}
  render(){
    if(!this.state.error)return this.props.children;
    return <main className="screen"><div className="empty-card"><strong>{this.props.name} could not finish loading.</strong><p className="muted">Everthread kept the rest of your life safe. Reload to fetch the newest screen files, or return to Life and try again.</p><div className="button-row"><button className="secondary-button" onClick={()=>window.location.reload()}>Reload Everthread</button>{this.props.onExit&&<button className="secondary-button" onClick={this.props.onExit}>Return to Life</button>}</div></div></main>;
  }
}
