export function Logo({
  size = 24,
  class: className = "",
}: {
  size?: number;
  class?: string;
}) {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: Don't care
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      class={className}
      viewBox="0 0 256 256"
    >
      <path
        d="M216,48V88a8,8,0,0,1-16,0V56H168a8,8,0,0,1,0-16h40A8,8,0,0,1,216,48ZM88,200H56V168a8,8,0,0,0-16,0v40a8,8,0,0,0,8,8H88a8,8,0,0,0,0-16Zm120-40a8,8,0,0,0-8,8v32H168a8,8,0,0,0,0,16h40a8,8,0,0,0,8-8V168A8,8,0,0,0,208,160ZM88,40H48a8,8,0,0,0-8,8V88a8,8,0,0,0,16,0V56H88a8,8,0,0,0,0-16Z"
        fill="currentColor"
      />
      <polygon
        points="160 128 96 88 96 168 160 128"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="16"
      />
    </svg>
  );
}

export function XIcon({
  size = 24,
  class: className = "",
}: {
  size?: number;
  class?: string;
}) {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: Don't care
    <svg
      width={size}
      height={size}
      class={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
    >
      <line
        x1="200"
        y1="56"
        x2="56"
        y2="200"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="16"
      />
      <line
        x1="200"
        y1="200"
        x2="56"
        y2="56"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="16"
      />
    </svg>
  );
}

export function InfoIcon({
  size = 24,
  class: className = "",
}: {
  size?: number;
  class?: string;
}) {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: Don't care
    <svg
      width={size}
      height={size}
      class={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
    >
      <circle
        cx="128"
        cy="128"
        r="96"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="16"
      />
      <path
        d="M120,120a8,8,0,0,1,8,8v40a8,8,0,0,0,8,8"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="16"
      />
      <circle cx="124" cy="84" r="12" fill="currentColor" />
    </svg>
  );
}

export function CaretDownIcon({
  size = 24,
  class: className = "",
}: {
  size?: number;
  class?: string;
}) {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: Don't care
    <svg
      width={size}
      height={size}
      class={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
    >
      <polyline
        points="208 96 128 176 48 96"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="16"
      />
    </svg>
  );
}
