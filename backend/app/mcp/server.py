from mcp.server.fastmcp import FastMCP
from app.services.ml import predict_risk
from app.services.xai import generate_shap_values
import json

# Create an MCP server instance
mcp = FastMCP("XAI-MedRisk-Server")

@mcp.tool()
def get_risk_prediction(age: int, bmi: float, symptoms: list[str]) -> str:
    """
    Given a patient's structured data, runs the ML model to predict health risk.
    """
    features = {"age": age, "bmi": bmi, "symptoms": symptoms}
    score = predict_risk(features)
    return json.dumps({"risk_score": score, "features": features})

@mcp.tool()
def get_feature_importance(structured_features_json: str, risk_score: float) -> str:
    """
    Given structured features and a risk score, runs SHAP to calculate feature importance.
    """
    try:
        features = json.loads(structured_features_json)
    except json.JSONDecodeError:
        return json.dumps({"error": "Invalid JSON for structured_features"})
        
    shap_values = generate_shap_values(features, risk_score)
    return shap_values

if __name__ == "__main__":
    # Start the MCP server over stdio
    # In production, this can also run over SSE (Server-Sent Events)
    mcp.run(transport='stdio')
