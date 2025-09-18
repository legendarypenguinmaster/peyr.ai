declare module "react-markdown" {
  import { ComponentType } from "react";
  const ReactMarkdown: ComponentType<{ children: string; remarkPlugins?: unknown[] }>;
  export default ReactMarkdown;
}

declare module "remark-gfm" {
  const remarkGfm: unknown;
  export default remarkGfm;
}


