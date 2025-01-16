document.addEventListener('DOMContentLoaded', () => {

    const fileInput = document.getElementById('tcxFiles');
    const chartCanvas = document.getElementById('hrChart');
    let chart;

    if (!fileInput || !chartCanvas) {
        console.error("One or more elements not found");
        return;
    }

    fileInput.addEventListener('change', handleFileSelect);

    document.getElementById('resetZoom').addEventListener('click', function() {
        if (chart) {
            chart.resetZoom();
        }
    });

    function handleFileSelect(event) {
        const files = event.target.files; // Get the FileList

        if (files.length === 0) {
            return; // No files selected
        }

        const promises = []; // Array to store promises for file reading

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();

            const promise = new Promise((resolve, reject) => {
                reader.onload = (e) => {
                    const xmlString = e.target.result;
                    const hrData = parseTCX(xmlString);
                    resolve({
                        label: file.name,
                        data: hrData
                    }); // Resolve the promise with data and label
                };
                reader.onerror = (e) => {
                    reject(e); // Reject the promise if there's an error
                };
                reader.readAsText(file);
            });
            promises.push(promise);
        }

        Promise.all(promises)
            .then(results => {
                createChart(results); // Create the chart with all data
            })
            .catch(error => {
                console.error("Error reading files:", error);
            });
    }

    function parseTCX(xmlString) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
        const trackpoints = xmlDoc.querySelectorAll('Trackpoint');
        const data = [];
        
        if (trackpoints.length === 0) return data;
        
        // Get start time from first trackpoint
        const startTime = new Date(trackpoints[0].querySelector('Time').textContent);
        
        trackpoints.forEach(trackpoint => {
            const hrElement = trackpoint.querySelector('HeartRateBpm > Value');
            const timeElement = trackpoint.querySelector('Time');
            
            if (hrElement && timeElement) {
                const currentTime = new Date(timeElement.textContent);
                const elapsedSeconds = (currentTime - startTime) / 1000;
                
                data.push({
                    hr: parseInt(hrElement.textContent, 10),
                    elapsedTime: elapsedSeconds
                });
            }
        });
        return data;
    }

    function formatElapsedTime(seconds) {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    function createChart(datasets) {
        const ctx = chartCanvas.getContext('2d');
        if (chart) {
            chart.destroy();
        }

        if (datasets.length === 0) return;

        // Find min and max times across all datasets
        const allTimes = datasets.flatMap(dataset => 
            dataset.data.map(point => point.elapsedTime)
        );
        const minTime = Math.floor(Math.min(...allTimes));
        const maxTime = Math.ceil(Math.max(...allTimes));

        const transformedDatasets = datasets.map((dataset, index) => ({
            label: dataset.label,
            data: dataset.data.map(point => ({
                x: point.elapsedTime,
                y: point.hr
            })),
            borderWidth: 2,
            borderColor: index === 0 ? 'rgba(255, 99, 132, 1)' : 'rgba(54, 162, 235, 1)',
            backgroundColor: 'transparent',
            tension: 0.1,
            fill: false,
            pointRadius: 0,
            pointHoverRadius: 5
        }));

        chart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: transformedDatasets
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        type: 'linear',
                        display: true,
                        min: minTime,
                        max: maxTime,
                        title: {
                            display: true,
                            text: 'Elapsed Time'
                        },
                        ticks: {
                            stepSize: 60,
                            autoSkip: false,
                            callback: function(value) {
                                return formatElapsedTime(value);
                            }
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Heart Rate (BPM)'
                        }
                    }
                },
                plugins: {
                    zoom: {
                        pan: {
                            enabled: true,
                            mode: 'x'
                        },
                        zoom: {
                            wheel: {
                                enabled: true
                            },
                            pinch: {
                                enabled: true
                            },
                            mode: 'x',
                            drag: {
                                enabled: true,
                                backgroundColor: 'rgba(225,225,225,0.3)'
                            }
                        },
                        limits: {
                            x: {min: minTime, max: maxTime}
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        axis: 'x',
                        callbacks: {
                            label: function(context) {
                                const elapsedTime = context.raw.x;
                                const hr = context.raw.y;
                                return `Time: ${formatElapsedTime(elapsedTime)}, HR: ${hr}`;
                            }
                        }
                    },
                    crosshair: {
                        line: {
                            color: '#000',
                            width: 1
                        }
                    }
                }
            }
        });
    }
});
