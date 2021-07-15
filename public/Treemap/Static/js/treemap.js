var treemap = d3.select("#my_dataviz"); //Select the div tag..

// Function to clear the html page...
function cleardata()
{
     treemap.html("");
};


// function for the treemap
function tree()
{
  cleardata();
  // set the dimensions and margins of the graph
  var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 1400 - margin.left - margin.right,
    height = 1400 - margin.top - margin.bottom;
  
  // append the svg object to the body of the page
  var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

  // read json data
  d3.json("./Treemap/Resources/P_ThreeRaviStockInfo.json").then(function(data)  {

    //console.log(data.forEach(vol => vol.Ticker));
      // Give the data to this cluster layout:
      var root = d3.hierarchy(data)
      .sum(function(d)
      { 
  
        return Math.abs((((d.Cmo2-d.Omo1)/d.Omo1)*100)) ;// Here the size of each leave is given in the 'value' field in input data
      });
      
      // console.log(root);
      // Then d3.treemap computes the position of each element of the hierarchy
      d3.treemap()
        .size([width, height])
        .padding(8)
        (root)
      
      // color for the sector...
      var fader = function(color) { return d3.interpolateRgb(color, "#fff")(0.2); };
      var color = d3.scaleOrdinal(d3.schemeCategory20.map(fader))
      //var color4 = d3.interpolateRdYlGn(0,1)


      // create a tooltip
      var Tooltip = d3.select("body")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "grey")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("position","absolute")
        .style("padding", "10px")

      // Three function that change the tooltip when user hover / move / leave a cell

      // on mouse over function...
      var mouseover = function(d) 
      {
        Tooltip
          .style("opacity", 1)  // Show the Tooltip
        d3.select(this)
        
          .style("stroke", "black") // for the ticker box border...
          .style("opacity", 1)
      };

      // on mouse move function...
      var mousemove = function(d) 
      {
        Tooltip  // Display inside the tooltip block... 
          .html(`<strong> Ticker:</strong> ${d.data.Ticker} <br>
          <strong> Company Name:</strong> ${d.data.name} <br>
          <strong> Sector:</strong> ${d.data.sector} <br> 
          <strong> Highest Price(May-Jun 2021):</strong> ${Math.max(d.data.Hmo1,d.data.Hmo2)} <br>
          <strong> Lowest Price (May-Jun 2021):</strong> ${Math.min(d.data.Lmo1,d.data.Lmo2)} <br>
          <strong> Volume:</strong> ${d.data.Vmo2} <br>
          <strong> % Change (May-Jun 2021):</strong> ${Math.round(((((d.data.Cmo2-d.data.Omo1)/d.data.Omo1)*100) + Number.EPSILON)*100) / 100} %`)
          .style("left", (d3.mouse(this)[0]+ 70) + "px")
          .style("top", (d3.mouse(this)[1]) + "px")

      
          
      //console.log(d.data.Ticker)
      };

      // on mouseleave function...
      var mouseleave = function(d) 
      {
        Tooltip
          .style("display", "block")
          .style("opacity", 0) //Close the Tooltip outside the Ticker box or Treemap...
        d3.select(this)
          .style("stroke", "white")
          .style("opacity", 1)  // for the Ticker box border
      };
      // use this information to add rectangles:
      svg
        .selectAll("rect")
        .data(root.leaves())
        .enter()
        .append("rect")
          .attr('x', function (d) { return d.x0; })
          .attr('y', function (d) { return d.y0; })
          .attr('width', function (d) { return d.x1 - d.x0; })
          .attr('height', function (d) { return d.y1 - d.y0; })
          .style("stroke", "white")
          .on("mouseover", mouseover) // rect
          .on("mouseleave", mouseleave) //rect & the tooltip
          .on("mousemove", mousemove) //tooltip
          
          
          .attr("fill", function (d)
          {
            if ((((d.data.Cmo2-d.data.Omo1)/d.data.Omo1)*100) <= -31)
            {
              return "#FF0000";
            }
            else if (((((d.data.Cmo2-d.data.Omo1)/d.data.Omo1)*100) > -31) && ((((d.data.Cmo2-d.data.Omo1)/d.data.Omo1)*100) < -22))
            {
              return "#CC0000";
            }
            else if (((((d.data.Cmo2-d.data.Omo1)/d.data.Omo1)*100) > -22) && ((((d.data.Cmo2-d.data.Omo1)/d.data.Omo1)*100) < -15))
            {
              return "#990000";
            }
            else if (((((d.data.Cmo2-d.data.Omo1)/d.data.Omo1)*100) > -15) && ((((d.data.Cmo2-d.data.Omo1)/d.data.Omo1)*100) < 0)) 
            {
              return "#971616";
            }
            else if ((((d.data.Cmo2-d.data.Omo1)/d.data.Omo1)*100) == 0)
            {
              return "#405147";
            }
            else if (((((d.data.Cmo2-d.data.Omo1)/d.data.Omo1)*100) > 0) && ((((d.data.Cmo2-d.data.Omo1)/d.data.Omo1)*100) < 4))
            {
              return "#006600";
            }
            else if ((((d.data.Cmo2-d.data.Omo1)/d.data.Omo1)*100) > 4)
            {
              return "#009900";
            }
          });

      // w = width and h = height.. to set the text position 
      var w = 20,
      h = 20;

      // svg for the text as Ticker ...
      svg
        .selectAll("text")
        .data(root.leaves())
        .enter()
        .append("text")
          .attr("x", function(d){ return d.x0 })    // +1 to adjust position (more right)
          .attr("y", function(d){ return d.y0 + ((d.y1 - d.y0)/2)})    // +30 to adjust position (lower)
          .text(function(d){ 
          if ((d.x1- d.x0 < w)|| (d.y1 - d.y0 < h))
          {
            return "";
          }
          else
          {
            return d.data.Ticker;
          }
          })
          .attr("text-anchor", "start")
          .attr("font-size", "10px")
          .attr("fill", "white")

      // svg for the text as Percentage change in 6 month time...
      svg
        .selectAll("vals")
        .data(root.leaves())
        .enter()
        .append("text")
        .attr("text-anchor", "start")
          .attr("x", function(d){ return d.x0 })    // +1 to adjust position (more right)
          .attr("y", function(d){ return d.y0 + ((d.y1 - d.y0)/2) + 12})    // +48 to adjust position (lower)
          .text(function(d){ 
            if((d.x1 - d.x0 < w) || (d.y1 - d.y0 < h))
            {
              return "";
            }
            else
            {
              return (Math.round(((((d.data.Cmo2-d.data.Omo1)/d.data.Omo1)*100) + Number.EPSILON)*100) / 100 +"%"); 
            }
        })
          .attr("font-size", "10px")
          .attr("fill", "white")

      // svg for the add title as sector ...
      svg
        .selectAll("titles")
        .data(root.descendants().filter(function(d){return d.depth==1}))
        .enter()
        .append("text")
          .attr("x", function(d){ return d.x0})
          .attr("y", function(d){ return d.y0+2})
          .text(function(d){ return d.data.sector })
          .attr("font-size", "19px")
          .attr("fill",  function(d){ return color(d.data.sector)} )
          .style("cursor", "pointer")
          // on click condition for a particular sector view...
          .on("click", function(d) {
            if ((d.data.sector) == "Industrials")
            {
              window.location = "../Treemap/html files/Industrials.html";
            }
            else if ((d.data.sector) == "Energy")
            {
              window.location = "../Treemap/html files/Energy.html";
            }
            else if ((d.data.sector) == "Communication Services")
            {
              window.location = "../Treemap/html files/CommunicationService.html";
            }
            else if ((d.data.sector) == "Consumer Discretionary")
            {
              window.location = "../Treemap/html files/ConsumerDiscretionary.html";
            }
            else if ((d.data.sector) == "Consumer Staples")
            {
              window.location = "../Treemap/html files/ConsumerStaple.html";
            }
            else if ((d.data.sector) == "Financials")
            {
              window.location = "../Treemap/html files/Financial.html";
            }
            else if ((d.data.sector) == "Health Care")
            {
              window.location = "../Treemap/html files/HealthCare.html";
            }
            else if ((d.data.sector) == "Information Technology")
            {
              window.location = "../Treemap/html files/InformationTech.html";
            }
            else if ((d.data.sector) == "Materials")
            {
              window.location = "../Treemap/html files/Materials.html";
            }
            else if ((d.data.sector) == "Real Estate")
            {
              window.location = "../Treemap/html files/RealEstate.html";
            }
            else if ((d.data.sector) == "Utilities")
            {
              window.location = "../Treemap/html files/Utilities.html";
            }
            else
            {
              window.location = "../../index.html";
            }
          })
  });
};

// call the treemap function...
tree();