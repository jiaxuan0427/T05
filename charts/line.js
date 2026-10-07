d3.csv("data/Ex5_ARE_Spot_Prices.csv", (row) => {
	const yearValue = row.Year;
	const averagePriceValue = row["Average Price (notTas-Snowy)"];

	return {
		year: yearValue.trim() === "" ? NaN : Number(yearValue),
		averagePrice: averagePriceValue.trim() === "" ? NaN : Number(averagePriceValue)
	};
}).then((data) => {
	const chartContainer = document.querySelector("#line-chart");

	if (!chartContainer) {
		console.error("The line chart container #line-chart was not found.");
		return;
	}

	// Keep every year; report invalid data instead of silently omitting a point.
	const hasInvalidData = data.some((row) =>
		!Number.isFinite(row.year) || !Number.isFinite(row.averagePrice)
	);

	if (data.length === 0 || hasInvalidData) {
		console.error("The spot-price CSV is empty or contains invalid year/average-price values.");
		chartContainer.textContent = "Unable to display the spot-price data.";
		return;
	}

	data.sort((a, b) => a.year - b.year);

	function styleAxis(axis) {
		axis.selectAll(".domain, .tick line").attr("stroke", "#b8c7bd");
		axis.selectAll(".tick text")
			.attr("fill", "#5e7169")
			.attr("font-size", 11);
	}

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
			.attr("aria-labelledby", "line-svg-title line-svg-description");

		svg.append("title")
			.attr("id", "line-svg-title")
			.text("Average Australian electricity spot price by year");
		svg.append("desc")
			.attr("id", "line-svg-description")
			.text("A line chart showing the average electricity spot price for every year from 1998 to 2024.");

		const margin = { top: 34, right: 20, bottom: 60, left: 72 };
		const plotWidth = width - margin.left - margin.right;
		const plotHeight = height - margin.top - margin.bottom;

		if (plotWidth <= 0 || plotHeight <= 0) return;

		const x = d3.scaleLinear()
			.domain(d3.extent(data, (row) => row.year))
			.range([0, plotWidth]);

		const y = d3.scaleLinear()
			.domain(d3.extent(data, (row) => row.averagePrice))
			.nice()
			.range([plotHeight, 0]);

		const plot = svg.append("g")
			.attr("transform", `translate(${margin.left},${margin.top})`);

		plot.append("g")
			.attr("class", "grid")
			.call(d3.axisLeft(y).ticks(5).tickSize(-plotWidth).tickFormat(""))
			.call((grid) => grid.select(".domain").remove())
			.call((grid) => grid.selectAll(".tick line").attr("stroke", "#e0e8e1"));

		plot.append("g")
			.attr("transform", `translate(0,${plotHeight})`)
			.call(
				d3.axisBottom(x)
					.ticks(Math.max(2, Math.floor(plotWidth / 60)))
					.tickFormat(d3.format("d"))
			)
			.call(styleAxis);

		plot.append("g")
			.call(d3.axisLeft(y).ticks(5))
			.call(styleAxis);

		const line = d3.line()
			.x((row) => x(row.year))
			.y((row) => y(row.averagePrice));

		plot.append("path")
			.datum(data)
			.attr("fill", "none")
			.attr("stroke", "#2b6d5b")
			.attr("stroke-width", 2.5)
			.attr("stroke-linejoin", "round")
			.attr("stroke-linecap", "round")
			.attr("d", line);

		const points = plot.selectAll(".data-point")
			.data(data)
			.join("circle")
			.attr("class", "data-point")
			.attr("cx", (row) => x(row.year))
			.attr("cy", (row) => y(row.averagePrice))
			.attr("r", 3)
			.attr("fill", "#d9684c")
			.attr("stroke", "#ffffff")
			.attr("stroke-width", 1);

		points.append("title")
			.text((row) => `${row.year}: ${row.averagePrice} average spot price`);

		plot.append("text")
			.attr("x", plotWidth / 2)
			.attr("y", plotHeight + 43)
			.attr("text-anchor", "middle")
			.attr("fill", "#53645e")
			.attr("font-size", 11)
			.text("Year");

		plot.append("text")
			.attr("transform", "rotate(-90)")
			.attr("x", -plotHeight / 2)
			.attr("y", -54)
			.attr("text-anchor", "middle")
			.attr("fill", "#53645e")
			.attr("font-size", 11)
			.text("Average spot price");
	}

	if ("ResizeObserver" in window) {
		new ResizeObserver(drawChart).observe(chartContainer);
	} else {
		window.addEventListener("resize", drawChart);
	}

	drawChart();
}).catch((error) => {
	console.error("Could not load the spot-price CSV for the line chart.", error);
	const chartContainer = document.querySelector("#line-chart");
	if (chartContainer) {
		chartContainer.textContent = "Unable to load the spot-price data.";
	}
});
