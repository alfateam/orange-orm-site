---
title: Orange ORM - The ultimate ORM for Node and Typescript.
---
<div style="display: flex; justify-content: center;">
  <img src="/logo.svg" alt="Orange ORM Logo" style="width: 22rem" />
</div>

The ultimate Object Relational Mapper for Node.js, Bun and Deno, offering seamless integration with a variety of popular databases. <span v-html="$projectFullName"></span> supports both TypeScript and JavaScript, including both CommonJS and ECMAScript.

<div class="status-badge-line">

[![npm version](https://img.shields.io/npm/v/orange-orm.svg?style=flat-square)](https://www.npmjs.org/package/orange-orm)
[![Build status](https://github.com/alfateam/orange-orm/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/alfateam/orange-orm/actions)
[![Coverage Badge](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/lroal/1a69422f03da7f8155cf94fe66022452/raw/rdb__heads_master.json)](https://github.com/alfateam/orange-orm/actions)
[![Github](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/lroal/1ccb2b79abbe0258d636e9b5e4630a1a/raw/rdb__heads_master.json)](https://github.com/alfateam/orange-orm)
[![GitHub Discussions](https://img.shields.io/github/discussions/alfateam/orange-orm)](https://github.com/alfateam/orange-orm/discussions)
[![Discord](https://badgen.net/discord/online-members/QjuEgvQXzd?icon=discord&label=Discord)](https://discord.gg/QjuEgvQXzd)
<!-- [![YouTube Video Views](https://img.shields.io/youtube/views/1IwwjPr2lMs)](https://youtu.be/1IwwjPr2lMs) -->

</div>

## Key Features

- **Rich Querying Model**: <span v-html="$projectName"></span> provides a powerful and intuitive querying model, making it easy to retrieve, filter, and manipulate data from your databases.
- **Active Record**: With a concise and expressive syntax, <span v-html="$projectName"></span> enables you to interact with your database using the [*Active Record Pattern*](https://en.wikipedia.org/wiki/Active_record_pattern).
- **No Code Generation Required**: Enjoy full IntelliSense, even in table mappings, without the need for cumbersome code generation.
- **TypeScript and JavaScript Support**: <span v-html="$projectName"></span> fully supports both TypeScript and JavaScript, allowing you to leverage the benefits of static typing and modern ECMAScript features.
- **Works in the Browser**: You can securely use <span v-html="$projectName"></span> in the browser by utilizing the Express.js or Hono plugin, which serves to safeguard sensitive database credentials from exposure at the client level and protect against SQL injection. This method mirrors a traditional REST API, augmented with advanced TypeScript tooling for enhanced functionality.

## Supported Databases and Runtimes

<div class="full-width-table">

|               | Node | Deno | Bun  | Cloudflare | Web  |
| ------------- | :--: | :--: | :--: | :--------: | :--: |
| Postgres      | ✅   | ✅   | ✅   | ✅         |      |
| PGlite        | ✅   | ✅   | ✅   | ✅         | ✅   |
| MS SQL        | ✅   |      | ✅   |            |      |
| MySQL         | ✅   | ✅   | ✅   |            |      |
| MariaDB       | ✅   | ✅   | ✅   |            |      |
| Oracle        | ✅   | ✅   | ✅   |            |      |
| SAP ASE       | ✅   |      |      |            |      |
| SQLite        | ✅   | ✅   | ✅   |            |      |
| Cloudflare D1 |      |      |      | ✅         |      |

</div>

## Sponsorship ❤️ 

Orange ORM is free and open source, maintained in my spare time.  
If Orange saves you or your company time, sponsorship helps fund ongoing development, bug fixes, documentation, and long-term maintenance.  
👉 [Sponsor Orange ORM on GitHub](https://github.com/sponsors/lroal)

## MCP (Model Context Protocol)

<span v-html="$projectFullName"></span> is available as an MCP resource on Context7. Use it with AI-powered tools like GitHub Copilot, Cursor, or Claude to get up-to-date documentation and code examples directly in your IDE.\
👉 [https://context7.com/alfateam/orange-orm](https://context7.com/alfateam/orange-orm)
