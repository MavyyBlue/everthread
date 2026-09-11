import { countryById } from './countries';

/**
 * Everthread estate rules are fictional gameplay values. They are deliberately
 * simplified and must not be interpreted as real-world tax or legal guidance.
 */
export type EstateRuleProfileId='light'|'moderate'|'standard'|'structured';

export interface EstateAdministrationRule {
  id:EstateRuleProfileId;
  label:string;
  administrationRate:number;
  administrationAllowance:number;
  administrationCap:number;
  levyAllowance:number;
  levyRate:number;
}

export interface EstateAdministrationQuote {
  countryId:string;
  countryName:string;
  rule:EstateAdministrationRule;
  grossEstateValue:number;
  debtObligations:number;
  administrationCosts:number;
  administrationAllowance:number;
  levyAllowance:number;
  levyBase:number;
  estateLevy:number;
  totalObligations:number;
  netEstateValue:number;
}

const profiles:Record<EstateRuleProfileId,EstateAdministrationRule>={
  light:{id:'light',label:'Light settlement',administrationRate:.008,administrationAllowance:300000,administrationCap:25000,levyAllowance:1200000,levyRate:.03},
  moderate:{id:'moderate',label:'Moderate settlement',administrationRate:.01,administrationAllowance:250000,administrationCap:35000,levyAllowance:900000,levyRate:.045},
  standard:{id:'standard',label:'Standard settlement',administrationRate:.012,administrationAllowance:250000,administrationCap:45000,levyAllowance:700000,levyRate:.055},
  structured:{id:'structured',label:'Structured settlement',administrationRate:.014,administrationAllowance:250000,administrationCap:55000,levyAllowance:550000,levyRate:.07},
};

function finiteNonNegative(value:number){return Number.isFinite(value)?Math.max(0,value):0;}

export function estateRuleForCountry(countryId:string):EstateAdministrationRule{
  const fiscalRate=countryById[countryId]?.taxRate??.24;
  if(fiscalRate<=.18)return profiles.light;
  if(fiscalRate<=.24)return profiles.moderate;
  if(fiscalRate<=.29)return profiles.standard;
  return profiles.structured;
}

export function quoteEstateAdministration(countryId:string,grossEstateValue:number,debtObligations:number):EstateAdministrationQuote{
  const country=countryById[countryId];
  const rule=estateRuleForCountry(countryId);
  const gross=finiteNonNegative(grossEstateValue);
  const debts=finiteNonNegative(debtObligations);
  const administrationBase=Math.max(0,gross-rule.administrationAllowance);
  const administrationCosts=administrationBase>0?Math.min(gross,rule.administrationCap,Math.round(administrationBase*rule.administrationRate)):0;
  const levyBase=Math.max(0,gross-debts-administrationCosts-rule.levyAllowance);
  const estateLevy=Math.min(Math.max(0,gross-debts-administrationCosts),Math.round(levyBase*rule.levyRate));
  const totalObligations=debts+administrationCosts+estateLevy;
  return{
    countryId,
    countryName:country?.name??'Current country',
    rule,
    grossEstateValue:gross,
    debtObligations:debts,
    administrationCosts,
    administrationAllowance:rule.administrationAllowance,
    levyAllowance:rule.levyAllowance,
    levyBase,
    estateLevy,
    totalObligations,
    netEstateValue:Math.max(0,gross-totalObligations),
  };
}
