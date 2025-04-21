import 'next';

declare module 'next' {
  interface PageProps {
    params: Record<string, string>;
    searchParams?: Record<string, string | string[] | undefined>;
  }
}

declare module '*.module.scss' {
  const classes: { [key: string]: string }
  export default classes
}