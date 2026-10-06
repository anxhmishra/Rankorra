"""Warm the insights cache before a demo (run from the backend folder):
   python -m scripts.prefetch_insights --limit 10 --match "National Institute of Technology" """
import argparse
import time

import engine
import insights_router as ir


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=10)
    ap.add_argument("--match", default="")
    a = ap.parse_args()
    client = ir._client()
    if client is None:
        raise SystemExit("Set TINYFISH_API_KEY first.")
    names = [n for n in sorted(engine.df_master["institute"].dropna().unique()) if a.match.lower() in n.lower()][: a.limit]
    for n in names:
        if ir._cache_get(n):
            print("cached   ", n)
            continue
        rec = ir.fetch_live(client, n)
        if rec["status"] != "failed":
            ir._cache_put(n, rec)
        print(rec["status"].ljust(9), n)
        time.sleep(1)


if __name__ == "__main__":
    main()
