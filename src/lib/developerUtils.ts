/**
 * Utility function to safely extract developer name from various data structures
 * @param developer - Can be a string, object, or null/undefined
 * @returns A string representation of the developer name
 */
export function getDeveloperName(developer: any): string {
  if (!developer) {
    return 'Unknown';
  }
  
  if (typeof developer === 'string') {
    return developer;
  }
  
  if (typeof developer === 'object' && developer !== null) {
    // Handle Strapi v4 structure (attributes.name)
    if (developer.attributes?.name) {
      return developer.attributes.name;
    }
    
    // Handle direct object structure (developer.name)
    if (developer.name) {
      return developer.name;
    }
    
    // Handle other possible structures
    if (developer.title) {
      return developer.title;
    }
  }
  
  return 'Unknown';
}

/**
 * Utility function to safely extract developer name for form values
 * @param developer - Can be a string, object, or null/undefined
 * @returns A string representation of the developer name suitable for form values
 */
export function getDeveloperFormValue(developer: any): string {
  if (!developer) {
    return '';
  }
  
  if (typeof developer === 'string') {
    return developer;
  }
  
  if (typeof developer === 'object' && developer !== null) {
    // Handle Strapi v4 structure (attributes.name)
    if (developer.attributes?.name) {
      return developer.attributes.name;
    }
    
    // Handle direct object structure (developer.name)
    if (developer.name) {
      return developer.name;
    }
  }
  
  return '';
}

