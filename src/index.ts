import { Liquid } from "liquidjs";

export const PackageName = "BaganDev";

export type PeisarEmphasisLevel = "Italic" | "Bold";
export type PeisarTableCellAlignment = "Default" | "Left" | "Center" | "Right";
export type PeisarTableCellAlignments = PeisarTableCellAlignment[];
export type PeisarTaskState = "Unchecked" | "Checked";
export type BaganHostingProvider =
  | "GithubPages"
  | "Vercel"
  | "Netlify"
  | "CloudflarePages"
  | "Custom";

/** Flush thresholds for the disk-archive tier. */
export interface ArchiveConfig {
  /**
   * Pending-content threshold (bytes) that triggers writing a new
   * shard; `0` disables size-based flushing (interval/drop only).
   */
  shardBytes?: number;
  /**
   * Maximum time (ms) pending entries may sit in the worker buffer
   * before being flushed. `0` disables the timer.
   */
  flushIntervalMs?: number;
}

/** An asset mirrored by the cache (JS/CSS/image/video/font/…). */
export interface AssetsObject {
  /** File name without extension (`foo.png` → `foo`). */
  fileName: string;
  /** URL for the asset (`path/to/foo.png` → `/path/to/foo.png`). */
  slug: string;
  /** Raw content: UTF-8 text for textual assets, base64 for binaries. */
  raw: string;
  /** Build output path for the asset. */
  outFilePath: string;
  /** Original absolute source path (watch-process identity). */
  inputFilePath: string;
  /** File extension (lowercase, without dot). */
  ext: string;
  /**
   * Kind classification: `"Js"`, `"Css"`, `"Image"`, `"Video"`,
   * `"Font"`, or `"Other"`.
   */
  fileType: string;
}

/**
 * JS-side options accepted by the `BaganCache` constructor (a flattened
 * subset of [`BaganCacheConfig`]; memory budgets only apply through the
 * `withConfig` factory).
 */
export interface BaganCacheJsOptions {
  /**
   * Theme package name (Jekyll-gem style), resolved from
   * `node_modules/<theme>`. Omit (null/undefined) for a local site:
   * the theme directories below are then resolved from the cwd.
   */
  theme?: string;
  /**
   * Local layouts directory (local mode only), relative to the cwd.
   * Defaults to `_layouts`.
   */
  themeLayoutsDir?: string;
  /**
   * Local includes directory (local mode only), relative to the cwd.
   * Defaults to `_includes`.
   */
  themeIncludesDir?: string;
  /**
   * Local theme assets directory (local mode only), relative to the
   * cwd. Defaults to `_assets`.
   */
  themeAssetsDir?: string;
  /**
   * Local data directory (local mode only), relative to the cwd.
   * Defaults to `_data`.
   */
  themeDataDir?: string;
  /**
   * Theme configuration object (`themeConfigObject`). When omitted
   * (and `theme` is set) it is loaded automatically from the theme
   * package's default export.
   */
  themeConfig?: BaganThemeConfig;
  /** Markdown parsing/rendering options (`fragment`, GFM, …). */
  markdown?: PeisarOptions;
  /** Disk-archive thresholds (shard size / flush interval). */
  archive?: ArchiveConfig;
  /** Static-hosting baseUrl resolution. */
  hosting?: HostingConfig;
  /** Build output directory. */
  outDir?: string;
  /** Disk-archive directory. */
  cacheDir?: string;
}

/**
 * Theme configuration.
 *
 * In theme mode this is the `themeConfigObject` the theme package
 * exports as its default export (Jekyll-gem style: the package itself
 * is the source of truth, `bagan-theme.json` is no longer read). In
 * local mode (no `theme` configured) the values come from the cache
 * configuration instead.
 */
