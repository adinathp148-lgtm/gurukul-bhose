import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export const ErrorState = ({
  title = 'माहिती लोड करताना अडचण आली',
  message = 'सर्व्हर किंवा नेटवर्क त्रुटीमुळे माहिती दर्शविता आली नाही. कृपया पुन्हा प्रयत्न करा.',
  onRetry
}) => {
  return (
    <div className="text-center py-12 px-4 rounded-2xl bg-red-50/50 border border-red-200 p-8 shadow-sm max-w-md mx-auto space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-red-900">{title}</h3>
      <p className="text-xs text-red-700 leading-relaxed">{message}</p>
      {onRetry && (
        <div className="pt-2">
          <Button variant="danger" size="sm" onClick={onRetry}>
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            <span>पुन्हा प्रयत्न करा (Retry)</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught an error]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6">
          <ErrorState 
            title="काहीतरी चूक झाली आहे"
            message={this.state.error?.message || 'अपेक्षित त्रुटी आढळली.'}
            onRetry={() => window.location.reload()}
          />
        </div>
      );
    }
    return this.props.children;
  }
}
