d3.csv("data/Ex5_TV_energy_55inchtv_byScreenType.csv", (row) => {
	const energyValue = row["Mean(Labelled energy consumption (kWh/year))"];

	return {
		screen_tech: row.Screen_Tech,
		mean_energy_consumpt: energyValue.trim() === "" ? NaN : Number(energyValue)
	};
}).then((data) => {
	const chartContainer = document.querySelector("#bar-chart");

	if (!chartContainer) {
		console.error("The bar chart container #bar-chart was not found.");
		return;
	}

	const technologyOrder = ["LCD", "LED", "OLED"];
	const chartData = data
		.filter((row) =>
			technologyOrder.includes(row.screen_tech) &&
			Number.isFinite(row.mean_energy_consumpt) &&
			row.mean_energy_consumpt >= 0
		)
		.sort((a, b) =>
			technologyOrder.indexOf(a.screen_tech) - technologyOrder.indexOf(b.screen_tech)
		);

	if (chartData.length === 0) {
		console.error("The bar chart CSV did not contain valid screen technology values.");
		chartContainer.textContent = "No valid screen technology data is available.";
		return;
	}

	const colors = {
		LCD: "#2b6d5b",
		LED: "#d9684c",
		OLED: "#d3a64a"
	};

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
			.attr("aria-labelledby", "bar-svg-title bar-svg-description");

		svg.append("title")
			.attr("id", "bar-svg-title")
			.text("Mean energy consumption of 55-inch TVs by screen technology");
		svg.append("desc")
			.attr("id", "bar-svg-description")
			.text("A vertical bar chart comparing mean energy consumption in kilowatt-hours per year for LCD, LED and OLED 55-inch televisions.");

		const margin = { top: 32, right: 20, bottom: 66, left: 76 };
		const plotWidth = width - margin.left - margin.right;
		const plotHeight = height - margin.top - margin.bottom;

		if (plotWidth <= 0 || plotHeight <= 0) return;

		const x = d3.scaleBand()
			.domain(chartData.map((row) => row.screen_tech))
			.range([0, plotWidth])
			.padding(0.28);

		const maxEnergy = d3.max(chartData, (row) => row.mean_energy_consumpt) || 1;
		const y = d3.scaleLinear()
			.domain([0, maxEnergy])
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
			.call(d3.axisBottom(x))
			.call(styleAxis);

		plot.append("g")
			.call(d3.axisLeft(y).ticks(5))
			.call(styleAxis);

		const bars = plot.selectAll(".bar")
			.data(chartData)
			.join("rect")
			.attr("class", "bar")
			.attr("x", (row) => x(row.screen_tech))
			.attr("y", (row) => y(row.mean_energy_consumpt))
			.attr("width", x.bandwidth())
			.attr("height", (row) => plotHeight - y(row.mean_energy_consumpt))
			.attr("fill", (row) => colors[row.screen_tech])
			.attr("rx", 2);

		bars.append("title")
			.text((row) =>
				`${row.screen_tech}: ${row.mean_energy_consumpt.toFixed(2)} kWh/year`
			);

		plot.selectAll(".bar-value")
			.data(chartData)
			.join("text")
			.attr("class", "bar-value")
			.attr("x", (row) => x(row.screen_tech) + x.bandwidth() / 2)
			.attr("y", (row) => y(row.mean_energy_consumpt) - 7)
			.attr("text-anchor", "middle")
			.attr("fill", "#203d36")
			.attr("font-size", 11)
			.attr("font-weight", 600)
			.text((row) => row.mean_energy_consumpt.toFixed(2));

		plot.append("text")
			.attr("x", plotWidth / 2)
			.attr("y", plotHeight + 49)
			.attr("text-anchor", "middle")
			.attr("fill", "#53645e")
			.attr("font-size", 11)
			.text("Screen technology");

		plot.append("text")
			.attr("transform", "rotate(-90)")
			.attr("x", -plotHeight / 2)
			.attr("y", -58)
			.attr("text-anchor", "middle")
			.attr("fill", "#53645e")
			.attr("font-size", 11)
			.text("Mean Energy Consumption (kWh/year)");
	}

	if ("ResizeObserver" in window) {
		new ResizeObserver(drawChart).observe(chartContainer);
	} else {
		window.addEventListener("resize", drawChart);
	}

	drawChart();
}).catch((error) => {
	console.error("Could not load the TV energy CSV for the bar chart.", error);
	const chartContainer = document.querySelector("#bar-chart");
	if (chartContainer) {
		chartContainer.textContent = "Unable to load the TV energy data.";
	}
});