export interface BaganThemeConfig {
  /** Theme package name. */
  name?: string;
  /** Theme package version. */
  version?: string;
  /** Optional theme author. */
  author?: string;
  /**
   * Relative path to the theme's HTML layout templates (default
   * `"_layouts"`), resolved against the theme root.
   */
  layoutsDir?: string;
  /**
   * Relative path to the theme's include templates (default
   * `"_includes"`), resolved against the theme root.
   */
  includesDir?: string;
  /**
   * Relative path to the theme's static assets (default `"_assets"`),
   * resolved against the theme root.
   */
  assetsDir?: string;
  /**
   * Relative path to the theme's data files (default `"_data"`),
   * resolved against the theme root.
   */
  dataDir?: string;
}

/**
 * Resolved hosting configuration: the single source of truth for every
 * URL the pipeline emits (page slugs, asset links, absolute URLs).
 */
export interface BaseDirInfo {
  /** Hosting provider in effect. */
  provider: BaganHostingProvider;
  /** Repository name (GitHub Pages project sites): `/<repo>/` prefix. */
  repo?: string;
  /**
   * Custom site URL (`https://example.com` or `https://user.github.io/repo`).
   * Used verbatim as the URL root for [`Self::site_url`].
   */
  siteUrl?: string;
  /**
   * Extra path prefix under the host (e.g. `subpath` for
   * `example.com/subpath/`).
   */
  pathPrefix?: string;
}

/**
 * A file-change event delivered to change callbacks
 * (see [`BaganCache::on_change`]).
 */
export interface CacheChangeEvent {
  /** Absolute path of the changed file. */
  path: string;
  /** `"create"`, `"modify"`, `"remove"`, or `"other"`. */
  kind: string;
  /** `true` when the file is under the markdown entry directory. */
  isMarkdown: boolean;
}

/**
 * An entry stored in the cache: raw UTF-8 text (markdown and textual
 * assets) or raw bytes (binary assets). Exposed to JavaScript so JS
 * consumers can branch on the variant. The serde derives back the
 * bincode round-trip through the disk archive.
 */
export type CachedContent =
  | { type: "Text"; field0: string }
  | { type: "Binary"; field0: Array<number> };

/** Static-hosting configuration for baseUrl resolution. */
export interface HostingConfig {
  /** Hosting provider (see [`HostingProvider`]). */
  provider?: BaganHostingProvider;
  /** GitHub repository name for project pages (`/<repo>/` prefix). */
  repo?: string;
  /** Custom site URL (overrides provider defaults when set). */
  siteUrl?: string;
  /** Extra path prefix (e.g. `"subpath"` for `example.com/subpath/`). */
  pathPrefix?: string;
}

/** LRU budgets for the memory tier. */
export interface MemoryConfig {
  /**
   * Maximum total bytes of raw content kept in memory (`0` =
   * unlimited). When the budget is exceeded, the least recently used
   * entries are evicted (they remain readable from the disk archive).
   */
  byteBudget?: number;
  /** Maximum number of entries in memory (`0` = unlimited). */
  entryBudget?: number;
}

/**
 * A page rendered for a Liquid theme: front-matter fields flattened next
 * to pipeline-derived fields (layout, slug, html, …).
 */
export interface PageObject {
  /**
   * Layout name from front matter (e.g. `default`, `page`, `post`);
   * `"default"` when front matter does not set one.
   */
  layout: string;
  /**
   * File name without extension (`foo.md` → `foo`); `index` for
   * directory roots. Used as a search / lookup key.
   */
  fileName: string;
  /** Request URL for the page (`path/to/foo.md` → `/path/to/foo`). */
  slug: string;
  /** HTML rendered from the markdown by Peisar. */
  html: string;
  /**
   * Build output path (`path/to/foo.md` → `outDir/path/to/foo/index.html`),
   * relative to the output root unless absolute.
   */
  outFilePath: string;
  /** Original absolute source path (watch-process identity). */
  inputFilePath: string;
  /** Page title (from front matter, or the first `#` heading). */
  title?: string;
  /** Short description from front matter. */
  summary?: string;
  /** Category tags from front matter. */
  tags?: Array<string>;
  /** Publication date from front matter (string form `yyyy-mm-dd`). */
  publishDate?: string;
  /**
   * Any extra front-matter keys not mapped to a named field, exposed
   * verbatim (as strings) so themes can render `{{ page.custom }}`.
   */
  extra?: Record<string, string>;
}

