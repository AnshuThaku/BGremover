from fastapi import FastAPI, File, UploadFile
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from rembg import remove
from PIL import Image
import io

app = FastAPI()

# --- MIDDLEWARE ---
# Enable CORS so frontend applications can communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

# --- HELPER FUNCTION ---
def optimize_image(image_bytes: bytes, max_width: int = 1024) -> Image.Image:
    """
    Reads an image from bytes and resizes it if it exceeds the max_width,
    maintaining the original aspect ratio to preserve image quality.
    """
    img = Image.open(io.BytesIO(image_bytes))
    
    if img.width > max_width:
        # Calculate new height while maintaining the aspect ratio
        ratio = max_width / float(img.width)
        new_height = int(float(img.height) * float(ratio))
        
        # Resize using high-quality downsampling
        img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
        
    return img

# --- API ENDPOINTS ---
@app.get("/")
def health_check():
    return {"status": "success", "message": "Background Removal API is running"}

@app.post("/remove-bg")
async def remove_background(file: UploadFile = File(...)):
    # 1. Read the uploaded file into memory
    input_bytes = await file.read()
    
    # 2. Optimize/Resize the image to prevent high memory usage during AI processing
    optimized_img = optimize_image(input_bytes)
    
    # 3. Process the image using rembg
    # rembg seamlessly accepts a PIL Image and returns a transparent PIL Image
    output_img = remove(optimized_img)
    
    # 4. Save the processed image back into an in-memory byte stream as a PNG
    image_stream = io.BytesIO()
    output_img.save(image_stream, format="PNG")
    
    # Reset the stream position to the beginning so it can be read by StreamingResponse
    image_stream.seek(0)
    
    # 5. Return the image directly to the client
    return StreamingResponse(image_stream, media_type="image/png")