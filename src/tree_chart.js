// Set the dimensions and margins of the diagram
const margin = { top: 20, right: 90, bottom: 30, left: 90 },
    width = 1200 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// Append the SVG object to the body of the page
const svg = d3.select("#tree-container").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Create the tree layout
const treemap = d3.tree().size([height, width]);

// Function to prune the tree and keep the path to the target category and its siblings
function pruneTreeToCategoryWithSiblings(root, targetName) {
    if (root.children) {
        for (let child of root.children) {
            if (child.data.name === targetName) {
                // Found the target, keep all siblings
                return root;
            } else {
                const result = pruneTreeToCategoryWithSiblings(child, targetName);
                if (result) {
                    // Keep this branch and prune others
                    root.children = [child];
                    return root;
                }
            }
        }
        // If none of the children lead to the target, remove them
        root.children = null;
    }
    return null;
}

// Load the JSON data
d3.json("taxonomy_v2.json").then(data => {
    // Convert the data to a hierarchical format
    const root = d3.hierarchy(data, d => d.children);

    // Specify the target category name
    const categoryName = "Comedy Films";

    // Prune the tree to keep only the path to the target category and its siblings
    const prunedRoot = pruneTreeToCategoryWithSiblings(root, categoryName);

    if (!prunedRoot) {
        console.error(`Category "${categoryName}" not found in the data.`);
        return;
    }

    // Compute the new tree layout
    const treeData = treemap(prunedRoot);

    // Get the nodes and links from the tree data
    const nodes = treeData.descendants(),
          links = treeData.descendants().slice(1);

    // Normalize for fixed-depth
    nodes.forEach(d => {
        d.y = d.depth * 180; // Adjust horizontal spacing
    });

    // ****************** Nodes section ***************************

    let i = 0;

    const node = svg.selectAll('g.node')
        .data(nodes, d => d.id || (d.id = ++i));

    // Enter new nodes at the parent's previous position
    const nodeEnter = node.enter().append('g')
        .attr('class', 'node')
        .attr('transform', d => "translate(" + d.y + "," + d.x + ")");

    // Add Circle for the nodes
    nodeEnter.append('circle')
        .attr('class', 'node')
        .attr('r', 10)
        .style('fill', '#fff');

    // Add labels for the nodes
    nodeEnter.append('text')
        .attr('dy', '.35em')
        .attr('x', d => d.children ? -13 : 13)
        .attr('text-anchor', d => d.children ? 'end' : 'start')
        .text(d => d.data.name);

    // ****************** Links section ***************************

    const link = svg.selectAll('path.link')
        .data(links, d => d.id);

    // Enter new links at the parent's previous position
    const linkEnter = link.enter().insert('path', 'g')
        .attr('class', 'link')
        .attr('d', d => {
            const o = { x: d.x, y: d.y };
            return diagonal(o, o);
        });

    // Update the links
    const linkUpdate = linkEnter.merge(link);

    // Transition to the new link positions
    linkUpdate.transition()
        .duration(500)
        .attr('d', d => diagonal(d, d.parent));

    // Creates a curved path from parent to the child nodes
    function diagonal(s, d) {
        const path = `M ${s.y} ${s.x}
                      C ${(s.y + d.y) / 2} ${s.x},
                        ${(s.y + d.y) / 2} ${d.x},
                        ${d.y} ${d.x}`;
        return path;
    }
});