/** Resolved theme directories, as absolute paths. */
export interface ThemeDirs {
  /** Directory containing the theme's HTML layout templates. */
  layoutsDir: string;
  /** Directory containing the theme's static assets. */
  assetsDir: string;
  /** Directory containing the theme's data files. */
  dataDir: string;
  /** Directory containing the theme's HTML includes files. */
  includesDir: string;
}

/**
 * JavaScript options for Markdown parsing and HTML rendering.
 *
 * Every property is optional.  Omitted parsing options enable GFM and
 * Kramdown; omitted rendering options produce a complete HTML document with
 * charset and viewport metadata.
 *
 * # Defaults
 *
 * | Property   | Default     |
 * |------------|-------------|
 * | `gfm`      | `true`      |
 * | `kramdown` | `true`      |
 * | `fragment` | `false` (full document) |
 * | `charset`  | `true`      |
 * | `viewport` | `true`      |
 * | `file_name`, `title`, `body_class`, `style` | `null` |
 */
export interface PeisarOptions {
  /**
   * Enable GitHub Flavored Markdown (tables, strikethrough, task lists,
   * autolinks).  Default: `true`.
   */
  gfm?: boolean;
  /**
   * Enable Kramdown-style block attributes (`{:#id .class key="val"}`).
   * Default: `true`.
   */
  kramdown?: boolean;
  /** Optional file name to attach to the parsed document. */
  fileName?: string;
  /**
   * If `true`, emit only the body content (no `<!DOCTYPE>`, `<html>`,
   * `<head>`, or `<body>` wrapper).  If `false`, emit a full HTML
   * document.  Default: `true` (fragment).
   */
  fragment?: boolean;
  /**
   * Include a `<meta charset="utf-8">` in the head (only relevant when
   * `fragment` is `false`).  Default: `true`.
   */
  charset?: boolean;
  /**
   * Include a `<meta name="viewport" content="width=device-width,
   * initial-scale=1.0">` in the head (only relevant when `fragment` is
   * `false`).  Default: `true`.
   */
  viewport?: boolean;
  /**
   * Optional `<title>` for the HTML head (only relevant when
   * `fragment` is `false`).  Default: `None`.
   */
  title?: string;
  /**
   * Optional additional CSS classes to add to `<body>` (only relevant
   * when `fragment` is `false`).  Default: `None`.
   */
  bodyClass?: string;
  /**
   * Optional inline CSS to inject in a `<style>` tag in the head.
   * Default: `None`.
   */
  style?: string;
}

/** Options that control how the AST is rendered to HTML. */
export interface RenderOptions {
  /**
   * If `true`, emit only the body content (no `<!DOCTYPE>`, `<html>`,
   * `<head>`, or `<body>` wrapper).  If `false`, emit a full HTML
   * document.  Default: `true` (fragment).
   */
  fragment: boolean;
  /**
   * Include a `<meta charset="utf-8">` in the head (only relevant when
   * `fragment` is `false`).  Default: `true`.
   */
  charset: boolean;
  /**
   * Include a `<meta name="viewport" content="width=device-width,
   * initial-scale=1.0">` in the head (only relevant when `fragment` is
   * `false`).  Default: `true`.
   */
  viewport: boolean;
  /**
   * Optional `<title>` for the HTML head (only relevant when
   * `fragment` is `false`).  Default: `None`.
   */
  title?: string;
  /**
   * Optional additional CSS classes to add to `<body>` (only relevant
   * when `fragment` is `false`).  Default: `None`.
   */
  bodyClass?: string;
  /**
   * Optional inline CSS to inject in a `<style>` tag in the head.
   * Default: `None`.
   */
  style?: string;
}

