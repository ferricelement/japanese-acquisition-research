"""Conjugation tables built by rule, so no agent writes a paradigm by hand.

Model verbs cover every class and -te/-ta sound change; forms are casual unless the key says polite.
form(verb, key) -> (kana, ja) ; table(key) -> rows for every model word that has the form.
"""
from romaji import kana_to_romaji

# kanji stem, kana stem, class, final kana (godan)
VERBS = {
    'taberu': ('食べ', 'たべ', 'ichidan', ''), 'miru': ('見', 'み', 'ichidan', ''),
    'kau': ('買', 'か', 'godan', 'う'), 'matsu': ('待', 'ま', 'godan', 'つ'), 'kaeru': ('帰', 'かえ', 'godan', 'る'),
    'nomu': ('飲', 'の', 'godan', 'む'), 'asobu': ('遊', 'あそ', 'godan', 'ぶ'), 'kaku': ('書', 'か', 'godan', 'く'),
    'oyogu': ('泳', 'およ', 'godan', 'ぐ'), 'hanasu': ('話', 'はな', 'godan', 'す'), 'iku': ('行', 'い', 'godan', 'く'),
    'suru': ('', '', 'suru', ''), 'kuru': ('来', '', 'kuru', ''),
}
ROW = {  # godan final -> (a, i, e, o) rows
    'う': ('わ', 'い', 'え', 'お'), 'つ': ('た', 'ち', 'て', 'と'), 'る': ('ら', 'り', 'れ', 'ろ'), 'む': ('ま', 'み', 'め', 'も'),
    'ぶ': ('ば', 'び', 'べ', 'ぼ'), 'ぬ': ('な', 'に', 'ね', 'の'), 'く': ('か', 'き', 'け', 'こ'), 'ぐ': ('が', 'ぎ', 'げ', 'ご'),
    'す': ('さ', 'し', 'せ', 'そ'),
}
TE = {'う': 'って', 'つ': 'って', 'る': 'って', 'む': 'んで', 'ぶ': 'んで', 'ぬ': 'んで', 'く': 'いて', 'ぐ': 'いで', 'す': 'して'}


def stems(v):
    """(dict, nai-stem, masu-stem, ba-stem, vol, te, ta, potential-stem, passive-stem, causative-stem, imperative)"""
    kj, k, cls, fin = VERBS[v]
    if cls == 'ichidan':
        return dict(d=k + 'る', a=k, i=k, e=k + 'れ', vol=k + 'よう', te=k + 'て', ta=k + 'た', pot=k + 'られる',
                    pas=k + 'られる', cau=k + 'させる', imp=k + 'ろ', cp=k + 'させられる', kj=kj, k=k)
    if cls == 'godan':
        a, i, e, o = ROW[fin]
        te = 'って' if v == 'iku' else TE[fin]
        return dict(d=k + fin, a=k + a, i=k + i, e=k + e, vol=k + o + 'う', te=k + te, ta=k + te[:-1] + ('だ' if te.endswith('で') else 'た'),
                    pot=k + e + 'る', pas=k + a + 'れる', cau=k + a + 'せる', imp=k + e, cp=k + a + ('せられる' if fin == 'す' else 'される'), kj=kj, k=k)
    if cls == 'suru':
        return dict(d='する', a='し', i='し', e='すれ', vol='しよう', te='して', ta='した', pot='できる', pas='される', cau='させる',
                    imp='しろ', cp='させられる', kj='', k='')
    return dict(d='くる', a='こ', i='き', e='くれ', vol='こよう', te='きて', ta='きた', pot='こられる', pas='こられる', cau='こさせる',
                imp='こい', cp='こさせられる', kj='来', k='')


def ichidan_from(base):
    """Endings that conjugate like an ichidan verb: -ru stem."""
    return base[:-1]


