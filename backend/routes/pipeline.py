"""Pipeline HTTP routes — delegates to graph service."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from models.pipeline_models import PipelineParseRequest, PipelineParseResponse
from services.graph_service import GraphValidationError, analyze_pipeline

router = APIRouter(prefix="/pipelines", tags=["pipelines"])


@router.post("/parse", response_model=PipelineParseResponse)
def parse_pipeline(body: PipelineParseRequest) -> PipelineParseResponse:
    try:
        return analyze_pipeline(body.nodes, body.edges)
    except GraphValidationError as exc:
        raise HTTPException(status_code=400, detail={"errors": exc.messages}) from exc