/**
 * Options that control how Markdown is parsed.
 *
 * # Defaults
 *
 * Both GFM and Kramdown extensions are enabled by default.  To parse
 * strict CommonMark only:
 */
export interface AstOptions {
  /**
   * Enable GitHub Flavored Markdown (tables, strikethrough, task lists,
   * autolinks).  Default: `true`.
   */
  gfm: boolean;
  /**
   * Enable Kramdown-style block attributes (`{:#id .class key="val"}`).
   * Default: `true`.
   */
  kramdown: boolean;
  /**
   * Optional file name to attach to the parsed
   * [`Document`](crate::Document).
   */
  fileName?: string;
}

/** Parsed Kramdown block attributes (`{:#id .class key="val"}`). */
export interface Attributes {
  /** HTML `id` attribute. */
  id?: string;
  /** CSS class list. */
  classes?: Array<string>;
  /** Arbitrary key/value attributes. */
  attributes?: Array<[string, string]>;
}

/** Block-level nodes. */
export type Block =
  | {
      type: "Heading" /** Heading level (1–6). */;
      level: number /** Inline content of the heading. */;
      children: Array<Inline> /** Source span. */;
      pos: Span /** Optional Kramdown attributes. */;
      attrs?: Attributes;
    }
  | {
      type: "Paragraph" /** Inline content of the paragraph. */;
      children: Array<Inline> /** Source span. */;
      pos: Span /** Optional Kramdown attributes. */;
      attrs?: Attributes;
    }
  | {
      type: "CodeBlock" /** Language hint from the info string (e.g. `rust` from ` ```rust `). */;
      lang?: string /** The raw code content. */;
      code: string /** Source span. */;
      pos: Span /** Optional Kramdown attributes. */;
      attrs?: Attributes;
    }
  | {
      type: "BlockQuote" /** Nested block content inside the quote. */;
      children: Array<Block> /** Source span. */;
      pos: Span /** Optional Kramdown attributes. */;
      attrs?: Attributes;
    }
  | {
      type: "List" /** `true` for ordered lists, `false` for unordered. */;
      ordered: boolean /** The list items. */;
      items: Array<ListItem> /** Source span. */;
      pos: Span /** Optional Kramdown attributes. */;
      attrs?: Attributes;
    }
  | { type: "ThematicBreak" /** Source span. */; pos: Span }
  | {
      type: "HtmlBlock" /** The raw HTML content. */;
      html: string /** Source span. */;
      pos: Span /** Optional Kramdown attributes. */;
      attrs?: Attributes;
    }
  | {
      type: "Table" /** The table structure (header, rows, alignments). */;
      table: Table /** Source span. */;
      pos: Span /** Optional Kramdown attributes. */;
      attrs?: Attributes;
    }
  | {
      type: "LinkReferenceDefinition" /** Normalized label (lowercased, trimmed). */;
      label: string /** The destination URL. */;
      url: string /** Optional link title. */;
      title?: string /** Source span. */;
      pos: Span;
    }
  | {
      type: "Comment" /** The comment text (markers stripped). */;
      value: string /** Source span. */;
      pos: Span;
    };

/**
 * Synchronous block-visitor callback. Receives a `Block`, returns
 * `VisitControlJs` (or `undefined` for no changes).
 */
export type BlockCallback = (arg: [Block]) => VisitorControl | null;

/**
 * Synchronous block parser hook. Receives a [`BlockParserContext`], returns
 * a [`BlockParseResultJs`] (or `undefined` to decline).
 */
export type BlockParseCallback = (
  arg: [BlockParserContext],
) => BlockParseResult | null;

/** Context passed to block parser hooks. */
export interface BlockParserContext {
  /** The current (unmodified) source line. */
  line: string;
  /** 0-based index of the current line in the (sub-)document. */
  lineIndex: number;
  /** Remaining lines starting at the current line (`lines[0]` is `line`). */
  lines: Array<string>;
}

