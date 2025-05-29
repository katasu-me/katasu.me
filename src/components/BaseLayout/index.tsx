type Props = Readonly<{
  children: React.ReactNode;
}>;

export default function BaseLayout({ children }: Props) {
  return <main className="mx-auto max-w-5xl">{children}</main>;
}
