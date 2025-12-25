import asyncio
import httpx
from typing import List, Dict, Any

class MirrorDiscovery:
    """
    Handles parallel probing and discovery of game content mirrors.
    """
    def __init__(self, mirrors: List[Dict[str, Any]]):
        self.mirrors = mirrors

    def get_weighted_mirrors(self) -> List[Dict[str, Any]]:
        """Returns mirrors sorted by their weight (descending)."""
        return sorted(self.mirrors, key=lambda x: x.get("weight", 0), reverse=True)

    async def probe_mirror(self, client: httpx.AsyncClient, mirror: Dict[str, Any]) -> Dict[str, Any]:
        """Probes a single mirror for availability and latency."""
        url = mirror["url"]
        try:
            start_time = asyncio.get_event_loop().time()
            # Use HEAD request to check availability without downloading
            response = await client.head(url, timeout=5.0)
            latency = asyncio.get_event_loop().time() - start_time
            
            return {
                **mirror,
                "available": response.status_code == 200,
                "latency": latency,
                "error": None
            }
        except Exception as e:
            return {
                **mirror,
                "available": False,
                "latency": float('inf'),
                "error": str(e)
            }

    async def discover_best_mirrors(self) -> List[Dict[str, Any]]:
        """Probes all mirrors in parallel and returns results sorted by health and weight."""
        async with httpx.AsyncClient() as client:
            tasks = [self.probe_mirror(client, m) for m in self.mirrors]
            results = await asyncio.gather(*tasks)
        
        # Sort by: 1. Availability, 2. Weight (desc), 3. Latency (asc)
        return sorted(
            results,
            key=lambda x: (x["available"], x.get("weight", 0), -x.get("latency", 0)),
            reverse=True
        )
