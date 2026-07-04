import React from 'react';
import DigitalResources from './DigitalResources';
import { useHomeContent } from '../context/HomeContentContext';

/**
 * Home wrapper around <DigitalResources /> that feeds it the CMS-editable
 * copy from home_content.digital_resources (tab "Recursos" del admin).
 */
export default function HomeResources() {
  const { content } = useHomeContent();
  const d = content.digital_resources || {};

  return (
    <DigitalResources
      eyebrow={d.eyebrow}
      titleLine1={d.titleLine1}
      titleLine2={d.titleLine2}
      subtitle={d.subtitle}
      limit={4}
      bg="cream"
    />
  );
}
