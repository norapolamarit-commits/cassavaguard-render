"""Runtime-visible model and dataset readiness for every displayed condition.

The product taxonomy contains mutually exclusive leaf-disease classes, pests that
need object detection/counting, and abiotic stresses that need field context.  They
must not be represented as one fabricated 13-way softmax.  This module is the single
source of truth used by both the API and UI to disclose what can actually be served.
"""
from __future__ import annotations

from backend.config import CLASSES
from backend.services.brown_spot_classifier import (
    get_brown_spot_classifier,
    get_brown_spot_metrics,
)
from backend.services.feature_extraction import ML_CLASS_ORDER
from backend.services.white_leaf_spot_classifier import (
    get_white_leaf_spot_classifier,
    get_white_leaf_spot_metrics,
)
from backend.services.whitefly_detector import (
    get_whitefly_metrics,
    get_whitefly_session,
)

TFDS_SOURCE = {
    "name": "TensorFlow Datasets — Cassava",
    "url": "https://www.tensorflow.org/datasets/catalog/cassava",
    "license": "Upstream image licence not declared in the TFDS catalog",
}

CCMT_SOURCE = {
    "name": "CCMT: Dataset for Crop Pest and Disease Detection",
    "url": "https://doi.org/10.17632/bwh3zbpkpv.1",
    "license": "CC BY 4.0",
}

WHITEFLY_SOURCE = {
    "name": "Cassava Whitefly Dataset",
    "url": "https://doi.org/10.17632/5g38399z9p.3",
    "license": "CC BY 4.0",
}

EMBRAPA_SOURCE = {
    "name": "Embrapa Plant Disease Image Database (PDDB)",
    "url": "https://doi.org/10.48432/XA1OVL",
    "license": "Embrapa CC BY-NC 4.0",
    "commercial_use_allowed": False,
}

CIAT_MEALYBUG_SOURCE = {
    "name": "CIAT cassava mealybug photographs via Wikimedia Commons",
    "url": "https://commons.wikimedia.org/wiki/File:Mealybug2_(4288382696).jpg",
    "license": "CC BY-SA 2.0",
}

BUGWOOD_NUTRIENT_SOURCE = {
    "name": "Bugwood cassava zinc-deficiency image 5356709",
    "url": "https://www.invasive.org/browse/detail.cfm?imgnum=5356709",
    "license": "CC BY 3.0",
}

SYNTHETIC_SEED = {
    "images": 1,
    "origin": "synthetic",
    "use": "train-only augmentation seed",
    "evaluation_allowed": False,
    "expert_review_required": True,
}


_PENDING = {
    "cad": {
        "task": "auxiliary_binary_classification",
        "status": "real_data_insufficient_synthetic_seed",
        "reason": (
            "Downloaded 1 expert-labelled real CAD image and 1 synthetic train-only "
            "seed. This is far below a defensible train/validation/test requirement."
        ),
        "dataset": {**EMBRAPA_SOURCE, "images": 1},
        "synthetic": SYNTHETIC_SEED,
    },
    "brown_leaf_spot": {
        "task": "auxiliary_binary_classification",
        "status": "dataset_available_training_required",
        "reason": "Real labelled images are available, but no verified runtime artifact has been trained yet.",
        "dataset": CCMT_SOURCE,
    },
    "white_leaf_spot": {
        "task": "auxiliary_binary_classification",
        "status": "real_dataset_downloaded_training_required",
        "reason": (
            "Downloaded 115 expert-labelled real images plus 1 synthetic train-only "
            "seed. A leakage-safe negative set, independent test set and trained "
            "artifact are still required; the source is non-commercial."
        ),
        "dataset": {**EMBRAPA_SOURCE, "images": 115},
        "synthetic": SYNTHETIC_SEED,
    },
    "sed": {
        "task": "whole_plant_multiview_classification",
        "status": "synthetic_seed_real_data_required",
        "reason": (
            "Only 1 generated whole-plant seed is present. No reusable labelled "
            "multiview real-image dataset was verified, so training or evaluation "
            "would not be valid."
        ),
        "dataset": {
            "name": "CassavaGuard synthetic SED seed",
            "license": "synthetic; not evaluation data",
            **SYNTHETIC_SEED,
        },
    },
    "mealybug": {
        "task": "object_detection",
        "status": "real_data_insufficient_synthetic_seed",
        "reason": (
            "Downloaded 3 real CIAT photographs and added 1 synthetic train-only "
            "seed. They have image-level descriptions but no bounding boxes and are "
            "far too few for a detector."
        ),
        "dataset": {**CIAT_MEALYBUG_SOURCE, "images": 3, "annotation": "image-level"},
        "synthetic": SYNTHETIC_SEED,
    },
    "whitefly": {
        "task": "object_detection_and_counting",
        "status": "real_dataset_downloaded_detector_training_required",
        "reason": (
            "Downloaded and checksum-verified 3,000 real images with paired PASCAL "
            "VOC boxes. A detector, relevant negatives and held-out field evaluation "
            "are still required before serving."
        ),
        "dataset": {**WHITEFLY_SOURCE, "images": 3000, "annotation": "PASCAL VOC bounding boxes"},
    },
    "water_stress": {
        "task": "multimodal_field_stress_estimation",
        "status": "synthetic_seed_real_paired_data_required",
        "reason": (
            "Only 1 generated train-only seed is present. Production training needs "
            "real cassava images paired by field/time with soil moisture, weather "
            "and expert stress labels."
        ),
        "dataset": {
            "name": "CassavaGuard synthetic water-stress seed",
            "license": "synthetic; not evaluation data",
            **SYNTHETIC_SEED,
        },
    },
    "nutrient_def": {
        "task": "multimodal_field_stress_estimation",
        "status": "real_data_insufficient_synthetic_seed",
        "reason": (
            "Downloaded 1 real laboratory image labelled zinc deficiency and added "
            "1 synthetic potassium-deficiency seed. A generic nutrient class cannot "
            "be validated without real soil/tissue measurements and nutrient-specific labels."
        ),
        "dataset": {**BUGWOOD_NUTRIENT_SOURCE, "images": 1},
        "synthetic": SYNTHETIC_SEED,
    },
}


