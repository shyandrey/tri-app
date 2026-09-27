"""Strict extraction of server-rendered Stats PTO professional result tables.
Python standard library only; stdin HTML -> stdout JSON. No network or writes.
"""
import json
import re
import sys
from html.parser import HTMLParser


class Node:
    def __init__(self, tag='', attrs=(), parent=None):
        self.tag, self.attrs, self.parent, self.children = tag, dict(attrs), parent, []

    def text(self):
        return ''.join(c if isinstance(c, str) else c.text() for c in self.children)

    def find(self, tag=None, cls=None):
        for child in self.children:
            if isinstance(child, Node):
                if (tag is None or child.tag == tag) and (cls is None or cls in (child.attrs.get('class') or '').split()):
                    yield child
                yield from child.find(tag, cls)


class Document(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = self.current = Node()

    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs, self.current)
        self.current.children.append(node)
        if tag not in {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}:
            self.current = node

    def handle_endtag(self, tag):
        node = self.current
        while node.parent:
            if node.tag == tag:
                self.current = node.parent
                return
            node = node.parent

    def handle_data(self, data):
        self.current.children.append(data)


def clean(value):
    return ' '.join(value.split())


def time_value(value):
    value = re.sub(r'\s*\(\d+\)\s*$', '', value).strip()
    if value in {'', '-', '--:--', '—'}:
        return None
    if not re.fullmatch(r'(?:\d+:)?\d{1,2}:[0-5]\d', value):
        raise ValueError('Unknown time: ' + value)
    return value


def parse(html):
    doc = Document()
    doc.feed(html)
    title = [clean(n.text()) for n in doc.root.find('h1')]
    if len(title) != 1:
        raise ValueError('Expected a single race title')
    tables = list(doc.root.find('table', 'race-results'))
    if not tables:
        raise ValueError('No professional result tables')
    groups = []
    for table in tables:
        parent = table.parent
        while parent and parent.attrs.get('id') not in {'FPRO', 'MPRO'}:
            parent = parent.parent
        if not parent:
            raise ValueError('Result table has no explicit professional gender panel')
        gender = {'FPRO': 'W', 'MPRO': 'M'}[parent.attrs['id']]
        headings = [clean(n.text()) for n in parent.find(cls='sof-heading')]
        if len(headings) > 1:
            raise ValueError('Ambiguous SOF in ' + parent.attrs['id'])
        sof = None
        if headings:
            match = re.fullmatch(r'SOF:\s*(\d+(?:\.\d+)?)', headings[0])
            if not match:
                raise ValueError('Unsupported SOF: ' + headings[0])
            sof = float(match[1])
        trs = list(table.find('tr'))
        headers = list(trs[0].find('td'))
        labels = [clean(c.text()) for c in headers]
        if labels[:8] != ['', '', 'Swim', 'T1', 'Bike', 'T2', 'Run', 'Overall'] or labels[-1] != 'PTO Pts' or len(labels) not in {9, 10}:
            raise ValueError('Unsupported result columns: ' + repr(labels))
        if len(labels) == 10 and not any('T100' in n.attrs.get('alt', '') for n in headers[8].find('img')):
            raise ValueError('Unknown series-points column')
        rows = []
        for tr in trs[1:]:
            cells = list(tr.find('td'))
            raw = [clean(c.text()) for c in cells]
            if len(raw) != len(labels):
                raise ValueError('Malformed row width')
            names = list(cells[1].find('a', 'headline'))
            if len(names) != 1 or not names[0].attrs.get('href', '').startswith('/athlete/'):
                raise ValueError('Ambiguous athlete identity')
            name = clean(names[0].text())
            position = int(raw[0]) if re.fullmatch(r'[1-9]\d*', raw[0]) else raw[0]
            if not isinstance(position, int) and position not in {'DNF', 'DNS', 'DSQ'}:
                raise ValueError('Unknown position/status: ' + raw[0])
            flags = [c[10:].upper() for n in cells[1].find() for c in n.attrs.get('class', '').split() if re.fullmatch(r'flag-icon-[a-z]{2}', c)]
            if len(set(flags)) > 1:
                raise ValueError('Conflicting country flags')
            row = {'athleteName': name, 'gender': gender, 'position': position}
            if flags:
                row['countryCode'] = flags[0]
            for field, value in zip(['swimTime', 't1Time', 'bikeTime', 't2Time', 'runTime', 'totalTime'], raw[2:8]):
                parsed = time_value(value)
                if parsed is not None:
                    row[field] = parsed
            for field, value in [('ptoPoints', raw[-1])] + ([('seriesPoints', raw[8])] if len(raw) == 10 else []):
                if value not in {'', '-', '—'}:
                    if not re.fullmatch(r'\d+(?:\.\d+)?', value):
                        raise ValueError('Invalid points: ' + value)
                    row[field] = float(value)
            rows.append({'result': row, 'athletePath': names[0].attrs['href'], 'rawCells': raw})
        if not rows or len({r['result']['athleteName'] for r in rows}) != len(rows):
            raise ValueError('Empty or duplicate field')
        group = {'panel': parent.attrs['id'], 'gender': gender, 'rows': rows}
        if sof is not None:
            group['sof'] = sof
        groups.append(group)
    if len({g['gender'] for g in groups}) != len(groups):
        raise ValueError('Duplicate gender tables')
    return {'title': title[0], 'dates': re.findall(r'<b>Date:</b>\s*([^<]+)', html), 'groups': groups}


if __name__ == '__main__':
    print(json.dumps(parse(sys.stdin.read()), ensure_ascii=False))
