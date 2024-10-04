import * as d3 from "d3";
import { TaxonomyNode } from "./interfaces";
import { HierarchyNode } from "d3-hierarchy";

// Set the dimensions and margins of the diagram
const margin = { top: 20, right: 90, bottom: 30, left: 90 };
const width = 1600 - margin.left - margin.right;
const height = 3000 - margin.top - margin.bottom;

// Append the svg object to the body of the page
const svg = d3
  .select("#tree-container")
  .append("svg")
  .attr("width", width + margin.right + margin.left)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Create the tree layout
const treemap = d3.tree<TaxonomyNode>().size([height, width]);

// Increase this value to add more vertical space between nodes
const verticalSpacing = 40;

// Increase this value to add more horizontal space between levels
const horizontalSpacing = 250;

// Load the JSON data
d3.json<TaxonomyNode>("taxonomy_v2.json").then((data) => {
  console.log(data);
  // Convert the flat JSON to a hierarchical format
  const root = d3.hierarchy(data, (d) => d?.children);

  // Assigns the x and y position for the nodes
  const treeData = treemap(root as HierarchyNode<TaxonomyNode>);

  // Compute the new tree layout.
  const nodes = treeData.descendants();
  const links = treeData.descendants().slice(1);

  // Normalize for fixed-depth.
  nodes.forEach((d) => {
    d.y = d.depth * horizontalSpacing;
  });

  // ****************** Nodes section ***************************

  // Update the nodes...
  let i = 0; // Declare the variable i
  const node = svg
    .selectAll("g.node")
    .data(nodes, (d: any) => d.id || (d.id = ++i));

  // Enter any new modes at the parent's previous position.
  const nodeEnter = node
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", (d: any) => `translate(${d.y},${d.x})`)
    .on("click", click);

  // Add Circle for the nodes
  nodeEnter
    .append("circle")
    .attr("class", "node")
    .attr("r", 10)
    .style("fill", "#fff");

  // Add labels for the nodes
  nodeEnter
    .append("text")
    .attr("dy", ".35em")
    .attr("x", (d: any) => (d.children || d._children ? -13 : 13))
    .attr("text-anchor", (d: any) =>
      d.children || d._children ? "end" : "start"
    )
    .text((d: any) => d.data.name);

  // ****************** Links section ***************************

  // Update the links...
  const link = svg.selectAll("path.link").data(links, (d: any) => d.id);

  // Enter any new links at the parent's previous position.
  const linkEnter = link
    .enter()
    .insert("path", "g")
    .attr("class", "link")
    .attr("d", (d: any) => {
      const o = { x: d.x, y: d.y };
      return diagonal(o, o);
    });

  // Update the links...
  const linkUpdate = linkEnter.merge(link as any);

  // Transition back to the parent element position
  linkUpdate
    .transition()
    .duration(500)
    .attr("d", (d: any) => diagonal(d, d.parent));

  // Creates a curved (diagonal) path from parent to the child nodes
  function diagonal(s: { x: number; y: number }, d: { x: number; y: number }) {
    const path = `M ${s.y} ${s.x}
                      C ${(s.y + d.y) / 2} ${s.x},
                        ${(s.y + d.y) / 2} ${d.x},
                        ${d.y} ${d.x}`;

    return path;
  }

  // Toggle children on click.
  function click(event: MouseEvent, d: any) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    update(d);
  }

  function update(source: any) {
    // Assigns the x and y position for the nodes
    const treeData = treemap(root as HierarchyNode<TaxonomyNode>);

    // Compute the new tree layout.
    const nodes = treeData.descendants();
    const links = treeData.descendants().slice(1);

    // Normalize for fixed-depth.
    nodes.forEach((d) => {
      d.y = d.depth * horizontalSpacing;
      d.x = d.x * verticalSpacing;
    });

    // Update the nodes...
    const node = svg
      .selectAll("g.node")
      .data(nodes, (d: any) => d.id || (d.id = ++i));

    // Enter any new nodes at the parent's previous position.
    const nodeEnter = node
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d: any) => `translate(${source.y0},${source.x0})`)
      .on("click", click);

    // Add Circle for the nodes
    nodeEnter
      .append("circle")
      .attr("class", "node")
      .attr("r", 10)
      .style("fill", (d: any) => (d._children ? "lightsteelblue" : "#fff"));

    // Add labels for the nodes
    nodeEnter
      .append("text")
      .attr("dy", ".35em")
      .attr("x", (d: any) => (d.children || d._children ? -13 : 13))
      .attr("text-anchor", (d: any) =>
        d.children || d._children ? "end" : "start"
      )
      .text((d: any) => d.data.name);

    // UPDATE
    const nodeUpdate = nodeEnter.merge(node as any);

    // Transition to the proper position for the node
    nodeUpdate
      .transition()
      .duration(500)
      .attr("transform", (d: any) => `translate(${d.y},${d.x})`);

    // Update the node attributes and style
    nodeUpdate
      .select("circle.node")
      .attr("r", 10)
      .style("fill", (d: any) => (d._children ? "lightsteelblue" : "#fff"))
      .attr("cursor", "pointer");

    // Remove any exiting nodes
    const nodeExit = node
      .exit()
      .transition()
      .duration(500)
      .attr("transform", (d: any) => `translate(${source.y},${source.x})`)
      .remove();

    // On exit reduce the node circles size to 0
    nodeExit.select("circle").attr("r", 1e-6);

    // On exit reduce the opacity of text labels
    nodeExit.select("text").style("fill-opacity", 1e-6);

    // Update the links...
    const link = svg.selectAll("path.link").data(links, (d: any) => d.id);

    // Enter any new links at the parent's previous position.
    const linkEnter = link
      .enter()
      .insert("path", "g")
      .attr("class", "link")
      .attr("d", () => {
        const o = { x: source.x, y: source.y };
        return diagonal(o, o);
      });

    // UPDATE
    const linkUpdate = linkEnter.merge(link as any);

    // Transition back to the parent element position
    linkUpdate
      .transition()
      .duration(500)
      .attr("d", (d: any) => diagonal(d, d.parent));

    // Remove any exiting links
    const linkExit = link
      .exit()
      .transition()
      .duration(500)
      .attr("d", () => {
        const o = { x: source.x, y: source.y };
        return diagonal(o, o);
      })
      .remove();

    // Store the old positions for transition.
    nodes.forEach((d: any) => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  // Store the old positions for transition.
  nodes.forEach((d: any) => {
    d.x0 = d.x;
    d.y0 = d.y;
  });
});