def class_readiness() -> list[dict]:
    """Return all display classes with an explicit production-readiness contract."""
    brown_model = get_brown_spot_classifier()
    brown_metrics = get_brown_spot_metrics() if brown_model is not None else None
    white_model = get_white_leaf_spot_classifier()
    white_metrics = (
        get_white_leaf_spot_metrics() if white_model is not None else None
    )
    whitefly_model = get_whitefly_session()
    whitefly_metrics = (
        get_whitefly_metrics() if whitefly_model is not None else None
    )
    output = []
    for item in CLASSES:
        key = item["key"]
        if key in ML_CLASS_ORDER:
            readiness = {
                "task": "five_way_leaf_classification",
                "status": "serving_trained_model",
                "production_output": True,
                "model_head": "cnn_efficientnet_b2",
                "dataset": TFDS_SOURCE,
                "reason": "Included in the verified five-class CNN probability output.",
            }
        elif key == "brown_leaf_spot" and brown_metrics is not None:
            readiness = {
                "task": "auxiliary_binary_classification",
                "status": "serving_trained_auxiliary_model",
                "production_output": True,
                "model_head": brown_metrics["model_id"],
                "dataset": {
                    **CCMT_SOURCE,
                    "effective_images": sum(brown_metrics["dataset"]["counts"].values()),
                },
                "reason": (
                    "Served as an independent auxiliary finding with mandatory "
                    "expert review; it is not mixed into the five-way softmax."
                ),
                "test": {
                    "macro_f1": brown_metrics["test"]["macro_f1"],
                    "roc_auc": brown_metrics["test"]["roc_auc"],
                    "brown_leaf_spot_recall": (
                        brown_metrics["test"]["per_class"]["brown_leaf_spot"]["recall"]
                    ),
                },
            }
        elif key == "white_leaf_spot" and white_metrics is not None:
            readiness = {
                "task": "auxiliary_binary_classification",
                "status": "serving_experimental_auxiliary_model",
                "production_output": False,
                "model_head": white_metrics["model_id"],
                "dataset": {
                    **EMBRAPA_SOURCE,
                    "images": 115,
                },
                "synthetic": SYNTHETIC_SEED,
                "reason": (
                    "Executable only as an experimental review-only auxiliary finding "
                    "with mandatory expert review. Cross-source confounding, the "
                    "non-commercial data licence and absent Thai-field holdout "
                    "block production release."
                ),
                "test": {
                    "macro_f1": white_metrics["test"]["macro_f1"],
                    "roc_auc": white_metrics["test"]["roc_auc"],
                    "white_leaf_spot_recall": (
                        white_metrics["test"]["per_class"]["white_leaf_spot"]["recall"]
                    ),
                },
            }
        elif key == "whitefly" and whitefly_metrics is not None:
            test = whitefly_metrics["test"]
            test_evaluated = test.get("evaluated") is not False
            evaluation = (
                test if test_evaluated
                else whitefly_metrics["validation_operating_point"]
            )
            readiness = {
                "task": "object_detection_and_counting",
                "status": "serving_review_only_detector",
                "production_output": False,
                "model_head": whitefly_metrics["model_id"],
                "dataset": {
                    **WHITEFLY_SOURCE,
                    "images": 3000,
                    "annotation": "PASCAL VOC bounding boxes",
                },
                "reason": (
                    "Executable only for review. The model was selected on grouped "
                    "acquisition-run validation; sealed test metrics remain unavailable "
                    "until the validation gate passes."
                ),
                "evaluation_warning": whitefly_metrics.get("evaluation_warning"),
                "evaluation": {
                    "set": "test" if test_evaluated else "validation",
                    "precision": evaluation.get("metrics/precision(B)", evaluation.get("precision")),
                    "recall": evaluation.get("metrics/recall(B)", evaluation.get("recall")),
                    "f1": evaluation.get("f1"),
                    "map50": (
                        test.get("metrics/mAP50(B)") if test_evaluated
                        else whitefly_metrics["validation"].get("metrics/mAP50(B)")
                    ),
                    "map50_95": (
                        test.get("metrics/mAP50-95(B)") if test_evaluated
                        else whitefly_metrics["validation"].get("metrics/mAP50-95(B)")
                    ),
                },
            }
        else:
            readiness = {
                **_PENDING[key],
                "production_output": False,
                "model_head": None,
            }
        output.append({**item, **readiness})
    return output


def readiness_by_key() -> dict[str, dict]:
    return {item["key"]: item for item in class_readiness()}


def readiness_summary() -> dict:
    rows = class_readiness()
    statuses: dict[str, int] = {}
    for row in rows:
        statuses[row["status"]] = statuses.get(row["status"], 0) + 1
    return {
        "display_classes": len(rows),
        "serving_classes": sum(bool(row["production_output"]) for row in rows),
        "not_serving_classes": sum(not row["production_output"] for row in rows),
        "statuses": statuses,
        "taxonomy": "multi_head",
        "note": (
            "Disease classification, pest detection/counting and multimodal stress "
            "estimation are separate heads; probabilities are never fabricated into "
            "one 13-way distribution."
        ),
    }
