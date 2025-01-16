document.addEventListener('DOMContentLoaded', () => {
    const paceToggle = document.getElementById('pace-toggle');
    const toggleLabel = document.getElementById('toggle-label');

    paceToggle.addEventListener('change', () => {
        toggleLabel.textContent = paceToggle.checked ? 'min/mile' : 'min/km';
    });
});

function convertPaceToMiles() {
    const hh = parseInt(document.getElementById('pace-min-km-hh').value) || 0;
    const mm = parseInt(document.getElementById('pace-min-km-mm').value) || 0;
    const ss = parseInt(document.getElementById('pace-min-km-ss').value) || 0;
    const paceInSeconds = timeToSeconds(hh, mm, ss);
    const paceMinMile = paceInSeconds * 1.60934;
    document.getElementById('pace-min-mile-result').textContent = `Pace: ${secondsToTime(paceMinMile)} min/mile`;
}

function convertPaceToKm() {
    const hh = parseInt(document.getElementById('pace-min-mile-hh').value) || 0;
    const mm = parseInt(document.getElementById('pace-min-mile-mm').value) || 0;
    const ss = parseInt(document.getElementById('pace-min-mile-ss').value) || 0;
    const paceInSeconds = timeToSeconds(hh, mm, ss);
    const paceMinKm = paceInSeconds / 1.60934;
    document.getElementById('pace-min-km-result').textContent = `Pace: ${secondsToTime(paceMinKm)} min/km`;
}

function convertPace() {
    const hh = parseInt(document.getElementById('pace-hh').value) || 0;
    const mm = parseInt(document.getElementById('pace-mm').value) || 0;
    const ss = parseInt(document.getElementById('pace-ss').value) || 0;
    const paceInSeconds = timeToSeconds(hh, mm, ss);
    const conversionType = document.getElementById('pace-toggle').checked ? 'min/mile' : 'min/km';

    let convertedPace;
    if (conversionType === 'min/km') {
        convertedPace = paceInSeconds / 1.60934;
        document.getElementById('pace-result').textContent = `Pace: ${secondsToTime(convertedPace)} min/km`;
    } else {
        convertedPace = paceInSeconds * 1.60934;
        document.getElementById('pace-result').textContent = `Pace: ${secondsToTime(convertedPace)} min/mile`;
    }
}

function calculatePace() {
    const hh = parseInt(document.getElementById('time-hh').value) || 0;
    const mm = parseInt(document.getElementById('time-mm').value) || 0;
    const ss = parseInt(document.getElementById('time-ss').value) || 0;
    const distance = parseFloat(document.getElementById('distance').value);
    const timeInSeconds = timeToSeconds(hh, mm, ss);
    const paceInSeconds = timeInSeconds / distance;
    document.getElementById('pace-result').textContent = `Pace: ${secondsToTime(paceInSeconds)} min/km or min/mile`;
}

function timeToSeconds(hh, mm, ss) {
    return (hh * 3600) + (mm * 60) + ss;
}

function secondsToTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}