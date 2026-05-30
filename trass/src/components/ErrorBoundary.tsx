import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';

interface Props extends WithTranslation {
  children?: React.ReactNode;
}

interface State { hasError: boolean; error: Error | null; }

class ErrorBoundary extends React.Component<Props, State> {
  props!: Props;
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    const { t } = this.props;
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8">
          <div className="max-w-lg w-full bg-[#151619] border border-red-500/20 rounded-2xl p-8 space-y-4">
            <h2 className="text-red-400 font-bold text-xl font-mono">{t('runtime_error')}</h2>
            <pre className="text-white/60 text-xs font-mono bg-black/40 p-4 rounded-xl overflow-auto whitespace-pre-wrap">
              {this.state.error?.message}
              {'\n\n'}
              {this.state.error?.stack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-orange-500 text-black font-bold rounded-xl text-sm"
            >
              {t('reload')}
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default withTranslation()(ErrorBoundary);

