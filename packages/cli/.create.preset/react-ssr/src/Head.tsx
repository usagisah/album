export function Head() {
  return (
    <>
      <meta charSet="UTF-8" />
      <link rel="icon" type="image/svg+xml" href={import.meta.env.DEV ? "/vite.svg" : `${__app_id_path__}/vite.svg`} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Vite + React + TS</title>
    </>
  )
}
