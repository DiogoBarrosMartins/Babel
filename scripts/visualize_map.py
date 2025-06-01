import requests
import matplotlib.pyplot as plt

response = requests.get("http://localhost:3005/world/map/raw")
tiles = response.json()

empty = [(t['x'], t['y']) for t in tiles if t['type'] == 'EMPTY']
outposts = [(t['x'], t['y'], t['race']) for t in tiles if t['type'] == 'OUTPOST']
villages = [(t['x'], t['y'], t['race']) for t in tiles if t['type'] == 'VILLAGE']

plt.figure(figsize=(12, 12))
plt.grid(True)

if empty:
    xs, ys = zip(*empty)
    plt.scatter(xs, ys, c='lightgrey', s=1, label='Empty')

race_colors = {
    'HUMAN': 'blue',
    'ORC': 'red',
    'ELF': 'green',
    'DWARF': 'orange',
    'UNDEAD': 'purple',
}

for x, y, race in outposts:
    plt.scatter(x, y, c=race_colors.get(race, 'black'), s=30, marker='^', label=f'{race} Outpost')

for x, y, race in villages:
    plt.scatter(x, y, c='sienna', s=20, marker='s', label=f'{race} Village')

plt.title('🌍 Babel World Map')
plt.xlabel('X')
plt.ylabel('Y')
plt.show()
