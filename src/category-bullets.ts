import * as d3 from "d3";
import taxonomy from "./data/taxonomy.json";
import { TaxonomyData, Category } from "./interfaces";

// Update the type of taxonomy
const taxonomyData: TaxonomyData = taxonomy as TaxonomyData;

// Extract top-level categories
const categories: Category[] = taxonomyData.children;
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
  .text((d: Category) => d.name) // Assuming 'name' is the property you want to display
  .call((selection) => wrap(selection as any, 120)); // Use type assertion

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
