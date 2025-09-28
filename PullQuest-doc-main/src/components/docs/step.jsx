import React from "react"
import PropTypes from "prop-types"

export function Step({ number, title, id, children }) {
  return (
    <section id={id} className="scroll-mt-24">
      <header className="flex items-center gap-3 mb-3">
        <div
          aria-hidden
          className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm"
        >
          {number}
        </div>
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
      </header>
      <div className="text-sm md:text-base leading-relaxed text-muted-foreground">{children}</div>
    </section>
  )
}

// Add prop-types for runtime type validation in JavaScript
Step.propTypes = {
  number: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  id: PropTypes.string,
  children: PropTypes.node.isRequired,
}