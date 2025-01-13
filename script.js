document.addEventListener('DOMContentLoaded', () => {
    const workoutLink = document.querySelector('nav a[href="workout.html"]');
    const mainContent = document.querySelector('main .container');

    if (workoutLink && mainContent) {
        workoutLink.addEventListener('click', (event) => {
            event.preventDefault();

            fetch('workout.html')
                .then(response => response.text())
                .then(html => {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = html;

                    // Correctly select the section within the container
                    const workoutSection = tempDiv.querySelector('main .container section');

                    if (workoutSection) {
                        mainContent.innerHTML = workoutSection.outerHTML; // Use outerHTML to include the <section> tag
                        // Reattach event listener, after the content has been loaded
                        const fileInput = document.getElementById('tcxFiles');
                        if (fileInput) {
                            fileInput.addEventListener('change', handleFileSelect);
                        }
                        // if chart already exists, destroy it
                        if (chart) {
                            chart.destroy();
                        }
                    } else {
                        console.error('Could not find the section in workout.html');
                    }
                })
                .catch(error => console.error('Error fetching workout.html:', error));
        });
    }

    const fileInput = document.getElementById('tcxFiles');
    const chartCanvas = document.getElementById('hrChart');
    let chart;

    if (!fileInput || !chartCanvas) {
        console.error("One or more elements not found");
        return;
    }

    fileInput.addEventListener('change', handleFileSelect);

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
        const hrElements = xmlDoc.querySelectorAll('Trackpoint > HeartRateBpm > Value');
        const hrData = [];
        hrElements.forEach(element => {
            hrData.push(parseInt(element.textContent, 10));
        });
        return hrData;
    }

    function createChart(datasets) {
        const ctx = chartCanvas.getContext('2d');
        if (chart) {
            chart.destroy();
        }

        if (datasets.length === 0) return;

        const maxLength = Math.max(...datasets.map(dataset => dataset.data.length));
        const labels = Array.from(Array(maxLength).keys());

        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Time/Index'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Heart Rate (BPM)'
                        }
                    }
                }
            }
        });
    }
});
