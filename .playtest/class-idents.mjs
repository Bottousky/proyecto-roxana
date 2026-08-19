from pathlib import Path
import re,collections
s=Path('dist/assets/ExplorationScene-zhrZaFXr.js').read_text(encoding='utf-8');c=s[s.find('class uv extends'):s.find('export{uv',s.find('class uv extends'))]
ids=collections.Counter(re.findall(r'(?<![$\w])([A-Za-z_$][\w$]*)\s*\(',c))
for k,v in ids.most_common(): print(f'{k}\t{v}')
