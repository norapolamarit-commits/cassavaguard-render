"""Run CassavaGuard's verified training stages in a safe order.

The default trains the classical baseline and CNN.  Synthetic fusion is excluded
from production by default and requires ``--include-experimental-fusion``.
"""
from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

TRAINING_DIR = Path(__file__).resolve().parent


def parse_args(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--skip-classical", action="store_true")
    parser.add_argument("--skip-cnn", action="store_true")
    parser.add_argument("--include-experimental-fusion", action="store_true")
    parser.add_argument("--cnn-epochs-head", type=int, default=6)
    parser.add_argument("--cnn-epochs-fine", type=int, default=10)
    parser.add_argument("--cnn-batch-size", type=int, default=32)
    parser.add_argument("--skip-verify", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    return parser.parse_args(argv)


def main(argv=None):
    args = parse_args(argv)
    commands = []
    if not args.skip_classical:
        commands.append(("classical baseline", [sys.executable, str(TRAINING_DIR / "train_classifier.py")]))
    if args.include_experimental_fusion:
        commands.append(("EXPERIMENTAL fusion", [sys.executable,
                                                  str(TRAINING_DIR / "train_fusion_classifier.py")]))
    if not args.skip_cnn:
        cnn_command = [
            sys.executable, str(TRAINING_DIR / "train_cnn.py"),
            "--epochs-head", str(args.cnn_epochs_head),
            "--epochs-fine", str(args.cnn_epochs_fine),
            "--batch-size", str(args.cnn_batch_size),
        ]
        commands.append(("EfficientNet-B0 CNN", cnn_command))
    if not commands:
        raise SystemExit("no training stage selected")

    for stage, command in commands:
        print(f"\n=== {stage} ===", flush=True)
        print(" ".join(command), flush=True)
        if not args.dry_run:
            subprocess.run(command, check=True)

    verify_command = [sys.executable, str(TRAINING_DIR / "verify_artifacts.py")]
    if args.include_experimental_fusion:
        verify_command.append("--include-fusion")
    if not args.skip_cnn:
        verify_command.append("--require-cnn")
    if not args.skip_verify:
        print("\n=== artifact verification ===", flush=True)
        print(" ".join(verify_command), flush=True)
        if not args.dry_run:
            subprocess.run(verify_command, check=True)


if __name__ == "__main__":
    main()
