import pytest
from content_db import EXPANSIONS, STUFF_PACKS, COMMUNITY_CONTENT
import re

def test_expansions_exist():
    assert len(EXPANSIONS) > 0
    # Check for a well-known EP
    ep_ids = [ep.id for ep in EXPANSIONS]
    assert "EP01" in ep_ids

def test_stuff_packs_exist():
    assert len(STUFF_PACKS) > 0

def test_community_content_exists():
    assert len(COMMUNITY_CONTENT) > 0

def test_unique_ids():
    ids = [ep.id for ep in EXPANSIONS] + [sp.id for sp in STUFF_PACKS] + [cc.id for cc in COMMUNITY_CONTENT]
    duplicates = [i for i in set(ids) if ids.count(i) > 1]
    assert len(ids) == len(set(ids)), f"Duplicate IDs found: {duplicates}"

def test_date_format():
    date_regex = re.compile(r'^\d{4}-\d{2}-\d{2}$')
    for item in EXPANSIONS + STUFF_PACKS:
        assert date_regex.match(item.release_date), f"Invalid date format for {item.id}: {item.release_date}"
