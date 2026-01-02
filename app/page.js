export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <main className="max-w-2xl w-full">
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Your Name</h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Your Title or Role
          </p>
        </header>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">About</h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
            A brief introduction about yourself. What you do, what you're passionate about,
            and what makes you unique.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Projects</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-medium mb-2">Project Name</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Brief description of your project and what it does.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2">Project Name</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Brief description of your project and what it does.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Contact</h2>
          <div className="flex gap-4">
            <a
              href="mailto:your.email@example.com"
              className="text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors"
            >
              Email
            </a>
            <a
              href="https://github.com/yourusername"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/yourusername"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
