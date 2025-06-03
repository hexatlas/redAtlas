import React, { ReactNode } from 'react';

function LegendLayout({
  children,
  footer,
  className,
  route,
}: {
  children: ReactNode;
  footer?: ReactNode;
  className?;
  route?;
}) {
  return (
    <>
      <section
        className={`layout ${className}`}
        aria-label="Legend Content"
        aria-description="View the selected information"
      >
        {children}
      </section>
      <footer className="legend__footer" aria-label="Legend Footer">
        {footer || (
          <blockquote>
            <b>Note:</b> Data availability and quality varies between locations.
          </blockquote>
        )}
      </footer>
    </>
  );
}

export default React.memo(LegendLayout);
