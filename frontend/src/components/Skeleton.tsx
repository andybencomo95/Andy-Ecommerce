import type { CSSProperties } from 'react';

import styles from './Skeleton.module.css';

interface SkeletonProps {
  variant?: 'text' | 'title' | 'avatar' | 'card' | 'image' | 'button';
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: CSSProperties;
}

function Skeleton({
  variant = 'text',
  width,
  height,
  className = '',
  style,
}: SkeletonProps): React.JSX.Element {
  const variantClass = styles[variant] ?? styles.text;

  return (
    <div
      className={`${styles.skeleton} ${variantClass} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

export default Skeleton;
