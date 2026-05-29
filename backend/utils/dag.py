"""Reusable DAG and connectivity utilities (parity with frontend graph/analytics.js)."""

from __future__ import annotations

from collections import defaultdict, deque
from typing import Iterable


def build_adjacency(node_ids: Iterable[str], edges: list[dict]) -> dict[str, list[str]]:
    adj: dict[str, list[str]] = {nid: [] for nid in node_ids}
    for edge in edges:
        src = edge["source"]
        tgt = edge["target"]
        if src in adj:
            adj[src].append(tgt)
    return adj


def detect_cycle_dfs(node_ids: list[str], edges: list[dict]) -> bool:
    """DFS cycle detection on directed graph."""
    adj = build_adjacency(node_ids, edges)
    visited: set[str] = set()
    in_stack: set[str] = set()

    def dfs(u: str) -> bool:
        visited.add(u)
        in_stack.add(u)
        for v in adj.get(u, []):
            if v not in visited:
                if dfs(v):
                    return True
            elif v in in_stack:
                return True
        in_stack.discard(u)
        return False

    for nid in node_ids:
        if nid not in visited and dfs(nid):
            return True
    return False


def detect_cycle_kahn(node_ids: list[str], edges: list[dict]) -> bool:
    """Kahn's algorithm: if topological sort can't include all nodes, a cycle exists."""
    indeg: dict[str, int] = {nid: 0 for nid in node_ids}
    adj: dict[str, list[str]] = defaultdict(list)

    for edge in edges:
        src, tgt = edge["source"], edge["target"]
        if src in indeg and tgt in indeg:
            adj[src].append(tgt)
            indeg[tgt] += 1

    queue = deque([nid for nid, d in indeg.items() if d == 0])
    visited = 0

    while queue:
        u = queue.popleft()
        visited += 1
        for v in adj[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                queue.append(v)

    return visited != len(node_ids)


def detect_cycle(node_ids: list[str], edges: list[dict]) -> bool:
    """Primary cycle check (DFS). Kahn available as alternate implementation."""
    return detect_cycle_dfs(node_ids, edges)


def compute_connectivity(node_ids: list[str], edges: list[dict]) -> tuple[list[str], list[str]]:
    """
    Returns (isolated_node_ids, disconnected_node_ids).
    Mirrors frontend computeConnectivity semantics.
    """
    if not node_ids:
        return [], []

    neighbors: dict[str, set[str]] = {nid: set() for nid in node_ids}
    indeg = {nid: 0 for nid in node_ids}
    outdeg = {nid: 0 for nid in node_ids}

    for edge in edges:
        src, tgt = edge["source"], edge["target"]
        if src not in neighbors or tgt not in neighbors:
            continue
        neighbors[src].add(tgt)
        neighbors[tgt].add(src)
        indeg[tgt] += 1
        outdeg[src] += 1

    isolated = [nid for nid in node_ids if indeg[nid] + outdeg[nid] == 0]

    # Undirected connected components
    visited: set[str] = set()
    components: list[list[str]] = []

    for nid in node_ids:
        if nid in visited:
            continue
        stack = [nid]
        comp: list[str] = []
        visited.add(nid)
        while stack:
            u = stack.pop()
            comp.append(u)
            for v in neighbors.get(u, set()):
                if v not in visited:
                    visited.add(v)
                    stack.append(v)
        components.append(comp)

    largest = max(components, key=len, default=[])
    largest_set = set(largest)
    disconnected = [nid for nid in node_ids if nid not in largest_set]

    return isolated, disconnected