/**
 * Result returned from the JS `parseBlock` callback.
 *
 * All fields are optional; omitting `block` (or returning `undefined`)
 * declines the position so the next hook / built-in parser handles it.
 */
export interface BlockParseResult {
  /** The parsed block node. */
  block?: Block;
  /** Number of source lines consumed (must be at least `1`). */
  consumed?: number;
}

/**
 * A Markdown document — the root of the AST.
 *
 * Contains the top-level block children and all link reference definitions
 * collected from the source text.
 */
export interface Document {
  /** Always `"root"`. */
  nodeType: string;
  /** Optional source file name. */
  fileName?: string;
  /** Span of the whole document in the source text. */
  pos: Span;
  /** Top-level block children. */
  children: Array<Block>;
  /** All link reference definitions collected from the document. */
  linkReferences: Array<LinkReferenceDefinition>;
}

/** Inline-level nodes. */
export type Inline =
  | {
      type: "Text" /** The text value. */;
      value: string /** Source span. */;
      pos: Span;
    }
  | {
      type: "Emphasis" /** Emphasis level (italic or bold). */;
      level: PeisarEmphasisLevel /** Nested inline content. */;
      children: Array<Inline> /** Source span. */;
      pos: Span;
    }
  | {
      type: "Code" /** The code text. */;
      code: string /** Source span. */;
      pos: Span;
    }
  | {
      type: "HtmlInline" /** The raw HTML string. */;
      html: string /** Source span. */;
      pos: Span;
    }
  | {
      type: "Strikethrough" /** Nested inline content. */;
      children: Array<Inline> /** Source span. */;
      pos: Span;
    }
  | { type: "HardBreak" /** Source span. */; pos: Span }
  | { type: "SoftBreak" /** Source span. */; pos: Span }
  | {
      type: "Image" /** Alternative text. */;
      alt: string /** Image URL. */;
      url: string /** Optional title. */;
      title?: string /** Source span. */;
      pos: Span;
    }
  | {
      type: "Link" /** Link text (inline children). */;
      text: Array<Inline> /** Destination URL. */;
      url: string /** Optional link title. */;
      title?: string /** `true` if this is a GFM autolink (bare URL). */;
      autolink: boolean /** Source span. */;
      pos: Span;
    }
  | {
      type: "LinkReference" /** Link text (inline children). */;
      text: Array<Inline> /** Normalized label used to look up the reference. */;
      label: string /** Resolved destination URL. */;
      url: string /** Optional resolved title. */;
      title?: string /** Source span. */;
      pos: Span;
    };

/**
 * Synchronous inline-visitor callback. Receives an `Inline`, returns
 * `InlineVisitControlJs` (or `undefined` for no changes).
 */
export type InlineCallback = (arg: [Inline]) => InlineVisitorControl | null;

/**
 * Synchronous inline parser hook. Receives an [`InlineParserContext`],
 * returns an [`InlineParseResultJs`] (or `undefined` to decline).
 */
export type InlineParseCallback = (
  arg: [InlineParserContext],
) => InlineParseResult | null;

/**
 * Context passed to inline parser hooks.
 *
 * On the JavaScript side the fields are exposed as `rest` and `index`.
 */
export interface InlineParserContext {
  /** Remaining inline text starting at the current character position. */
  rest: string;
  /** 0-based character index of the current position in the inline text. */
  index: number;
}

/**
 * Result returned from the JS `parseInline` callback.
 *
 * All fields are optional; omitting `inline` (or returning `undefined`)
 * declines the position so the next hook / built-in parser handles it.
 */
export interface InlineParseResult {
  /** The parsed inline node. */
  inline?: Inline;
  /** Number of characters consumed (`0` or missing declines). */
  consumed?: number;
}

/**
 * JS-facing mirror of [`InlineVisitControl`].
 *
 * Returned from the JS `visitInline` callback.  All fields are optional;
 * omitting a field means "no change" for that operation.
 */
