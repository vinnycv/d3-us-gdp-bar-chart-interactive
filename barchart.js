// apply attr('id', '...') to all elements created
// use variables as much as possible
// make svg area
// fetch the data
// inside the fetch, perform the graph creation
// use then, 
//   apply titles, these are texts elements, transformed to place
//   create years array w data for the labels, show year and Q
//   create date array w data either storing an actual date with new Date or just the dates?
//   set x scale with dates as domain and width as range
//   create x axis var: d3.append('axisBottom').scale(x scale)
//    append this to svg container as g element and call x axis
//   store yaxis data in new array, and its max too maybe
//   create y scale with scaleLinear
//   create yaxis with append g and call y scale
//   create rects with gdp data, prescaled or scale in creation
//   add attr for the data-gdp and data-date
//   set x, y , height, width - width is only trickier one where you combine your x scale fn with years date array
//   use mouseover and mouseout to set tooltip and overlay


// Sometimes the last test fails and says the tooltip data-date attribute does not equal what is expected but if you scroll down to the tooltip and un-comment the console.log you'll see it does in fact equal the data point from the raw json
import * as d3 from 'd3';
import './style.css'


const h = 600;
const w = 1000;
// const padLR = 60;
const pad = 60;
const barWidth = (w - 2*pad)/275;

const svg = d3.select(".container")
              .append("svg")
              .attr("height", h)
              .attr("width", w)
              .style("background-color", "wheat");

const graphTitle = svg.append("text")
                        .attr("id", "title")
                        .text("United States GDP Growth")
                        .style("font-size", "2rem")
                        .style("transform", `translate(${w/3 + "px"}, ${pad + "px"})`);

const tooltip = d3.select(".container")
                  .append("div")
                  .attr("id", "tooltip")

                  .style("opacity", 0);

const overlay = d3.select(".container")
                  .append("div")
                  .attr("class", "overlay")
                  .style("opacity", 0);

d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json")
  .then((response) => {
  const data = response.data;
  const dates = data.map((d) => new Date(d[0]));
  const gdpMax = d3.max(data, (d) => d[1]);
  const years = data.map((d) => {
    let Q;
    switch (d[0][6]) {
      case '1': Q = "Q1"; break;
      case '4': Q = "Q2"; break;
      case '7': Q = "Q3"; break;
      case '0': Q = "Q4"; break;
    }
    return d[0].substring(0, 4) + " " + Q;
  });

  const xTitle = svg.append("text")
                    .text("Date")
                    .style("transform", `translate(${w/2 + "px"}, ${h - pad/3 + "px"})`);
  
  const yTitle = svg.append("text")
                    .text("Gross Domestic Product (billions)")
                    .style("transform", `translate(${pad + 20 + "px"}, ${h/2 + "px"}) rotate(-90deg)`);
  
  const xScale = d3.scaleTime()
                   .domain([d3.min(dates), d3.max(dates)])
                   .range([0, w - 2*pad]);
  
  const xAxis = d3.axisBottom(xScale);
  svg.append("g")
     .attr("id", "x-axis")
     .attr("transform", `translate(${pad}, ${h - pad})`)
     .call(xAxis);
  
  const yScale = d3.scaleLinear()
                   .domain([0, gdpMax])
                   .range([h - 2*pad, 0]);
  
  const yAxis = d3.axisLeft(yScale);
  svg.append("g")
     .attr("id", "y-axis")
     .attr("transform", `translate(${pad}, ${pad})`)
     .call(yAxis);
  
  const gdpLinearScale = d3.scaleLinear().domain([0, gdpMax]).range([0, h - 2*pad]);
  const scaledGDP = data.map((d) => gdpLinearScale(d[1]));
  
  svg.selectAll("rect")
     .data(scaledGDP).enter()
     .append("rect")
     .attr("x", (d, i) => pad + i * (w - 2*pad)/275)
     .attr("y", (d) => h - pad - d)
     .attr("height", (d) => d)
     .attr("width", barWidth)
     .style("fill", "orange")
     .attr("class", "bar")
     .attr("data-date", (d, i) => data[i][0])
     .attr("data-gdp", (d, i) => data[i][1])
     .attr("index", (d, i) => i)
     .on("mouseover", (event, d) => {
        const i = event.target.getAttribute("index");
        overlay.transition().duration(0)
               .style("width", barWidth + "px")
               .style("height", d + "px")
               .style("opacity", 1)
               .style("top", h - pad - d + "px")
               .style("left", pad + i * barWidth + "px");
    
    // Sometimes the last test fails and says the data-date attr does not equal but if you un-comment the console.log below you'll see it does in fact equal the data point from the raw json
        console.log(data[i][0]);
        tooltip.transition().duration(0)
               .attr("data-date", data[i][0])
               .style("opacity", "0.8")
               .style("top", event.layerY - 30 + "px")
               .style("left", pad + i*barWidth + 20 + "px");
               tooltip.html(
                years[i] + "<br>" + "$"
                 + data[i][1].toFixed(1).toString().replace(/(\d+)(?=\d{3})/, '$1,')
                + " Billion"
               )
              
     })
    .on("mouseout", (event) => {
      overlay.transition().duration(200).style("opacity", "0");
      tooltip.transition().duration(200).style("opacity", "0");
  });
})
.catch(error => console.log(error));


// export function setupCounter(element) {
//   let counter = 0
//   const setCounter = (count) => {
//     counter = count
//     element.innerHTML = `count is ${counter}`
//   }
//   element.addEventListener('click', () => setCounter(counter + 1))
//   setCounter(0)
// }
