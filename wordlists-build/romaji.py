"""Kana to romaji in kotoba's spelling: modified Hepburn, lowercase, no macrons, long vowels as spelled
(ou, ei, ee), katakana ー doubles the vowel (koohii), n' before a vowel or y, っ before ch is t (kotchi).
Particles can't be told from kana, so は/へ/を come out as ha/he/o; compare() allows for that."""
import re

_BASE = {
    'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o', 'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
    'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so', 'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
    'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no', 'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
    'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo', 'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
    'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro', 'わ': 'wa', 'ゐ': 'i', 'ゑ': 'e', 'を': 'o', 'ん': 'n',
    'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go', 'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
    'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do', 'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
    'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po', 'ゔ': 'vu',
    'ぁ': 'a', 'ぃ': 'i', 'ぅ': 'u', 'ぇ': 'e', 'ぉ': 'o', 'ゃ': 'ya', 'ゅ': 'yu', 'ょ': 'yo', 'ゎ': 'wa',
}
_DIGRAPH = {}
for k, r in (('き', 'ky'), ('ぎ', 'gy'), ('し', 'sh'), ('じ', 'j'), ('ち', 'ch'), ('に', 'ny'), ('ひ', 'hy'), ('び', 'by'),
             ('ぴ', 'py'), ('み', 'my'), ('り', 'ry'), ('ぢ', 'j')):
    for s, v in (('ゃ', 'a'), ('ゅ', 'u'), ('ょ', 'o')):
        _DIGRAPH[k + s] = r + v
for k, r in (('し', 'sh'), ('じ', 'j'), ('ち', 'ch')):
    _DIGRAPH[k + 'ぇ'] = r + 'e'
_DIGRAPH.update({'てぃ': 'ti', 'でぃ': 'di', 'とぅ': 'tu', 'どぅ': 'du', 'ふぁ': 'fa', 'ふぃ': 'fi', 'ふぇ': 'fe', 'ふぉ': 'fo',
                 'うぃ': 'wi', 'うぇ': 'we', 'うぉ': 'wo', 'ゔぁ': 'va', 'ゔぃ': 'vi', 'ゔぇ': 've', 'ゔぉ': 'vo', 'つぁ': 'tsa',
                 'てゅ': 'tyu', 'でゅ': 'dyu', 'いぇ': 'ye', 'くぁ': 'kwa'})


def to_hira(s):
    return ''.join(chr(ord(c) - 0x60) if 'ァ' <= c <= 'ヶ' else c for c in s)


def kana_to_romaji(text):
    s = to_hira(text)
    out, i = [], 0
    while i < len(s):
        two, c = s[i:i + 2], s[i]
        if c == 'っ':
            nxt = kana_to_romaji(s[i + 1:i + 3])[:2] if i + 1 < len(s) else ''
            if nxt.startswith('ch'):
                out.append('t')
            elif nxt and nxt[0] in 'bcdfghjklmpqrstvwxyz':
                out.append(nxt[0])
            i += 1
            continue
        if c == 'ー':
            prev = ''.join(out)
            v = re.findall(r'[aeiou]', prev)
            out.append(v[-1] if v else '')
            i += 1
            continue
        if two in _DIGRAPH:
            out.append(_DIGRAPH[two])
            i += 2
            continue
        if c == 'ん':
            nxt = s[i + 1:i + 2]
            out.append("n'" if nxt and (nxt in 'あいうえおやゆよ') else 'n')
            i += 1
            continue
        out.append(_BASE.get(c, c))
        i += 1
    return ''.join(out)


def _norm(r):
    r = r.lower().replace("'", '').replace('-', '')
    r = re.sub(r'[^a-z]', '', r)
    return r


def compare(romaji, kana):
    """True when romaji spells kana, allowing wa/ha, e/he, o/wo particles and spacing."""
    a, b = _norm(romaji), _norm(kana_to_romaji(kana))
    if a == b:
        return True
    # particles: try making each ha/he in the kana reading wa/e
    b2 = re.sub(r'ha', 'wa', b)
    b3 = re.sub(r'he', 'e', b2)
    return a in (b2, b3) or a.replace('wa', 'ha') == b or _relaxed(a) == _relaxed(b)


def _relaxed(r):
    return r.replace('wa', 'ha').replace('he', 'e')
