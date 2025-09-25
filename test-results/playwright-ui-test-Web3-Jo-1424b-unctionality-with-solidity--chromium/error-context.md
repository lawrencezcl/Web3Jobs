# Page snapshot

```yaml
- generic [active]:
  - alert [ref=e1]
  - dialog [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - heading "Build Error" [level=1] [ref=e7]
        - paragraph [ref=e8]: Failed to compile
        - generic [ref=e9]:
          - generic "An outdated version detected (latest is 15.5.4), upgrade is highly recommended!" [ref=e11]: Next.js (14.2.5) is outdated
          - link "(learn more)" [ref=e12] [cursor=pointer]:
            - /url: https://nextjs.org/docs/messages/version-staleness
      - generic [ref=e13]:
        - generic [ref=e14]:
          - link "./src/app/globals.css.webpack[javascript/auto]!=!./node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[12].use[2]!./node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[12].use[3]!./src/app/globals.css" [ref=e15] [cursor=pointer]:
            - text: ./src/app/globals.css.webpack[javascript/auto]!=!./node_modules/next/dist/build/webpack/loaders/css-loader/src/index.js??ruleSet[1].rules[13].oneOf[12].use[2]!./node_modules/next/dist/build/webpack/loaders/postcss-loader/src/index.js??ruleSet[1].rules[13].oneOf[12].use[3]!./src/app/globals.css
            - img
          - generic [ref=e20]: "ReferenceError: module is not defined in ES module scope This file is being treated as an ES module because it has a '.js' file extension and '/root/Web3Jobs/package.json' contains \"type\": \"module\". To treat it as a CommonJS script, rename it to use the '.cjs' file extension."
        - contentinfo [ref=e21]:
          - paragraph [ref=e22]:
            - generic [ref=e23]: This error occurred during the build process and can only be dismissed by fixing the error.
```