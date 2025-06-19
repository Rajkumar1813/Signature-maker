document.addEventListener('DOMContentLoaded', function() {

 // Theme toggle functionality
            const themeToggle = document.getElementById('themeToggle');
            const body = document.body;
            
            // Check for saved theme preference
            const currentTheme = localStorage.getItem('theme');
            if (currentTheme === 'dark') {
                body.classList.add('dark-mode');
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            }
            
            themeToggle.addEventListener('click', function() {
                body.classList.toggle('dark-mode');
                if (body.classList.contains('dark-mode')) {
                    localStorage.setItem('theme', 'dark');
                    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
                    showNotification('Dark mode enabled');
                } else {
                    localStorage.setItem('theme', 'light');
                    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
                    showNotification('Light mode enabled');
                }
            });
            
            // Scroll to top functionality
            const scrollToTopBtn = document.getElementById('scrollToTop');
            
            window.addEventListener('scroll', function() {
                if (window.pageYOffset > 300) {
                    scrollToTopBtn.classList.add('active');
                } else {
                    scrollToTopBtn.classList.remove('active');
                }
            });
            
            scrollToTopBtn.addEventListener('click', function() {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });

            // Hide loading screen after 3 seconds
            setTimeout(function() {
                document.querySelector('.loading-screen').classList.add('animate__fadeOut');
                setTimeout(function() {
                    document.querySelector('.loading-screen').style.display = 'none';
                }, 500);
            }, 3000);
            
            // Initialize signature pad
            const canvas = document.getElementById('signatureCanvas');
            const signaturePad = new SignaturePad(canvas, {
                backgroundColor: 'rgba(255, 255, 255, 0)',
                penColor: document.getElementById('signatureColor').value,
                minWidth: parseFloat(document.getElementById('signatureWidth').value),
                maxWidth: parseFloat(document.getElementById('signatureWidth').value)
            });
            
            // DOM elements
            const clearBtn = document.getElementById('clearBtn');
            const generateBtn = document.getElementById('generateBtn');
            const signatureColor = document.getElementById('signatureColor');
            const signatureWidth = document.getElementById('signatureWidth');
            const signatureType = document.getElementById('signatureType');
            const textSignatureContainer = document.getElementById('textSignatureContainer');
            const fontOptionsContainer = document.getElementById('fontOptionsContainer');
            const fontOptions = document.getElementById('fontOptions');
            const signatureText = document.getElementById('signatureText');
            const signaturePreview = document.getElementById('signaturePreview');
            const downloadSection = document.getElementById('downloadSection');
            const downloadPngBtn = document.getElementById('downloadPngBtn');
            const downloadJpgBtn = document.getElementById('downloadJpgBtn');
            const downloadSvgBtn = document.getElementById('downloadSvgBtn');
            const copySignatureBtn = document.getElementById('copySignatureBtn');
            const notification = document.getElementById('notification');
            const notificationMessage = document.getElementById('notificationMessage');
            
            // Selected font style
            let selectedFont = "'Dancing Script', cursive";
            
            // Show notification
            function showNotification(message) {
                notificationMessage.textContent = message;
                notification.style.display = 'block';
                setTimeout(function() {
                    notification.style.display = 'none';
                }, 3000);
            }
            
            // Fix for high DPI displays
            function resizeCanvas() {
                const ratio = Math.max(window.devicePixelRatio || 1, 1);
                canvas.width = canvas.offsetWidth * ratio;
                canvas.height = canvas.offsetHeight * ratio;
                canvas.getContext('2d').scale(ratio, ratio);
                signaturePad.clear(); // Clear on resize to prevent artifacts
            }
            
            // Initial resize
            window.addEventListener('resize', resizeCanvas);
            resizeCanvas();
            
            // Event listeners
            clearBtn.addEventListener('click', function() {
                signaturePad.clear();
                signaturePreview.style.display = 'none';
                canvas.style.display = 'block';
                downloadSection.style.display = 'none';
                showNotification('Signature cleared!');
            });
            
            signatureColor.addEventListener('input', function() {
                signaturePad.penColor = this.value;
                showNotification('Color changed successfully');
            });
            
            signatureWidth.addEventListener('input', function() {
                signaturePad.minWidth = parseFloat(this.value);
                signaturePad.maxWidth = parseFloat(this.value);
                showNotification('Line width adjusted');
            });
            
            signatureType.addEventListener('change', function() {
                if (this.value === 'text') {
                    textSignatureContainer.style.display = 'block';
                    fontOptionsContainer.style.display = 'block';
                    canvas.style.display = 'none';
                    showNotification('Text signature mode activated');
                } else {
                    textSignatureContainer.style.display = 'none';
                    fontOptionsContainer.style.display = 'none';
                    canvas.style.display = 'block';
                    showNotification('Draw signature mode activated');
                }
            });
            
            // Font selection
            fontOptions.querySelectorAll('.font-option').forEach(option => {
                option.addEventListener('click', function() {
                    // Remove active class from all options
                    fontOptions.querySelectorAll('.font-option').forEach(opt => {
                        opt.classList.remove('active');
                    });
                    
                    // Add active class to selected option
                    this.classList.add('active');
                    
                    // Set selected font
                    selectedFont = this.getAttribute('data-font');
                    showNotification(`Font changed to ${this.textContent.trim()}`);
                });
            });
            
            // Set first font as active by default
            fontOptions.querySelector('.font-option').classList.add('active');
            
            generateBtn.addEventListener('click', function() {
                if (signatureType.value === 'draw' && signaturePad.isEmpty()) {
                    showNotification('Please draw your signature first!');
                    return;
                }
                
                if (signatureType.value === 'text' && !signatureText.value.trim()) {
                    showNotification('Please enter your signature text!');
                    return;
                }
                
                generateSignature();
            });
            
            // Generate signature
            function generateSignature() {
                if (signatureType.value === 'draw') {
                    // For drawn signature
                    if (signaturePad.isEmpty()) {
                        showNotification('Please provide a signature first.');
                        return;
                    }
                    
                    const signatureData = signaturePad.toDataURL();
                    
                    // Show preview
                    signaturePreview.src = signatureData;
                    signaturePreview.style.display = 'block';
                    canvas.style.display = 'none';
                    downloadSection.style.display = 'block';
                    
                    // Prepare for download
                    prepareDownloadButtons(signatureData);
                    
                    showNotification('Signature generated successfully!');
                } else {
                    // For text signature
                    const text = signatureText.value.trim();
                    const color = signatureColor.value.substring(1); // Remove # from color
                    
                    // Create text signature
                    const textSignatureUrl = createTextSignature(text, color, selectedFont);
                    
                    // Show preview
                    signaturePreview.src = textSignatureUrl;
                    signaturePreview.style.display = 'block';
                    downloadSection.style.display = 'block';
                    
                    // Prepare for download
                    prepareDownloadButtons(textSignatureUrl);
                    
                    showNotification('Text signature created successfully!');
                }
            }
            
            // Create text signature
            function createTextSignature(text, color, font) {
                // Create a canvas to draw the text signature
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = 600;
                tempCanvas.height = 200;
                const ctx = tempCanvas.getContext('2d');
                
                // White background
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
                
                // Set font and color
                ctx.font = `italic 60px ${font}`;
                ctx.fillStyle = `#${color}`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // Draw text
                ctx.fillText(text, tempCanvas.width/2, tempCanvas.height/2);
                
                return tempCanvas.toDataURL('image/png');
            }
            
            function prepareDownloadButtons(signatureData) {
                // PNG download
                downloadPngBtn.onclick = function() {
                    downloadSignature(signatureData, 'png');
                    showNotification('PNG download started');
                };
                
                // JPG download
                downloadJpgBtn.onclick = function() {
                    const jpgData = signatureData.replace('png', 'jpeg');
                    downloadSignature(jpgData, 'jpg');
                    showNotification('JPG download started');
                };
                
                // SVG download (only for text signatures)
                if (signatureType.value === 'text') {
                    downloadSvgBtn.style.display = 'inline-block';
                    downloadSvgBtn.onclick = function() {
                        // For demo, we'll just download the PNG as SVG isn't easily generated client-side
                        downloadSignature(signatureData, 'svg');
                        showNotification('SVG download started');
                    };
                } else {
                    downloadSvgBtn.style.display = 'none';
                }
                
                // Copy to clipboard
                copySignatureBtn.onclick = function() {
                    if (navigator.clipboard) {
                        fetch(signatureData)
                            .then(res => res.blob())
                            .then(blob => {
                                navigator.clipboard.write([
                                    new ClipboardItem({
                                        'image/png': blob
                                    })
                                ]).then(() => {
                                    showNotification('Signature copied to clipboard!');
                                }).catch(err => {
                                    console.error('Could not copy image: ', err);
                                    showNotification('Failed to copy signature. Please try downloading instead.');
                                });
                            });
                    } else {
                        showNotification('Clipboard API not supported in your browser. Please download the signature.');
                    }
                };
            }
            
            function downloadSignature(dataUrl, format) {
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = `Signature_Craft_${new Date().getTime()}.${format}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            
            // Fix for mobile devices
            if ('ontouchstart' in window) {
                document.body.style.marginBottom = '50px'; // Add space for fingers
                
                // Prevent scrolling when drawing
                canvas.addEventListener('touchstart', function(e) {
                    if (e.target === canvas) {
                        e.preventDefault();
                    }
                }, { passive: false });
                
                canvas.addEventListener('touchmove', function(e) {
                    if (e.target === canvas) {
                        e.preventDefault();
                    }
                }, { passive: false });
            }
        });