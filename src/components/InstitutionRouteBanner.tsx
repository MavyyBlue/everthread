import type { InstitutionRouteRequest } from '../core/institutionRouting';

export function InstitutionRouteBanner({request,onBackToMap}:{request?:InstitutionRouteRequest;onBackToMap?:()=>void}){
  if(!request)return null;
  return <aside className="institution-route-banner" aria-label={`Opened from ${request.placeLabel}`}>
    <span><small>From Everthread map</small><strong>{request.placeLabel}</strong><em>{request.serviceLabel}</em></span>
    {onBackToMap&&<button className="secondary-button" onClick={onBackToMap}>Back to Map</button>}
  </aside>;
}
