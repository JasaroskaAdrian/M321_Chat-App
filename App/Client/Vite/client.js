if (location.host.includes('localhost')) {
    // Makes the Application on Live Reload if its hosted on Localhost
    document.write(
        `<script src="http://${(location.host || 'localhost').split(':')[0]}:35729/livereload.js?snipver=1"></script>`
    )
}
console.log("Vite Live Reload Running...")