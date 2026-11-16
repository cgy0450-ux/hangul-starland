"""Stable QA entry point: the current stone/bomb contract replaces the old easy-shot win."""
import runpy
from pathlib import Path
runpy.run_path(str(Path(__file__).with_name('stone_bomb.py')),run_name='__main__')
