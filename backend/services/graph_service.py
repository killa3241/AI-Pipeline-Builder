"""Graph analysis service — no HTTP concerns."""

from __future__ import annotations

from models.pipeline_models import (
    PipelineEdge,
    PipelineNode,
    PipelineParseResponse,
)
from utils.dag import compute_connectivity, detect_cycle


class GraphValidationError(ValueError):
    """Raised when the graph structure is malformed (maps to HTTP 400)."""

    def __init__(self, messages: list[str]):
        self.messages = messages
        super().__init__("; ".join(messages))


def _validate_graph_structure(
    nodes: list[PipelineNode], edges: list[PipelineEdge]
) -> list[str]:
    errors: list[str] = []
    node_ids = {n.id for n in nodes}

    if len(node_ids) != len(nodes):
        errors.append("Duplicate node IDs detected.")

    seen_edges: set[str] = set()
    for edge in edges:
        if edge.source not in node_ids:
            errors.append(f"Edge '{edge.id}' references unknown source '{edge.source}'.")
        if edge.target not in node_ids:
            errors.append(f"Edge '{edge.id}' references unknown target '{edge.target}'.")
        if edge.source == edge.target:
            errors.append(f"Edge '{edge.id}' is a self-connection.")

        sh = edge.sourceHandle or ""
        th = edge.targetHandle or ""
        if sh and th:
            key = f"{edge.source}::{sh}-->{edge.target}::{th}"
        else:
            key = f"{edge.source}-->{edge.target}"
        if key in seen_edges:
            errors.append(f"Duplicate edge detected: {edge.id}.")
        else:
            seen_edges.add(key)

    return errors


def analyze_pipeline(
    nodes: list[PipelineNode], edges: list[PipelineEdge]
) -> PipelineParseResponse:
    """
    Analyze pipeline graph and return analytics aligned with frontend contract.
    """
    validation_errors = _validate_graph_structure(nodes, edges)
    if validation_errors:
        raise GraphValidationError(validation_errors)

    node_ids = [n.id for n in nodes]
    edge_dicts = [e.model_dump() for e in edges]

    num_nodes = len(nodes)
    num_edges = len(edges)

    cycle_detected = detect_cycle(node_ids, edge_dicts)
    is_dag = not cycle_detected

    isolated_ids, disconnected_ids = compute_connectivity(node_ids, edge_dicts)

    return PipelineParseResponse(
        num_nodes=num_nodes,
        num_edges=num_edges,
        is_dag=is_dag,
        cycle_detected=cycle_detected,
        isolated_nodes=len(isolated_ids),
        disconnected_nodes=len(disconnected_ids),
    )
