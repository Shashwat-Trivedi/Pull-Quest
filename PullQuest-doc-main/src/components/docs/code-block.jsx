"use client"

import React from "react"
import PropTypes from "prop-types"
import { Button } from "@/components/ui/button"
import { Check, Clipboard } from "lucide-react"

export function CodeBlock({ code, filename, ariaLabel, className }) {
  const [copied, setCopied] = React.useState(false)

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (e) {
      // It's generally better to at least log the error
      console.error("Failed to copy text: ", e)
    }
  }

  return (
    <figure
      className={`relative rounded-lg border bg-card text-foreground overflow-hidden ${className || ""}`}
      aria-label={ariaLabel || "Code example"}
    >
      {filename ? (
        <figcaption className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
          <span className="text-xs text-muted-foreground">{filename}</span>
          <Button size="sm" variant="ghost" className="h-8 px-2" onClick={onCopy} aria-label="Copy code">
            {copied ? <Check className="h-4 w-4 text-primary" /> : <Clipboard className="h-4 w-4" />}
          </Button>
        </figcaption>
      ) : (
        <div className="absolute right-2 top-2">
          <Button size="sm" variant="secondary" className="h-8 px-2" onClick={onCopy} aria-label="Copy code">
            {copied ? <Check className="h-4 w-4 text-primary" /> : <Clipboard className="h-4 w-4" />}
          </Button>
        </div>
      )}
      <pre className="p-4 text-sm leading-relaxed overflow-x-auto">
        <code>{code}</code>
      </pre>
    </figure>
  )
}

// Add prop-types for runtime type validation in JavaScript
CodeBlock.propTypes = {
  code: PropTypes.string.isRequired,
  filename: PropTypes.string,
  ariaLabel: PropTypes.string,
  className: PropTypes.string,
}