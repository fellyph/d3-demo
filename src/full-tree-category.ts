import * as d3 from "d3";

// Define interfaces for our data structures
interface TaxonomyNode {
  name: string;
  children: TaxonomyNode[];
  id?: string;
}

interface HierarchyNode extends d3.HierarchyNode<TaxonomyNode> {}

// Function to load and process the taxonomy_v2.md file
async function loadTaxonomyData(): Promise<TaxonomyNode> {
  const response = await fetch("/taxonomy_v2.md");
  const text = await response.text();
  return parseTaxonomyData(text);
}

// Function to parse the file content
function parseTaxonomyData(text: string): TaxonomyNode {
  const lines = text.trim().split("\n").slice(2); // Remove header and separator line
  const data: TaxonomyNode = { name: "Root", children: [] };

  lines.forEach((line) => {
    const [id, path] = line
      .split("|")
      .slice(1, 3)
      .map((s) => s.trim());
    const parts = path.split("/").filter(Boolean);

    let currentNode: TaxonomyNode = data;
    parts.forEach((part, index) => {
      let child = currentNode.children.find((c) => c.name === part);
      if (!child) {
        child = { name: part, children: [] };
        currentNode.children.push(child);
      }
      currentNode = child;
      if (index === parts.length - 1) {
        child.id = id;
      }
    });
  });

  return data;
}

function createTaxonomyTree(data: TaxonomyNode): void {
  const width = 1200;
  const height = 800;
  const margin = { top: 20, right: 90, bottom: 30, left: 90 };

  const svg = d3
    .select("#app")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const root = d3.hierarchy(data) as HierarchyNode;
  const treeLayout = d3
    .tree<TaxonomyNode>()
    .size([
      height - margin.top - margin.bottom,
      width - margin.left - margin.right,
    ]);
  treeLayout(root);

  // Add links
  svg
    .selectAll(".link")
    .data(root.links())
    .enter()
    .append("path")
    .attr("class", "link")
    .attr(
      "d",
      d3
        .linkHorizontal<
          d3.HierarchyLink<TaxonomyNode>,
          d3.HierarchyPointLink<TaxonomyNode>
        >()
        .x((d) => d.source.y)
        .y((d) => d.source.x)
    );

  // Add nodes
  const node = svg
    .selectAll(".node")
    .data(root.descendants())
    .enter()
    .append("g")
    .attr(
      "class",
      (d) => "node" + (d.children ? " node--internal" : " node--leaf")
    )
    .attr("transform", (d) => `translate(${d.y},${d.x})`);

  node.append("circle").attr("r", 5);

  node
    .append("text")
    .attr("dy", ".35em")
    .attr("x", (d) => (d.children ? -13 : 13))
    .style("text-anchor", (d) => (d.children ? "end" : "start"))
    .text((d) => d.data.name);
}

// Main function
async function init(): Promise<void> {
  const data = await loadTaxonomyData();
  createTaxonomyTree(data);
}

init();
