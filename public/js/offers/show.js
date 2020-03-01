const DOMStrings = {
	chartViewsInfo: document.querySelector('.views-info'),
	chartPriceInfo: document.querySelector('.price-info'),
	priceChart: document.querySelector('#priceChart'),
	viewChart: document.querySelector('#viewsChart'),
	viewsChartData: JSON.parse(document.querySelector('#viewsChartData').textContent),
	priceChartData: JSON.parse(document.querySelector('#priceChartData').textContent)
};

const chartObjects = {};

const UIController = (function() {
	return {
		renderChart(chartType) {
			let chartData;
			let canvas;

			if(chartType === 'BOTH') {
				chartData = DOMStrings.viewsChartData, DOMStrings.priceChartData;
				canvas = DOMStrings.bothCharts;
			} else if(chartType === 'VIEWS'){
				chartData = DOMStrings.viewsChartData;
				canvas = DOMStrings.viewChart;
			} else if(chartType === 'PRICE') {
				chartData = DOMStrings.priceChartData;
				canvas = DOMStrings.priceChart;
			}
		
			chartData.dates = chartData.dates.map(dateInMs => new Date(dateInMs));
	
			const ctx = canvas.getContext("2d");
			
			let chartMarkup = {
				type: "line",
				data: {
					labels: chartData.dates,
					datasets: [{
						data: chartData.data,
						backgroundColor: 'transparent',
						borderColor: '#105BE1',
						borderWidth: 2
					}]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					legend: {
						display: false
					},
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
							gridLines: {
								drawOnChartArea: false
							},
						}]
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
			}

			dataset = chartMarkup.data.datasets[0];

			dataset.pointBackgroundColor = 'rgba(16, 91, 225,0.75)';
			dataset.pointBorderColor = 'rgba(16,62,203,0.25)';

			if (chartType === 'PRICE') {
				dataset.pointRadius = 5;
				dataset.hitRadius = 12;
				dataset.pointHoverRadius = 8;
				dataset.hoverBorderWidth = 3;
			} else if (chartType === 'VIEWS' || chartType === 'BOTH') {
				dataset.hoverRadius = 3;
				dataset.hitRadius = 3;
				dataset.pointRadius = 0;
				dataset.hoverBorderWidth = 0;
				Chart.defaults.line.lineTenstion = 0.2;
			}

			const myChart = new Chart(ctx, chartMarkup);

			return myChart;
		}
	}
})();

const controller = (function(UIController) {
	const setupEventListeners = () => {
		const chartInfoArr = [DOMStrings.chartViewsInfo, DOMStrings.chartPriceInfo];
		const chartArr = [DOMStrings.priceChart, DOMStrings.viewChart];

		chartInfoArr.forEach((el, i, arr)=> {
			el.addEventListener("click", function() {
				arr.forEach(el => el.classList.remove('active'));
				this.classList.add('active');

				chartArr.forEach(element => element.classList.remove('active'));

				isPriceInfoActive = chartInfoArr[1].classList.contains('active');
				isViewsInfoActive = chartInfoArr[0].classList.contains('active');

				if(isViewsInfoActive) {
					DOMStrings.viewChart.classList.add('active');
				} else if(isPriceInfoActive) {
					DOMStrings.priceChart.classList.add('active');
				}
			});
		});
	};

	return {
		init() {
			setupEventListeners();

			chartObjects.viewChart = UIController.renderChart("VIEWS");
			chartObjects.priceChart = UIController.renderChart("PRICE");
		}
	}
})(UIController);

controller.init();