import os
from pathlib import Path


def test_timer_markup_and_script_are_present():
    template_path = Path('templates/index.html')
    script_path = Path('static/main.js')

    template_text = template_path.read_text(encoding='utf-8')
    script_text = script_path.read_text(encoding='utf-8')

    assert 'id="timer"' in template_text
    assert 'id="hint-button"' in template_text
    assert 'id="check-puzzle"' in template_text
    assert 'id="leaderboard"' in template_text
    assert 'startTimer()' in script_text
    assert 'stopTimer()' in script_text
    assert 'requestHint' in script_text
    assert 'checkPuzzle' in script_text
    assert 'localStorage' in script_text
    assert 'hintsUsed' in script_text
