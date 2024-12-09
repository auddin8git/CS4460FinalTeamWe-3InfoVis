{
const fixedrectHeight = 20;
const fixedrectWidth = 0;

const margin = { top: 40, right: 10, bottom: 60, left: 60 }; // right: 10 or 150

//CHANGE GRAPH SIZES
const width = 400 - margin.left - margin.right; // normally 800
const height = 500 - margin.top - margin.bottom + fixedrectHeight;

// CHANGE GRAPH X AND Y POSITION USING CSS: TRANSLATE
const chartContainer = document.getElementById("#all-content");
// chartContainer.style.transform = "translateX(100px)";
// chartContainer.style.transform = "translateY(0px)";

// CHANGE INFO BOX + IMAGE BOX SIZES
const subContainerWidth = "250px"; // normally 250px
const imageBoxWidth = "300px"; // normally 300px

d3.select("#sub-containerCOMPLEX")
  .style("width", subContainerWidth);
d3.select('#info-boxCOMPLEX')
  .style("width", subContainerWidth);
d3.select("#image-boxCOMPLEX")
  .style("width", imageBoxWidth);


const minYear = 1990;
const maxYear = 2024;

const xRanges = [
  { start: 1990, end: 2000 },
  { start: 1990, end: 2010 },
  { start: 1990, end: 2024 },
];

const networkColors = {
  "netflix": "#8dd3c7",
  "fox": "#ffffb3",
  "disney+": "#bebada",
  "cbs": "#fb8072",
  "prime video": "#80b1d3",
  "nbc": "#fdb462",
  "hulu": "#b3de69"
};

// Create SVG
const svg = d3
  .select("#chartCOMPLEX")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Add chart title
svg
  .append("text")
  .attr("class", "chart-titleCOMPLEX")
  .attr("x", width / 2)
  .attr("y", -10)
  .style("text-anchor", "middle")
  .style("font-size", "16px")
  .style("font-weight", "bold");

// Create tooltip
const tooltip = d3
  .select("#page6")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// Create color scale
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

const validNetworks = ["netflix", "fox", "disney+", "cbs", "prime video", "nbc", "hulu"];
const validShows = [""]

d3.csv("use_these_shows.csv").then(function (data) {
  // Process the data
  data.forEach((d) => {
    const parsedDate = new Date(d.first_air_date);
    d.firstYear = !isNaN(parsedDate) ? parsedDate.getFullYear() : null;
    d.lastYear = !isNaN(new Date(d.last_air_date)) ? new Date(d.last_air_date).getFullYear() : null;
    d.vote_count = +d.vote_count;
    d.popularity = +d.popularity;

    try {
      d.networks = JSON.parse(d.networks.replace(/'/g, '"'));
    } catch (e) {
      d.networks = d.networks.split(",").map((network) => ({ name: network.trim() }));
    }
    d.networks = d.networks.filter((network) => validNetworks.includes(network.name));
  });

  // Function to get the highest-rated show by network for each year and metric
  function getFilteredShows(network, metric) {
    // Filter data for the given network
    const filteredData = data.filter((d) => {
      // console.log("d.networks", d.networks);
      return (
        d.networks.some((net) => net.name.trim().toLowerCase() == network.name.trim().toLowerCase())
      );
    });
  
    // Return all shows in the desired format
    return filteredData.map((d) => {
      const showMetric = metric === "vote_count" ? d.vote_count : d.popularity;
      return {
        show: d.name,
        value: showMetric,
        year: 0,
        showData: d,
      };
    });
  }
  
  // Continue with the rest of your code to render the chart
  // Scales for x and y
  const x = d3.scaleLinear().domain([minYear, maxYear]).range([0, width]);
  const y = d3.scaleLinear().range([height, 0]);

  // Add axes
  const xAxis = svg.append("g").attr("transform", `translate(0,${height})`);
  const yAxis = svg.append("g");

  xAxis.transition().duration(750)
    .call(d3.axisBottom(x)
    .ticks(d3.timeYear.every(1))  // Creates a tick for every year
    .tickFormat(d3.format("d"))); // Format ticks as plain numbers (e.g., 1990, 1991, ...)

  // Optional: Rotate the tick labels for better readability
  xAxis.selectAll("text")
      .style("text-anchor", "middle")
      .attr("transform", "rotate(-90)")  // Rotate labels if necessary
      .style("font-size", "10px");

  // Add axis labels
  svg
    .append("text")
    .attr("class", "axis-labelCOMPLEX")
    .attr("transform", `translate(${width / 2},${height + 40})`)
    .style("text-anchor", "middle")
    .text("Year");

  const yLabel = svg
    .append("text")
    .attr("class", "axis-labelCOMPLEX")
    .attr("transform", "rotate(-90)")
    .attr("y", -40)
    .attr("x", -height / 2)
    .style("text-anchor", "middle");

  function updateChart() {
    // const year = document.getElementById("year-sliderCOMPLEX").value;
    const metric = document.getElementById("metricSelectorCOMPLEX").value;

    // Get highest-rated shows for each network
    let showData = validNetworks.map((network) => getFilteredShows({ name: network }, metric));
    let networkData = [];

    for (let i = 0; i < showData.length; i++) {
      for (let j = 0; j < showData[i].length; j++) {
        networkData.push(showData[i][j]);
      }
    }

    console.log("networkData", networkData)

    // Update the y-axis domain based on metric
    y.domain([0, d3.max(networkData, (d) => d.value)]);

    // Update the axes
    // xAxis.transition().duration(750).call(d3.axisBottom(x).tickFormat(d3.format("d")));
    yAxis.transition().duration(750).call(d3.axisLeft(y));

    yLabel.text(metric === "vote_count" ? "Vote Count" : "Popularity")
      .attr("dy", -5)

    // Create rectangles for the highest-rated shows
    const rectangles = svg.selectAll(".rect").data(networkData);

    rectangles.exit().remove(); // Remove old rectangles

    // Add new rectangles
    const newRects = rectangles.enter().append("rect").attr("class", "rect");

    // Merge and update rectangles
    rectangles
      .merge(newRects)
      .transition()
      .duration(750)
      .attr("x", (d) => {
        // Ensure x starts at minYear for shows that started earlier
        const startYear = Math.max(d.showData.firstYear, minYear);
        return x(startYear) - fixedrectWidth / 2; // Calculate x position
      })
      .attr("width", (d) => {
        // Check if the show is only one year long
        const width = d.showData.firstYear === d.showData.lastYear
          ? fixedrectWidth // Use fixed width for shows that are only one year long
          : x(d.showData.lastYear) - x(d.showData.firstYear) + fixedrectWidth; // Use calculated width for multi-year shows
        return width;
      })
      .attr("y", (d) => {
        const centerY = y(d.value); // Center the rectangle at the vote count or popularity
        return centerY - fixedrectHeight / 2; // Adjust to center it with a fixed height
      })
      .attr("height", fixedrectHeight) // Fixed height of the rectangle
      .style("opacity", 0.5)
      .attr("fill", (d) => networkColors[d.showData.networks[0].name.toLowerCase()]);

    // Add tooltip events
    svg
      .selectAll(".rect")
      .on("mouseover", function (event, d) {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip
          .html(`
            <strong>${d.showData.name}</strong><br/>
            ${metric === "vote_count" ? "Votes: " : "Popularity: "} ${d.value}<br/>
            Network: ${d.showData.networks.map(net => net.name).join(', ')}<br/>
            First Year: ${d.showData.firstYear}<br/>
            Last Year: ${d.showData.lastYear}
          `)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function () {
        tooltip.transition().duration(500).style("opacity", 0);
      });

    // Add click event to update the info box
    svg.selectAll(".rect")
    .on("click", function (event, d) {
      d3.select(this).raise();
      const content = customContent[d.showData.name];
      const message = content ? content.msg : "No custom message available for this show.";
      const image = content ? content.image : ".ColorBars.png"; // Default image in the folder
      console.log(image)
      const imageBox = d3.select("#image-boxCOMPLEX");
      const infoBox = d3.select('#info-boxCOMPLEX')

      imageBox.html(`
        <img src="${image}" alt="Image for ${d.showData.name}" style="width: 100%; border-radius: 8px; margin-top: 25px;"/>
      `);
      infoBox.html(`
        <p>${message}</p>
      `);

      d3.selectAll(".rect").attr("stroke", "none");
      d3.select(this).attr("stroke", "black").attr("stroke-width", 2);

      event.stopPropagation();
    });
  }
  console.log("HERE")

  // Add a click listener to the entire SVG or document
  d3.select("#page6").on("click", function (event) {
    const isRectangle = event.target.tagName === "rect";
    if (!isRectangle) {
      d3.selectAll(".rect").attr("stroke", "none");
      d3.select("#info-boxCOMPLEX").html("<p>Click on a bar to see details here.</p>");
      d3.select("#image-boxCOMPLEX").html(`<img src="ColorBars.png" alt="Image for BLANK" style="width: 100%; border-radius: 8px; margin-top: 25px;"/>`);
    }
  });

  let currentRangeIndex = 0;

  document
  .getElementById("changeXAxisButtonCOMPLEX")
  .addEventListener("click", () => {
    currentRangeIndex = (currentRangeIndex + 1) % xRanges.length;
    updateXAxisRange();
  });

  // Update x-axis range function
  function updateXAxisRange() {
    const { start, end } = xRanges[currentRangeIndex];
    x.domain([start, end]);
    xAxis.transition().duration(750).call(d3.axisBottom(x).tickFormat(d3.format("d")));
    updateChart();
  }

  const legendContainer = d3.select("#legendCOMPLEX");
  const legend = legendContainer
    .append("svg")
    // .attr("width", width + margin.left + margin.right)
    // .attr("height", height + margin.top + margin.bottom)
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .attr("text-anchor", "middle")

    .attr("transform", `translate(${length + 20}, 0)`); // normally 20

  const legend_networks = [...new Set(data.map((d) => d.networks[0].name))];
  legend_networks.forEach((network, i) => {
    const legendItem = legend
      .append("g")
      .attr("transform", `translate(0, ${i * 20})`);

    // Add the colored box
    legendItem
      .append("rect")
      .attr("text-anchor", "start")
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", networkColors[network.toLowerCase()]) // Use the color for the network
      .style("opacity", 0.5)

    // Add the text (network name)
    legendItem
      .append("text")
      .attr("text-anchor", "start")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .text(network);
  });

  // Event Listener
  document
    .getElementById("metricSelectorCOMPLEX")
    .addEventListener("change", updateChart);

  // Initial rendering
  // updateChart();
  updateXAxisRange();
});

const customContent = {
  "Breaking Bad": {
    msg: "While \"Breaking Bad\" originally aired on AMC, it became a massive hit on Netflix and is considered one of the best shows in television history. Netflix's instant streaming model helped the show gain a new audience, particularly during its later seasons. The ability to binge-watch the series allowed fans to experience the show's intense storytelling in a new way, contributing to its cultural impact and boosting its and Netflix's popularity.",
    image: "BreakingBad.jpg"
  },
  "Orange Is the New Black": {
    msg: "\"Orange Is the New Black\" (2013) was one of Netflix's first original series, signaling the company’s transition to producing original content. These shows were ground-breaking for the platform because they showed that Netflix could not only be a distributor but also a producer of high-quality, award-winning television, which helped it grow into a global entertainment powerhouse.",
    image: "oisnb.jpg"
  },
  "The Simpsons": {
    msg: "\"The Simpsons\" (1989–present) became an iconic animated series that established Fox's reputation for bold and edgy content. The show’s cultural influence and ability to attract both critical and commercial success cemented Fox’s place in TV history.",
    image: "Simpsons.jpg"
  },
  "24": {
    msg: "\"24\" (2001–2010) redefined the procedural genre with its real-time format and intense storytelling, introducing a more serialized narrative structure on network television. This show’s innovative format and suspense-driven plotlines helped Fox maintain its relevance and push boundaries in the 2000s.",
    image: "24.jpg"
  },
  "Empire": {
    msg: "\"Empire\" (2015–2020) was a cultural phenomenon that blended drama, music, and social issues. The show’s success helped Fox tap into diverse audiences and break new ground in terms of representation and storytelling, solidifying Fox as a major player in the entertainment world.",
    image: "Empire.jpg"
  },
  "Hannah Montana": {
    msg: "The creation of \"Hannah Montana\" (2006–2011) on the Disney Channel was pivotal for Disney's domination in the children's and pre-teen market. This show helped to solidify Disney Channel as a powerhouse in youth-focused entertainment. Although not a part of Disney+, shows on the Disney Channel garnered approval and aided the later arrival of Disney+.",
    image: "HannahMontana.jpg"
  },
  "The Mandalorian": {
    msg: "\"The Mandaloiran\" (2019) marked Disney+’s grand entry into streaming and made a massive impact. As the first live-action Star Wars series, it not only solidified the Star Wars franchise’s continued success but also helped Disney+ establish itself as a major player in streaming by attracting both new and nostalgic fans. This success demonstrated the potential of Disney's vast content library.",
    image: "Mandalorian.jpg"
  },
  "Frasier": {
    msg: "\"Frasier\" (1993–2004) became one of the most critically acclaimed sitcoms of its time, winning multiple Emmys, including Outstanding Comedy Series, and was praised for its witty writing, sophisticated humor, and strong ensemble cast. It became one of CBS's flagship shows throughout its run, consistently drawing large audiences and helping to solidify the network's position as a leader in prime-time sitcoms.",
    image: "Frasier.jpg"
  },
  "Survivor": {
    msg: "\"Survivor\" (2000–present) was a groundbreaking reality TV show that became a cultural phenomenon. Its success brought millions of viewers to CBS and helped establish the network as a leader in unscripted content, pushing CBS into the mainstream reality TV market.",
    image: "Survivor.jpg"
  },
  "The Big Bang Theory": {
    msg: "\"The Big Bang Theory\" (2007–2019) became one of the most successful sitcoms of all time. It helped CBS build a loyal audience base, particularly with younger viewers, and provided a huge ratings boost. The show’s success, combined with its syndication deals, made it one of the highest-grossing TV series for CBS.",
    image: "BigBangTheory.jpg"
  },
  "The Marvelous Mrs. Maisel": {
    msg: "\"The Marvelous Mrs. Maisel\" (2017–2023) was a game-changer for Amazon Prime Video, receiving critical acclaim and multiple awards. This show demonstrated Amazon’s ability to compete with traditional television networks and streaming services like Netflix by creating high-quality, engaging original content that appealed to both critics and audiences.",
    image: "MarvelousMrsMaisel.jpg"
  },
  "The Boys": {
    msg: "\"The Boys\" (2019-2022) revolutionized the superhero genre by subverting typical superhero tropes. It is a dark, violent, and satirical look at the world of corrupt superheroes. The series' success helped solidify Prime Video as a provider of edgy, high-quality original content. \"The Boys\" is not only a fan favorite but also a critical success, praised for its sharp writing, acting, and unique take on the superhero genre.",
    image: "TheBoys.jpg"
  },
  "Friends": {
    msg: "\"Friends\" (1994–2004) was one of NBC’s most influential shows during the 1990s, which along with another NBC show, \"Seinfeld\" (1989–1998), shaped the sitcom genre. Friends helped NBC dominate the primetime slot and became a cultural milestone, attracting millions of viewers worldwide.",
    image: "Friends.jpeg"
  },
  "The Office": {
    msg: "\"The Office\" (U.S., 2005–2013) redefined sitcoms with its mockumentary format and quirky characters. It gained a cult following and helped NBC maintain its relevancy in the competitive TV landscape of the 2000s, especially after the end of \"Friends\".",
    image: "TheOffice.jpg"
  },
  "This Is Us": {
    msg: "\"This Is Us\" (2016–2022) was one of the most critically acclaimed dramas of the decade and helped NBC regain its dominance in the drama space. It created a buzz for its emotionally powerful storytelling, and its success helped boost the network's ratings and reputation for high-quality, character-driven narratives.",
    image: "ThisIsUs.jpg"
  },
  "Lost": {
    msg: "\"Lost\" (2004–2010) is considered one of the most influential and groundbreaking shows of the early 2000s, and its availability on Hulu played a significant role in the network’s growth. \"Lost\" became a key part of the platform’s offering, helping to draw in new Hulu subscribers who wanted to binge-watch this cultural touchstone.",
    image: "Lost.jpg"
  },
  "The Handmaid's Tale": {
    msg: "\"The Handmaid's Tale\" (2017–present) was Hulu’s first major original series and earned critical acclaim, including several Emmy Awards. The show helped Hulu solidify itself as a serious competitor in the original content space, comparable to Netflix and Amazon Prime Video.",
    image: "HandmaidsTale.jpeg"
  },
  // Add more messages for other shows
};
}