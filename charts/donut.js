d3.csv("data/Ex5_TV_energy_Allsizes_byScreenType.csv", (row) => {
	const energyValue = row["Mean(Labelled energy consumption (kWh/year))"];

	return {
		screen_tech: row.Screen_Tech,
		mean_energy_consumpt: energyValue.trim() === "" ? NaN : Number(energyValue)
	};
}).then((data) => {
	const chartContainer = document.querySelector("#donut-chart");

	if (!chartContainer) {
		console.error("The donut chart container #donut-chart was not found.");
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
		console.error("The donut chart CSV did not contain valid screen technology values.");
		chartContainer.textContent = "No valid screen technology data is available.";
		return;
	}

	const colors = {
		LCD: "#2b6d5b",
		LED: "#d9684c",
		OLED: "#d3a64a"
	};

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
			.attr("aria-labelledby", "donut-svg-title donut-svg-description");

		svg.append("title")
			.attr("id", "donut-svg-title")
			.text("Average TV energy consumption by screen technology");
		svg.append("desc")
			.attr("id", "donut-svg-description")
			.text("A donut chart comparing the mean labelled energy consumption of LCD, LED and OLED televisions, in kilowatt-hours per year.");

		const radius = Math.min(height * 0.32, width * 0.22);
		const centerX = width * 0.34;
		const centerY = height / 2;

		const pie = d3.pie()
			.value((row) => row.mean_energy_consumpt)
			.sort(null);

		const arc = d3.arc()
			.innerRadius(radius * 0.58)
			.outerRadius(radius);

		const slices = svg.append("g")
			.attr("transform", `translate(${centerX},${centerY})`)
			.selectAll("path")
			.data(pie(chartData))
			.join("path")
			.attr("d", arc)
			.attr("fill", (slice) => colors[slice.data.screen_tech])
			.attr("stroke", "#ffffff")
			.attr("stroke-width", 2);

		slices.append("title")
			.text((slice) =>
				`${slice.data.screen_tech}: ${slice.data.mean_energy_consumpt.toFixed(1)} kWh/year`
			);

		svg.append("text")
			.attr("x", centerX)
			.attr("y", centerY - 4)
			.attr("text-anchor", "middle")
			.attr("fill", "#203d36")
			.attr("font-size", Math.max(9, Math.min(11, width / 35)))
			.text("MEAN ENERGY");

		svg.append("text")
			.attr("x", centerX)
			.attr("y", centerY + 12)
			.attr("text-anchor", "middle")
			.attr("fill", "#5e7169")
			.attr("font-size", Math.max(9, Math.min(11, width / 35)))
			.text("kWh/year");

		const legendX = width * 0.63;
		const legendStartY = centerY - (chartData.length - 1) * 27;
		const legend = svg.append("g")
			.attr("aria-label", "Legend with mean energy values");

		const legendItems = legend.selectAll("g")
			.data(chartData)
			.join("g")
			.attr("transform", (row, index) =>
				`translate(${legendX},${legendStartY + index * 54})`
			);

		legendItems.append("circle")
			.attr("cx", 5)
			.attr("cy", 0)
			.attr("r", 5)
			.attr("fill", (row) => colors[row.screen_tech]);

		legendItems.append("text")
			.attr("x", 16)
			.attr("y", 4)
			.attr("fill", "#203d36")
			.attr("font-size", 12)
			.attr("font-weight", 600)
			.text((row) => row.screen_tech);

		legendItems.append("text")
			.attr("x", 16)
			.attr("y", 21)
			.attr("fill", "#5e7169")
			.attr("font-size", 11)
			.text((row) => `${row.mean_energy_consumpt.toFixed(1)} kWh/year`);
	}

	if ("ResizeObserver" in window) {
		new ResizeObserver(drawChart).observe(chartContainer);
	} else {
		window.addEventListener("resize", drawChart);
	}

	drawChart();
}).catch((error) => {
	console.error("Could not load the TV energy CSV for the donut chart.", error);
	const chartContainer = document.querySelector("#donut-chart");
	if (chartContainer) {
		chartContainer.textContent = "Unable to load the TV energy data.";
	}
});
