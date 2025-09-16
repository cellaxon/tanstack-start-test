// CloudFront Function for SPA routing
// This function should be associated with Viewer Request event

function handler(event) {
    var request = event.request;
    var uri = request.uri;

    // Check if the URI is a file request (has an extension)
    if (uri.includes('.')) {
        // It's a file, let it through
        return request;
    }

    // For routes without extensions, return index.html
    // This handles /dashboard, /login, etc.
    request.uri = '/index.html';

    return request;
}