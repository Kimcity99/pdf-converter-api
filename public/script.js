document.getElementById("convertTextBtn").addEventListener("click", async function() {
    const text = document.getElementById("textInput").value;

    if (!text) {
        alert("Please enter some text.");
        return;
    }

    const response = await fetch("http://localhost:5000/convert/text-to-pdf", {
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

    const response = await fetch("http://localhost:5000/convert/image-to-pdf", {
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
