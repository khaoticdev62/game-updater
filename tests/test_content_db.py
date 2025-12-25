import pytest
from content_db import EXPANSIONS, STUFF_PACKS, COMMUNITY_CONTENT

def test_expansions_exist():
    assert len(EXPANSIONS) > 0
    # Check for a well-known EP
    ep_ids = [ep.id for ep in EXPANSIONS]
    assert "EP01" in ep_ids

def test_stuff_packs_exist():
    assert len(STUFF_PACKS) > 0

def test_community_content_exists():
    assert len(COMMUNITY_CONTENT) > 0
