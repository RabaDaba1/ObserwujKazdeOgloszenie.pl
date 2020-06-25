const DOMStrings = {
	chartViewsInfo: document.querySelector('.chart__num-views'),
	chartPriceInfo: document.querySelector('.chart__num-price'),
	priceChart: document.querySelector('#chart__price'),
	viewChart: document.querySelector('#chart__views'),
	viewsChartData: JSON.parse(document.querySelector('.chart__data-views').textContent),
	price: document.querySelector('.offer__stats-value:nth-of-type(1)').textContent,
	modal: document.querySelector('.modal'),
	modalDataNew: document.querySelector('modal__data--new').textContent,
	modalDataOld: document.querySelector('modal__data--old').textContent,
	openModal: Array.from(document.querySelectorAll('.modal__open')),
	closeModal: document.querySelector('.modal__close'),
	changesTableRows: Array.from(document.querySelectorAll('.changelog__table-data'))
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
		},
		switchCharts(chartHeaders, target) {
			chartHeaders.forEach(el => el.classList.remove('active'));
				target.classList.add('active');

				const chartArr = [DOMStrings.priceChart,DOMStrings.viewChart];
				chartArr.forEach(element => element.classList.remove('active'));

				isPriceInfoActive = chartHeaders[1].classList.contains('active');
				isViewsInfoActive = chartHeaders[0].classList.contains('active');

				if(isViewsInfoActive) {
					DOMStrings.viewChart.classList.add('active');
				} else if(isPriceInfoActive) {
					DOMStrings.priceChart.classList.add('active');
				}
		},
		renderModal(button) {				
			const	currentRowIndex = DOMStrings.changesTableRows.indexOf(button.parentNode.parentNode),
					modalDataNew = JSON.parse(DOMStrings.modalDataNew)[currentRowIndex],
					modalDataOld = JSON.parse(DOMStrings.modalDataOld)[currentRowIndex];

			let processedNewData = modalDataNew.split(" "),
				processedOldData = modalDataOld.split(" ");

			const difference = patienceDiffPlus(processedOldData, processedNewData);
			
			let lastNewChanged = false,
				lastOldChanged = false;
			difference.lines.forEach(el => {
				if(el.bIndex === -1) {
					let markup;
					lastOldChanged ? markup = processedOldData[el.aIndex] : markup = `<span class="modal__deleted">${processedOldData[el.aIndex]}`;

					processedOldData[el.aIndex] = markup;
					lastOldChanged = true;
				} else if (el.aIndex === -1) {
					let markup;
					lastNewChanged ? markup = processedNewData[el.bIndex] : markup = `<span class="modal__added">${processedNewData[el.bIndex]}`
					
					processedNewData[el.bIndex] = markup;
					lastNewChanged = true;
				} else {
					if(lastOldChanged) {
						processedOldData[el.aIndex - 1] = processedOldData[el.aIndex - 1] + '</span>';
					}

					if(lastNewChanged) {
						processedNewData[el.bIndex - 1] = processedNewData[el.bIndex - 1] + '</span>';
					}
					lastOldChanged = false;
					lastNewChanged = false;
				}
			});
			
			document.querySelector(".modal__text--old").insertAdjacentHTML('beforeend', `<p>${processedOldData.join(" ")}</p>`);
			document.querySelector(".modal__text--new").insertAdjacentHTML('beforeend', `<p>${processedNewData.join(" ")}</p>`);

			document.querySelector(".modal__text-old .modal__text-heading").textContent = `Stary ${button.dataset.offertype}`
			document.querySelector(".modal__text-new .modal__text-heading").textContent = `Nowy ${button.dataset.offertype}`

			document.querySelector(".modal__count--deleted").textContent = ' ' + difference.lineCountDeleted;
			document.querySelector(".modal__count--inserted").textContent = ' ' + difference.lineCountInserted;

			DOMStrings.modal.style.display = 'block';
		},
		closeModal() {
			DOMStrings.modal.style.display = 'none';

			let modalTextCompare = Array.from(document.querySelectorAll(".modal-text"));
			
			modalTextCompare.forEach(el => {
				el.parentNode.removeChild(el);
			})
		}
	}
})();

const controller = (function(UIController) {
	const setupEventListeners = () => {
		const chartHeaders = [DOMStrings.chartViewsInfo, DOMStrings.chartPriceInfo];

		chartHeaders.forEach((el, i, arr) => el.addEventListener("click", () => UIController.switchCharts(arr, el)));

		if(DOMStrings.openModal.length > 0) {
			DOMStrings.openModal.forEach(el => {
				el.addEventListener('click', function() {
					UIController.renderModal(this);
				});
			});
		}

		DOMStrings.closeModal.addEventListener('click', () => UIController.closeModal());

		window.addEventListener('click', function (event) {
			if(event.target === DOMStrings.modal) {
				UIController.closeModal();
			}
		});
	};

	return {
		init() {
			setupEventListeners();

			chartObjects.viewChart = UIController.renderChart("VIEWS");
			if(DOMStrings.price.includes('brak')) {
				DOMStrings.chartPriceInfo.style.display = 'none';
			} else {
				DOMStrings.priceChartData = JSON.parse(document.querySelector('.chart__data-price').textContent);
				chartObjects.priceChart = UIController.renderChart("PRICE");
			}
		}
	}
})(UIController);

controller.init();