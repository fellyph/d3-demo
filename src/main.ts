import "./style.css";
import * as d3 from "d3";
import taxonomy from "./data/taxonomy.json";

const app = document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = `
  <h1>Taxonomy Categories</h1>
`;

// Extract top-level categories
const categories = taxonomy.children.map((child) => child.name);
const columns = 6;

const svg = d3
  .select("#app")
  .append("svg")
  .attr("width", 1200)
  .attr("height", 800);

const circleGroup = svg
  .selectAll("g")
  .data(categories)
  .enter()
  .append("g")
  .attr(
    "transform",
    (_, i) =>
      `translate(${(i % columns) * 160 + 100}, ${
        Math.floor(i / columns) * 160 + 100
      })`
  );

circleGroup
  .append("circle")
  .attr("r", 70)
  .attr("fill", "lightblue")
  .attr("stroke", "navy")
  .attr("stroke-width", 2);

circleGroup
  .append("text")
  .attr("text-anchor", "middle")
  .attr("dy", "0.3em")
  .attr("font-size", "1em")
  .text((d) => d)
  .call(wrap, 120);

// Function to wrap text
function wrap(
  text: d3.Selection<d3.BaseType, string, d3.BaseType, unknown>,
  width: number
) {
  text.each(function () {
    const text = d3.select(this);
    const words = text.text().split(/\s+/).reverse();
    let word;
    let line: string[] = [];
    let lineNumber = 0;
    const lineHeight = 1.1;
    const y = text.attr("y");
    const dy = parseFloat(text.attr("dy") || "0");
    let tspan = text
      .text(null)
      .append("tspan")
      .attr("x", 0)
      .attr("y", y)
      .attr("dy", dy + "em");

    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(" "));
      if ((tspan.node()?.getComputedTextLength() || 0) > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text
          .append("tspan")
          .attr("x", 0)
          .attr("y", y)
          .attr("dy", ++lineNumber * lineHeight + dy + "em")
          .text(word);
      }
    }
  });
}
