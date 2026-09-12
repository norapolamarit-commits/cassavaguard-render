import json


def test_published_yield_prior_has_provenance_and_fail_closed_status():
    with open("backend/ml_models/yield_reference_prior.json", encoding="utf-8") as handle:
        prior = json.load(handle)
    assert prior["source"]["doi"] == "10.17632/gh2nfyyknj.1"
    assert prior["source"]["license"] == "CC BY 4.0"
    assert prior["records"]["valid_height_weight_pairs"] == 216
    assert prior["fresh_root_weight_kg"]["p10"] < prior["fresh_root_weight_kg"]["median"] < prior["fresh_root_weight_kg"]["p90"]
    assert prior["production_eligible"] is False
