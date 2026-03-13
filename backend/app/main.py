import os
import io
from typing import List, Dict
import polars as pl
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from groq import Groq
from dotenv import load_dotenv
import uvicorn

# Load environment variables
load_dotenv()

app = FastAPI(title="Dataswiss Pro Engine", version="3.2.0")
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# --- PRODUCTION CORS CONFIGURATION ---
# Replace the list below with your actual frontend URL once Render generates it
origins = [
    "http://localhost:5173",          # Local development
    "https://dataswiss-advancedtool.onrender.com", # Your backend URL
    # Add your frontend Render URL here once it's deployed, e.g.:
    # "https://dataswiss-pro.onrender.com" 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Use ["*"] temporarily for easy deployment, then switch to the 'origins' list for security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- GATHERING: MULTI-FORMAT UPLOADS ---
@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    contents = await file.read()
    filename = file.filename.lower()
    
    try:
        if filename.endswith('.csv'):
            df = pl.read_csv(io.BytesIO(contents))
        elif filename.endswith('.json'):
            df = pl.read_json(io.BytesIO(contents))
        elif filename.endswith(('.xlsx', '.xls')):
            df = pl.read_excel(io.BytesIO(contents), engine="calamine")
        else:
            raise HTTPException(status_code=400, detail="Unsupported format. Use CSV, JSON, or Excel.")
        
        # Clean data: Remove completely empty rows
        df = df.filter(~pl.all_horizontal(pl.all().is_null()))
        
        return {"data": df.to_dicts()}
    except Exception as e:
        print(f"Server Processing Error: {e}")
        raise HTTPException(status_code=500, detail=f"Engine error: {str(e)}")

# --- TRANSFORMATION: POLARS REFINEMENT ---
@app.post("/api/transform")
async def transform_data(payload: List[Dict]):
    try:
        df = pl.DataFrame(payload)
        cols = df.columns
        
        # Identify types
        str_cols = [c for c in cols if df[c].dtype == pl.String]
        num_cols = [c for c in cols if df[c].dtype in [pl.Int64, pl.Float64]]
        
        ops = [pl.lit("refined").alias("status")]
        
        for c in str_cols:
            ops.append(pl.col(c).str.to_titlecase())
        for c in num_cols:
            ops.append((pl.col(c) * 1.2).alias(c))

        refined_df = df.with_columns(ops)
        return {"data": refined_df.to_dicts()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Polars error: {e}")

# --- INTELLIGENCE: GROQ AI (Llama 3.1) ---
@app.post("/api/ai-insight")
async def get_ai_insight(payload: List[Dict]):
    try:
        summary = str(payload[:15])
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a professional Data Analyst. Provide 2 punchy, elite sentences of insight about this data."},
                {"role": "user", "content": f"Analyze: {summary}"}
            ]
        )
        return {"insight": completion.choices[0].message.content}
    except Exception as e:
        return {"insight": "AI Error: Check the GROQ_API_KEY in Render Environment Variables."}

# --- REPORTING: EXPORT ---
@app.post("/api/export")
async def export_report(payload: List[Dict]):
    try:
        df = pl.DataFrame(payload)
        md_table = df.to_pandas().to_markdown(index=False)
        report = f"# Dataswiss Report\n\n{md_table}\n\n---\n*Generated via Dataswiss Engine*"
        return Response(content=report, media_type="text/markdown")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Export failed.")

if __name__ == "__main__":
    # Use environment variable for port to satisfy Render's requirements
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)