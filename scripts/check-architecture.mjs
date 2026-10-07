import { readdir, readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import ts from "typescript";
const domainRoot = resolve("libs/domain/src");
async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((e) =>
        e.isDirectory() ? files(resolve(dir, e.name)) : [resolve(dir, e.name)],
      ),
    )
  ).flat();
}
const errors = [];
for (const path of await files(domainRoot)) {
  if (!path.endsWith(".ts")) continue;
  const source = ts.createSourceFile(
    path,
    await readFile(path, "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );
  function visit(node) {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      const spec = node.moduleSpecifier.text;
      if (
        !spec.startsWith(".") ||
        !resolve(dirname(path), spec).startsWith(domainRoot + "/")
      )
        errors.push(`${path}: dependency outside domain: ${spec}`);
    }
    if (
      ts.isIdentifier(node) &&
      [
        "window",
        "document",
        "localStorage",
        "sessionStorage",
        "navigator",
        "Notification",
        "fetch",
      ].includes(node.text)
    )
      errors.push(`${path}: browser dependency: ${node.text}`);
    ts.forEachChild(node, visit);
  }
  visit(source);
}
if (errors.length) throw new Error(errors.join("\n"));
console.log("Domain boundaries verified.");
