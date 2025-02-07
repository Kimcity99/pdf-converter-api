const API_BASE_URL = "https://pdf-converter-api-6blm.onrender.com";  // Use the correct URL from Render

document.getElementById("convertTextBtn").addEventListener("click", async function () {
    const text = document.getElementById("textInput").value;

    if (!text) {
        alert("Please enter some text.");
        return;
    }

    const response = await fetch(`${API_BASE_URL}/convert/text-to-pdf`, {  // Use the correct Render URL
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text })
    });

    if (response.ok) {
        const pdfBlob = await response.blob();
        const downloadLink = document.getElementById("pdfDownload");
        downloadLink.href = URL.createObjectURL(pdfBlob);
        document.getElementById("downloadLink").style.display = "block";
    } else {
        alert("Failed to convert text to PDF.");
    }
});



document.getElementById("convertImageBtn").addEventListener("click", async function() {
    const imageInput = document.getElementById("imageInput");
    const formData = new FormData();

    if (!imageInput.files[0]) {
        alert("Please select an image.");
        return;
    }

    formData.append("image", imageInput.files[0]);

    const response = await fetch(`${API_BASE_URL}/convert/image-to-pdf`, {
        method: "POST",
        body: formData
    });

    if (response.ok) {
        const pdfBlob = await response.blob();
        const downloadLink = document.getElementById("pdfDownload");
        downloadLink.href = URL.createObjectURL(pdfBlob);
        document.getElementById("downloadLink").style.display = "block";
    } else {
        alert("Failed to convert image to PDF.");
    }
});
document.getElementById('convertPdfToJpgBtn').addEventListener('click', async function () {
    const pdfInput = document.getElementById('pdfInput');
    if (pdfInput.files.length === 0) {
        alert('Please select a PDF file.');
        return;
    }

    const file = pdfInput.files[0];
    const reader = new FileReader();

    reader.onload = async function (event) {
        const pdfData = new Uint8Array(event.target.result);

        // Load the PDF using pdf-lib
        const pdfDoc = await PDFLib.PDFDocument.load(pdfData);

        // Get the number of pages
        const pageCount = pdfDoc.getPageCount();

        // Convert each page to an image (JPG)
        for (let i = 0; i < pageCount; i++) {
            const page = pdfDoc.getPage(i);

            // Render the page to a canvas
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const viewport = page.getViewport({ scale: 2 }); // Increase scale for better quality
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            // Render the page onto the canvas
            await page.render({ canvasContext: context, viewport }).promise;

            // Convert the canvas to a JPG image
            const imageData = canvas.toDataURL('image/jpeg', 1.0);

            // Compress the image (optional)
            const compressedImage = await compressImage(imageData);

            // Create a download link for the JPG image
            const downloadLink = document.createElement('a');
            downloadLink.href = compressedImage;
            downloadLink.download = `page_${i + 1}.jpg`;
            downloadLink.textContent = `Download Page ${i + 1}`;

            // Append the download link to the container
            document.getElementById('jpgImagesContainer').appendChild(downloadLink);
            document.getElementById('jpgImagesContainer').appendChild(document.createElement('br'));
        }

        // Show the download links container
        document.getElementById('jpgDownloadLinks').style.display = 'block';
    };

    reader.readAsArrayBuffer(file);
});

// Function to compress the image
async function compressImage(imageData) {
    const blob = await fetch(imageData).then((res) => res.blob());
    const options = {
        maxSizeMB: 1, // Maximum size in MB
        maxWidthOrHeight: 1024, // Maximum width or height
        useWebWorker: true, // Use a web worker for better performance
    };
    const compressedBlob = await imageCompression(blob, options);
    return URL.createObjectURL(compressedBlob);
}