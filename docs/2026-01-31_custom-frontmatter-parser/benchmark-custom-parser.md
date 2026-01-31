=== Dependency Performance Benchmark ===
Date: Sa. 31 Jan. 2026 11:32:18 CET

## Version Info
Version: 0.8.3

## Dependencies (package.json)
```json
  "dependencies": {
    "feed": "^5.2.0",
    "marked": "^17.0.1",
    "marked-gfm-heading-id": "^4.1.3"
  }
}
```

## npm install Performance
Measuring fresh install time...
Install time: ms

## Package Count
Direct dependencies: 17
Total packages (including transitive): 7

## Disk Usage
node_modules size: 1,1M

## Dependency Tree
```
easto@0.8.3 /Users/thomaspuppe/Code/easto
├─┬ feed@5.2.0
│ └─┬ xml-js@1.6.11
│   └── sax@1.4.4
├─┬ marked-gfm-heading-id@4.1.3
│ ├── github-slugger@2.0.0
│ └── marked@17.0.1 deduped
└── marked@17.0.1

```

## Build Performance (5 runs)
Measuring build times...

Run 1: 32.006ms
Run 2: 30.937ms
Run 3: 31.532ms
Run 4: 31.525ms
Run 5: 31.755ms

Average build time: 31ms

## Package Sizes (top 10 largest)
```
472K	node_modules/xml-js
448K	node_modules/marked
 72K	node_modules/feed
 68K	node_modules/sax
 48K	node_modules/marked-gfm-heading-id
 36K	node_modules/github-slugger
```