export interface InlineVisitorControl {
  /** Nodes to insert before the current node. */
  insertBefore?: Array<Inline>;
  /** Nodes to insert after the current node. */
  insertAfter?: Array<Inline>;
  /** Replace the current node with these nodes. */
  replaceWith?: Array<Inline>;
  /** Remove the current node entirely. */
  remove?: boolean;
  /** Whether to recurse into this node's children. */
  recurse?: boolean;
}

/** A link reference definition collected at the document level. */
export interface LinkReferenceDefinition {
  /** Normalized label (lowercased, trimmed). */
  label: string;
  /** The destination URL. */
  url: string;
  /** Optional link title. */
  title?: string;
  /** Source span. */
  pos: Span;
}

/** A single list item (an `<li>`). Contains nested block content. */
export interface ListItem {
  /** Nested block content of the item. */
  children: Array<Block>;
  /** GFM task-list state: `None` = not a task, `Some` = checked / unchecked. */
  task?: PeisarTaskState;
  /** Span of the item in the *sub-document* of its enclosing list. */
  pos: Span;
}

/**
 * A plugin containing optional Markdown parser hooks and AST visitor
 * callbacks.
 */
export interface Plugin {
  /** Optional JS callback for block nodes (JS: `visitBlock`). */
  visitBlock?: BlockCallback;
  /** Optional JS callback for inline nodes (JS: `visitInline`). */
  visitInline?: InlineCallback;
  /** Optional JS block parser hook (JS: `parseBlock`). */
  parseBlock?: BlockParseCallback;
  /** Optional JS inline parser hook (JS: `parseInline`). */
  parseInline?: InlineParseCallback;
}

/** A zero-based point in the source text. */
export interface Position {
  /** Line number, 0-based. */
  line: number;
  /** Column number, 0-based (in characters). */
  column: number;
  /** Byte offset from the start of the input. */
  offset: number;
}

/**
 * A half-open span `[start, end)` covering a node's source text.
 *
 * `start` is inclusive and `end` is exclusive; both positions point into the
 * original source string.
 */
export interface Span {
  /** The start position (inclusive). */
  start: Position;
  /** The end position (exclusive). */
  end: Position;
}

/** A GFM table. */
export interface Table {
  /** The header row. */
  header: TableRow;
  /** Body rows. */
  rows: Array<TableRow>;
  /** Column alignment specifications (one per column). */
  alignments: PeisarTableCellAlignments;
}

/** A single table cell. */
export interface TableCell {
  /** Inline content of the cell. */
  children: Array<Inline>;
}

/** A single table row (header or body). */
export interface TableRow {
  /** The cells in this row. */
  cells: Array<TableCell>;
}

/**
 * JS-facing mirror of [`VisitControl`].
 *
 * Returned from the JS `visitBlock` callback.  All fields are optional;
 * omitting a field means "no change" for that operation.
 */
export interface VisitorControl {
  /** Nodes to insert before the current node. */
  insertBefore?: Array<Block>;
  /** Nodes to insert after the current node. */
  insertAfter?: Array<Block>;
  /** Replace the current node with these nodes. */
  replaceWith?: Array<Block>;
  /** Remove the current node entirely. */
  remove?: boolean;
  /** Whether to recurse into this node's children. */
  recurse?: boolean;
}

interface BasePlugin {
  name: string;
  version: string;
  author?: string;
  description?: string;
}

export interface MarkdownPlugin extends BasePlugin {
  type: "markdown";
  fun: (config: Record<string, unknown>) => Plugin;
}

export interface LiquidPlugin extends BasePlugin {
  type: "liquid";
  fun: (
    config: Record<string, unknown>,
  ) => (this: Liquid, L: typeof Liquid) => void;
}

export type BaganPluginFectory = (
  ...args: any[]
) => MarkdownPlugin | LiquidPlugin;

export type BaganPlugin = MarkdownPlugin | LiquidPlugin | BaganPluginFectory;
