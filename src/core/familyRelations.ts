import type { RelationshipType } from '../types/game';

export const LEGACY_CLOSE_FAMILY_RELATION_TYPES = [
  'parent','stepparent','grandparent','sibling','half_sibling','stepsibling','child','grandchild','niece_nephew',
] as const satisfies readonly RelationshipType[];

export const EXTENDED_FAMILY_RELATION_TYPES = [
  'aunt_uncle','cousin',
] as const satisfies readonly RelationshipType[];

export const FAMILY_RELATIONSHIP_TYPES = [
  ...LEGACY_CLOSE_FAMILY_RELATION_TYPES,
  ...EXTENDED_FAMILY_RELATION_TYPES,
] as const satisfies readonly RelationshipType[];

export const SIBLING_RELATIONSHIP_TYPES = [
  'sibling','half_sibling','stepsibling',
] as const satisfies readonly RelationshipType[];

export const LEGACY_CLOSE_FAMILY_RELATION_TYPE_SET = new Set<RelationshipType>(LEGACY_CLOSE_FAMILY_RELATION_TYPES);
export const EXTENDED_FAMILY_RELATION_TYPE_SET = new Set<RelationshipType>(EXTENDED_FAMILY_RELATION_TYPES);
export const FAMILY_RELATIONSHIP_TYPE_SET = new Set<RelationshipType>(FAMILY_RELATIONSHIP_TYPES);
export const SIBLING_RELATIONSHIP_TYPE_SET = new Set<RelationshipType>(SIBLING_RELATIONSHIP_TYPES);

export function relationshipTypeLabel(type:RelationshipType){
  if(type==='aunt_uncle')return'aunt / uncle';
  if(type==='niece_nephew')return'niece / nephew';
  return type.replaceAll('_',' ');
}
