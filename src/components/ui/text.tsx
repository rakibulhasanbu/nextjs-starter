import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Typography primitive for the whole app.
 *
 * `variant` controls the visual style (size / spacing / default weight).
 * Semantics are controlled separately via the `render` prop
 * (e.g. `render={<h2 />}`), so you can style a `<div>` like an `h1` without
 * breaking the document outline.
 *
 * Composable modifiers, usable with any variant:
 * - `tone`      – semantic color
 * - `weight`    – override the variant's font weight
 * - `align`     – text alignment
 * - `transform` – uppercase / lowercase / capitalize
 * - `clamp`     – limit to N lines with an ellipsis (`clamp={1}` = single line)
 *
 * Accessibility:
 * - Pick the heading level from the surrounding document structure, not from
 *   how big you want the text to look. Headings must not skip levels.
 * - When no `render` is supplied, a sensible semantic element is used per
 *   variant (see `variantElement` below).
 * - When `clamp` hides text, pass a `title` (native prop, forwarded as-is) so
 *   the full string stays available on hover. If the text is essential, prefer
 *   a real tooltip over `title`.
 * - `inlineCode`, `list` and `listItem` render inline/flow content and must be
 *   nested correctly (`listItem` only inside `list`).
 * - For text inside a sentence or inside another `Text`, pass `render={<span />}`
 *   so you don't nest block elements (e.g. `<p>` inside `<p>`).
 */
const textVariants = cva("", {
  variants: {
    variant: {
      h1: "font-heading scroll-m-20 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl lg:text-5xl",
      h2: "font-heading scroll-m-20 text-2xl font-semibold tracking-tight first:mt-0 sm:text-3xl",
      h3: "font-heading scroll-m-20 text-xl font-semibold tracking-tight sm:text-2xl",
      h4: "font-heading scroll-m-20 text-lg font-semibold tracking-tight sm:text-xl",
      p: "leading-7 [&:not(:first-child)]:mt-6",
      lead: "text-lg text-muted-foreground sm:text-xl",
      large: "text-lg font-semibold",
      small: "text-sm leading-none font-medium",
      caption: "text-xs leading-tight font-medium",
      blockquote: "mt-6 border-l-2 pl-6 italic",
      inlineCode: "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
      list: "my-6 ml-6 list-disc [&>li]:mt-2",
      listItem: "",
    },
    /**
     * Semantic color, composable with any variant, e.g.
     * `<Text variant="large" tone="muted">` or `<Text tone="destructive">`.
     * `default` inherits the current text color.
     */
    tone: {
      default: "",
      muted: "text-muted-foreground",
      primary: "text-primary",
      secondary: "text-secondary-foreground",
      accent: "text-accent-foreground",
      destructive: "text-destructive",
      success: "text-success",
      warning: "text-warning",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    },
    transform: {
      none: "",
      uppercase: "uppercase",
      lowercase: "lowercase",
      capitalize: "capitalize",
    },
    clamp: {
      1: "line-clamp-1 min-w-0",
      2: "line-clamp-2 min-w-0",
      3: "line-clamp-3 min-w-0",
      4: "line-clamp-4 min-w-0",
      5: "line-clamp-5 min-w-0",
      6: "line-clamp-6 min-w-0",
    },
  },
  defaultVariants: {
    variant: "p",
    tone: "default",
  },
});

type TextVariant = NonNullable<VariantProps<typeof textVariants>["variant"]>;

/** Default semantic element for each variant when `render` is not provided. */
const variantElement: Record<TextVariant, keyof HTMLElementTagNameMap> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  p: "p",
  lead: "p",
  large: "div",
  small: "small",
  caption: "p",
  blockquote: "blockquote",
  inlineCode: "code",
  list: "ul",
  listItem: "li",
};

type TextProps = useRender.ComponentProps<"p"> & VariantProps<typeof textVariants>;

function Text({
  className,
  variant = "p",
  tone = "default",
  weight,
  align,
  transform,
  clamp,
  render,
  ...props
}: TextProps) {
  const resolvedVariant = variant ?? "p";

  return useRender({
    defaultTagName: variantElement[resolvedVariant],
    props: mergeProps<"p">(
      {
        className: cn(
          textVariants({
            variant: resolvedVariant,
            tone,
            weight,
            align,
            transform,
            clamp,
          }),
          className
        ),
      },
      props
    ),
    render,
    state: {
      slot: "text",
      variant: resolvedVariant,
      tone: tone ?? "default",
    },
  });
}

export { Text, textVariants };
export type { TextProps, TextVariant };
