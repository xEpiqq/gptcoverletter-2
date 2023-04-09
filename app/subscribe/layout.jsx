const Layout = ({ children }) => {
  return (
    <html suppressHydrationWarning lang="en">
      {/*
    <head /> will contain the components returned by the nearest parent
    head.js. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
  */}
      <head />

      <body style={{margin: 0 }}>
        <main className="flex-grow">{children}</main>
      </body>
    </html>
  );
};

export default Layout;
