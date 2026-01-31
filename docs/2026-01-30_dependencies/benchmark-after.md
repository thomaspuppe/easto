=== Dependency Performance Benchmark ===
Date: Fr. 30 Jan. 2026 23:02:35 CET

## Version Info
Version: 0.8.2

## Dependencies (package.json)
```json
  "dependencies": {
    "feed": "^5.2.0",
    "gray-matter": "^4.0.3",
    "marked": "^17.0.1",
    "marked-gfm-heading-id": "^4.1.3"
  }
}
```

## npm install Performance
Measuring fresh install time...
Install time: ms

## Package Count
Direct dependencies: 18
Total packages (including transitive): 18

## Disk Usage
node_modules size: 2,2M

## Dependency Tree
```
easto@0.8.2 /Users/thomaspuppe/Code/easto
├─┬ feed@5.2.0
│ └─┬ xml-js@1.6.11
│   └── sax@1.4.4
├─┬ gray-matter@4.0.3
│ ├─┬ js-yaml@3.14.2
│ │ ├─┬ argparse@1.0.10
│ │ │ └── sprintf-js@1.0.3
│ │ └── esprima@4.0.1
│ ├── kind-of@6.0.3
│ ├─┬ section-matter@1.0.0
│ │ ├─┬ extend-shallow@2.0.1
│ │ │ └── is-extendable@0.1.1
│ │ └── kind-of@6.0.3 deduped
│ └── strip-bom-string@1.0.0
├─┬ marked-gfm-heading-id@4.1.3
│ ├── github-slugger@2.0.0
│ └── marked@17.0.1 deduped
└── marked@17.0.1

```

## Build Performance (5 runs)
Measuring build times...

Run 1: 28.82ms
Run 2: 26.201ms
Run 3: 26.503ms
Run 4: 26.491ms
Run 5: 26.439ms

Average build time: 26ms

## Package Sizes (top 10 largest)
```
472K	node_modules/xml-js
448K	node_modules/marked
364K	node_modules/js-yaml
324K	node_modules/esprima
184K	node_modules/argparse
 80K	node_modules/sprintf-js
 76K	node_modules/gray-matter
 72K	node_modules/feed
 68K	node_modules/sax
 48K	node_modules/marked-gfm-heading-id
```