FORMS = {
    'dict': lambda s: s['d'], 'masu': lambda s: s['i'] + 'ます', 'ta': lambda s: s['ta'], 'mashita': lambda s: s['i'] + 'ました',
    'nai': lambda s: s['a'] + 'ない', 'masen': lambda s: s['i'] + 'ません', 'nakatta': lambda s: s['a'] + 'なかった',
    'masen-deshita': lambda s: s['i'] + 'ません でした', 'te': lambda s: s['te'], 'teru': lambda s: s['te'] + 'る',
    'te-iru': lambda s: s['te'] + ' いる', 'teta': lambda s: s['te'] + 'た', 'tenai': lambda s: s['te'] + 'ない',
    'temasu': lambda s: s['te'] + 'ます', 'tai': lambda s: s['i'] + 'たい', 'takunai': lambda s: s['i'] + 'たくない',
    'takatta': lambda s: s['i'] + 'たかった', 'vol': lambda s: s['vol'], 'mashou': lambda s: s['i'] + 'ましょう',
    'mashou-ka': lambda s: s['i'] + 'ましょう か', 'masen-ka': lambda s: s['i'] + 'ません か',
    'tara': lambda s: s['ta'] + 'ら', 'ba': lambda s: s['e'] + 'ば', 'nakereba': lambda s: s['a'] + 'なければ',
    'nakya': lambda s: s['a'] + 'なきゃ', 'nakucha': lambda s: s['a'] + 'なくちゃ', 'naide': lambda s: s['a'] + 'ないで',
    'nakute': lambda s: s['a'] + 'なくて', 'nai-to': lambda s: s['a'] + 'ない と', 'to': lambda s: s['d'] + ' と',
    'nara': lambda s: s['d'] + ' なら', 'pot': lambda s: s['pot'], 'pot-nai': lambda s: s['pot'][:-1] + 'ない',
    'pas': lambda s: s['pas'], 'pas-ta': lambda s: s['pas'][:-1] + 'た', 'cau': lambda s: s['cau'],
    'sasete': lambda s: s['cau'][:-1] + 'て', 'cp': lambda s: s['cp'], 'imp': lambda s: s['imp'], 'na': lambda s: s['d'] + ' な',
    'nasai': lambda s: s['i'] + 'なさい', 'te-kudasai': lambda s: s['te'] + ' ください', 'naide-kudasai': lambda s: s['a'] + 'ないで ください',
    'te-kure': lambda s: s['te'] + ' くれ', 'te-shimau': lambda s: s['te'] + ' しまう', 'chau': lambda s: _chau(s, 'ちゃう'),
    'chatta': lambda s: _chau(s, 'ちゃった'), 'te-oku': lambda s: s['te'] + ' おく', 'toku': lambda s: _toku(s),
    'te-miru': lambda s: s['te'] + ' みる', 'te-mo': lambda s: s['te'] + 'も', 'te-mo-ii': lambda s: s['te'] + ' も いい',
    'cha-dame': lambda s: _chau(s, 'ちゃ だめ'), 'tari': lambda s: s['ta'] + 'り', 'nagara': lambda s: s['i'] + 'ながら',
    'sou': lambda s: s['i'] + 'そう', 'sugiru': lambda s: s['i'] + 'すぎる', 'yasui': lambda s: s['i'] + 'やすい',
    'nikui': lambda s: s['i'] + 'にくい', 'zu-ni': lambda s: ('せ' if s['d'] == 'する' else s['a']) + 'ず に',
    'te-kara': lambda s: s['te'] + ' から', 'ta-koto-aru': lambda s: s['ta'] + ' こと ある', 'ta-hou-ga-ii': lambda s: s['ta'] + ' ほう が いい',
    'nai-hou-ga-ii': lambda s: s['a'] + 'ない ほう が いい', 'you-ni': lambda s: s['d'] + ' よう に',
    'n-da': lambda s: s['d'] + ' ん だ', 'nn': lambda s: _nn(s),
}


def _chau(s, tail):
    te = s['te']
    return te[:-1] + ('じゃ' if te.endswith('で') else 'ちゃ') + tail[2:] if tail.startswith('ちゃ') else te


def _toku(s):
    te = s['te']
    return te[:-1] + ('どく' if te.endswith('で') else 'とく')


