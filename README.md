Welcome to your new TanStack app! 

# Getting Started

To run this application:

```bash
pnpm install
pnpm start
```

# Building For Production

This project supports multiple build strategies for different deployment scenarios:

## Build Strategies Comparison

| Build Type | Command | Output | Use Case |
|-----------|---------|--------|----------|
| **SSR** | `pnpm build` | `.output/` | Node.js server deployment |
| **SPA** | `pnpm build:static` | `dist/` | Single-page application |
| **SSG** | `pnpm build:ssg` | `dist-ssg/` | Static site with individual HTML files |
| **SSG Advanced** | `pnpm build:ssg:advanced` | `dist-ssg/` | SEO-optimized static site |

## 1. SSR Build (Server-Side Rendering)

Default TanStack Start build with server-side rendering:

```bash
# Build
pnpm build

# Run production server
pnpm start
```

**Output:** `.output/` directory with Node.js server
**Best for:** Dynamic content, real-time data, user authentication

## 2. SPA Build (Single-Page Application)

Client-side only build with single `index.html`:

```bash
# Build
pnpm build:static

# Preview locally
pnpm serve
```

**Output structure:**
```
dist/
├── index.html          # Single HTML file for all routes
├── assets/            # JS/CSS bundles
└── _redirects         # Routing configuration
```

**Best for:** Interactive apps, admin dashboards, when SEO is not critical

## 3. SSG Build (Static Site Generation)

Generates individual HTML files for each route:

```bash
# Basic SSG build
pnpm build:ssg

# Advanced SSG with SEO optimization
pnpm build:ssg:advanced

# Preview locally
pnpm serve:ssg
```

**Output structure:**
```
dist-ssg/
├── index.html                    # Home page
├── login/
│   └── index.html               # /login route
├── dashboard/
│   ├── index.html               # /dashboard route
│   ├── billing/
│   │   └── index.html          # /dashboard/billing route
│   └── ...                     # Other dashboard subroutes
├── assets/                     # Shared JS/CSS bundles
├── sitemap.xml                  # SEO sitemap (advanced only)
└── robots.txt                   # Crawler configuration
```

**SSG Advanced features:**
- Individual meta tags per page (title, description)
- Relative asset paths for subdirectory deployment
- Canonical URLs
- Sitemap generation
- SEO-friendly structure

**Best for:** Marketing sites, blogs, documentation, when SEO is important

## Deployment Guides

### Netlify

All build types work with Netlify:

```bash
# Using netlify.toml (already configured)
git push origin main
```

Or drag & drop the output folder to Netlify dashboard.

### Vercel

```bash
# Deploy with Vercel CLI
vercel --prod

# vercel.json already configured for SPA routing
```

### GitHub Pages

For SSG builds (recommended for GitHub Pages):

```bash
# Build
pnpm build:ssg

# Deploy using gh-pages
npx gh-pages -d dist-ssg
```

### AWS S3 + CloudFront

```bash
# Build
pnpm build:ssg  # or build:static

# Deploy using included script
./scripts/deploy-s3.sh your-bucket-name

# Or manual upload
aws s3 sync dist-ssg/ s3://your-bucket/ --delete
```

**Note:** S3 configuration files included:
- `aws/cloudfront-config.json` - CloudFront settings
- `aws/cloudfront-functions.js` - SPA routing function
- `scripts/deploy-s3.sh` - Automated deployment script

### Static Hosting Services

Any static hosting service (Surge, Firebase Hosting, etc.) can use:
- `dist/` folder for SPA builds
- `dist-ssg/` folder for SSG builds

## Routing Configuration

The project includes routing configuration for all major platforms:

| Platform | Config File | Purpose |
|----------|------------|---------|
| Netlify | `netlify.toml`, `_redirects` | SPA routing support |
| Vercel | `vercel.json` | Rewrite rules for SPA |
| GitHub Pages | `404.html` | Client-side routing fallback |
| Local dev | `serve.json` | Local preview server config |

## Build Performance

All builds are optimized with:
- Code splitting (vendor chunks)
- Minification (esbuild)
- Tree shaking
- Compression-ready output

## Choosing the Right Build

- **Need SEO?** → Use SSG (`build:ssg:advanced`)
- **Need authentication/dynamic data?** → Use SSR (`build`) or SPA (`build:static`)
- **Deploying to static hosting?** → Use SSG or SPA
- **Have a Node.js server?** → Use SSR
- **Want fastest deployment?** → Use SPA
- **Want best initial load time?** → Use SSG

## Testing

