import Image from "next/image";

export function HeaderBrand() {
  return (
    <Image
      src="/brand/minimal-logo.png"
      alt=""
      width={92}
      height={92}
      priority
      className="h-14 w-14 shrink-0 object-contain md:h-16 md:w-16"
    />
  );
}

export function FooterBrand() {
  return (
    <a
      href="/"
      aria-label="Lyric of the Day home"
      className="inline-block"
    >
      <Image
        src="/brand/primary-logo.png"
        alt="Lyric of the Day"
        width={420}
        height={420}
        className="h-auto w-44 object-contain sm:w-52"
      />
    </a>
  );
}
