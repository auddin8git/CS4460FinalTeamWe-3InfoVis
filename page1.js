document.addEventListener("DOMContentLoaded", function() {
  // Streaming service data with logos
  const data = [
    { service: "Netflix", date: new Date("August 29, 1997"), logo: "netflix.png" },
    { service: "Fox", date: new Date("October 9, 1986"), logo: "fox.png" },
    { service: "Disney+", date: new Date("November 12, 2019"), logo: "disneyplus.png" },
    { service: "CBS", date: new Date("January 1, 1929"), logo: "cbs.png" },
    { service: "Prime Video", date: new Date("September 7, 2006"), logo: "primevideo.png" },
    { service: "NBC", date: new Date("November 15, 1926"), logo: "nbc.png" },
    { service: "Hulu", date: new Date("October 29, 2007"), logo: "hulu.png" },
  ];

  // Sort data by date
  data.sort((a, b) => a.date - b.date);

  // Set up SVG dimensions and margins
  const margin = { top: 20, right: 30, bottom: 70, left: 50 };
  const width = 900 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Append the SVG container
  const svg = d3
    .select("#timeline")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Tooltip setup
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // Add tip popup
  const tipPopup = d3
    .select("#timeline")
    .append("div")
    .attr("class", "tip-popup")
    .style("opacity", 1)
    .html(
      `<div class="tip-popup-content">
        <p>Hover over the logos to view the dates</p>
        <span class="close-btn">&times;</span>
      </div>`
    );

  // Close button functionality
  d3.select(".close-btn").on("click", function() {
    tipPopup.style("opacity", 0).style("pointer-events", "none");
  });

  // Define scales
  const xScale = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => d.date))
    .range([0, width]);

  // Draw timeline line
  svg
    .append("line")
    .attr("x1", 0)
    .attr("y1", height / 2)
    .attr("x2", width)
    .attr("y2", height / 2)
    .attr("stroke", "#333")
    .attr("stroke-width", 2);

  // Draw tick marks on the timeline line
  svg
    .selectAll(".tick")
    .data(xScale.ticks(data.length))
    .enter()
    .append("line")
    .attr("class", "tick")
    .attr("x1", (d) => xScale(d))
    .attr("y1", height / 2 - 5)
    .attr("x2", (d) => xScale(d))
    .attr("y2", height / 2 + 5)
    .attr("stroke", "#333")
    .attr("stroke-width", 1);

  // Add logos to the timeline
  svg
    .selectAll(".logo")
    .data(data)
    .enter()
    .append("image")
    .attr("x", (d) => xScale(d.date) - 30) // Center the logo
    .attr("y", (d, i) => (i % 2 === 0 ? height / 2 - 130 : height / 2 + 120)) // Adjust vertical distance
    .attr("width", 60) // Increase logo size
    .attr("height", 60) // Increase logo size
    .attr("xlink:href", (d) => d.logo)
    .on("mouseover", function (event, d) {
      tooltip
        .transition()
        .duration(200)
        .style("opacity", 0.9);
      tooltip
        .html(
          `<div class="tooltip-content">
            <strong>Service:</strong> ${d.service}<br/>
            <strong>Launch Date:</strong> ${d3.timeFormat("%B %d, %Y")(d.date)}
          </div>`
        )
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mousemove", function (event) {
      tooltip
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", function () {
      tooltip.transition().duration(500).style("opacity", 0);
    });

  // Draw X-axis on the timeline line
  const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b %d, %Y")).ticks(data.length);
  svg
    .append("g")
    .attr("transform", `translate(0,${height / 2})`) // Align the axis with the timeline line
    .call(xAxis)
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");
});