import { Link, Form } from "@remix-run/react";
import { FacebookIcon, InstagramIcon, TwitterIcon, GithubIcon, YoutubeIcon } from "images/icons";

export default function FooterSection() {
  return (
    <footer className="bg-white dark:bg-muted border-t dark:border-none dark:rounded-t-lg border-gray-200 pt-16 pb-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-400 dark:text-foreground uppercase tracking-wider">Company</h3>
            <ul className="mt-4 space-y-4">
              {["About", "Blog"].map((item) => (
                <li key={item}>
                  <Link to={`/${item.toLowerCase()}`} className="text-base text-gray-500 dark:text-muted-foreground hover:text-gray-900">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 dark:text-foreground uppercase tracking-wider">Legal</h3>
            <ul className="mt-4 space-y-4">
              {["Privacy", "Terms"].map((item) => (
                <li key={item}>
                  <Link to={`/${item.toLowerCase()}`} className="text-base text-gray-500 dark:text-muted-foreground hover:text-gray-900">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-2 md:col-span-2">
            <h3 className="text-sm font-semibold text-gray-400 dark:text-foreground uppercase tracking-wider">Subscribe to our newsletter</h3>
            <p className="mt-4 text-base text-gray-500 dark:text-muted-foreground">
              The latest news, articles, and resources, sent to your inbox weekly.
            </p>
            <Form className="mt-4 sm:flex sm:max-w-md" method="post">
              <input
                type="email"
                name="email"
                id="email-address"
                autoComplete="email"
                required
                className="appearance-none min-w-0 w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-4 text-base text-gray-900 placeholder-gray-500 dark:placeholder:text-muted-foreground focus:outline-none focus:ring-yellow-300 focus:border-yellow-300 focus:placeholder-gray-400 dark:bg-background dark:focus:text-foreground dark:border-border-muted dark:focus:border-ring"
                placeholder="Enter your email"
              />
              <div className="mt-3 rounded-md sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                <button
                  type="submit"
                  className="w-full bg-primary flex items-center justify-center border border-transparent rounded-md py-2 px-4 text-base font-medium text-white hover:bg-yellow-300 focus:ring-2 focus:ring-offset-2 focus:ring-yellow-300 transition duration-200"
                >
                  Subscribe
                </button>
              </div>
            </Form>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-200 dark:border-border-muted pt-8 md:flex md:justify-between">
          <p className="text-base text-gray-400 dark:text-muted-foreground text-center md:text-left">
            &copy; 2024 Fitizen, Inc. All rights reserved.
          </p>
          <div className="mt-8 md:mt-0 flex justify-center space-x-6">
            {[
              { Icon: FacebookIcon, href: "#" },
              { Icon: InstagramIcon, href: "#" },
              { Icon: TwitterIcon, href: "#" },
              { Icon: GithubIcon, href: "#" },
              { Icon: YoutubeIcon, href: "#" },
            ].map(({ Icon, href }, icon_idx) => (
              <a key={`${href}-${icon_idx}`} href={href} className="text-gray-400 dark:text-muted-foreground hover:text-gray-500 dark:hover:text-foreground">
                <span className="sr-only">{Icon.name}</span>
                <Icon className="size-6" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}