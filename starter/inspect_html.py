import requests
html = requests.get('http://127.0.0.1:5000/').text
print('has select', 'id="difficulty"' in html)
print('has script', '/static/main.js' in html)
