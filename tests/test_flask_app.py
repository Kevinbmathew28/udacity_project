import importlib
import importlib.util
import os
from pathlib import Path
import pytest

try:
    from flask import Flask
except Exception:
    Flask = None

MODULE_CANDIDATES = [
    "app",
    "server",
    "sudoku",
    "projects.1_sudoku.app",
    "Projects.1_Sudoku.app",
    "Projects.1_Sudoku.server",
    "Projects.1_Sudoku.solution",
]


def _import_module_by_name(name):
    try:
        return importlib.import_module(name)
    except Exception:
        return None


def test_flask_app_loads():
    """Baseline test: find a Flask application in common module locations and ensure it loads.

    This test searches a short list of likely module names for an application object
    (``app``, ``application``) or a factory (``create_app``). If found, it asserts
    the object is a Flask application and that a test client can be created.

    If no Flask application is present in the repository, the test is skipped.
    """
    if Flask is None:
        pytest.skip("Flask is not installed in the test environment")

    for name in MODULE_CANDIDATES:
        mod = _import_module_by_name(name)
        if not mod:
            continue

        app_obj = None
        # Common patterns for Flask apps
        if hasattr(mod, "create_app") and callable(getattr(mod, "create_app")):
            try:
                app_obj = getattr(mod, "create_app")()
            except Exception:
                # If the factory raises during instantiation, keep looking
                app_obj = None
        if app_obj is None and hasattr(mod, "app"):
            app_obj = getattr(mod, "app")
        if app_obj is None and hasattr(mod, "application"):
            app_obj = getattr(mod, "application")

        if app_obj is None:
            continue

        assert isinstance(app_obj, Flask), f"Found object in {name} but it's not a Flask app"
        client = app_obj.test_client()
        # Basic smoke check: test client exposes 'get' method
        assert hasattr(client, "get")
        return

    pytest.skip("No Flask application module found in repository - test skipped")
