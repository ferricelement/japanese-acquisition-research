#!/usr/bin/env python3
"""Look up spoken-frequency ranks in jiten.moe's drama-subtitle list (3,030 dramas).

Usage: python3 freq.py 結構 けっこう じゃん だよね
Matches each query exactly against the Word (dictionary form) or Form (kana) column.
Rank 1 = most frequent. Prints NOT FOUND when absent.
"""
import csv, os, sys

PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "jiten_freq_Drama.csv")

def main(queries):
    hits = {q: [] for q in queries}
    with open(PATH, encoding="utf-8") as f:
        for row in csv.DictReader(f):
            for q in queries:
                if row["Word"] == q or row["Form"] == q:
                    hits[q].append((int(row["Rank"]), row["Word"], row["Form"]))
    for q in queries:
        rows = sorted(hits[q])[:4]
        if rows:
            print(f"{q}: " + "; ".join(f"#{r} {w} ({k})" for r, w, k in rows))
        else:
            print(f"{q}: NOT FOUND")

if __name__ == "__main__":
    main(sys.argv[1:])
