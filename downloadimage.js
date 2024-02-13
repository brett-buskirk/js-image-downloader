const https = require('https');
const fs = require('fs');
const path = require('path');

function downloadImage(url, options = {}) {
    return new Promise((resolve, reject) => {
        const headers = options.headers || {};
        
        const requestOptions = {
            headers: headers
        };

        const req = https.get(url, requestOptions, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`Failed to download image. Status code: ${res.statusCode}`));
                return;
            }

            const contentType = res.headers['content-type'];
            const extension = contentType.split('/')[1];
            const filename = options.filename || `image_${Date.now()}.${extension}`;
            const imagePath = path.join(__dirname, filename);

            const fileStream = fs.createWriteStream(imagePath);
            res.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();
                resolve({ filename: filename, imagePath: imagePath });
            });

            fileStream.on('error', (err) => {
                fs.unlink(imagePath, () => { // Delete the file if any error occurs
                    reject(err);
                });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });
    });
}

// Example usage:
// downloadImage('https://example.com/image.jpg', { headers: { 'Authorization': 'Bearer token' }, filename: 'my_image.jpg' })
//     .then(result => {
//         console.log('Image downloaded successfully:', result.filename);
//         console.log('Image saved at:', result.imagePath);
//     })
//     .catch(error => {
//         console.error('Error:', error);
//     });
