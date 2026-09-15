import { Component } from 'react';

// Catches render crashes so one broken component doesn't blank the app.
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    console.error('[ErrorBoundary]', error);
  }

  render() {
    if (this.state.error) {
      return (
        <section className="mx-auto max-w-2xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
          <p className="mt-2 text-sm text-neutral-400">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => this.setState({ error: null })}
              className="rounded-md border border-white/15 px-4 py-2 text-sm text-white hover:border-accent"
            >
              Try again
            </button>
            <a href="/" className="rounded-md bg-[#f4f4f5] px-4 py-2 text-sm font-semibold text-black hover:bg-neutral-300">
              Go home
            </a>
          </div>
        </section>
      );
    }
    return this.props.children;
  }
}
