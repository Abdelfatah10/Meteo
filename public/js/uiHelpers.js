let isCurrentLocation = false;

// Warning Box
export function showWarningBox() {
    // Show only once per user using localStorage
    if (!localStorage.getItem('locationWarningShown')) {
        const box = document.getElementById('location-warning');
        if (box) box.style.display = 'block';
        localStorage.setItem('locationWarningShown', 'true');
    }
}

// Spinner
export function showSpinner() {
    document.getElementById('spinner').style.display = 'flex';
}
export function hideSpinner() {
    document.getElementById('spinner').style.display = 'none';
}

// Is Current Location
export function getIsCurrentLocation() {
    return isCurrentLocation;
}
// Set Current Location
export function setIsCurrentLocation(value) {
    isCurrentLocation = value;
}