def _nn(s):
    """Spoken -ranai -> -nnai (wakannai): only r-row verbs."""
    a = s['a']
    return a[:-1] + 'んない' if a.endswith('ら') else None


def form(v, key):
    s = stems(v)
    kana = FORMS[key](s)
    if kana is None:
        return None
    kj, k = s['kj'], s['k']
    if VERBS[v][2] == 'kuru':
        ja = '来' + kana[1:]
    elif kj and kana.startswith(k):
        ja = kj + kana[len(k):]
    else:
        ja = kana
    return kana, ja


# i-adjectives, ii, na-adjectives and nouns with the copula
ADJ = {'takai': ('高', 'たか', 'i'), 'ii': ('', '', 'ii'), 'kirei': ('きれい', 'きれい', 'na'), 'gakusei': ('学生', 'がくせい', 'noun')}
AFORMS = {
    'plain': {'i': 'い', 'ii': 'いい', 'na': 'だ', 'noun': 'だ'},
    'polite': {'i': 'い です', 'ii': 'いい です', 'na': ' です', 'noun': ' です'},
    'past': {'i': 'かった', 'ii': 'よかった', 'na': ' だった', 'noun': ' だった'},
    'past-polite': {'i': 'かった です', 'ii': 'よかった です', 'na': ' でした', 'noun': ' でした'},
    'neg': {'i': 'くない', 'ii': 'よくない', 'na': ' じゃ ない', 'noun': ' じゃ ない'},
    'neg-polite': {'i': 'くない です', 'ii': 'よくない です', 'na': ' じゃ ない です', 'noun': ' じゃ ない です'},
    'neg-past': {'i': 'くなかった', 'ii': 'よくなかった', 'na': ' じゃ なかった', 'noun': ' じゃ なかった'},
    'te': {'i': 'くて', 'ii': 'よくて', 'na': ' で', 'noun': ' で'},
    'adverb': {'i': 'く', 'ii': 'よく', 'na': ' に', 'noun': None},
    'naru': {'i': 'く なる', 'ii': 'よく なる', 'na': ' に なる', 'noun': ' に なる'},
    'attr': {'i': 'い', 'ii': 'いい', 'na': ' な', 'noun': ' の'},
    'ba': {'i': 'ければ', 'ii': 'よければ', 'na': ' なら', 'noun': ' なら'},
    'tara': {'i': 'かったら', 'ii': 'よかったら', 'na': ' だったら', 'noun': ' だったら'},
    'sou': {'i': 'そう', 'ii': 'よさそう', 'na': 'そう', 'noun': None},
    'sugiru': {'i': 'すぎる', 'ii': 'よすぎる', 'na': 'すぎる', 'noun': None},
    'darou': {'i': 'い だろう', 'ii': 'いい だろう', 'na': ' だろう', 'noun': ' だろう'},
    'deshou': {'i': 'い でしょう', 'ii': 'いい でしょう', 'na': ' でしょう', 'noun': ' でしょう'},
    'sa': {'i': 'さ', 'ii': 'よさ', 'na': None, 'noun': None},
}


def aform(w, key):
    kj, k, cls = ADJ[w]
    end = AFORMS[key][cls]
    if end is None:
        return None
    return k + end, kj + end


def _row(word, r):
    kana, ja = r
    return {'word': word, 'romaji': ' '.join(kana_to_romaji(p) for p in kana.split()), 'ja': ja.replace(' ', ''), 'kana': kana.replace(' ', '')}


def table(key):
    rows = []
    if key in FORMS:
        for v in VERBS:
            r = form(v, key)
            if r:
                rows.append(_row(v, r))
    elif key in AFORMS:
        for w in ADJ:
            r = aform(w, key)
            if r:
                rows.append(_row(w, r))
    return rows


if __name__ == '__main__':
    import sys
    for key in sys.argv[1:] or ['te', 'ta', 'nai', 'pot', 'cp', 'chau', 'toku', 'nn', 'neg', 'sou']:
        print(key, ', '.join(f"{r['word']}→{r['romaji']} {r['ja']}" for r in table(key)))
