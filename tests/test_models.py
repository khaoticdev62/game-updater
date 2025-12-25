import pytest
from pydantic import ValidationError
from models import Expansion, StuffPack, CommunityContent

def test_expansion_model_validation():
    data = {
        "id": "EP01",
        "name": "Get to Work",
        "release_date": "2015-03-31",
        "description": "Rule the workplace with The Sims 4 Get to Work."
    }
    ep = Expansion(**data)
    assert ep.id == "EP01"
    assert ep.name == "Get to Work"

def test_expansion_missing_field():
    with pytest.raises(ValidationError):
        Expansion(id="EP01")

def test_stuff_pack_model():
    data = {
        "id": "SP01",
        "name": "Luxury Party Stuff",
        "release_date": "2015-05-19",
        "description": "Throw a luxurious party."
    }
    sp = StuffPack(**data)
    assert sp.id == "SP01"

def test_community_content_model():
    data = {
        "id": "CC01",
        "name": "MC Command Center",
        "source": "https://deaderpool-mccc.com/",
        "description": "A collection of mods."
    }
    cc = CommunityContent(**data)
    assert cc.id == "CC01"
