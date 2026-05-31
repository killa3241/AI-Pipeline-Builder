"""Pydantic schemas for pipeline parse API."""

from __future__ import annotations

from pydantic import BaseModel, Field


class PipelineNode(BaseModel):
    id: str = Field(..., min_length=1)
    type: str | None = None
    data: dict | None = None


class PipelineEdge(BaseModel):
    id: str = Field(..., min_length=1)
    source: str = Field(..., min_length=1)
    target: str = Field(..., min_length=1)
    sourceHandle: str | None = None
    targetHandle: str | None = None


class PipelineParseRequest(BaseModel):
    nodes: list[PipelineNode]
    edges: list[PipelineEdge]


class PipelineParseResponse(BaseModel):
    num_nodes: int
    num_edges: int
    is_dag: bool
    cycle_detected: bool
    isolated_nodes: int
    disconnected_nodes: int
    pipeline_valid: bool
    validation_errors: list[str] = Field(default_factory=list)
