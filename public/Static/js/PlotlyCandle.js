d3.json("./Static/data/Predicted_Info_2.json").then((data, err) => {
  if (err) throw err;

  // This is work for the sector dropwdown
  // create empty list for sectors
  var sectorNames = []

  // loop to pull just the sector names
  for (var i = 0; i < data.length; i++) {
    sectorNames.push(data[i].sector)
  };

  // removing duplicate names
  let removeDuplicates = new Set(sectorNames);
  let sectors = [...removeDuplicates]

  // creating the dropdown with the sector names
  d3.select("#selDataset")
    .selectAll("#stocksss")
    .data(sectors)
    .enter()
    .append("option")
    .text(function (d) { return d })
    .attr("value", function (d) { return d })


  // This is work for the Ticker dropwdown
  // create empty dictonary for ticker info
  var tickerNames = { "": "Select Ticker" }

  // for loop to populate the dictionary with stock ticker and name
  for (var i = 0; i < data.length; i++) {
    tickerNames[data[i].Ticker] = data[i].name
  };

  // creating ticker dropdown
  d3.select("#selDataset2")
    .selectAll("#JordanBelfort")
    .data(Object.entries(tickerNames))
    .enter()
    .append("option")
    .text(function (d) { return `${d[1]} (${d[0]})` })
    .attr("value", function (d) { return d[0] })

  // clearing infobox
  d3.select(".toad").html("");

  //calling function when a sector is chosen
  d3.selectAll("#selDataset").on("change", sectorChanged);

  function sectorChanged() {
    // selecting the sector dropdown menu
    var dropdownMenu = d3.select("#selDataset");
    // Assign the value of the dropdown menu option to a variable
    var dataset = dropdownMenu.property("value");
    // filter the entire dataset and create an array of stocks in the sector chosen
    var filterArray = data.filter(d1 => d1.sector === dataset);

    // creating dictionary for filtered stock tickers and names
    var tickerNames2 = { "": "Select Ticker" }

    // loop to pull those tickers and names
    for (var i = 0; i < filterArray.length; i++) {
      tickerNames2[filterArray[i].Ticker] = filterArray[i].name
    };

    // clearing the ticker dropdown
    d3.select("#selDataset2").html("")

    // repopulating the ticker dropdown on that sector(all stocks if "select sector" is chosen)
    if (dataset === "") {
      d3.select("#selDataset2")
        .selectAll("#JordanBelfort")
        .data(Object.entries(tickerNames))
        .enter()
        .append("option")
        .text(function (d) { return `${d[1]} (${d[0]})` })
        .attr("value", function (d) { return d[0] })
    }
    else {
      d3.select("#selDataset2")
        .selectAll("#JordanBelfort")
        .data(Object.entries(tickerNames2))
        .enter()
        .append("option")
        .text(function (d) { return `${d[1]} (${d[0]})` })
        .attr("value", function (d) { return d[0] })
    }
  }

  //calling function when a Ticker is chosen
  d3.selectAll("#selDataset2").on("change", tickerChanged);

  function tickerChanged() {
    // clearing visuals to be replaced
    d3.select("#my_dataviz").html("");
    d3.select("#peach").html("");
    d3.select(".toad").html("");
    d3.select("#predictor").html("");
    d3.select(".chartTitle").html("");
    d3.select("#svg-area").html("");
    d3.select("#box2").html("");
    d3.select("#box3").html("");

    // this work is for the 3 info boxes at the bottom
    // empty variables to fill later
    var tickerList = []
    var dataList = []
    var dataDict = {}
    var tableList = []
    var tableDict = {}

    // forEach loop to pull the tickers and differences between 7/2 actual opening and our predicted opening
    data.forEach(function (data) {

      // pulling closing 7/1 numbers
      var closing7_1 = data.Closing_7_1_21
      // pulling original numbers
      var original = data.Opening_Original_7_2_21
      // pulling predicted numbers
      var predicted = data.Opening_Predicted_7_2_21

      // finding the difference between original and predicted for 7/2
      //    this is the difference in dollar amount **(comment 1 of 2)
      // var difference = Math.abs(original - predicted).toFixed(2)
      //    this is the difference in % **(comment 1 of 2)
      var difference = (((predicted - original) / original) * 100).toFixed(2)

      // finding difference between closing 7/1 to our predicted open 7/2
      var tableDiff = (((predicted - closing7_1) / closing7_1) * 100).toFixed(2)

      // making sure the differences are numeric and absolute value if needed
      difference = +Math.abs(difference)
      tableDiff = +tableDiff

      // pushing the tickers into a list
      tickerList.push(data.Ticker)
      // pushing the diffrences into lists
      dataList.push(difference)
      tableList.push(tableDiff)
    })

    // for loop to put each of the needed list combinations into dictionaries
    for (var i = 0; i < dataList.length; i++) {
      dataDict[tickerList[i]] = dataList[i]
      tableDict[tickerList[i]] = tableList[i]
    }

    // pulling the key,value pairs for the model overview
    var dataDictKV = Object.entries(dataDict)

    // some basic mathmatical stats on our findings
    var dataMax = d3.max(dataList)
    var dataMin = d3.min(dataList)
    var dataMean = d3.mean(dataList)
    var dataMedian = d3.median(dataList)

    // pulling, sorting, and slicing for the top ten gainers table
    var tableDictStop10 = Object.keys(tableDict).map(function (key) {
      return [key, tableDict[key]];
    })
    tableDictStop10.sort(function (first, second) {
      return second[1] - first[1];
    })
    tableDictSStop10 = tableDictStop10.slice(0, 10)

    // pulling, sorting, and slicing for the top ten losers table
    var tableDictSbottom10 = Object.keys(tableDict).map(function (key) {
      return [key, tableDict[key]];
    })
    tableDictSbottom10.sort(function (first, second) {
      return first[1] - second[1];
    })
    tableDictSSbottom10 = tableDictSbottom10.slice(0, 10)

    // for loop to find which ticker has the max and min differences and storing into an html formatted variable
    for (var i = 0; i < dataDictKV.length; i++) {
      if (dataDictKV[i][1] === dataMax) {
        var maxDiff = `Ticker that has the maximum Difference : <br> ${dataDictKV[i][0]}  ${dataDictKV[i][1]}%`
      }
      if (dataDictKV[i][1] === dataMin) {
        var minDiff = `Ticker that has the minimum Difference : <br> ${dataDictKV[i][0]}  ${dataDictKV[i][1]}%`
      }
    }
    // storing the mean and median into an html formatted variable
    var meanDiff = `Overall average Difference : <br> ${dataMean.toFixed(2)}%`
    var medianDiff = `Overall median Difference : <br> ${dataMedian.toFixed(2)}%`

    // creating the model overview table and puttin in the stats we found plus the machine learning score
    d3.select("#statistics")
      .selectAll("ul")
      .html(function (d) {
        return `<br><h3><center> Model Overview </center></h3><p> 
      Overall stats on the difference between <br> 
      the actual opening price vs our predicted opening price for 7/2/21 <br><br> 
      ${maxDiff} <br><br> 
      ${minDiff} <br><br> 
      ${meanDiff} <br><br> 
      ${medianDiff} <br>
      <hr color="white" style="margin-right: 20px;">
      <center>Machine Learning: <br><br>
      MSE score: <br>
      0.004356288121559715 <br><br>
      R2 score: <br>
      0.9954598958296442 <br></center>`
      });

    // creating the top ten gainers table
    d3.select(".ranked")
      .selectAll("ul")
      .html(function (d) {
        return `<br><h3><center> Top 10 gainers <br>from close 7/1 to predicted open 7/2 </center></h3>`
      });

    d3.select("#top10")
      .selectAll("tr")
      .data(tableDictSStop10)
      .enter()
      .append("tr")
      .html(function (d) {
        return `<td>${d[0]}</td><td>${d[1]}%</td>`;
      });

    // creating the top ten losers table
    d3.select(".ranked2")
      .selectAll("ul")
      .html(function (d) {
        return `<br><h3><center> Top 10 losers <br>from close 7/1 to predicted open 7/2 </center></h3><p>`
      });


    d3.select("#bottom10")
      .selectAll("tr")
      .data(tableDictSSbottom10)
      .enter()
      .append("tr")
      .html(function (d) {
        return `<td>${d[0]}</td><td>${d[1]}%</td>`;
      });

    // finding the ticker from the ticker dropdown selection
    // selecting the Ticker dropdown menu
    var dropdownMenu2 = d3.select("#selDataset2");
    // Assign the value of the dropdown menu option to a variable
    var dataset2 = dropdownMenu2.property("value");
    // filter the entire dataset and create an array of the Ticker chosen
    var filterArray2 = data.filter(d2 => d2.Ticker === dataset2);
    // this variable is equal to the ticker chosen 
    var tickerForD3 = filterArray2[0].Ticker

    // this work is for the 18-month D3 line graph
    // making the title header
    d3.select(".chartTitle").append("text")
      .attr("x", "50")
      .attr("y", "50")
      .html(`${tickerForD3} Opening stock prices from Jan,2 2020 - July,1 2021`)

    // Define SVG area dimensions
    var svgWidth = 1500;
    var svgHeight = 700;

    // Define the chart's margins as an object
    var margin = { top: 60, right: 60, bottom: 60, left: 160 };

    // Define dimensions of the chart area
    var chartWidth = svgWidth - margin.left - margin.right;
    var chartHeight = svgHeight - margin.top - margin.bottom;

    // Select body, append SVG area to it, and set its dimensions
    var svg = d3.select("#svg-area")
      .append("svg")
      .attr("width", svgWidth)
      .attr("height", svgHeight);

    // Append a group area, then set its margins
    var chartGroup = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Configure a parseTime function which will return a new Date object from a string
    var parseTime = d3.timeParse('%Y-%m-%d');

    // this will filter the ticker
    var filters = { 'Ticker': [tickerForD3] };

    // Load data from MLData3.csv
    d3.csv("./Static/data/MLData3.csv").then(function (graphData) {

      graphData = graphData.filter(function (row) {
        // run through all the filters, returning a boolean
        return ['Ticker', 'date', 'sector', 'name', 'opening', 'closing', 'next_Opening'].reduce(function (pass, column) {
          return pass && (
            // pass if no filter is set
            !filters[column] ||
            // pass if the row's value is equal to the filter
            // (i.e. the filter is set to a string)
            row[column] === filters[column] ||
            // pass if the row's value is in an array of filter values
            filters[column].indexOf(row[column]) >= 0
          );
        }, true);
      })

      // Format the date and cast the opening value to a number
      graphData.forEach(function (data) {
        data.date = parseTime(data.date);
        data.opening = +data.opening;
      });

      // Configure a time scale
      var xTimeScale = d3.scaleTime()
        .domain(d3.extent(graphData, data => data.date))
        .range([0, chartWidth]);

      // Configure a linear scale with a range between the chartHeight and 0
      var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(graphData, data => data.opening)])
        .range([chartHeight, 0]);

      // Create two new axis functions passing the scales in as arguments
      var bottomAxis = d3.axisBottom(xTimeScale);
      var leftAxis = d3.axisLeft(yLinearScale);

      // define the area to be filled in
      var area = d3.area()
        .x(function (d) { return xTimeScale(d.date); })
        .y0(chartHeight)
        .y1(function (d) { return yLinearScale(d.opening); });

      // Configure a line function which will plot the x and y coordinates using our scales
      var drawLine = d3.line()
        .x(data => xTimeScale(data.date))
        .y(data => yLinearScale(data.opening));

      // add the area to the graph
      chartGroup.append("path")
        .data([graphData])
        .attr("class", "area")
        .attr("d", area);

      // Append an SVG path and plot its points using the line function
      chartGroup.append("path")
        .attr("d", drawLine(graphData))
        .attr("class", "x axis")
        .style("fill", "none")
        .attr("stroke-width", "3")
        .attr("stroke", "blue")

      // Append an SVG group element to the chartGroup, create the left axis inside of it
      chartGroup.append("g")
        .classed("axis", true)
        .attr("class", "axisTan")
        .attr("stroke", "ivory")
        .call(leftAxis);

      // Append an SVG group element to the chartGroup, create the bottom axis inside of it
      chartGroup.append("g")
        .classed("axis", true)
        .attr("class", "axisTan")
        .attr("transform", `translate(0, ${chartHeight})`)
        .attr("stroke", "ivory")
        .call(bottomAxis);

      // x-axis label
      var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);
      xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("stroke", "ivory")
        .attr("fill", "ivory")
        .classed("active", true)
        .text("Months");

      // y-axis label
      var yLabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)");
      yLabelsGroup.append("text")
        .attr("x", 0 - (chartHeight / 2))
        .attr("y", 75 - margin.left)
        .attr("dy", "1em")
        .attr("stroke", "ivory")
        .attr("fill", "ivory")
        .classed("active", true)
        .text("Opening Price");

      // append circles
      var circlesGroup = chartGroup.selectAll("circle")
        .data(graphData)
        .enter()
        .append("circle")
        .attr("cx", d => xTimeScale(d.date))
        .attr("cy", d => yLinearScale(d.opening))
        .attr("r", "1")
        .attr("fill", "gold")
        .attr("stroke-width", "2")
        .attr("stroke", "white")
        .style("cursor", "pointer")

      // creating tooltip
      // Date formatter to display dates nicely
      var dateFormatter = d3.timeFormat("%Y-%d-%b");

      // Step 1: Initialize Tooltip
      var toolTip = d3.tip()
        .attr("class", "circletip")
        .attr("stroke", "yellow")
        .offset([80, -60])
        .html(function (d) {
          return (`<strong>Opening Price: ${d.opening} </strong> <hr> Date: ${dateFormatter(d.date)}`);
        })

      // Step 2: Create the tooltip in chartGroup.
      chartGroup.call(toolTip);

      // Step 3: Create "mouseover" event listener to display tooltip
      circlesGroup.on("mouseover", function (d) {
        toolTip.show(d, this)
      })
        // Step 4: Create "mouseout" event listener to hide tooltip
        .on("mouseout", function (d) {
          toolTip.hide(d);
        });

    }).catch(function (error) {
      console.log(error);
    });

    // putting it in local storage incase we want multi-pages
    localStorage.setItem("array", filterArray2);

    // Plotly Predicted plot
    // pulling the key,value pairs (FA2 stands for filterArray2 - made it a small name to condense code on next lines)
    var FA2 = Object.entries(filterArray2[0])
    // creating plot with opening values
    var x = [FA2[3][0], FA2[8][0], FA2[13][0], FA2[18][0], FA2[24][0]]
    var y = [FA2[3][1], FA2[8][1], FA2[13][1], FA2[18][1], FA2[24][1]]

    // plot it
    var trace1 = [{ x: x, y: y, type: "line" }]
    var layOut = {
      title: `${filterArray2[0].name} (${filterArray2[0].Ticker}) Predicted Opening Price`, xaxis: { title: "Date", automargin: true },
      yaxis: { title: "Opening Price", autorange: true, type: "linear" }
    };
    Plotly.newPlot("candlestick", trace1, layOut)

    // Info Box Work
    // calling the ML csv to match treemap numbers and colors
    d3.csv("./Static/data/MLData3.csv").then((plotData) => {

      // creating empty lists for data
      var infoBox = []
      var percChange = []

      // doing a forEach loop to get just the info for the days in the treemap % change (4/30&7/1)
      plotData.forEach(function (d4) {
        if (d4.Ticker == tickerForD3 && d4.date == "2021-04-30" || d4.Ticker == tickerForD3 && d4.date == "2021-07-01") {
          if (d4.Ticker == tickerForD3 && d4.date == "2021-04-30") {
            percChange.push(d4.opening)
          }
          else {
            percChange.push(d4.closing)
          }
        }
      })

      // doing the percent change calc and storing into a variable
      var RAVIdiff = ((percChange[1] - percChange[0]) / percChange[0]) * 100
      // pushing that into another list for correct structure
      infoBox.push(RAVIdiff)
      // rounding to 2 decimals
      RRavidiff = RAVIdiff.toFixed(2)

      // variables for height/width of info box
      var height = 150
      var width = 350

      // Appending SVG wrapper to predictor, set its height and width, and create a variable which references it
      var svg = d3.select("#predictor")
        .append("svg")
        .attr("height", height)
        .attr("width", width);

      // Append a rectangle and call data
      svg.append("rect")
        .data(infoBox)
        .attr("width", width)
        .attr("height", height)
        .attr("x", 0)
        .attr("y", 0)
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        // if condition to color the box to match the treemap color for that stock
        .attr("fill", function (d) {
          if ((d) <= -31) { return "#FF0000"; }
          else if (((d) > -31) && (((d)) < -22)) { return "#CC0000"; }
          else if (((d) > -22) && ((d) < -15)) { return "#990000"; }
          else if (((d) > -15) && ((d) < 0)) { return "#971616"; }
          else if ((d) == 0) { return "#405147"; }
          else if (((d) > 0) && ((d) < 4)) { return "#006600"; }
          else if ((d) > 4) { return "#009900"; };
        })

      // append the text element to the box
      svg.append("text")
        .attr("color", "white")
        .attr("x", width / 20)
        .attr("y", height / 1.8)
        .html(`% Change (May-June 2021) : ${RRavidiff}%`)
    })

    d3.json("./Static/data/Predicted_Info_2.json").then((d7) => {

      // this is work for the 2 boxes showing the difference in 7/2 actual opening price vs our predicted price(lightblue and tan)
      var box2 = d7.filter(d => d.Ticker === tickerForD3)

      // variables for height/width of info box
      var heightH = 150
      var widthH = 350

      // adding original opening price box (tan)
      var svg2 = d3.select("#box2")
        .append("svg")
        .attr("height", heightH)
        .attr("width", widthH);

      svg2.append("rect")
        .data(box2)
        .attr("width", widthH)
        .attr("height", heightH)
        .attr("x", 0)
        .attr("y", 0)
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .attr("fill", "tan")

      svg2.append("text")
        .attr("color", "white")
        .attr("x", widthH / 20)
        .attr("y", heightH / 1.8)
        .html(`Original Opening 7/2/21 : ${box2[0].Opening_Original_7_2_21.toFixed(2)}`)

      // adding predicted opening price box (tan)
      var svg3 = d3.select("#box3")
        .append("svg")
        .attr("height", heightH)
        .attr("width", widthH);

      svg3.append("rect")
        .data(box2)
        .attr("width", widthH)
        .attr("height", heightH)
        .attr("x", 0)
        .attr("y", 0)
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .attr("fill", "lightblue")

      svg3.append("text")
        .attr("color", "white")
        .attr("x", widthH / 20)
        .attr("y", heightH / 1.8)
        .html(`Predicted Opening 7/2/21 : ${box2[0].Opening_Predicted_7_2_21.toFixed(2)}`)

      // this is work for the static line that shows all stocks relatively
      // empty variables
      var staticLine = {}
      var percentChange = []
      var lineTicker = []

      // nested for loops to create a dictionary of the ticker and their percent change from opening 6/28 - closing 7/1
      for (var i = 0; i < d7.length; i++) {
        var percentChange3 = ((d7[i].Closing_7_1_21 - d7[i].Opening_6_28_21) / d7[i].Opening_6_28_21) * 100
        percentChange3 = +percentChange3.toFixed(2)
        percentChange.push(percentChange3)
        lineTicker.push(d7[i].Ticker)
        for (var k = 0; k < lineTicker.length; k++) {
          staticLine[lineTicker[k]] = percentChange[k]
        }
      }

      // creating a variable that holds the horizontal line point for the ticker chosen
      var horizontalLine = staticLine[tickerForD3]

      //STATIC LINE
      var staticLineData = [{ x: lineTicker, y: percentChange, type: "line" }];
      //STATIC LINE
      var staticLineLayOut10 = {
        title: `Percentage change from 6/28/21 Open - 7/1/21 Close`,
        yaxis: {
          title: "4 Days Difference"
        },
        shapes: [{
          type: 'line',
          x0: tickerForD3,
          y0: 0,
          x1: tickerForD3,
          yref: 'paper',
          y1: 1,
          line: {
            color: 'red',
            width: .7
          }
        }, {
          type: 'line',
          x0: 0,
          y0: horizontalLine,
          x1: 1,
          xref: 'paper',
          y1: horizontalLine,
          line: {
            color: '#971616',
            width: .7
          }
        }]
      };

      //plotting the static plots
      Plotly.newPlot("static", staticLineData, staticLineLayOut10);
    })
  }
});