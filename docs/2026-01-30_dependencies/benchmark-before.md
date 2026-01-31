=== Dependency Performance Benchmark ===
Date: Fr. 30 Jan. 2026 23:01:08 CET

## Version Info
Version: 0.8.1

## Dependencies (package.json)
```json
  "dependencies": {
    "feed": "^5.2.0",
    "marked": "^17.0.1",
    "marked-gfm-heading-id": "^4.1.3",
    "ncp": "^2.0.0",
    "yaml-front-matter": "^4.1.1"
  }
}
```

## npm install Performance
Measuring fresh install time...
Install time: ms

## Package Count
Direct dependencies: 19
Total packages (including transitive): 14

## Disk Usage
node_modules size: 2,5M

## Dependency Tree
```
easto@0.8.1 /Users/thomaspuppe/Code/easto
├─┬ feed@5.2.0
│ └─┬ xml-js@1.6.11
│   └── sax@1.4.4
├─┬ marked-gfm-heading-id@4.1.3
│ ├── github-slugger@2.0.0
│ └── marked@17.0.1 deduped
├── marked@17.0.1
├── ncp@2.0.0
└─┬ yaml-front-matter@4.1.1
  ├── commander@6.2.1
  └─┬ js-yaml@3.14.2
    ├─┬ argparse@1.0.10
    │ └── sprintf-js@1.0.3
    └── esprima@4.0.1

```

## Build Performance (5 runs)
Measuring build times...

Run 1: 26.72ms
Run 2: 25.003ms
Run 3: 25.021ms
Run 4: 26.016ms
Run 5: 25.745ms

Average build time: 25ms

## Package Sizes (top 10 largest)
```
472K	node_modules/xml-js
448K	node_modules/marked
364K	node_modules/js-yaml
324K	node_modules/esprima
264K	node_modules/yaml-front-matter
184K	node_modules/argparse
124K	node_modules/commander
 80K	node_modules/sprintf-js
 72K	node_modules/feed
 68K	node_modules/sax
```

