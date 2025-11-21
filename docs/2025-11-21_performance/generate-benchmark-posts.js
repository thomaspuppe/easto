const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = './docs/2025-11-21_performance/benchmark_content';

// Content templates with varying lengths and types
const templates = [
  {
    name: 'short-text',
    content: `This is a short blog post with minimal content. It contains just a few paragraphs to test performance with lightweight posts.

## Quick Update

Just a brief update on what's happening. Nothing too extensive, just enough to make a valid post.

That's all for now!`
  },
  {
    name: 'medium-article',
    content: `This is a medium-length article that discusses various topics in web development and technology.

## Introduction

In this post, we'll explore several interesting concepts that are relevant to modern web development. This type of content is typical for a technical blog.

## Main Content

Here's where we dive into the details. This section would normally contain several paragraphs of technical discussion, code examples, and explanations.

### Subsection 1

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

### Subsection 2

More detailed content goes here. We're building up to a reasonable article length that represents a typical blog post.

## Code Example

\`\`\`javascript
function example() {
  console.log('This is a code example');
  return true;
}
\`\`\`

## Conclusion

Wrapping up the article with some final thoughts and takeaways.`
  },
  {
    name: 'long-tutorial',
    content: `This is a comprehensive tutorial post with extensive content, multiple sections, and various markdown features.

## Introduction to the Topic

Welcome to this in-depth tutorial. We'll cover everything you need to know about this particular subject, from basic concepts to advanced techniques.

## Prerequisites

Before we begin, you should have:
- Basic knowledge of JavaScript
- Node.js installed
- A text editor of your choice
- Coffee (optional but recommended)

## Chapter 1: Getting Started

Let's start with the fundamentals. In this section, we'll build a solid foundation for understanding the rest of the tutorial.

### Setting Up Your Environment

First, you'll need to set up your development environment. Here's how:

1. Install Node.js from the official website
2. Create a new project directory
3. Initialize npm with \`npm init -y\`
4. Install required dependencies

\`\`\`bash
mkdir my-project
cd my-project
npm init -y
npm install express
\`\`\`

### Understanding the Basics

Now that we have our environment ready, let's understand some core concepts.

**Important concept 1:** This is something you really need to understand.

**Important concept 2:** And this is equally important.

## Chapter 2: Building Your First Application

Time to get our hands dirty with some actual code.

\`\`\`javascript
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
\`\`\`

### Explaining the Code

Let's break down what's happening here:
- We import Express
- Create an app instance
- Define a route handler
- Start the server

## Chapter 3: Advanced Techniques

Now that we understand the basics, let's explore some more advanced topics.

### Performance Optimization

Here are some tips for optimizing performance:
1. Use async/await for better readability
2. Implement caching strategies
3. Minimize database queries
4. Use connection pooling

### Error Handling

Proper error handling is crucial:

\`\`\`javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
\`\`\`

## Real-World Example

Let's look at a more complete example that you might use in production.

\`\`\`javascript
const express = require('express');
const app = express();

app.use(express.json());

const users = [];

app.post('/users', (req, res) => {
  const user = req.body;
  users.push(user);
  res.status(201).json(user);
});

app.get('/users', (req, res) => {
  res.json(users);
});

app.listen(3000);
\`\`\`

## Common Pitfalls

Here are some mistakes to avoid:
- Forgetting to handle errors
- Not validating input
- Blocking the event loop
- Not using environment variables

## Conclusion

We've covered a lot of ground in this tutorial. You should now have a solid understanding of the topic and be ready to build your own applications.

## Further Reading

- [Official Documentation](https://example.com)
- [Advanced Patterns](https://example.com)
- [Community Forum](https://example.com)

Happy coding!`
  },
  {
    name: 'list-heavy',
    content: `This post is heavy on lists and structured content.

## Top 10 Things You Should Know

Here's my list of important things:

1. First important thing with some explanation
2. Second important thing that you shouldn't ignore
3. Third item on the list
4. Fourth consideration
5. Fifth point to remember
6. Sixth tip for success
7. Seventh recommendation
8. Eighth best practice
9. Ninth thing to keep in mind
10. Tenth and final item

## Resources and Links

### Official Documentation
- [Link 1](https://example.com/docs)
- [Link 2](https://example.com/guides)
- [Link 3](https://example.com/api)

### Community Resources
- [Forum](https://example.com/forum)
- [Discord](https://example.com/discord)
- [GitHub](https://example.com/github)

### Related Articles
- Article about topic A
- Article about topic B
- Article about topic C

## Quick Reference

| Command | Description | Example |
|---------|-------------|---------|
| init | Initialize project | \`npm init\` |
| install | Install package | \`npm install pkg\` |
| run | Run script | \`npm run build\` |
| test | Run tests | \`npm test\` |

## Checklist

Before deploying, make sure you:
- [ ] Run all tests
- [ ] Update documentation
- [ ] Check for security issues
- [ ] Review performance
- [ ] Update changelog
- [ ] Tag the release

## Summary

That's the quick rundown of everything you need to know!`
  }
];

// Generate 150 posts
console.log('Generating 150 benchmark posts...\n');

for (let i = 1; i <= 150; i++) {
  // Pick a template (cycle through them)
  const template = templates[i % templates.length];

  // Generate date (spread over 2020-2024, newest first for sorting)
  const year = 2024 - Math.floor(i / 38);
  const month = String((i % 12) + 1).padStart(2, '0');
  const day = String(((i * 3) % 28) + 1).padStart(2, '0');
  const date = `${year}-${month}-${day}`;

  // Generate unique slug
  const slug = `${template.name}-${i}`;

  // Generate filename (sorted newest first)
  const filename = `${year}-${month}_${slug}.md`;

  // Create frontmatter
  const frontmatter = `---
title: "${template.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} #${i}"
date: ${date}
datelabel: "${new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}"
language: en
tags: [${template.name}, benchmark, test]
permalink: ${slug}
draft: false
description: "Benchmark post ${i} - ${template.name} template for performance testing"
---

`;

  const fullContent = frontmatter + template.content;

  const filepath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filepath, fullContent);

  if (i % 25 === 0) {
    console.log(`Generated ${i} posts...`);
  }
}

console.log('\n✅ Successfully generated 150 benchmark posts!');
console.log(`📁 Location: ${OUTPUT_DIR}`);

// Show stats
const stats = {
  total: 150,
  byTemplate: {}
};

templates.forEach(t => {
  stats.byTemplate[t.name] = Math.ceil(150 / templates.length);
});

console.log('\n📊 Distribution:');
Object.entries(stats.byTemplate).forEach(([name, count]) => {
  console.log(`   ${name}: ~${count} posts`);
});
