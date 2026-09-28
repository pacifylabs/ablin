import Image from 'next/image';
import type { FrameworkWithMark } from '@/cms/collections/frameworks';
import { cloudinaryLoader } from '@/cms/cloudinary-loader';
import { LineIcon } from './LineIcon';

/**
 * A framework's mark: its client-approved logo when there is one (see withMarks), otherwise its line icon. The name
 * is always printed next to it, so both are decorative.
 */
export function FrameworkMark({
  framework,
  size = 30,
}: {
  framework: FrameworkWithMark;
  size?: number;
}) {
  if (framework.mark) {
    const { src, width, height } = framework.mark;
    return (
      <Image
        src={src}
        alt=""
        width={Math.round((width / height) * size)}
        height={size}
        loader={cloudinaryLoader}
        style={{ height: size, width: 'auto' }}
      />
    );
  }
  return <LineIcon name={framework.icon} size={size} />;
}
