from pydantic import BaseModel
from typing import Optional

class ContentBase(BaseModel):
    """Base class for all Sims 4 content."""
    id: str
    name: str
    description: str

class Expansion(ContentBase):
    """Represents an Expansion Pack (EP)."""
    release_date: str

class StuffPack(ContentBase):
    """Represents a Stuff Pack (SP)."""
    release_date: str

class CommunityContent(BaseModel):
    """Represents community-created content like mods or CC."""
    id: str
    name: str
    source: str
    description: str
