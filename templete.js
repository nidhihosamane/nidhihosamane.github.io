// Load the data
const iris = d3.csv("iris.csv");

// Once the data is loaded, proceed with plotting
iris.then(function (data) {
    // Convert string values to numbers
    data.forEach(function (d) {
        d.PetalLength = +d.PetalLength;
        d.PetalWidth = +d.PetalWidth;
    });

    // Define dimensions and margins for the scatter plot
    const width = 600, height = 400;
    const margin = { top: 60, bottom: 50, left: 60, right: 30 };

    // Create the SVG container for the scatter plot
    const svg = d3
        .select('#scatterplot')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('background', '#e9f7f2');

    // Add scatter plot title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Scatter Plot of Petal Length vs. Petal Width");

    // Set up scales for x and y axes
    const xScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalLength) - 1, d3.max(data, d => d.PetalLength) + 1])
        .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalWidth) - 1, d3.max(data, d => d.PetalWidth) + 1])
        .range([height - margin.bottom, margin.top]);

    const colorScale = d3.scaleOrdinal()
        .domain(data.map(d => d.Species))
        .range(d3.schemeCategory10);

    // Add circles for each data point
    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.PetalLength))
        .attr("cy", d => yScale(d.PetalWidth))
        .attr("r", 5)
        .attr("fill", d => colorScale(d.Species));

    // Add x-axis with label
    svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale))
        .append("text")
        .attr("x", width / 2)
        .attr("y", 35)
        .attr("fill", "black")
        .style("font-size", "12px")
        .text("Petal Length");

    // Add y-axis with label
    svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -40)
        .attr("fill", "black")
        .style("font-size", "12px")
        .text("Petal Width");

        // Add legend
    const legend = svg.selectAll(".legend")
    .data(colorScale.domain())
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", (d, i) => `translate(${width - margin.right - 100}, ${margin.top + i * 20})`);

legend.append("rect")
    .attr("x", 0)
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", colorScale);

legend.append("text")
    .attr("x", 15)
    .attr("y", 5)
    .attr("dy", "0.35em")
    .text(d => d);
});

// BOXPLOT
iris.then(function (data) {
    // Convert string values to numbers
    data.forEach(d => {
        d.PetalLength = +d.PetalLength;
        d.PetalWidth = +d.PetalWidth;
    });

    // Define dimensions and margins for the box plot
    const width = 600;
    const height = 400;
    const margin = { top: 60, right: 40, bottom: 50, left: 60 };

    // Create the SVG container for the box plot
    const svg = d3
        .select('#boxplot')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('background', '#e9f7f2');

    // Add box plot title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Box Plot of Petal Length by Species");

    // Set up scales for x and y axes
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.Species))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalLength) - 1, d3.max(data, d => d.PetalLength) + 1])
        .range([height - margin.bottom, margin.top]);

    // Add x-axis with label
    svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale))
        .append("text")
        .attr("x", width / 2)
        .attr("y", 35)
        .attr("fill", "black")
        .style("font-size", "12px")
        .text("Species");

    // Add y-axis with label
    svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -45)
        .attr("fill", "black")
        .style("font-size", "12px")
        .text("Petal Length");

    // Define rollup function to calculate Q1, median, Q3, and IQR
    const rollupFunction = function (groupData) {
        const values = groupData.map(d => d.PetalLength).sort(d3.ascending);
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const iqr = q3 - q1;
        return { q1, median, q3, iqr };
    };

    // Calculate quartiles by species
    const quartilesBySpecies = d3.rollup(data, rollupFunction, d => d.Species);

    quartilesBySpecies.forEach((quartiles, Species) => {
        const x = xScale(Species);
        const boxWidth = xScale.bandwidth();
        const { q1, median, q3, iqr } = quartiles;

        const lowerWhisker = Math.max(q1 - 1.5 * iqr, d3.min(data.filter(d => d.Species === Species), d => d.PetalLength));
        const upperWhisker = Math.min(q3 + 1.5 * iqr, d3.max(data.filter(d => d.Species === Species), d => d.PetalLength));

        // Draw whiskers and box
        svg.append("line")
            .attr("x1", x + boxWidth / 2)
            .attr("x2", x + boxWidth / 2)
            .attr("y1", yScale(lowerWhisker))
            .attr("y2", yScale(upperWhisker))
            .attr("stroke", "black");

        svg.append("rect")
            .attr("x", x)
            .attr("y", yScale(q3))
            .attr("width", boxWidth)
            .attr("height", yScale(q1) - yScale(q3))
            .attr("fill", "#add8e6")
            .attr("stroke", "black");

        svg.append("line")
            .attr("x1", x)
            .attr("x2", x + boxWidth)
            .attr("y1", yScale(median))
            .attr("y2", yScale(median))
            .attr("stroke", "black");
    });
});
