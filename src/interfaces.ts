export interface TaxonomyNode {
  name: string;
  children?: TaxonomyNode[];
}

export interface Category extends TaxonomyNode {
  // Additional properties specific to top-level categories can be added here
}

export interface Subcategory extends TaxonomyNode {
  // Additional properties specific to subcategories can be added here
}

export interface TaxonomyData {
  name: string;
  children: Category[];
}
