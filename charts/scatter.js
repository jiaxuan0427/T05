// Load the television data and convert the numeric fields as each row is read.
d3.csv("data/Ex5_TV_energy.csv", (row) => ({
	brand: row.brand,
	screen_tech: row.screen_tech,
	screensize: numberOrNaN(row.screensize),
	energy_consumpt: numberOrNaN(row.energy_consumpt),
	star2: numberOrNaN(row.star2),
	count: numberOrNaN(row.count)
})).then((data) => {
	const chartContainer = document.querySelector("#scatter-chart");

	if (!chartContainer) {
		console.error("The scatter chart container #scatter-chart was not found.");
		return;
	}

	// A record needs both values to be plotted; incomplete rows are skipped.
	const plotData = data.filter((row) =>
		Number.isFinite(row.star2) && Number.isFinite(row.energy_consumpt)
	);

	function drawChart() {
		const width = chartContainer.clientWidth;
		const height = chartContainer.clientHeight;
		if (width === 0 || height === 0) return;

		chartContainer.replaceChildren();

		const svg = d3.select(chartContainer)
			.append("svg")
			.attr("width", "100%")
			.attr("height", "100%")
			.attr("viewBox", `0 0 ${width} ${height}`)
			.attr("role", "img")
			.attr("aria-labelledby", "scatter-title scatter-description");

		svg.append("title")
			.attr("id", "scatter-title")
			.text("TV energy consumption by star rating");
		svg.append("desc")
			.attr("id", "scatter-description")
			.text("Each circle represents one TV data record. The horizontal axis shows its star rating and the vertical axis shows annual energy consumption in kilowatt-hours.");

		// Margins leave room for tick labels and the two axis labels.
		const margin = { top: 42, right: 20, bottom: 62, left: 72 };
		const plotWidth = width - margin.left - margin.right;
		const plotHeight = height - margin.top - margin.bottom;

		if (plotWidth <= 0 || plotHeight <= 0) return;

		const x = d3.scaleLinear()
			.domain(d3.extent(plotData, (row) => row.star2))
			.nice()
			.range([0, plotWidth]);

		const y = d3.scaleLinear()
			.domain([0, d3.max(plotData, (row) => row.energy_consumpt) || 1])
			.nice()
			.range([plotHeight, 0]);

		const plot = svg.append("g")
			.attr("transform", `translate(${margin.left},${margin.top})`);

		// Light horizontal guides make energy use easier to compare.
		plot.append("g")
			.attr("class", "grid")
			.call(d3.axisLeft(y).ticks(5).tickSize(-plotWidth).tickFormat(""))
			.call((grid) => grid.select(".domain").remove())
			.call((grid) => grid.selectAll(".tick line").attr("stroke", "#e0e8e1"));

		plot.append("g")
			.attr("transform", `translate(0,${plotHeight})`)
			.call(d3.axisBottom(x).ticks(Math.max(2, Math.floor(plotWidth / 65))))
			.call(styleAxis);

		plot.append("g")
			.call(d3.axisLeft(y).ticks(5))
			.call(styleAxis);

		// Axis labels describe the measure and its units.
		plot.append("text")
			.attr("class", "axis-label")
			.attr("x", plotWidth / 2)
			.attr("y", plotHeight + 48)
			.attr("text-anchor", "middle")
			.attr("fill", "#53645e")
			.attr("font-size", 11)
			.text("Star rating (Energy Efficiency)");

		plot.append("text")
			.attr("class", "axis-label")
			.attr("transform", "rotate(-90)")
			.attr("x", -plotHeight / 2)
			.attr("y", -54)
			.attr("text-anchor", "middle")
			.attr("fill", "#53645e")
			.attr("font-size", 11)
			.text("Energy consumption (kWh/year)");

		plot.selectAll("circle")
            .data(plotData)
            .join("circle")
            .attr("cx", (row) => x(row.star2))
            .attr("cy", (row) => y(row.energy_consumpt))
            .attr("r", 4)
            .attr("fill", "#2b6d5b")
            .attr("fill-opacity", 0.58)
            .attr("stroke", "#ffffff")
            .attr("stroke-width", 0.7)
            .append("title")
            .text((row) => `${row.brand} · ${row.screen_tech}\nStar rating: ${row.star2}\nEnergy use: ${row.energy_consumpt} kWh/year`);
	}

	function styleAxis(axis) {
		axis.selectAll(".domain, .tick line").attr("stroke", "#b8c7bd");
		axis.selectAll(".tick text")
			.attr("fill", "#5e7169")
			.attr("font-size", 11);
	}
	// Redraw when the chart container changes size; use window resize as a fallback.
	if ("ResizeObserver" in window) {
		new ResizeObserver(drawChart).observe(chartContainer);
	} else {
		window.addEventListener("resize", drawChart);
	}

	drawChart();
}).catch((error) => {
	console.error("Could not load the TV energy CSV for the scatter plot.", error);
	const chartContainer = document.querySelector("#scatter-chart");
	if (chartContainer) {
		chartContainer.textContent = "Unable to load the TV energy data.";
	}
});

function numberOrNaN(value) {
	const number = Number(value);

	return value.trim() === "" || !Number.isFinite(number) 
	? NaN 
	: number;
}