This project uses [Vitest](https://vitest.dev/) for testing. You can run the tests with:

```bash
pnpm test
```

## Styling

This project uses [Tailwind CSS](https://tailwindcss.com/) for styling.


## Linting & Formatting

This project uses [Biome](https://biomejs.dev/) for linting and formatting. The following scripts are available:


```bash
pnpm lint
pnpm format
pnpm check
```


## Shadcn

Add components using the latest version of [Shadcn](https://ui.shadcn.com/).

```bash
pnpx shadcn@latest add button
```



## Routing
This project uses [TanStack Router](https://tanstack.com/router). The initial setup is a file based router. Which means that the routes are managed as files in `src/routes`.

### Adding A Route

To add a new route to your application just add another a new file in the `./src/routes` directory.

TanStack will automatically generate the content of the route file for you.

Now that you have two routes you can use a `Link` component to navigate between them.

### Adding Links

To use SPA (Single Page Application) navigation you will need to import the `Link` component from `@tanstack/react-router`.

```tsx
import { Link } from "@tanstack/react-router";
```

Then anywhere in your JSX you can use it like so:

```tsx
<Link to="/about">About</Link>
```

This will create a link that will navigate to the `/about` route.

More information on the `Link` component can be found in the [Link documentation](https://tanstack.com/router/v1/docs/framework/react/api/router/linkComponent).

### Using A Layout

In the File Based Routing setup the layout is located in `src/routes/__root.tsx`. Anything you add to the root route will appear in all the routes. The route content will appear in the JSX where you use the `<Outlet />` component.

Here is an example layout that includes a header:

```tsx
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { Link } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <>
      <header>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
        </nav>
      </header>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})
```

The `<TanStackRouterDevtools />` component is not required so you can remove it if you don't want it in your layout.

More information on layouts can be found in the [Layouts documentation](https://tanstack.com/router/latest/docs/framework/react/guide/routing-concepts#layouts).


## Data Fetching

There are multiple ways to fetch data in your application. You can use TanStack Query to fetch data from a server. But you can also use the `loader` functionality built into TanStack Router to load the data for a route before it's rendered.

For example:

```tsx
const peopleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/people",
  loader: async () => {
    const response = await fetch("https://swapi.dev/api/people");
    return response.json() as Promise<{
      results: {
        name: string;
      }[];
    }>;
  },
  component: () => {
    const data = peopleRoute.useLoaderData();
    return (
      <ul>
        {data.results.map((person) => (
          <li key={person.name}>{person.name}</li>
        ))}
      </ul>
    );
  },
});
```

Loaders simplify your data fetching logic dramatically. Check out more information in the [Loader documentation](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#loader-parameters).

### React-Query

React-Query is an excellent addition or alternative to route loading and integrating it into you application is a breeze.

First add your dependencies:

```bash
pnpm add @tanstack/react-query @tanstack/react-query-devtools
```

Next we'll need to create a query client and provider. We recommend putting those in `main.tsx`.

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ...

const queryClient = new QueryClient();

// ...

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
```

You can also add TanStack Query Devtools to the root route (optional).

```tsx
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <ReactQueryDevtools buttonPosition="top-right" />
      <TanStackRouterDevtools />
    </>
  ),
});
```

Now you can use `useQuery` to fetch your data.

```tsx
import { useQuery } from "@tanstack/react-query";

import "./App.css";

function App() {
  const { data } = useQuery({
    queryKey: ["people"],
    queryFn: () =>
      fetch("https://swapi.dev/api/people")
        .then((res) => res.json())
        .then((data) => data.results as { name: string }[]),
    initialData: [],
  });

  return (
    <div>
      <ul>
        {data.map((person) => (
          <li key={person.name}>{person.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
```

You can find out everything you need to know on how to use React-Query in the [React-Query documentation](https://tanstack.com/query/latest/docs/framework/react/overview).

## State Management

Another common requirement for React applications is state management. There are many options for state management in React. TanStack Store provides a great starting point for your project.

First you need to add TanStack Store as a dependency:

```bash
pnpm add @tanstack/store
```

Now let's create a simple counter in the `src/App.tsx` file as a demonstration.

```tsx
import { useStore } from "@tanstack/react-store";
import { Store } from "@tanstack/store";
import "./App.css";

const countStore = new Store(0);

function App() {
  const count = useStore(countStore);
  return (
    <div>
      <button onClick={() => countStore.setState((n) => n + 1)}>
        Increment - {count}
      </button>
    </div>
  );
}

export default App;
```

One of the many nice features of TanStack Store is the ability to derive state from other state. That derived state will update when the base state updates.

Let's check this out by doubling the count using derived state.

```tsx
import { useStore } from "@tanstack/react-store";
import { Store, Derived } from "@tanstack/store";
import "./App.css";

const countStore = new Store(0);

const doubledStore = new Derived({
  fn: () => countStore.state * 2,
  deps: [countStore],
});
doubledStore.mount();

function App() {
  const count = useStore(countStore);
  const doubledCount = useStore(doubledStore);

  return (
    <div>
      <button onClick={() => countStore.setState((n) => n + 1)}>
        Increment - {count}
      </button>
      <div>Doubled - {doubledCount}</div>
    </div>
  );
}

export default App;
```

We use the `Derived` class to create a new store that is derived from another store. The `Derived` class has a `mount` method that will start the derived store updating.

Once we've created the derived store we can use it in the `App` component just like we would any other store using the `useStore` hook.

You can find out everything you need to know on how to use TanStack Store in the [TanStack Store documentation](https://tanstack.com/store/latest).

# Demo files

Files prefixed with `demo` can be safely deleted. They are there to provide a starting point for you to play around with the features you've installed.

# Learn More

You can learn more about all of the offerings from TanStack in the [TanStack documentation](https://tanstack.com).



---

# New Project

```
pnpx create-start-app@latest
Packages: +337
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Progress: resolved 402, reused 180, downloaded 157, added 337, done
┌  Let's configure your TanStack Start application
│
◇  What would you like to name your project?
│  tanstack-start-test
│
◇  Would you like to use Tailwind CSS?
│  Yes
│
◇  Select toolchain
│  Biome
│
◇  What add-ons would you like for your project?
│  Form, Shadcn, Store, Table, Query
│
◇  Would you like any examples?
│  none
│
◇  Initialized git repository
│
◇  Installed dependencies
│
◇  Installed additional shadcn components
│
▲  Warnings: 
│  TanStack Start is not yet at 1.0 and may change significantly or not be compatible with other add-ons.
│  Migrating to Start might require deleting node_modules and re-installing.
│
└  Your TanStack Start app is ready in 'tanstack-start-test'.

Use the following commands to start your app:
% cd tanstack-start-test
% pnpm dev

Please check the README.md for information on testing, styling, adding routes, etc.
```

---


