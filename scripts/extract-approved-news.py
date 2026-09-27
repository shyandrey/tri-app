"""Extract exact visible text/time from a saved public Telegram embed (stdlib only).
This does not approve posts or derive Bot API entities from HTML.
"""
from html.parser import HTMLParser
import argparse
import json
from pathlib import Path


class TelegramEmbed(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.depth = 0
        self.parts = []
        self.published_at = None
        self.post = None

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if attrs.get('data-post'):
            self.post = attrs['data-post']
        if tag == 'div':
            if self.depth:
                self.depth += 1
            elif 'js-message_text' in attrs.get('class', '').split():
                self.depth = 1
        if self.depth and tag == 'br':
            self.parts.append('\n')
        if tag == 'time' and 'datetime' in attrs:
            self.published_at = attrs['datetime']

    def handle_endtag(self, tag):
        if tag == 'div' and self.depth:
            self.depth -= 1

    def handle_data(self, data):
        if self.depth:
            self.parts.append(data)


def extract(html):
    parser = TelegramEmbed()
    parser.feed(html)
    return dict(post=parser.post, publishedAt=parser.published_at, publishedText=''.join(parser.parts))


if __name__ == '__main__':
    cli = argparse.ArgumentParser()
    cli.add_argument('html')
    args = cli.parse_args()
    print(json.dumps(extract(Path(args.html).read_text()), ensure_ascii=False, indent=2))
