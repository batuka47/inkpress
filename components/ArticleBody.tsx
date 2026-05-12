import type { Json } from "@/types/database";
import PullQuote from "./PullQuote";

interface Props {
  body: Json | null;
}

type TipTapNode = {
  type: string;
  content?: TipTapNode[];
  text?: string;
  marks?: { type: string; attrs?: Record<string, string> }[];
  attrs?: Record<string, string | number | boolean | null>;
};

function renderNode(node: TipTapNode, index: number): React.ReactNode {
  const key = index;

  switch (node.type) {
    case "paragraph":
      return (
        <p key={key} className="mb-6">
          {node.content?.map((child, i) => renderNode(child, i))}
        </p>
      );

    case "heading": {
      const level = (node.attrs?.level as number) ?? 2;
      const Tag = `h${level}` as "h2" | "h3" | "h4";
      return (
        <Tag key={key} className={`font-(family-name:--font-playfair) font-bold mt-8 mb-4 ${
          level === 2 ? "text-2xl" : level === 3 ? "text-xl" : "text-lg"
        }`}>
          {node.content?.map((child, i) => renderNode(child, i))}
        </Tag>
      );
    }

    case "blockquote":
      return (
        <PullQuote key={key}>
          {node.content?.map((child, i) => renderNode(child, i))}
        </PullQuote>
      );

    case "bulletList":
      return (
        <ul key={key} className="list-disc pl-6 mb-6 space-y-2">
          {node.content?.map((child, i) => renderNode(child, i))}
        </ul>
      );

    case "orderedList":
      return (
        <ol key={key} className="list-decimal pl-6 mb-6 space-y-2">
          {node.content?.map((child, i) => renderNode(child, i))}
        </ol>
      );

    case "listItem":
      return (
        <li key={key} className="leading-relaxed">
          {node.content?.map((child, i) => renderNode(child, i))}
        </li>
      );

    case "image":
      return (
        <figure key={key} className="my-8 -mx-4 md:-mx-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={String(node.attrs?.src ?? "")}
            alt={String(node.attrs?.alt ?? "")}
            className="w-full"
          />
          {node.attrs?.title && (
            <figcaption className="article-caption px-4 mt-2">
              {String(node.attrs.title)}
            </figcaption>
          )}
        </figure>
      );

    case "horizontalRule":
      return <hr key={key} className="newspaper-rule my-8" />;

    case "hardBreak":
      return <br key={key} />;

    case "text": {
      let content: React.ReactNode = node.text ?? "";
      if (node.marks) {
        for (const mark of node.marks) {
          if (mark.type === "bold") {
            content = <strong>{content}</strong>;
          } else if (mark.type === "italic") {
            content = <em>{content}</em>;
          } else if (mark.type === "code") {
            content = <code className="bg-[--color-surface] px-1 rounded text-sm font-(family-name:--font-dm-mono)">{content}</code>;
          } else if (mark.type === "link") {
            content = <a href={mark.attrs?.href} className="text-[--color-accent] underline underline-offset-2 hover:no-underline">{content}</a>;
          }
        }
      }
      return content;
    }

    default:
      return null;
  }
}

export default function ArticleBody({ body }: Props) {
  if (!body) return null;

  const doc = body as { type: string; content?: TipTapNode[]; html?: string };

  // Native HTML editor output
  if (doc.type === "html" && doc.html) {
    return (
      <div
        className="article-body"
        dangerouslySetInnerHTML={{ __html: doc.html }}
      />
    );
  }

  // TipTap JSON
  if (doc.type !== "doc" || !doc.content) return null;

  return (
    <div className="article-body">
      {doc.content.map((node, i) => renderNode(node, i))}
    </div>
  );
}
