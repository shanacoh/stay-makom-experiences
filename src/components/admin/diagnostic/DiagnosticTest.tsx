import { DiagnosticTest as TestType } from '@/hooks/admin/useDiagnostic';
import { CheckCircle2, XCircle, AlertTriangle, Clock } from 'lucide-react';

interface DiagnosticTestProps {
  test: TestType;
}

export const DiagnosticTest = ({ test }: DiagnosticTestProps) => {
  const getIcon = () => {
    if (test.pass === null) return <Clock className="h-4 w-4 text-muted-foreground" />;
    if (test.warning) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    if (test.pass) return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getColor = () => {
    if (test.pass === null) return 'text-muted-foreground';
    if (test.warning) return 'text-yellow-600';
    if (test.pass) return 'text-emerald-600';
    return 'text-red-600';
  };

  return (
    <div className="flex items-start gap-3 py-2 px-3 rounded-md hover:bg-muted/50 transition-colors">
      {getIcon()}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-xs text-muted-foreground">{test.id}</span>
          <span className="text-sm font-medium">{test.name}</span>
        </div>
        <p className={`text-xs mt-1 ${getColor()}`}>{test.detail}</p>
        {test.duration && (
          <span className="text-xs text-muted-foreground mt-1">
            {(test.duration / 1000).toFixed(2)}s
          </span>
        )}
      </div>
    </div>
  );
};