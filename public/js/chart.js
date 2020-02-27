const generateChart = (chartDataSelector, canvasSelector, chartType) => {
	let chartData = document.querySelector(chartDataSelector).textContent;
	chartData = JSON.parse(chartData);

	chartData.dates = chartData.dates.map(dateInMs => new Date(dateInMs));

	const canvas = document.querySelector(canvasSelector);
	const ctx = canvas.getContext("2d");

	let g = ctx.createLinearGradient(0,0,canvas.width,0),
		label;
	
	if (chartType === "PRICE") {
		g.addColorStop(0, 'rgba(151,188,180,0.55)');
		g.addColorStop(0.5, 'rgba(60,200,214,0.55)');
		g.addColorStop(1, 'rgba(54,184,233,0.55)');
		label = 'Cena';
	} else if (chartType === "VIEWS") {
		g.addColorStop(0, 'rgba(201,43,95,0.55)');
		g.addColorStop(1, 'rgba(118,58,136,0.55)');
		label = 'Wyświetlenia';
	}
	
	ctx.fillStyle = g;
	ctx.fillRect(0,0,canvas.width,canvas.height);
	

	const globalPoint = Chart.defaults.global.elements.point;
	if (chartType === 'PRICE') {
		globalPoint.hoverRadius = 6;
		globalPoint.hitRadius = 6;
		globalPoint.radius = 4;
		globalPoint.hoverBorderWidth = 1;
	} else if (chartType === 'VIEWS') {
		globalPoint.hoverRadius = 3;
		globalPoint.hitRadius = 3;
		globalPoint.radius = 0;
		globalPoint.hoverBorderWidth = 0;
		Chart.defaults.line.lineTenstion = 0;
	}
	
	const myChart = new Chart(ctx, {
		type: "line",
		data: {
			labels: chartData.dates,
			datasets: [{
				label,
				data: chartData.data,
				backgroundColor: g,
				borderColor: 'rgba(255, 99, 132, 1)',
				borderWidth: 1
			}]
		},
		options: {
			responsive: true,
    		maintainAspectRatio: false,
			scales: {
				yAxes: [{
					gridLines: {
						lineWidth: 2
					},
					ticks: {
						min: Math.round(Math.min(...chartData.data) * 0.8),
						max: Math.round(Math.max(...chartData.data) * 1.05),
						stepSize: Math.round(Math.max(...chartData.data) * 0.25)
					}
				}],
				xAxes: [{
					gridLines: {
						lineWidth: 2,
						drawOnChartArea: false
					},
					display: false,
					type: 'time',
					distribution: 'linear',
					time: {
						displayFormats: {
							day: "MMM D"
						}
					},
					gridLines: {
						drawOnChartArea: false
					},
					ticks: {
					}
				}]
			},
			title: {
				display: true,
				text: chartType
			},
			plugins: {
				zoom: {
					pan: {
						enabled: true,
						mode: 'xy',
						rangeMin: {
							// Format of min pan range depends on scale type
							x: null,
							y: null
						},
						rangeMax: {
							// Format of max pan range depends on scale type
							x: null,
							y: null
						},
					},
					zoom: {
						enabled: true,
						mode: 'xy',
						rangeMin: {
							x: null,
							y: null
						},
						rangeMax: {
							// Format of max zoom range depends on scale type
							x: null,
							y: null
						},
						speed: 0.1,
					}
				}
			}
		}
	});
};

if(document.querySelector('#priceChartData')) {
	generateChart("#priceChartData", "#priceChart", "PRICE");
}
generateChart("#viewsChartData", "#viewsChart", "VIEWS");