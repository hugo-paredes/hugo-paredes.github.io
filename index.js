// script.js
document.addEventListener('DOMContentLoaded', () => {
    const workoutLink = document.querySelector('nav a[href="compare_workouts.html"]'); // Select the link
    const mainContent = document.querySelector('main .container'); // Select the main content area

    if (workoutLink && mainContent) {
        workoutLink.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default link behavior

            fetch('workout.html') // Fetch the content of workout.html
                .then(response => response.text()) // Get the response as text
                .then(html => {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = html;
                    const workoutSection = tempDiv.querySelector('main .container');

                    if (workoutSection) {
                        mainContent.innerHTML = workoutSection.innerHTML;
                        // reattach the event listener to the file input
                        const fileInput = document.getElementById('tcxFiles');
                        if (fileInput) {
                            fileInput.addEventListener('change', handleFileSelect);
                        }
                    } else {
                        console.error('Could not find the main content in compare_workouts.html');
                    }
                })
                .catch(error => console.error('Error fetching compare_workouts.html:', error));
        });
    }
});