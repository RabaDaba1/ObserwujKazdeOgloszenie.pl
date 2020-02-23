const generateChart = (chartDataSelector, canvasSelector, type) => {
	let chartData = document.querySelector(chartDataSelector).textContent;
	chartData = JSON.parse(chartData);

	chartData.dates = chartData.dates.map(dateInMs => new Date(dateInMs));

	const canvas = document.querySelector(canvasSelector);
	const ctx = canvas.getContext("2d");

	let g = ctx.createLinearGradient(0,0,canvas.width,0),
		label;
	
	if (type === "PRICE") {
		g.addColorStop(0, 'rgba(151,188,180,0.55)');
		g.addColorStop(0.5, 'rgba(60,200,214,0.55)');
		g.addColorStop(1, 'rgba(54,184,233,0.55)');
		label = 'Cena';
	} else if (type === "VIEWS") {
		g.addColorStop(0, 'rgba(201,43,95,0.55)');
		g.addColorStop(1, 'rgba(118,58,136,0.55)');
		label = 'Wyświetlenia';
	}
	
	ctx.fillStyle = g;
	ctx.fillRect(0,0,canvas.width,canvas.height);
	
	if (type === 'PRICE') {
		Chart.defaults.global.elements.point.hoverRadius = 6;
		Chart.defaults.global.elements.point.hitRadius = 6;
		Chart.defaults.global.elements.point.radius = 4;
		Chart.defaults.global.elements.point.hoverBorderWidth = 1;
	} else if (type === 'VIEWS') {
		Chart.defaults.global.elements.point.hoverRadius = 3;
		Chart.defaults.global.elements.point.hitRadius = 3;
		Chart.defaults.global.elements.point.radius = 0;
		Chart.defaults.global.elements.point.hoverBorderWidth = 0;
		Chart.defaults.line.lineTenstion = 0;
	}
	
	const chart = new Chart(ctx, {
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
					ticks: {
						min: Math.round(Math.min(...chartData.data) * 0.8),
						max: Math.round(Math.max(...chartData.data) * 1.05),
						stepSize: Math.round(Math.max(...chartData.data) * 0.25)
					}
				}],
				xAxes: [{
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
				text: type
        	}
		}
	});
}